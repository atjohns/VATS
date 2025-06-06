import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';

// Custom interface for stack props that includes Google Auth client details
export interface VatsStackProps extends cdk.StackProps {
  env: {
    account: string | undefined;
    region: string | undefined;
    googleAuthClientId: string;
    googleAuthClientSecret: string;
  };
}

export class VatsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: VatsStackProps) {
    super(scope, id, props);

    // Team selections table for user selections
    const teamSelectionsTable = new dynamodb.Table(this, 'TeamSelectionsTable', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    
    // Team scores table for tracking points
    const teamScoresTable = new dynamodb.Table(this, 'TeamScoresTable', {
      partitionKey: { name: 'teamId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sport', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    
    // Create S3 bucket for static website hosting
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Only for dev environments
      autoDeleteObjects: true, // Only for dev environments
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: true,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED
    });
    
    // CloudFront Origin Access Identity
    const cloudfrontOAI = new cloudfront.OriginAccessIdentity(this, 'CloudFrontOAI', {
      comment: 'OAI for VATS web app'
    });
    
    // Grant CloudFront permissions to access the bucket
    websiteBucket.addToResourcePolicy(new iam.PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [websiteBucket.arnForObjects('*')],
      principals: [new iam.CanonicalUserPrincipal(
        cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId
      )]
    }));

