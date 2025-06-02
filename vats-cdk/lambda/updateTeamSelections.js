const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    const { userId } = event.pathParameters;
    const { teamSelections } = JSON.parse(event.body);
    
    // Validate team selections
    if (!Array.isArray(teamSelections) || teamSelections.length !== 8) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: 'Must select exactly 8 teams' })
      };
    }
    
    // Update team selections in DynamoDB
    const params = {
      TableName: process.env.TEAM_SELECTIONS_TABLE,
      Key: { userId },
      UpdateExpression: 'SET teamSelections = :teamSelections, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':teamSelections': teamSelections,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };
    
    const result = await dynamodb.update(params).promise();
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(result.Attributes)
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