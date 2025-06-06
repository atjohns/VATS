const { 
  GetCommand, 
  PutCommand, 
  ScanCommand 
} = require('@aws-sdk/lib-dynamodb');
const { fbsTeamsMap } = require('./fbsTeamsData');
const { dynamodb, createCorsResponse } = require('./utils');

/**
 * Get all team scores
 */
async function getTeamScores(sport) {
  // Create params for the scan operation
  const params = {
    TableName: process.env.TEAM_SCORES_TABLE,
    FilterExpression: sport ? 'sport = :sportValue' : undefined,
    ExpressionAttributeValues: sport ? { ':sportValue': sport } : undefined
  };
  
  const command = new ScanCommand(params);
  const result = await dynamodb.send(command);
  
  // If we have no scores yet, return empty array
  if (!result.Items || result.Items.length === 0) {
    return createCorsResponse(200, { 
      teamScores: []
    });
  }
  
  // Return with full team data
  return createCorsResponse(200, {
    teamScores: result.Items
  });
}

/**
 * Get scores for a specific team
 */
async function getTeamScore(teamId, sport) {
  const params = {
    TableName: process.env.TEAM_SCORES_TABLE,
    Key: { 
      teamId,
      sport
    }
  };
  
  const command = new GetCommand(params);
  const result = await dynamodb.send(command);
  
  if (!result.Item) {
    // Return default zero scores if not found
    const teamDetails = fbsTeamsMap[teamId] || {};
    return createCorsResponse(200, { 
      teamId,
      schoolName: teamDetails.schoolName || teamId,
      teamName: teamDetails.teamName || "",
      conference: teamDetails.conference || "",
      sport: sport || "football",
      regularSeasonPoints: 0,
      postseasonPoints: 0,
      isNew: true
    });
  }
  
  // Return team score
  return createCorsResponse(200, result.Item);
}

/**
 * Update team scores
 */
async function updateTeamScores(event) {
  // Log event details to help debug
  var body = JSON.parse(event.body);
  var parsedBody = JSON.parse(body);
  console.log('body JSON:', parsedBody);

  var teamScores = parsedBody.teamScores;
  
  // Validate team scores array
  if (!Array.isArray(teamScores)) {
    return createCorsResponse(400, { message: 'Invalid team scores format' });
  }
  
  // Create a batch of promises to update each team's score
  const updatePromises = teamScores.map(async (team) => {
    // Validate required fields
    if (!team.teamId || !team.sport) {
      console.warn('Skipping team with missing required fields:', team);
      return;
    }
    
    const timestamp = new Date().toISOString();
    
    // Check if the team score already exists
    const checkParams = {
      TableName: process.env.TEAM_SCORES_TABLE,
      Key: { 
        teamId: team.teamId,
        sport: team.sport
      }
    };
    
    const getCommand = new GetCommand(checkParams);
    const existingRecord = await dynamodb.send(getCommand);
    
    if (!existingRecord.Item) {
      // Create a new record for new team scores
      const putParams = {
        TableName: process.env.TEAM_SCORES_TABLE,
        Item: {
          teamId: team.teamId,
          sport: team.sport,
          schoolName: team.schoolName,
          teamName: team.teamName || "",
          conference: team.conference || "",
          regularSeasonPoints: team.regularSeasonPoints || 0,
          postseasonPoints: team.postseasonPoints || 0,
          createdAt: timestamp,
          updatedAt: timestamp
        }
      };
      
      const putCommand = new PutCommand(putParams);
      return dynamodb.send(putCommand);
    } else {
      // Update existing record
      const updateParams = {
        TableName: process.env.TEAM_SCORES_TABLE,
        Key: { 
          teamId: team.teamId,
          sport: team.sport
        },
        Item: {
          ...existingRecord.Item,
          regularSeasonPoints: team.regularSeasonPoints || existingRecord.Item.regularSeasonPoints || 0,
          postseasonPoints: team.postseasonPoints || existingRecord.Item.postseasonPoints || 0,
          updatedAt: timestamp
        }
      };
      
      const putCommand = new PutCommand(updateParams);
      return dynamodb.send(putCommand);
    }
  });
  
  // Execute all update operations
  try {
    await Promise.all(updatePromises);
    return createCorsResponse(200, { 
      message: 'Team scores updated successfully',
      updatedCount: teamScores.length
    });
  } catch (error) {
    console.error('Error updating team scores:', error);
    return createCorsResponse(500, { 
      message: 'Failed to update team scores',
      error: error.message
    });
  }
}

module.exports = {
  getTeamScores,
  getTeamScore,
  updateTeamScores
};