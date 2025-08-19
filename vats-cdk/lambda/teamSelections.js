const { 
  GetCommand, 
  PutCommand, 
  UpdateCommand,
  ScanCommand
} = require('@aws-sdk/lib-dynamodb');
// No longer need team data mapping as we save full data directly
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
      womensbballSelections: [],
      baseballSelections: [],
      softballSelections: [],
      perks: [], // Add empty perks array for new users
      isNew: true 
    });
  }
  
  // Extract perks and perk adjustments if they exist
  const perks = result.Item.perks || [];
  const perkAdjustments = result.Item.perkAdjustments || {};
  
  // Get team data directly without reconstruction
  const teamData = result.Item.teamSelections || [];
  
  // Just calculate total points for each team and make sure all fields are present
  const fullTeamData = teamData.map(team => {
    return {
      id: team.id,
      schoolName: team.schoolName,
      conference: team.conference,
      sport: team.sport,
      regularSeasonPoints: team.regularSeasonPoints || 0,
      postseasonPoints: team.postseasonPoints || 0,
      totalPoints: (team.regularSeasonPoints || 0) + (team.postseasonPoints || 0)
    };
  });
  
  // Separate selections by sport
  const footballSelections = fullTeamData.filter(team => team.sport === "football");
  const mensbballSelections = fullTeamData.filter(team => team.sport === "mensbball");
  const womensbballSelections = fullTeamData.filter(team => team.sport === "womensbball");
  const baseballSelections = fullTeamData.filter(team => team.sport === "baseball");
  const softballSelections = fullTeamData.filter(team => team.sport === "softball");
  
  // Return with sport-specific arrays
  return createCorsResponse(200, {
    footballSelections,
    mensbballSelections,
    womensbballSelections,
    baseballSelections,
    softballSelections,
    perks: perks, // Include perks in the response
    perkAdjustments: perkAdjustments // Include perk adjustments in the response
  });
}

/**
 * Update user team selections
 */
