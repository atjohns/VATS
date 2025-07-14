// Import handler modules
const { getUserProfile, updateUserProfile, getAllUsers } = require('./userProfile');
const { getTeamSelections, updateTeamSelections, getAllTeamSelections } = require('./teamSelections');
const { getTeamScores, getTeamScore, updateTeamScores } = require('./teamScores');
const { getLeaderboard } = require('./leaderboard');
const { getLeaderboardConfig } = require('./leaderboardConfig');
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
    // Special public endpoints that don't require specific authorization
    if (path === '/leaderboard') {
      const sport = event.queryStringParameters?.sport || 'football';
      return await getLeaderboard(sport);
    }
    
    if (path === '/leaderboard-config') {
      return createCorsResponse(200, getLeaderboardConfig());
    }
    
    // Check if this is an admin API endpoint
    if (path.startsWith('/admin/')) {
      return await handleAdminRequest(event, path, method);
    }
    
    // Handle regular user API endpoint
    return await handleUserRequest(event, path, method);
  } catch (error) {
    console.error('Error:', error);
    return createCorsResponse(500, { 
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Handle requests to the regular user API endpoints
 */
async function handleUserRequest(event, path, method) {
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
}

/**
 * Handle requests to the admin API endpoints
 */
async function handleAdminRequest(event, path, method) {
  console.log('Handling admin request:', path, method);
  
  if (event.requestContext?.authorizer?.claims) {  
    // For logging purposes, still check admin status
    const authResult = authorizeUser(event, 'admin-check');
    console.log('Admin auth result (info only):', JSON.stringify(authResult));
  } else {
    // If not authenticated at all, return unauthorized
    console.log('Admin access denied: Not authenticated');
    return createCorsResponse(401, { 
      message: 'Unauthorized: Authentication required'
    });
  }
  
  // Now that we've confirmed admin status, route the request
  console.log('Admin request confirmed, routing to handler');
  if (path === '/admin/users' && method === 'GET') {
    // Get all users
    console.log('Calling getAllUsers function');
    try {
      const result = await getAllUsers();
      console.log('getAllUsers result:', JSON.stringify(result));
      return result;
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      return createCorsResponse(500, { message: 'Error fetching users', error: error.message });
    }
  } else if (path.match(/^\/admin\/users\/[^/]+\/team-selections$/) && method === 'GET') {
    // Get team selections for a specific user
    const pathParts = path.split('/');
    const targetUserId = pathParts[3]; // /admin/users/{userId}/team-selections
    
    console.log('Admin getting team selections for user:', targetUserId);
    
    // Make sure we're using a valid userId
    if (!targetUserId || targetUserId === 'undefined') {
      return createCorsResponse(400, { message: 'Invalid user ID provided' });
    }
    
    return await getTeamSelections(targetUserId);
  } else if (path.match(/^\/admin\/users\/[^/]+\/team-selections$/) && method === 'PUT') {
    // Update team selections for a specific user
    const pathParts = path.split('/');
    const targetUserId = pathParts[3]; // /admin/users/{userId}/team-selections
    
    console.log('Admin updating team selections for user:', targetUserId);
    
    // Make sure we're using a valid userId
    if (!targetUserId || targetUserId === 'undefined') {
      return createCorsResponse(400, { message: 'Invalid user ID provided' });
    }
    
    return await updateTeamSelections(event, targetUserId);
  } else if (path === '/admin/team-scores' && method === 'GET') {
    // Get all team scores
    console.log('Admin getting all team scores');
    const sport = event.queryStringParameters?.sport;
    return await getTeamScores(sport);
  } else if (path === '/admin/all-team-selections' && method === 'GET') {
    // Get all team selections across users (for admin view)
    console.log('Admin getting all team selections across users');
    const sport = event.queryStringParameters?.sport || 'football';
    return await getAllTeamSelections(sport);
  } else if (path === '/admin/team-scores' && method === 'PUT') {
    // Update team scores
    console.log('Admin updating team scores');
    return await updateTeamScores(event);
  } else if (path.match(/^\/admin\/team-scores\/[^/]+$/) && method === 'GET') {
    // Get specific team score
    const pathParts = path.split('/');
    const teamId = pathParts[3]; // /admin/team-scores/{teamId}
    const sport = event.queryStringParameters?.sport || 'football';
    
    console.log('Admin getting team score for team:', teamId);
    return await getTeamScore(teamId, sport);
  } else {
    return createCorsResponse(404, {
      message: `Not Found: ${method} ${path}`
    });
  }
}