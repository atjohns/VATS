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
  userPoolId: '',
  userPoolWebClientId: '6',
  identityPoolId: '',
  websiteBucketName: '',
  apiUrl: '',
  cloudfrontUrl: '',
  googleAuthEnabled: true,
  userPoolDomain: '',
  hostedUISignInUrl: '',
  oauth: {
    domain: '',
    redirectSignIn: '',
    redirectSignOut: '',
    responseType: 'code'
  }
};