async function updateTeamSelections(event, userId) {
  // Log event details to help debug
  var parsedBody;
  try {
    // Handle both string and already-parsed JSON body formats
    if (typeof event.body === 'string') {
      // API Gateway sends the body as a JSON string
      const body = JSON.parse(event.body);
      // Sometimes the body is double-stringified
      if (typeof body === 'string') {
        parsedBody = JSON.parse(body);
      } else {
        parsedBody = body;
      }
    } else {
      // Body is already parsed (e.g., in test environments)
      parsedBody = event.body;
    }
  } catch (e) {
    console.error('Error parsing request body');
    return createCorsResponse(400, { message: 'Invalid request body format' });
  }

  var teamSelections;
  var perks = parsedBody.perks || [];
  var perkAdjustments = parsedBody.perkAdjustments || {};
  var sport; // Declare sport variable
  
  if (parsedBody.footballSelections) {
    teamSelections = parsedBody.footballSelections;
    sport = "football";
  } else if (parsedBody.mensbballSelections) {
    teamSelections = parsedBody.mensbballSelections;
    sport = "mensbball";
  } else if (parsedBody.womensbballSelections) {
    teamSelections = parsedBody.womensbballSelections;
    sport = "womensbball";
  } else if (parsedBody.baseballSelections) {
    teamSelections = parsedBody.baseballSelections;
    sport = "baseball";
  } else if (parsedBody.softballSelections) {
    teamSelections = parsedBody.softballSelections;
    sport = "softball";
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
      
    }
  } catch (err) {
    console.warn('Error getting existing team selections for preserving scores');
    // Continue with empty map
  }
  
  // Extract team data, preserving existing point information
  const minimalTeamData = teamSelections.map(team => {
    // Get existing points for this team if available
    const existingPoints = existingPointsMap.get(team.id) || {};
    
    return {
      id: team.id,
      schoolName: team.schoolName,
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
        perks: perks, // Save perks in the database
        perkAdjustments: perkAdjustments, // Save perk adjustments in the database
        createdAt: timestamp,
        updatedAt: timestamp
      }
    };
    
    const putCommand = new PutCommand(putParams);
    await dynamodb.send(putCommand);
    
    // Separate by sport for the response
    const footballSelections = sport === "football" ? teamSelections : [];
    const mensbballSelections = sport === "mensbball" ? teamSelections : [];
    const womensbballSelections = sport === "womensbball" ? teamSelections : [];
    const baseballSelections = sport === "baseball" ? teamSelections : [];
    const softballSelections = sport === "softball" ? teamSelections : [];
    
    result = {
      userId,
      footballSelections,
      mensbballSelections,
      womensbballSelections,
      baseballSelections,
      softballSelections,
      perks: perks, // Include perks in the response
      perkAdjustments: perkAdjustments, // Include perk adjustments in the response
      createdAt: timestamp,
      updatedAt: timestamp
    };
  } else {
    // Update existing record
    // First, get the existing team selections to merge with the new ones
    const existingTeamSelections = existingRecord.Item.teamSelections || [];
    
    // Filter out teams of the current sport and keep teams from other sports
    const otherSportSelections = existingTeamSelections.filter(team => team.sport !== sport);
    
    // Merge the teams from other sports with the new team selections
    const mergedTeamSelections = [...otherSportSelections, ...minimalTeamData];
    
    // Get existing perks and merge with new ones based on sport
    const existingPerks = existingRecord.Item.perks || [];
    
    // Filter out perks for the current sport
    const otherSportPerks = existingPerks.filter(perk => perk.sportType !== sport);
    
    // Filter new perks for current sport
    const currentSportPerks = perks.filter(perk => perk.sportType === sport);
    
    // Merge perks from other sports with the new perks for current sport
    const mergedPerks = [...otherSportPerks, ...currentSportPerks];
    
    // Get existing perk adjustments
    const existingPerkAdjustments = existingRecord.Item.perkAdjustments || {};
    
    // Merge perk adjustments - take new values for current sport, preserve others
    const mergedPerkAdjustments = {
      ...existingPerkAdjustments,
      ...perkAdjustments
    };
    
    
    const updateParams = {
      TableName: process.env.TEAM_SELECTIONS_TABLE,
      Key: { userId },
      UpdateExpression: 'SET teamSelections = :teamSelections, perks = :perks, perkAdjustments = :perkAdjustments, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':teamSelections': mergedTeamSelections,
        ':perks': mergedPerks, // Use merged perks to preserve perks from other sports
        ':perkAdjustments': mergedPerkAdjustments, // Use merged adjustments
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
    
    // Process team data to ensure all fields are present and calculate totals
    const allFullTeamData = allTeamSelections.map(team => {
      return {
        id: team.id,
        schoolName: team.schoolName,
        conference: team.conference,
        sport: team.sport,
        regularSeasonPoints: team.regularSeasonPoints || 0,
        postseasonPoints: team.postseasonPoints || 0,
        totalPoints: (team.regularSeasonPoints || 0) + (team.postseasonPoints || 0)
      };
    });
    
    // Separate by sport
    const footballSelections = allFullTeamData.filter(team => team.sport === "football");
    const mensbballSelections = allFullTeamData.filter(team => team.sport === "mensbball");
    const womensbballSelections = allFullTeamData.filter(team => team.sport === "womensbball");
    const baseballSelections = allFullTeamData.filter(team => team.sport === "baseball");
    const softballSelections = allFullTeamData.filter(team => team.sport === "softball");
    
    // Return the full team details with sport-specific arrays
    result = {
      ...updateResult.Attributes,
      footballSelections,
      mensbballSelections,
      womensbballSelections,
      baseballSelections,
      softballSelections
    };
    
    // Ensure perks are included in the response
    if (!result.perks && updateResult.Attributes.perks) {
      result.perks = updateResult.Attributes.perks;
    }
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
        if (team.schoolName && team.sport === sport) {
          const enhancedTeam = {
            id: team.id,
            teamId: team.id, // For consistency with TeamScore interface
            schoolName: team.schoolName,
            conference: team.conference,
            sport: team.sport,
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