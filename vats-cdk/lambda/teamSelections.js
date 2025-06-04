const { 
  GetCommand, 
  PutCommand, 
  UpdateCommand 
} = require('@aws-sdk/lib-dynamodb');
const { fbsTeamsMap } = require('./fbsTeamsData');
const { dynamodb, createCorsResponse } = require('./utils');

/**
 * Get user team selections
 */
async function getTeamSelections(userId) {
  const params = {
    TableName: process.env.TEAM_SELECTIONS_TABLE,
    Key: { userId }
  };
  
  const command = new GetCommand(params);
  const result = await dynamodb.send(command);
  
  if (!result.Item) {
    return createCorsResponse(200, { 
      userId, 
      teamSelections: [], 
      isNew: true 
    });
  }
  
  // Reconstruct full team data
  const minimalTeamData = result.Item.teamSelections || [];
  const fullTeamData = minimalTeamData.map(team => {
    const teamDetails = fbsTeamsMap[team.schoolName] || {};
    return {
      id: team.id,
      schoolName: team.schoolName,
      teamName: teamDetails.teamName || "Unknown",
      location: teamDetails.location || "Unknown",
      conference: teamDetails.conference || "Unknown"
    };
  });
  
  // Return with full team data
  return createCorsResponse(200, {
    ...result.Item,
    teamSelections: fullTeamData
  });
}

/**
 * Update user team selections
 */
async function updateTeamSelections(event, userId) {
  // Log event details to help debug
  var body = JSON.parse(event.body);
  var parsedBody = JSON.parse(body);
  console.log('body JSON:', parsedBody);

  var teamSelections = parsedBody.teamSelections;
  
  // Validate team selections
  if (!Array.isArray(teamSelections) || teamSelections.length !== 8) {
    return createCorsResponse(400, { message: 'Must select exactly 8 teams' });
  }
  
  // Extract only the minimal data needed (id and schoolName)
  const minimalTeamData = teamSelections.map(team => ({
    id: team.id,
    schoolName: team.schoolName
  }));
  
  // First check if the user already exists in the table
  const checkParams = {
    TableName: process.env.TEAM_SELECTIONS_TABLE,
    Key: { userId }
  };
  
  const getCommand = new GetCommand(checkParams);
  const existingRecord = await dynamodb.send(getCommand);
  
  let result;
  const timestamp = new Date().toISOString();
  
  if (!existingRecord.Item) {
    // Create a new record for new users
    const putParams = {
      TableName: process.env.TEAM_SELECTIONS_TABLE,
      Item: {
        userId,
        teamSelections: minimalTeamData,
        createdAt: timestamp,
        updatedAt: timestamp
      }
    };
    
    const putCommand = new PutCommand(putParams);
    await dynamodb.send(putCommand);
    
    result = {
      userId,
      teamSelections,
      createdAt: timestamp,
      updatedAt: timestamp
    };
  } else {
    // Update existing record
    const updateParams = {
      TableName: process.env.TEAM_SELECTIONS_TABLE,
      Key: { userId },
      UpdateExpression: 'SET teamSelections = :teamSelections, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':teamSelections': minimalTeamData,
        ':updatedAt': timestamp
      },
      ReturnValues: 'ALL_NEW'
    };
    
    const updateCommand = new UpdateCommand(updateParams);
    const updateResult = await dynamodb.send(updateCommand);
    
    // Return the full team details rather than just the minimal data
    result = {
      ...updateResult.Attributes,
      teamSelections: teamSelections
    };
  }
  
  return createCorsResponse(200, result);
}

module.exports = {
  getTeamSelections,
  updateTeamSelections
};