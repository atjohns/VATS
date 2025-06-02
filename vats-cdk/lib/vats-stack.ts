import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class VatsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create S3 bucket for profile pictures
    const profilePicturesBucket = new s3.Bucket(this, 'ProfilePicturesBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.POST,
            s3.HttpMethods.PUT,
          ],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
    });

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

    // Create Cognito User Pool for authentication
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

    // Create app client
    const userPoolClient = new cognito.UserPoolClient(this, 'VatsUserPoolClient', {
      userPool,
      generateSecret: false,
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      oAuth: {
        flows: {
          implicitCodeGrant: true,
        },
        callbackUrls: ['http://localhost:3000'],
        logoutUrls: ['http://localhost:3000'],
      },
    });

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
          's3:GetObject',
          's3:PutObject',
        ],
        resources: [
          profilePicturesBucket.arnForObjects('${cognito-identity.amazonaws.com:sub}/*'),
        ],
      })
    );

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

    // Define Lambda functions for API
    const getUserProfileLambda = new lambda.Function(this, 'GetUserProfileLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'getUserProfile.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        USERS_TABLE: usersTable.tableName,
        PROFILE_PICTURES_BUCKET: profilePicturesBucket.bucketName,
      },
    });

    const updateUserProfileLambda = new lambda.Function(this, 'UpdateUserProfileLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'updateUserProfile.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        USERS_TABLE: usersTable.tableName,
      },
    });

    const getTeamSelectionsLambda = new lambda.Function(this, 'GetTeamSelectionsLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'getTeamSelections.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        TEAM_SELECTIONS_TABLE: teamSelectionsTable.tableName,
      },
    });

    const updateTeamSelectionsLambda = new lambda.Function(this, 'UpdateTeamSelectionsLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'updateTeamSelections.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        TEAM_SELECTIONS_TABLE: teamSelectionsTable.tableName,
      },
    });

    // Grant required permissions to Lambda functions
    usersTable.grantReadWriteData(getUserProfileLambda);
    usersTable.grantReadWriteData(updateUserProfileLambda);
    teamSelectionsTable.grantReadWriteData(getTeamSelectionsLambda);
    teamSelectionsTable.grantReadWriteData(updateTeamSelectionsLambda);
    profilePicturesBucket.grantRead(getUserProfileLambda);
    profilePicturesBucket.grantReadWrite(updateUserProfileLambda);

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'VatsApi', {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    // Create authorizer for API
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'VatsAuthorizer', {
      cognitoUserPools: [userPool],
    });

    // Create API endpoints
    const users = api.root.addResource('users');
    
    const userProfile = users.addResource('{userId}');
    userProfile.addMethod('GET', new apigateway.LambdaIntegration(getUserProfileLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    userProfile.addMethod('PUT', new apigateway.LambdaIntegration(updateUserProfileLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // Add team-selections as a child resource of userProfile instead of creating a new {userId} resource
    const teamSelections = userProfile.addResource('team-selections');
    teamSelections.addMethod('GET', new apigateway.LambdaIntegration(getTeamSelectionsLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    teamSelections.addMethod('PUT', new apigateway.LambdaIntegration(updateTeamSelectionsLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
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
    
    new cdk.CfnOutput(this, 'ProfilePicturesBucketName', {
      value: profilePicturesBucket.bucketName,
    });
  }
}