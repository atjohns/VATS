#!/bin/bash
# V.A.T.S. deployment script

# Ensure script exits if any command fails
set -e

echo "=================================================="
echo "V.A.T.S. Infrastructure Deployment"
echo "=================================================="

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the TypeScript code
echo "Building TypeScript code..."
npm run build

# Deploy the CDK stack
echo "Deploying CDK stack..."
cdk deploy

# Store the outputs in a file
echo "Storing CDK outputs..."
cdk deploy --outputs-file cdk-outputs.json
echo "CDK outputs saved to cdk-outputs.json"

# Extract the outputs
echo "Extracting outputs for frontend configuration..."
USER_POOL_ID=$(cat cdk-outputs.json | jq -r '.VatsStack.UserPoolId')
USER_POOL_CLIENT_ID=$(cat cdk-outputs.json | jq -r '.VatsStack.UserPoolClientId')
IDENTITY_POOL_ID=$(cat cdk-outputs.json | jq -r '.VatsStack.IdentityPoolId')
API_URL=$(cat cdk-outputs.json | jq -r '.VatsStack.ApiUrl')
PROFILE_PICTURES_BUCKET=$(cat cdk-outputs.json | jq -r '.VatsStack.ProfilePicturesBucketName')

echo "=================================================="
echo "CDK Deployment Complete!"
echo "=================================================="
echo "AWS Resources:"
echo "User Pool ID: $USER_POOL_ID"
echo "User Pool Client ID: $USER_POOL_CLIENT_ID"
echo "Identity Pool ID: $IDENTITY_POOL_ID"
echo "API URL: $API_URL"
echo "Profile Pictures Bucket: $PROFILE_PICTURES_BUCKET"
echo "=================================================="


# Generate a configuration file for the frontend
echo "Generating frontend configuration..."
CONFIG_FILE="../vats/src/aws-config.ts"
cat > $CONFIG_FILE << EOL
interface AwsConfig {
  region: string;
  userPoolId: string;
  userPoolWebClientId: string;
  identityPoolId: string;
  profilePicturesBucket: string;
  apiUrl: string;
}

export const awsConfig: AwsConfig = {
  region: 'us-east-1',
  userPoolId: '$USER_POOL_ID',
  userPoolWebClientId: '$USER_POOL_CLIENT_ID',
  identityPoolId: '$IDENTITY_POOL_ID',
  profilePicturesBucket: '$PROFILE_PICTURES_BUCKET',
  apiUrl: '$API_URL',
};
EOL

echo "Frontend configuration file generated at $CONFIG_FILE"


echo "=================================================="
echo "Deployment completed successfully!"
echo "=================================================="
echo "Next steps:"
echo "1. Navigate to the React app directory: cd ../vats"
echo "2. Install dependencies: npm install"
echo "3. Start the dev server: npm start"
echo "=================================================="