# V.A.T.S. CDK Infrastructure

This directory contains the AWS CDK (Cloud Development Kit) code for deploying the backend infrastructure for the V.A.T.S. application.

## Architecture Components

- **Amazon Cognito**: User authentication and authorization
- **Amazon S3**: Storage for profile pictures
- **Amazon DynamoDB**: NoSQL database for storing user profiles and team selections
- **Amazon API Gateway**: REST API endpoints
- **AWS Lambda**: Serverless functions for backend logic

## Prerequisites

- AWS CLI installed and configured
- Node.js (v14.x or later)
- npm or yarn
- AWS CDK CLI: `npm install -g aws-cdk`

## Deployment Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the TypeScript code:
   ```bash
   npm run build
   ```

3. Bootstrap the CDK (first time only):
   ```bash
   cdk bootstrap
   ```

4. Deploy the stack:
   ```bash
   cdk deploy
   ```

5. Note the outputs displayed after deployment:
   - UserPoolId
   - UserPoolClientId
   - IdentityPoolId
   - ApiUrl
   - ProfilePicturesBucketName

6. Update the React frontend configuration with these values in `vats/src/aws-config.ts`.

## Lambda Functions

The stack includes several Lambda functions:

- `getUserProfile`: Retrieve user profile information
- `updateUserProfile`: Update user profile and profile picture
- `getTeamSelections`: Retrieve user's selected teams
- `updateTeamSelections`: Update user's team selections


## Cleaning Up

To destroy the deployed resources:
```bash
cdk destroy
```

## CDK Documentation

- [AWS CDK Developer Guide](https://docs.aws.amazon.com/cdk/latest/guide/home.html)
- [AWS CDK API Reference](https://docs.aws.amazon.com/cdk/api/latest/)