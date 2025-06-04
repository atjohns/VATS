// Import handler modules
const { getUserProfile, updateUserProfile } = require('./userProfile');
const { getTeamSelections, updateTeamSelections } = require('./teamSelections');
const { createCorsResponse, authorizeUser } = require('./utils');

/**
 * Main API handler that routes requests to the appropriate handlers
 */
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event));

  // Handle OPTIONS preflight requests for CORS
  if (event.httpMethod === 'OPTIONS') {
    return createCorsResponse(200);
  }

  // Extract path and HTTP method for routing
  const path = event.path;
  const method = event.httpMethod;

  try {
    // Extract userId from path
    const pathParts = path.split('/');
    const userId = pathParts[2]; // /users/{userId}/...

    // Validate user authorization
    const authResult = authorizeUser(event, userId);
    if (!authResult.authorized) {
      return authResult.response;
    }

    // Route based on path and method
    if (path.match(/^\/users\/[^/]+\/team-selections$/) && method === 'GET') {
      return await getTeamSelections(userId);
    } else if (path.match(/^\/users\/[^/]+\/team-selections$/) && method === 'PUT') {
      return await updateTeamSelections(event, userId);
    } else if (path.match(/^\/users\/[^/]+$/) && method === 'GET') {
      return await getUserProfile(userId);
    } else if (path.match(/^\/users\/[^/]+$/) && method === 'PUT') {
      return await updateUserProfile(event, userId);
    } else {
      return createCorsResponse(404, {
        message: `Not Found: ${method} ${path}`
      });
    }
  } catch (error) {
    console.error('Error:', error);
    return createCorsResponse(500, { 
      message: 'Internal server error',
      error: error.message
    });
  }
};