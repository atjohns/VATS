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
  console.log('Body received for team score update:', parsedBody);

  var teamScores = parsedBody.teamScores;
  console.log(`Processing ${teamScores ? teamScores.length : 0} team scores`);
  
  // Validate team scores array
  if (!Array.isArray(teamScores)) {
    return createCorsResponse(400, { message: 'Invalid team scores format' });
  }
  
  // Log some details about the team scores being updated
  teamScores.forEach((team, index) => {
    console.log(`Team ${index + 1}:`, {
      teamId: team.teamId,
      sport: team.sport,
      schoolName: team.schoolName,
      teamName: team.teamName,
      regularSeasonPoints: team.regularSeasonPoints,
      postseasonPoints: team.postseasonPoints,
      // Log football-specific fields if present
      ...(team.regularSeasonWins !== undefined && { regularSeasonWins: team.regularSeasonWins }),
      ...(team.regularSeasonChampion !== undefined && { regularSeasonChampion: team.regularSeasonChampion }),
      ...(team.conferenceChampion !== undefined && { conferenceChampion: team.conferenceChampion }),
      ...(team.cfpAppearance !== undefined && { cfpAppearance: team.cfpAppearance }),
      ...(team.bowlWin !== undefined && { bowlWin: team.bowlWin }),
      ...(team.cfpWins !== undefined && { cfpWins: team.cfpWins }),
      ...(team.cfpSemiFinalWin !== undefined && { cfpSemiFinalWin: team.cfpSemiFinalWin }),
      ...(team.cfpChampion !== undefined && { cfpChampion: team.cfpChampion })
    });
  });
  
  // Create a batch of promises to update each team's score
  const updatePromises = teamScores.map(async (team) => {
    // Validate and sanitize required fields
    if (!team.teamId || !team.sport) {
      console.warn('Skipping team with missing required fields:', team);
      return;
    }
    
    // Ensure IDs are strings
    const teamId = String(team.teamId);
    const sport = String(team.sport);
    
    console.log(`Processing team update for: ${teamId} (${sport})`);
    
    // Make sure we have schoolName
    if (!team.schoolName) {
      team.schoolName = team.teamName || teamId;
      console.log(`Missing schoolName, using fallback: ${team.schoolName}`);
    }
    
    const timestamp = new Date().toISOString();
    
    // Check if the team score already exists
    const checkParams = {
      TableName: process.env.TEAM_SCORES_TABLE,
      Key: { 
        teamId: teamId,
        sport: sport
      }
    };
    
    const getCommand = new GetCommand(checkParams);
    const existingRecord = await dynamodb.send(getCommand);
    
    if (!existingRecord.Item) {
      // Create a new record for new team scores
      const putParams = {
        TableName: process.env.TEAM_SCORES_TABLE,
        Item: {
          teamId: teamId,
          sport: sport,
          schoolName: team.schoolName,
          teamName: team.teamName || "",
          conference: team.conference || "",
          regularSeasonPoints: team.regularSeasonPoints || 0,
          postseasonPoints: team.postseasonPoints || 0,
          // Store football specific scoring fields if provided
          regularSeasonWins: team.regularSeasonWins,
          regularSeasonChampion: team.regularSeasonChampion,
          conferenceChampion: team.conferenceChampion,
          cfpAppearance: team.cfpAppearance,
          bowlWin: team.bowlWin,
          cfpWins: team.cfpWins,
          cfpSemiFinalWin: team.cfpSemiFinalWin,
          cfpChampion: team.cfpChampion,
          // Store any other fields provided
          totalPoints: team.totalPoints || (team.regularSeasonPoints || 0) + (team.postseasonPoints || 0),
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
          teamId: teamId,
          sport: sport
        },
        Item: {
          ...existingRecord.Item,
          // Update basic team info
          teamName: team.teamName || existingRecord.Item.teamName || "",
          conference: team.conference || existingRecord.Item.conference || "",
          schoolName: team.schoolName || existingRecord.Item.schoolName,
          // Update score points
          regularSeasonPoints: team.regularSeasonPoints || existingRecord.Item.regularSeasonPoints || 0,
          postseasonPoints: team.postseasonPoints || existingRecord.Item.postseasonPoints || 0,
          // Update football specific scoring fields if provided
          regularSeasonWins: team.regularSeasonWins !== undefined ? team.regularSeasonWins : existingRecord.Item.regularSeasonWins,
          regularSeasonChampion: team.regularSeasonChampion !== undefined ? team.regularSeasonChampion : existingRecord.Item.regularSeasonChampion,
          conferenceChampion: team.conferenceChampion !== undefined ? team.conferenceChampion : existingRecord.Item.conferenceChampion,
          cfpAppearance: team.cfpAppearance !== undefined ? team.cfpAppearance : existingRecord.Item.cfpAppearance,
          bowlWin: team.bowlWin !== undefined ? team.bowlWin : existingRecord.Item.bowlWin,
          cfpWins: team.cfpWins !== undefined ? team.cfpWins : existingRecord.Item.cfpWins,
          cfpSemiFinalWin: team.cfpSemiFinalWin !== undefined ? team.cfpSemiFinalWin : existingRecord.Item.cfpSemiFinalWin,
          cfpChampion: team.cfpChampion !== undefined ? team.cfpChampion : existingRecord.Item.cfpChampion,
          // Update total points
          totalPoints: team.totalPoints || (team.regularSeasonPoints || existingRecord.Item.regularSeasonPoints || 0) + (team.postseasonPoints || existingRecord.Item.postseasonPoints || 0),
          updatedAt: timestamp
        }
      };
      
      const putCommand = new PutCommand(updateParams);
      return dynamodb.send(putCommand);
    }
  });
  
  // Execute all update operations
  try {
    const results = await Promise.all(updatePromises);
    console.log(`Successfully updated ${results.filter(Boolean).length} team scores`);
    
    // Get updated scores to verify
    const verifyParams = {
      TableName: process.env.TEAM_SCORES_TABLE,
      FilterExpression: 'attribute_exists(teamId)'
    };
    
    const verifyCommand = new ScanCommand(verifyParams);
    const verifyResult = await dynamodb.send(verifyCommand);
    const updatedTeamScores = verifyResult.Items || [];
    
    console.log(`Verification: ${updatedTeamScores.length} total team scores in database`);
    
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