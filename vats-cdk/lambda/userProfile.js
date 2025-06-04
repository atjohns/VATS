const { 
  GetCommand, 
  PutCommand, 
  UpdateCommand 
} = require('@aws-sdk/lib-dynamodb');
const { 
  PutObjectCommand, 
  GetObjectCommand 
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { dynamodb, s3, createCorsResponse } = require('./utils');

/**
 * Get user profile
 */
async function getUserProfile(userId) {
  const params = {
    TableName: process.env.USERS_TABLE,
    Key: { userId }
  };
  
  const command = new GetCommand(params);
  const result = await dynamodb.send(command);
  
  // If user doesn't exist in DynamoDB yet, create a basic profile record
  if (!result.Item) {
    // Return a minimal profile so the frontend can handle this gracefully
    return createCorsResponse(200, { 
      userId,
      name: '',
      isNew: true // Flag to indicate this is a new user
    });
  }
  
  const user = result.Item;
  
  // If the user has a profile picture, get a presigned URL
  if (user.profilePictureKey) {
    const command = new GetObjectCommand({
      Bucket: process.env.PROFILE_PICTURES_BUCKET,
      Key: user.profilePictureKey
    });
    
    // Get presigned URL valid for 1 hour
    user.profilePictureUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
  }
  
  return createCorsResponse(200, user);
}

/**
 * Update user profile
 */
async function updateUserProfile(event, userId) {
  // Log event details to help debug
  console.log('Update user profile event:', JSON.stringify(event));
  console.log('Event body type:', typeof event.body);
  console.log('Event body content:', event.body);
  
  // Safely parse the event body
  let name, profilePictureBase64;
  try {
    // First, ensure we have a parsed object
    let parsedBody;
    if (typeof event.body === 'string') {
      parsedBody = JSON.parse(event.body);
    } else if (typeof event.body === 'object') {
      parsedBody = event.body;
    } else {
      console.error('Unexpected event body type:', typeof event.body);
      return createCorsResponse(400, { message: 'Invalid request body format' });
    }
    
    console.log('Parsed body:', JSON.stringify(parsedBody));
    
    // Extract the required fields from the parsed body
    if (parsedBody) {
      name = parsedBody.name;
      profilePictureBase64 = parsedBody.profilePictureBase64;
      console.log('Name:', name);
      console.log('Has profile picture:', !!profilePictureBase64);
    } else {
      console.error('Empty parsed body');
      return createCorsResponse(400, { message: 'Missing required data' });
    }
  } catch (error) {
    console.error('Error parsing event body:', error);
    return createCorsResponse(400, { message: 'Invalid request body format' });
  }
  
  // First, check if the user already exists
  const checkParams = {
    TableName: process.env.USERS_TABLE,
    Key: { userId }
  };
  
  const getCommand = new GetCommand(checkParams);
  const existingUser = await dynamodb.send(getCommand);
  
  let profilePictureKey = existingUser.Item?.profilePictureKey;
  
  // If a profile picture was uploaded, save it to S3
  if (profilePictureBase64) {
    // Remove the data URL prefix
    const base64Data = profilePictureBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    const fileExtension = profilePictureBase64.split(';')[0].split('/')[1];
    profilePictureKey = `${userId}/profile.${fileExtension}`;
    
    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.PROFILE_PICTURES_BUCKET,
      Key: profilePictureKey,
      Body: buffer,
      ContentEncoding: 'base64',
      ContentType: `image/${fileExtension}`
    });
    
    await s3.send(putObjectCommand);
  }
  
  let result;
  
  if (!existingUser.Item) {
    // User doesn't exist yet, create a new record
    const putParams = {
      TableName: process.env.USERS_TABLE,
      Item: {
        userId,
        name,
        createdAt: new Date().toISOString(),
        ...(profilePictureKey && { profilePictureKey })
      }
    };
    
    const putCommand = new PutCommand(putParams);
    await dynamodb.send(putCommand);
    
    // Get the newly created user
    result = putParams.Item;
  } else {
    // User exists, update the existing record
    const updateParams = {
      TableName: process.env.USERS_TABLE,
      Key: { userId },
      UpdateExpression: 'SET #name = :name',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':name': name
      },
      ReturnValues: 'ALL_NEW'
    };
    
    if (profilePictureKey) {
      updateParams.UpdateExpression += ', profilePictureKey = :profilePictureKey';
      updateParams.ExpressionAttributeValues[':profilePictureKey'] = profilePictureKey;
    }
    
    const updateCommand = new UpdateCommand(updateParams);
    const updateResult = await dynamodb.send(updateCommand);
    result = updateResult.Attributes;
  }
  
  // Generate a presigned URL for the profile picture
  if (result.profilePictureKey) {
    const command = new GetObjectCommand({
      Bucket: process.env.PROFILE_PICTURES_BUCKET,
      Key: result.profilePictureKey
    });
    
    // Get presigned URL valid for 1 hour
    result.profilePictureUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
  }
  
  return createCorsResponse(200, result);
}

module.exports = {
  getUserProfile,
  updateUserProfile
};