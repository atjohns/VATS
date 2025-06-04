import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';

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


    // Create DynamoDB tables for user profiles and team selections
    const usersTable = new dynamodb.Table(this, 'UsersTable', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const teamSelectionsTable = new dynamodb.Table(this, 'TeamSelectionsTable', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
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
        ],
        logoutUrls: [
          'http://localhost:3000',
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
          usersTable.tableArn,
          teamSelectionsTable.tableArn,
        ],
      })
    );

    // Attach roles to identity pool
    new cognito.CfnIdentityPoolRoleAttachment(this, 'IdentityPoolRoleAttachment', {
      identityPoolId: identityPool.ref,
      roles: {
        authenticated: authenticatedRole.roleArn,
        unauthenticated: unauthenticatedRole.roleArn,
      },
    });

    // Define a single Lambda function for all API operations
    const apiLambda = new lambda.Function(this, 'ApiHandlerLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'apiHandler.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        USERS_TABLE: usersTable.tableName,
        TEAM_SELECTIONS_TABLE: teamSelectionsTable.tableName,
      },
      timeout: cdk.Duration.seconds(30), // Increase timeout for combined handler
      memorySize: 512, // Allocate more memory
    });

    // Grant all required permissions to the single Lambda function
    usersTable.grantReadWriteData(apiLambda);
    teamSelectionsTable.grantReadWriteData(apiLambda);

    // Create API Gateway with basic CORS support
    const api = new apigateway.RestApi(this, 'VatsApi', {
      defaultCorsPreflightOptions: {
        allowOrigins: ['*'],
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
          redirectUri: 'http://localhost:3000/home',
        }),
      });
    } else {
      new cdk.CfnOutput(this, 'GoogleAuthEnabled', {
        value: 'false',
      });
    }
  }
}