    // Create CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessIdentity(websiteBucket, {
          originAccessIdentity: cloudfrontOAI
        }),
        compress: true,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(0)
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(0)
        }
      ]
    });

    // Create Cognito User Pool for authentication with both Cognito and Google
    const userPool = new cognito.UserPool(this, 'VatsUserPool', {
      selfSignUpEnabled: true,
      autoVerify: { email: true },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
        givenName: {
          required: true,
          mutable: true,
        },
        familyName: {
          required: true,
          mutable: true,
        },
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    
    // Extract Google OAuth credentials from props
    const googleClientId = props?.env?.googleAuthClientId;
    const googleClientSecret = props?.env?.googleAuthClientSecret;
    
    // Generate CloudFront URLs for OAuth callbacks
    const cloudfrontUrl = `https://${distribution.distributionDomainName}`;

    // Create app client with support for Google OAuth
    const userPoolClient = new cognito.UserPoolClient(this, 'VatsUserPoolClient', {
      userPool,
      generateSecret: false,
      authFlows: {
        userPassword: true,
        userSrp: true,
        custom: true,
      },
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.GOOGLE,
      ],
      oAuth: {
        flows: {
          implicitCodeGrant: true,
          authorizationCodeGrant: true,
        },
        scopes: [
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.PROFILE,
          cognito.OAuthScope.COGNITO_ADMIN,
        ],
        callbackUrls: [
          'http://localhost:3000',
          'http://localhost:3000/home',
          `${cloudfrontUrl}`,
          `${cloudfrontUrl}/home`,
          `${cloudfrontUrl}/admin`,
        ],
        logoutUrls: [
          'http://localhost:3000',
          `${cloudfrontUrl}`,
        ],
      },
    });
    
    // Store a reference to the Google provider if created
    let googleProvider: cognito.UserPoolIdentityProviderGoogle | undefined;
    
    // Add Google as an identity provider if credentials are provided
    if (googleClientId && googleClientSecret) {
      // Create Google Identity Provider
      googleProvider = new cognito.UserPoolIdentityProviderGoogle(this, 'GoogleProvider', {
        userPool,
        clientId: googleClientId,
        clientSecretValue: cdk.SecretValue.unsafePlainText(googleClientSecret),
        scopes: ['profile', 'email', 'openid'],
        attributeMapping: {
          email: cognito.ProviderAttribute.GOOGLE_EMAIL,
          givenName: cognito.ProviderAttribute.GOOGLE_GIVEN_NAME,
          familyName: cognito.ProviderAttribute.GOOGLE_FAMILY_NAME
        }
      });
      
      // Add the Google provider to the user pool
      userPool.registerIdentityProvider(googleProvider);
    } else {
      // Log a warning if Google credentials aren't provided
      console.warn('Google OAuth credentials not provided or incomplete. Google sign-in will not be available.');
    }

    // If google provider was created, add dependency to ensure it exists before the client
    if (googleProvider) {
      userPoolClient.node.addDependency(googleProvider);
    }

    // Create identity pool for authenticated and unauthenticated users
    const identityPool = new cognito.CfnIdentityPool(this, 'VatsIdentityPool', {
      allowUnauthenticatedIdentities: true,
      cognitoIdentityProviders: [
        {
          clientId: userPoolClient.userPoolClientId,
          providerName: userPool.userPoolProviderName,
        },
      ],
    });

    // Create roles for authenticated and unauthenticated users
    const unauthenticatedRole = new iam.Role(this, 'UnauthenticatedRole', {
      assumedBy: new iam.FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: { 'cognito-identity.amazonaws.com:aud': identityPool.ref },
          'ForAnyValue:StringLike': { 'cognito-identity.amazonaws.com:amr': 'unauthenticated' },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
    });


    const authenticatedRole = new iam.Role(this, 'AuthenticatedRole', {
      assumedBy: new iam.FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: { 'cognito-identity.amazonaws.com:aud': identityPool.ref },
          'ForAnyValue:StringLike': { 'cognito-identity.amazonaws.com:amr': 'authenticated' },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
    });


    authenticatedRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'dynamodb:GetItem',
          'dynamodb:PutItem',
          'dynamodb:UpdateItem',
        ],
        resources: [
          teamSelectionsTable.tableArn,
        ],
      })
    );

    // Create the 'admins' Cognito group
    const adminsGroup = new cognito.CfnUserPoolGroup(this, 'AdminsGroup', {
      userPoolId: userPool.userPoolId,
      groupName: 'admins',
      description: 'Admin users with extended privileges',
      precedence: 0, // Lower number = higher precedence
    });
    
    // Create a role for admin users with additional permissions
    const adminRole = new iam.Role(this, 'AdminRole', {
      assumedBy: new iam.FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: { 'cognito-identity.amazonaws.com:aud': identityPool.ref },
          'ForAnyValue:StringLike': { 'cognito-identity.amazonaws.com:amr': 'authenticated' },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
      description: 'Role for admins group members with extended permissions',
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess')
      ]
    });
    
    // Add admin-specific permissions
    adminRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'dynamodb:GetItem',
          'dynamodb:PutItem',
          'dynamodb:UpdateItem',
          'dynamodb:DeleteItem',
          'dynamodb:Scan',
          'dynamodb:Query',
        ],
        resources: [
          teamSelectionsTable.tableArn,
        ],
      })
    );
    
    // Add permissions for admin to use Cognito to list users
    adminRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'cognito-idp:ListUsers',
          'cognito-idp:AdminGetUser',
          'cognito-idp:AdminListGroupsForUser'
        ],
        resources: [
          userPool.userPoolArn
        ],
      })
    );
    
    // Set up role mapping for the Cognito Identity Pool with specific mappings for admin roles
    const cfnRoleAttachment = new cognito.CfnIdentityPoolRoleAttachment(this, 'IdentityPoolRoleAttachment', {
      identityPoolId: identityPool.ref,
      roles: {
        authenticated: authenticatedRole.roleArn,
        unauthenticated: unauthenticatedRole.roleArn,
      },
      // Use rules-based mapping for assigning the admin role to users in the admins group
      roleMappings: {
        userPoolMapping: {
          type: 'Rules',
          ambiguousRoleResolution: 'AuthenticatedRole',
          identityProvider: `cognito-idp.${this.region}.amazonaws.com/${userPool.userPoolId}:${userPoolClient.userPoolClientId}`,
          rulesConfiguration: {
            rules: [
              {
                claim: 'cognito:groups',
                matchType: 'Contains',
                value: 'admins',
                roleArn: adminRole.roleArn
              }
            ]
          }
        }
      }
    });

    // Define a single Lambda function for all API operations
    const apiLambda = new lambda.Function(this, 'ApiHandlerLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'apiHandler.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        TEAM_SELECTIONS_TABLE: teamSelectionsTable.tableName,
        TEAM_SCORES_TABLE: teamScoresTable.tableName,
        USER_POOL_ID: userPool.userPoolId,
        REGION: this.region || 'us-east-1',
      },
      timeout: cdk.Duration.seconds(30), // Increase timeout for combined handler
      memorySize: 512, // Allocate more memory
    });

    // Grant all required permissions to the single Lambda function
    teamSelectionsTable.grantReadWriteData(apiLambda);
    teamScoresTable.grantReadWriteData(apiLambda);
    
    // Grant permissions to list Cognito users
    apiLambda.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'cognito-idp:ListUsers',
          'cognito-idp:AdminGetUser',
          'cognito-idp:AdminListGroupsForUser'
        ],
        resources: [
          userPool.userPoolArn
        ],
      })
    );

    // Create API Gateway with CORS support for CloudFront domains
    const api = new apigateway.RestApi(this, 'VatsApi', {
      defaultCorsPreflightOptions: {
        allowOrigins: ['*'], // In production, restrict this to specific domains
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
      }
    });

    // Create authorizer for API
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'VatsAuthorizer', {
      cognitoUserPools: [userPool],
      resultsCacheTtl: cdk.Duration.minutes(5),
    });

    // Create API endpoints
    const users = api.root.addResource('users');
    
    const userProfile = users.addResource('{userId}');
    
    // Configure Lambda integration with proxy integration and CORS response handling
    const apiIntegration = new apigateway.LambdaIntegration(apiLambda, {
      proxy: true,
    });
    
    // Define standard method responses for all API methods
    const standardMethodResponses = [
      {
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': true,
        }
      },
      {
        statusCode: '400',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': true,
        }
      },
      {
        statusCode: '401',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': true,
        }
      },
      {
        statusCode: '403',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': true,
        }
      },
      {
        statusCode: '404',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': true,
        }
      },
      {
        statusCode: '500',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': true,
        }
      }
    ];
    
    // Set up methods with proper CORS error responses
    userProfile.addMethod('GET', apiIntegration, {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
      methodResponses: standardMethodResponses,
    });
    
    userProfile.addMethod('PUT', apiIntegration, {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
      methodResponses: standardMethodResponses,
    });

    // Add team-selections as a child resource of userProfile
    const teamSelections = userProfile.addResource('team-selections');
    
    // Use the same Lambda handler for team selections endpoints
    teamSelections.addMethod('GET', apiIntegration, {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
      methodResponses: standardMethodResponses
    });
    
    teamSelections.addMethod('PUT', apiIntegration, {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
      methodResponses: standardMethodResponses
    });
    
    // Add admin endpoints
    const admin = api.root.addResource('admin');
    const adminUsers = admin.addResource('users');
    
    // Add team scores endpoints for admin
    const adminTeamScores = admin.addResource('team-scores');
    
    // Add endpoint for getting all team selections across users
    const adminAllTeamSelections = admin.addResource('all-team-selections');
    adminAllTeamSelections.addMethod('GET', apiIntegration, {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
      methodResponses: standardMethodResponses
    });
    
    // Get all team scores and update team scores
    adminTeamScores.addMethod('GET', apiIntegration, {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
      methodResponses: standardMethodResponses
    });
    
    adminTeamScores.addMethod('PUT', apiIntegration, {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
      methodResponses: standardMethodResponses
    });
    
    // Add resource for specific team score operations
    const adminTeamScore = adminTeamScores.addResource('{teamId}');
    
    adminTeamScore.addMethod('GET', apiIntegration, {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
      methodResponses: standardMethodResponses
    });
    
    // Add GET method for listing all users (admin only)
    adminUsers.addMethod('GET', apiIntegration, {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
      methodResponses: standardMethodResponses
    });
    
    // Add resource for specific user operations by admin
    const adminUserProfile = adminUsers.addResource('{userId}');
    const adminTeamSelections = adminUserProfile.addResource('team-selections');
    
    // Add methods for admin to view and edit user team selections
    adminTeamSelections.addMethod('GET', apiIntegration, {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
      methodResponses: standardMethodResponses
    });
    
    adminTeamSelections.addMethod('PUT', apiIntegration, {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
      methodResponses: standardMethodResponses
    });

    // Output important resources
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
    });
    
    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
    });
    
    new cdk.CfnOutput(this, 'IdentityPoolId', {
      value: identityPool.ref,
    });
    
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
    });
    
    new cdk.CfnOutput(this, 'WebsiteBucketName', {
      value: websiteBucket.bucketName,
    });

    new cdk.CfnOutput(this, 'CloudFrontURL', {
      value: cloudfrontUrl,
    });
    
    // Output OAuth domain URL if Google auth is enabled
    if (googleProvider) {
      // Create a custom domain for the Cognito hosted UI
      const domain = userPool.addDomain('VatsUserPoolDomain', {
        cognitoDomain: {
          domainPrefix: 'vats-app', // This will create vats-app.auth.<region>.amazoncognito.com
        },
      });
      
      new cdk.CfnOutput(this, 'GoogleAuthEnabled', {
        value: 'true',
      });
      
      new cdk.CfnOutput(this, 'UserPoolDomain', {
        value: domain.baseUrl(),
      });
      
      new cdk.CfnOutput(this, 'HostedUISignInUrl', {
        value: domain.signInUrl(userPoolClient, {
          redirectUri: cloudfrontUrl + '/home',
        }),
      });
    } else {
      new cdk.CfnOutput(this, 'GoogleAuthEnabled', {
        value: 'false',
      });
    }
  }
}