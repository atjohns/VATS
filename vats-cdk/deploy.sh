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
API_URL=$(cat cdk-outputs.json | jq -r '.VatsStack.ApiUrl' | sed 's/\/$//')
WEBSITE_BUCKET_NAME=$(cat cdk-outputs.json | jq -r '.VatsStack.WebsiteBucketName')
CLOUDFRONT_URL=$(cat cdk-outputs.json | jq -r '.VatsStack.CloudFrontURL')

# Extract Google OAuth related outputs if available
GOOGLE_AUTH_ENABLED=$(cat cdk-outputs.json | jq -r '.VatsStack.GoogleAuthEnabled // "false"')
USER_POOL_DOMAIN=$(cat cdk-outputs.json | jq -r '.VatsStack.UserPoolDomain // ""')
HOSTED_UI_SIGN_IN_URL=$(cat cdk-outputs.json | jq -r '.VatsStack.HostedUISignInUrl // ""')

echo "=================================================="
echo "CDK Deployment Complete!"
echo "=================================================="
echo "AWS Resources:"
echo "User Pool ID: $USER_POOL_ID"
echo "User Pool Client ID: $USER_POOL_CLIENT_ID"
echo "Identity Pool ID: $IDENTITY_POOL_ID"
echo "API URL: $API_URL"
echo "Website Bucket: $WEBSITE_BUCKET_NAME"
echo "CloudFront URL: $CLOUDFRONT_URL"
echo "Google Auth Enabled: $GOOGLE_AUTH_ENABLED"
if [ "$GOOGLE_AUTH_ENABLED" == "true" ]; then
  echo "User Pool Domain: $USER_POOL_DOMAIN"
  echo "Hosted UI Sign-in URL: $HOSTED_UI_SIGN_IN_URL"
fi
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
  websiteBucketName: string;
  apiUrl: string;
  cloudfrontUrl: string;
  // Google OAuth related settings
  googleAuthEnabled: boolean;
  userPoolDomain?: string;
  hostedUISignInUrl?: string;
  oauth?: {
    domain: string;
    redirectSignIn: string;
    redirectSignOut: string;
    responseType: string;
  };
}

export const awsConfig: AwsConfig = {
  region: 'us-east-1',
  userPoolId: '$USER_POOL_ID',
  userPoolWebClientId: '$USER_POOL_CLIENT_ID',
  identityPoolId: '$IDENTITY_POOL_ID',
  websiteBucketName: '$WEBSITE_BUCKET_NAME',
  apiUrl: '$API_URL',
  cloudfrontUrl: '$CLOUDFRONT_URL',
  googleAuthEnabled: $GOOGLE_AUTH_ENABLED,
EOL

if [ "$GOOGLE_AUTH_ENABLED" == "true" ]; then
  # Extract domain name from the full URL
  DOMAIN_NAME=$(echo $USER_POOL_DOMAIN | sed -e 's|^[^/]*//||' -e 's|/.*$||')
  
  cat >> $CONFIG_FILE << EOL
  userPoolDomain: '$USER_POOL_DOMAIN',
  hostedUISignInUrl: '$HOSTED_UI_SIGN_IN_URL',
  oauth: {
    domain: '$DOMAIN_NAME',
    redirectSignIn: '$CLOUDFRONT_URL/home,$CLOUDFRONT_URL/admin,http://localhost:3000/home',
    redirectSignOut: '$CLOUDFRONT_URL,http://localhost:3000',
    responseType: 'code'
  }
EOL
else
  cat >> $CONFIG_FILE << EOL
  // OAuth not configured
EOL
fi

cat >> $CONFIG_FILE << EOL
};
EOL

echo "Frontend configuration file generated at $CONFIG_FILE"

echo "=================================================="
echo "Building and deploying the React application..."
echo "=================================================="

# Navigate to the React app directory
cd ../vats

# Install dependencies
echo "Installing React app dependencies..."
npm install

# Build the React application
echo "Building the React application..."
npm run build

# Deploy to S3
echo "Deploying to S3 bucket: $WEBSITE_BUCKET_NAME..."
aws s3 sync build/ s3://$WEBSITE_BUCKET_NAME/ --delete

# Invalidate CloudFront cache
echo "Invalidating CloudFront cache..."
# Extract CloudFront distribution ID
DIST_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?DefaultCacheBehavior.TargetOriginId=='$WEBSITE_BUCKET_NAME'].Id" --output text)

if [ ! -z "$DIST_ID" ]; then
  aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"
  echo "CloudFront invalidation created for distribution: $DIST_ID"
else
  echo "CloudFront distribution ID not found for bucket: $WEBSITE_BUCKET_NAME"
fi

echo "=================================================="
echo "Deployment completed successfully!"
echo "=================================================="
echo "Your application is now available at:"
echo "$CLOUDFRONT_URL"
echo ""
echo "For local development:"
echo "1. Navigate to the React app directory: cd ../vats"
echo "2. Start the dev server: npm start"
echo "=================================================="