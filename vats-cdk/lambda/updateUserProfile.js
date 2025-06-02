const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

exports.handler = async (event) => {
  try {
    const { userId } = event.pathParameters;
    const { name, profilePictureBase64 } = JSON.parse(event.body);
    
    // Create update expression for DynamoDB
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
    
    // If a profile picture was uploaded, save it to S3
    if (profilePictureBase64) {
      // Remove the data URL prefix
      const base64Data = profilePictureBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      const fileExtension = profilePictureBase64.split(';')[0].split('/')[1];
      const profilePictureKey = `${userId}/profile.${fileExtension}`;
      
      await s3.putObject({
        Bucket: process.env.PROFILE_PICTURES_BUCKET,
        Key: profilePictureKey,
        Body: buffer,
        ContentEncoding: 'base64',
        ContentType: `image/${fileExtension}`
      }).promise();
      
      // Add the profile picture key to the DynamoDB update
      updateParams.UpdateExpression += ', profilePictureKey = :profilePictureKey';
      updateParams.ExpressionAttributeValues[':profilePictureKey'] = profilePictureKey;
    }
    
    // Update the user profile in DynamoDB
    const result = await dynamodb.update(updateParams).promise();
    
    // Generate a presigned URL for the profile picture
    let profilePictureUrl;
    if (result.Attributes.profilePictureKey) {
      const signedUrlParams = {
        Bucket: process.env.PROFILE_PICTURES_BUCKET,
        Key: result.Attributes.profilePictureKey,
        Expires: 3600 // URL valid for 1 hour
      };
      
      profilePictureUrl = await s3.getSignedUrlPromise('getObject', signedUrlParams);
    }
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...result.Attributes,
        profilePictureUrl
      })
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