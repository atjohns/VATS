// Import AWS SDK v3 for DynamoDB and S3
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { 
  DynamoDBDocumentClient
} = require('@aws-sdk/lib-dynamodb');
const { S3Client } = require('@aws-sdk/client-s3');

// Create clients
const dynamoClient = new DynamoDBClient({ region: 'us-east-1' });
const dynamodb = DynamoDBDocumentClient.from(dynamoClient);
const s3 = new S3Client({ region: 'us-east-1' });

/**
 * Creates a response with CORS headers
 */
function createCorsResponse(statusCode, body = {}) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,GET,PUT,POST,DELETE',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With,Accept',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };
}

/**
 * Validates user authorization based on JWT claims
 */
function authorizeUser(event, requestedUserId) {
  console.log('Auth check for userId:', requestedUserId);
  console.log('Auth Context:', JSON.stringify(event.requestContext?.authorizer || {}, null, 2));
  console.log('Request Headers:', JSON.stringify(event.headers || {}, null, 2));

  if (event.requestContext?.authorizer?.claims) {
    const claims = event.requestContext.authorizer.claims;
    const authenticatedUserId = claims.sub;
    console.log('Authenticated user ID:', authenticatedUserId);
    console.log('Requested user ID:', requestedUserId);
    
    // Check if user is in the admin group
    console.log('Claims:', JSON.stringify(claims, null, 2));
    
    // Method 1: Check for cognito:groups in token claims
    let isAdmin = false;
    const userGroups = claims['cognito:groups'] || [];
    if (Array.isArray(userGroups) && userGroups.includes('admins')) {
      isAdmin = true;
    }
    
    console.log('User groups:', JSON.stringify(userGroups));
    console.log('Is admin:', isAdmin);
    
    // Check if this is an admin endpoint check
    if (requestedUserId === 'admin-check') {
      if (isAdmin) {
        console.log('Admin access granted');
        return { authorized: true, isAdmin: true };
      } else {
        console.log('Admin access denied - not an admin user');
        return {
          authorized: false,
          response: createCorsResponse(403, { 
            message: 'Forbidden: Admin access required'
          })
        };
      }
    }
    
    // If user is admin or accessing their own data, authorize
    if (isAdmin || authenticatedUserId === requestedUserId) {
      console.log(isAdmin ? 'Admin access granted' : 'Self access granted');
      return { authorized: true, isAdmin };
    }
    
    // Otherwise deny access
    console.log(`Unauthorized: Authenticated user ${authenticatedUserId} tried to access data for ${requestedUserId}`);
    return {
      authorized: false,
      response: createCorsResponse(403, { 
        message: 'Forbidden: You can only access your own data'
      })
    };
  }
  
  console.log('No claims found in request');
  return {
    authorized: false,
    response: createCorsResponse(401, {
      message: 'Unauthorized: Authentication required'
    })
  };
}

module.exports = {
  dynamodb,
  s3,
  createCorsResponse,
  authorizeUser
};