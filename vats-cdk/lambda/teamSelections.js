const { 
  GetCommand, 
  PutCommand, 
  UpdateCommand,
  ScanCommand
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
      teamName: team.teamName || teamDetails.teamName || "Unknown",
      location: teamDetails.location || "Unknown",
      conference: team.conference || teamDetails.conference || "Unknown",
      sport: team.sport || "football", // Default to football for backward compatibility
      regularSeasonPoints: team.regularSeasonPoints || 0,
      postseasonPoints: team.postseasonPoints || 0,
      totalPoints: (team.regularSeasonPoints || 0) + (team.postseasonPoints || 0)
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
  
  // First, get existing team selections to preserve point data
  let existingPointsMap = new Map();
  
  try {
    const existingDataParams = {
      TableName: process.env.TEAM_SELECTIONS_TABLE,
      Key: { userId }
    };
    
    const existingDataCommand = new GetCommand(existingDataParams);
    const existingDataResult = await dynamodb.send(existingDataCommand);
    
    // If user has existing selections, build a lookup map for team points
    if (existingDataResult.Item && existingDataResult.Item.teamSelections) {
      const existingSelections = existingDataResult.Item.teamSelections;
      
      // Create a map of existing team points by team ID
      existingSelections.forEach(existingTeam => {
        if (existingTeam.id && (existingTeam.regularSeasonPoints || existingTeam.postseasonPoints)) {
          existingPointsMap.set(existingTeam.id, {
            regularSeasonPoints: existingTeam.regularSeasonPoints || 0,
            postseasonPoints: existingTeam.postseasonPoints || 0
          });
        }
      });
      
      console.log(`Found ${existingPointsMap.size} existing team scores to preserve`);
    }
  } catch (err) {
    console.warn('Error getting existing team selections for preserving scores:', err);
    // Continue with empty map
  }
  
  // Extract team data, preserving existing point information
  const minimalTeamData = teamSelections.map(team => {
    // Get existing points for this team if available
    const existingPoints = existingPointsMap.get(team.id) || {};
    
    return {
      id: team.id,
      schoolName: team.schoolName,
      teamName: team.teamName,
      conference: team.conference,
      sport: team.sport || sport, // Use provided sport or default
      // Use existing points rather than overwriting with zeros
      regularSeasonPoints: existingPoints.regularSeasonPoints || 0,
      postseasonPoints: existingPoints.postseasonPoints || 0,
      // Calculate total points
      totalPoints: (existingPoints.regularSeasonPoints || 0) + (existingPoints.postseasonPoints || 0)
    };
  });
  
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
    
    console.log('Creating new team selections record with data:', minimalTeamData);
    
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
    
    console.log('Saving team selections with preserved point data:', minimalTeamData);
    
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
        teamName: team.teamName || teamDetails.teamName || "Unknown",
        location: teamDetails.location || "Unknown",
        conference: team.conference || teamDetails.conference || "Unknown",
        sport: team.sport || "football", // Default to football for backward compatibility
        regularSeasonPoints: team.regularSeasonPoints || 0,
        postseasonPoints: team.postseasonPoints || 0,
        totalPoints: (team.regularSeasonPoints || 0) + (team.postseasonPoints || 0)
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

/**
 * Get all team selections across users (for admin view)
 */
async function getAllTeamSelections(sport) {
  // Create params for the scan operation
  const params = {
    TableName: process.env.TEAM_SELECTIONS_TABLE,
    ProjectionExpression: "userId, teamSelections"
  };
  
  // Use a scan operation to get all user selections
  const command = new ScanCommand(params);
  const result = await dynamodb.send(command);
  
  // Process results to extract all unique team selections
  const teamMap = new Map();
  
  result.Items.forEach(item => {
    const teamSelections = item.teamSelections;
    if (teamSelections && Array.isArray(teamSelections)) {
      teamSelections.forEach(team => {
        // Filter by sport and use schoolName as unique identifier
        if (team.schoolName && (!team.sport || team.sport === sport)) {
          // Add team details from our static map
          const teamDetails = fbsTeamsMap[team.schoolName] || {};
          const enhancedTeam = {
            id: team.id,
            teamId: team.id, // For consistency with TeamScore interface
            schoolName: team.schoolName,
            teamName: team.teamName || teamDetails.teamName || "Unknown",
            location: teamDetails.location || "Unknown",
            conference: team.conference || teamDetails.conference || "Unknown",
            sport: team.sport || sport || "football",
            regularSeasonPoints: team.regularSeasonPoints || 0,
            postseasonPoints: team.postseasonPoints || 0,
            totalPoints: (team.regularSeasonPoints || 0) + (team.postseasonPoints || 0)
          };
          teamMap.set(team.schoolName, enhancedTeam);
        }
      });
    }
  });
  
  // Convert map values to array
  const uniqueTeams = Array.from(teamMap.values());
  
  return createCorsResponse(200, { 
    teamSelections: uniqueTeams
  });
}

module.exports = {
  getTeamSelections,
  updateTeamSelections,
  getAllTeamSelections
};