# V.A.T.S. (Various Amateur Tournaments Showdown)

A React web application that allows users to create profiles and select college football teams for tournaments.

## Features

- User authentication and profile management
- Profile picture upload
- Selection of college football teams from an autocomplete list
- AWS-powered backend services

## Architecture

The application consists of:

- React frontend with TypeScript
- AWS CDK infrastructure
  - Amazon Cognito for authentication
  - Amazon S3 for storing profile pictures
  - Amazon DynamoDB for storing user profiles and team selections
  - Amazon API Gateway for REST API endpoints
  - AWS Lambda functions for backend processing

## Prerequisites

- Node.js (v14.x or later)
- npm or yarn
- AWS CLI configured with appropriate permissions
- AWS CDK CLI installed

## Setup and Deployment

### 1. Clone the Repository

```bash
git clone <repository-url>
cd VATS
```

### 2. Deploy the Backend Infrastructure

```bash
cd vats-cdk
npm install
npm run build
cdk deploy
```

Note the outputs from the CDK deployment, which include:
- UserPoolId
- UserPoolClientId
- IdentityPoolId
- ApiUrl
- ProfilePicturesBucketName

### 3. Update Frontend Configuration

Update the AWS configuration in `vats/src/aws-config.ts` with the values from the CDK deployment:

```typescript
export const awsConfig: AwsConfig = {
  region: 'us-east-1',
  userPoolId: 'YOUR_USER_POOL_ID',
  userPoolWebClientId: 'YOUR_USER_POOL_CLIENT_ID',
  identityPoolId: 'YOUR_IDENTITY_POOL_ID',
  profilePicturesBucket: 'YOUR_PROFILE_PICTURES_BUCKET_NAME',
  apiUrl: 'YOUR_API_URL',
};
```

### 4. Deploy the Frontend Application

```bash
cd vats
npm install
npm start # for development
npm run build # for production
```

For production deployment, upload the build directory to an S3 bucket configured for static website hosting or use a service like AWS Amplify.

## Using the Application

1. Create an account using the sign-up page
2. Verify your email address with the verification code
3. Sign in with your credentials
4. Update your profile with your name and profile picture
5. Select 8 teams for your tournament

## Development

### Frontend Development

```bash
cd vats
npm install
npm start
```

### Backend Development

```bash
cd vats-cdk
npm run build
npm run watch # watches for changes
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.