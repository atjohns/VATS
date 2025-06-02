const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

exports.handler = async (event) => {
  try {
    const { userId } = event.pathParameters;
    
    // Get user profile from DynamoDB
    const params = {
      TableName: process.env.USERS_TABLE,
      Key: { userId }
    };
    
    const result = await dynamodb.get(params).promise();
    
    if (!result.Item) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: 'User not found' })
      };
    }
    
    const user = result.Item;
    
    // If the user has a profile picture, get a presigned URL
    if (user.profilePictureKey) {
      const signedUrlParams = {
        Bucket: process.env.PROFILE_PICTURES_BUCKET,
        Key: user.profilePictureKey,
        Expires: 3600 // URL valid for 1 hour
      };
      
      user.profilePictureUrl = await s3.getSignedUrlPromise('getObject', signedUrlParams);
    }
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    };
  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};