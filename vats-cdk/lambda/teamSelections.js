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
      footballSelections: [], 
      mensbballSelections: [],
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
      conference: teamDetails.conference || "Unknown",
      sport: team.sport || "football" // Default to football for backward compatibility
    };
  });
  
  // Separate selections by sport
  const footballSelections = fullTeamData.filter(team => team.sport === "football" || !team.sport);
  const mensbballSelections = fullTeamData.filter(team => team.sport === "mensbball");
  
  // Return with sport-specific arrays
  return createCorsResponse(200, {
    footballSelections,
    mensbballSelections
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

  var teamSelections;
  if (parsedBody.footballSelections) {
    teamSelections = parsedBody.footballSelections;
    sport = "football";
  } else if (parsedBody.mensbballSelections) {
    teamSelections = parsedBody.mensbballSelections;
    sport = "mensbball";
  }
  
  // Validate team selections
  if (!Array.isArray(teamSelections) || teamSelections.length !== 8) {
    return createCorsResponse(400, { message: 'Must select exactly 8 teams' });
  }
  
  // Extract the minimal data needed (id, schoolName, and sport)
  const minimalTeamData = teamSelections.map(team => ({
    id: team.id,
    schoolName: team.schoolName,
    sport: team.sport || sport // Use provided sport or default
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
    
    // Separate by sport for the response
    const footballSelections = sport === "football" ? teamSelections : [];
    const mensbballSelections = sport === "mensbball" ? teamSelections : [];
    
    result = {
      userId,
      footballSelections,
      mensbballSelections,
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
    
    // Get all team selections from the database after update
    const getAllTeams = new GetCommand({
      TableName: process.env.TEAM_SELECTIONS_TABLE,
      Key: { userId }
    });
    
    const allTeamsResult = await dynamodb.send(getAllTeams);
    const allTeamSelections = allTeamsResult.Item?.teamSelections || [];
    
    // Reconstruct full team data for all teams
    const allFullTeamData = allTeamSelections.map(team => {
      const teamDetails = fbsTeamsMap[team.schoolName] || {};
      return {
        id: team.id,
        schoolName: team.schoolName,
        teamName: teamDetails.teamName || "Unknown",
        location: teamDetails.location || "Unknown",
        conference: teamDetails.conference || "Unknown",
        sport: team.sport || "football" // Default to football for backward compatibility
      };
    });
    
    // Separate by sport
    const footballSelections = allFullTeamData.filter(team => team.sport === "football" || !team.sport);
    const mensbballSelections = allFullTeamData.filter(team => team.sport === "mensbball");
    
    // Return the full team details with sport-specific arrays
    result = {
      ...updateResult.Attributes,
      footballSelections,
      mensbballSelections
    };
  }
  
  return createCorsResponse(200, result);
}

module.exports = {
  getTeamSelections,
  updateTeamSelections
};