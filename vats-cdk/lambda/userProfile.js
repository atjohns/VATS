const { CognitoIdentityProviderClient, ListUsersCommand } = require("@aws-sdk/client-cognito-identity-provider");
const { createCorsResponse } = require('./utils');

/**
 * Get user profile, this function is not in use
 */
async function getUserProfile(userId) {
  const user = ''
  
  return createCorsResponse(200, user);
}

/**
 * Get all users (admin only endpoint)
 */
async function getAllUsers() {
  console.log('getAllUsers called');
  
  try {
    // Get the User Pool ID from environment variables or use fallback if needed
    const userPoolId = process.env.USER_POOL_ID || 'us-east-1_uYyr7tAKF';
    const region = process.env.REGION || 'us-east-1';
    
    console.log('Using User Pool ID:', userPoolId);
    console.log('Using Region:', region);
    
    // Create a client with the specified region
    const client = new CognitoIdentityProviderClient({ region });
    
    // List users from the Cognito User Pool
    const command = new ListUsersCommand({ 
      UserPoolId: userPoolId,
      Limit: 60 // Limit results for faster response
    });
    
    console.log('Sending ListUsersCommand');
    const response = await client.send(command);
    console.log(`Received ${response.Users?.length || 0} users`);
    
    // Format the users for the response
    const users = (response.Users || []).map(user => {
      // Extract attributes like email, name, etc.
      const getAttr = (name) => {
        const attr = user.Attributes?.find(a => a.Name === name);
        return attr ? attr.Value : undefined;
      };
      
      return {
        userId: getAttr('sub'),
        username: user.Username,
        email: getAttr('email'),
        name: getAttr('name') || `${getAttr('given_name') || ''} ${getAttr('family_name') || ''}`.trim()
      };
    });
    
    return createCorsResponse(200, { users });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    return createCorsResponse(500, { message: 'Error fetching users', error: error.toString() });
  }
}

/**
 * Update user profile, this function is not in use
 */
async function updateUserProfile() {
  return createCorsResponse(200, '');
}

module.exports = {
  getUserProfile,
  updateUserProfile,
  getAllUsers
};