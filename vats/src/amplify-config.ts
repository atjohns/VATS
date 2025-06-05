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
        identityPoolId: awsConfig.identityPoolId,
        // Add OAuth configuration if Google auth is enabled
        ...(awsConfig.googleAuthEnabled && {
          loginWith: {
            oauth: {
              domain: awsConfig.oauth?.domain || '',
              scopes: ['email', 'profile', 'openid','aws.cognito.signin.user.admin'],
              responseType: awsConfig.oauth?.responseType || 'code',
              redirectSignIn: (awsConfig.oauth?.redirectSignIn || '').split(','),
              redirectSignOut: (awsConfig.oauth?.redirectSignOut || '').split(','),
              clientId: awsConfig.userPoolWebClientId,
            }
          }
        })
      }
    },
    
    // Legacy auth config - needed for backward compatibility
    aws_project_region: awsConfig.region,
    aws_cognito_identity_pool_id: awsConfig.identityPoolId,
    aws_cognito_region: awsConfig.region,
    aws_user_pools_id: awsConfig.userPoolId,
    aws_user_pools_web_client_id: awsConfig.userPoolWebClientId,
    
    // Add OAuth configuration for legacy compatibility
    ...(awsConfig.googleAuthEnabled && {
      oauth: {
        domain: awsConfig.oauth?.domain,
        scope: ['email', 'profile', 'openid','aws.cognito.signin.user.admin'],
        redirectSignIn: awsConfig.oauth?.redirectSignIn,
        redirectSignOut: awsConfig.oauth?.redirectSignOut,
        responseType: awsConfig.oauth?.responseType,
      },
      federationTarget: 'COGNITO_USER_POOLS'
    }),
    
    
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
      return value;
    },
    setItem: async (key: string, value: string) => {
      localStorage.setItem(key, value);
    },
    removeItem: async (key: string) => {
      localStorage.removeItem(key);
    },
    clear: async () => {
      localStorage.clear();
    }
  });
};