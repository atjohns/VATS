import { Amplify } from 'aws-amplify';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import { awsConfig } from './aws-config';

// Configure Amplify for V6
export const configureAmplify = () => {
  // Configure all Amplify services using legacy format for compatibility
  const config = {
    // Top-level region property
    region: awsConfig.region,
    
    // Auth configuration for v6
    Auth: {
      Cognito: {
        userPoolId: awsConfig.userPoolId,
        userPoolClientId: awsConfig.userPoolWebClientId,
        identityPoolId: awsConfig.identityPoolId
      }
    },
    
    // Legacy auth config - needed for backward compatibility
    aws_project_region: awsConfig.region,
    aws_cognito_identity_pool_id: awsConfig.identityPoolId,
    aws_cognito_region: awsConfig.region,
    aws_user_pools_id: awsConfig.userPoolId,
    aws_user_pools_web_client_id: awsConfig.userPoolWebClientId,
    
    // Storage configuration
    Storage: {
      S3: {
        bucket: awsConfig.profilePicturesBucket,
        region: awsConfig.region
      }
    },
    
    // Legacy storage config
    aws_user_files_s3_bucket: awsConfig.profilePicturesBucket,
    aws_user_files_s3_bucket_region: awsConfig.region,
    
    // API configuration
    API: {
      REST: {
        VatsApi: {
          endpoint: awsConfig.apiUrl,
          region: awsConfig.region
        }
      }
    },
    
    // Legacy API config
    aws_cloud_logic_custom: [{
      name: "VatsApi",
      endpoint: awsConfig.apiUrl,
      region: awsConfig.region
    }]
  };

  // Apply the configuration
  Amplify.configure(config);

  // Set up API token handler
  cognitoUserPoolsTokenProvider.setKeyValueStorage({
    getItem: async (key: string) => {
      const value = localStorage.getItem(key);
      console.log('Storage key accessed:', key, 'exists:', !!value);
      return value;
    },
    setItem: async (key: string, value: string) => {
      console.log('Storage setting key:', key);
      localStorage.setItem(key, value);
    },
    removeItem: async (key: string) => {
      console.log('Storage removing key:', key);
      localStorage.removeItem(key);
    },
    clear: async () => {
      console.log('Storage clearing all');
      localStorage.clear();
    }
  });
};