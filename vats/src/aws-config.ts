interface AwsConfig {
  region: string;
  userPoolId: string;
  userPoolWebClientId: string;
  identityPoolId: string;
  profilePicturesBucket: string;
  apiUrl: string;
}

export const awsConfig: AwsConfig = {
  // Update these values after deploying the CDK stack
  region: 'us-east-1',
  userPoolId: 'USER_POOL_ID', // Replace after CDK deployment
  userPoolWebClientId: 'USER_POOL_CLIENT_ID', // Replace after CDK deployment
  identityPoolId: 'IDENTITY_POOL_ID', // Replace after CDK deployment
  profilePicturesBucket: 'PROFILE_PICTURES_BUCKET_NAME', // Replace after CDK deployment
  apiUrl: 'API_URL', // Replace after CDK deployment
};