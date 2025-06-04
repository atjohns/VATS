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
    
    if (authenticatedUserId !== requestedUserId) {
      console.log(`Unauthorized: Authenticated user ${authenticatedUserId} tried to access data for ${requestedUserId}`);
      return {
        authorized: false,
        response: createCorsResponse(403, { 
          message: 'Forbidden: You can only access your own data'
        })
      };
    }
    
    return { authorized: true };
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