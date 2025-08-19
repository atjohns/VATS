const { 
  CognitoIdentityProviderClient, 
  ListUsersCommand,
  AdminUpdateUserAttributesCommand
} = require("@aws-sdk/client-cognito-identity-provider");
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
        name: getAttr('name') || `${getAttr('given_name') || ''} ${getAttr('family_name') || ''}`.trim(),
        teamName: getAttr('preferred_username'),
        profile: getAttr('profile')
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

/**
 * Update user's team name (preferred_username attribute)
 */
async function updateTeamName(event) {
  try {
    // Get the User Pool ID from environment variables
    const userPoolId = process.env.USER_POOL_ID || 'us-east-1_uYyr7tAKF';
    const region = process.env.REGION || 'us-east-1';
    
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { teamName } = body;
    
    // Validate input
    if (!teamName || typeof teamName !== 'string') {
      return createCorsResponse(400, { message: 'Team name is required' });
    }
    
    // Get user ID from the event
    const userId = event.requestContext?.authorizer?.claims?.sub;
    if (!userId) {
      return createCorsResponse(401, { message: 'Unauthorized' });
    }
    
    // Create a client with the specified region
    const client = new CognitoIdentityProviderClient({ region });
    
    // First, get the username from the user ID (sub)
    const listCommand = new ListUsersCommand({
      UserPoolId: userPoolId,
      Filter: `sub = "${userId}"`,
      Limit: 1
    });
    
    const listResponse = await client.send(listCommand);
    if (!listResponse.Users || listResponse.Users.length === 0) {
      return createCorsResponse(404, { message: 'User not found' });
    }
    
    const username = listResponse.Users[0].Username;
    
    // Update the preferred_username attribute
    const updateCommand = new AdminUpdateUserAttributesCommand({
      UserPoolId: userPoolId,
      Username: username,
      UserAttributes: [
        {
          Name: 'preferred_username',
          Value: teamName
        }
      ]
    });
    
    await client.send(updateCommand);
    
    return createCorsResponse(200, { 
      message: 'Team name updated successfully',
      teamName
    });
  } catch (error) {
    console.error('Error updating team name:', error);
    return createCorsResponse(500, { 
      message: 'Failed to update team name',
      error: error.message
    });
  }
}

module.exports = {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  updateTeamName
};