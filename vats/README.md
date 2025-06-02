# V.A.T.S. React Frontend

This directory contains the React frontend application for the V.A.T.S. (Various Amateur Tournaments Showdown) system.

## Features

- User registration and authentication
- Profile management with photo upload
- FCS team selection with autocomplete

## Project Structure

```
src/
  ├── assets/          # Static assets
  ├── components/      # Reusable React components
  │   ├── ProfileForm.tsx
  │   └── TeamSelectionForm.tsx
  ├── contexts/        # React contexts
  │   └── AuthContext.tsx
  ├── pages/           # Page components
  │   ├── Home.tsx
  │   ├── SignIn.tsx
  │   └── SignUp.tsx
  ├── services/        # API services
  │   └── api.ts
  ├── aws-config.ts    # AWS configuration
  ├── fcs-teams.ts     # FCS teams data
  └── App.tsx          # Main application component
```

## Prerequisites

- Node.js (v14.x or later)
- npm or yarn
- Backend infrastructure deployed (see the ../vats-cdk directory)

## Setup and Configuration

1. Install dependencies:
   ```bash
   npm install
   ```

2. Update the AWS configuration in `src/aws-config.ts` with values from the CDK deployment:
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

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

## Deployment Options

You can deploy the built frontend using various methods:

1. **AWS Amplify**:
   - Connect your repository to AWS Amplify for CI/CD deployment

2. **AWS S3 + CloudFront**:
   - Upload the build directory to an S3 bucket configured for static website hosting
   - Create a CloudFront distribution pointing to the bucket for global CDN

3. **Vercel or Netlify**:
   - Connect your repository for automated deployment

## Dependencies

- React and React Router for UI and routing
- Material-UI for component styling
- AWS Amplify for authentication and AWS service interaction