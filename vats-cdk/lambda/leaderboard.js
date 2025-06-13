const { 
  ScanCommand 
} = require('@aws-sdk/lib-dynamodb');
const { dynamodb, createCorsResponse } = require('./utils');
const { getAllUsers } = require('./userProfile');
const { getAllTeamSelections } = require('./teamSelections');

/**
 * Get leaderboard data for all users
 */
async function getLeaderboard(sport = 'football') {
  // Special case for overall view
  if (sport === 'overall') {
    return getOverallLeaderboard();
  }
  try {
    console.log(`Generating leaderboard for sport: ${sport}`);
    
    // Get all users from Cognito
    const allUsersResponse = await getAllUsers();
    const users = allUsersResponse.users || [];
    console.log(`Found ${users.length} users`);
    
    // Get all team selections
    const teamSelectionsResponse = await getAllTeamSelections(sport);
    const allTeamSelections = teamSelectionsResponse.teamSelections || [];
    console.log(`Found ${allTeamSelections.length} unique teams selected across users`);
    
    // Get team scores from the database
    const scoreParams = {
      TableName: process.env.TEAM_SCORES_TABLE,
      FilterExpression: 'sport = :sportValue',
      ExpressionAttributeValues: { ':sportValue': sport }
    };
    
    const scoreCommand = new ScanCommand(scoreParams);
    const scoreResult = await dynamodb.send(scoreCommand);
    const teamScores = scoreResult.Items || [];
    console.log(`Found ${teamScores.length} team scores for sport: ${sport}`);
    
    // Create a map of team scores for quick lookup
    const scoreMap = {};
    teamScores.forEach(score => {
      scoreMap[score.teamId] = score;
    });
    
    // Get all user team selections
    const userSelectionParams = {
      TableName: process.env.TEAM_SELECTIONS_TABLE
    };
    
    const selectionsCommand = new ScanCommand(userSelectionParams);
    const selectionsResult = await dynamodb.send(selectionsCommand);
    const userSelections = selectionsResult.Items || [];
    console.log(`Found ${userSelections.length} user selection entries`);
    
    // Process user selections and scores
    const userScores = userSelections.map(item => {
      // Find user details
      const userInfo = users.find(u => u.userId === item.userId) || { 
        userId: item.userId,
        username: item.userId
      };
      
      // Ensure we have either a name or a username
      if (!userInfo.name || userInfo.name.trim() === '') {
        userInfo.name = userInfo.username || userInfo.userId;
      }
      
      if (!item.teamSelections) {
        console.log(`No team selections found for user ${item.userId}`);
        return null;
      }
      
      // Get this user's team selections
      const teamSelections = (item.teamSelections || [])
        .filter(t => t.sport === sport)
        .map(team => {
          if (!team || !team.id) {
            console.log(`Invalid team selection found for user ${item.userId}:`, team);
            return null;
          }
          
          // Find score data for this team
          const scoreData = scoreMap[team.id] || {
            regularSeasonPoints: 0,
            postseasonPoints: 0
          };
          
          // Find full team details - first try by ID then by school name
          let teamDetails = allTeamSelections.find(t => t.id === team.id);
          
          if (!teamDetails) {
            teamDetails = allTeamSelections.find(t => t.schoolName === team.schoolName) || {
              schoolName: team.schoolName || 'Unknown School',
              conference: team.conference || 'Unknown'
            };
          }
          
          // Calculate total points
          const regularSeasonPoints = team.regularSeasonPoints || scoreData.regularSeasonPoints || 0;
          const postseasonPoints = team.postseasonPoints || scoreData.postseasonPoints || 0;
          const totalPoints = regularSeasonPoints + postseasonPoints;
          
          return {
            teamId: team.id,
            schoolName: team.schoolName || teamDetails.schoolName,
            conference: teamDetails.conference || team.conference || 'Unknown',
            regularSeasonPoints,
            postseasonPoints,
            totalPoints
          };
        })
        .filter(Boolean); // Remove any null entries
      
      // Get perk adjustment for this sport if it exists
      const perkAdjustment = item.perkAdjustments && item.perkAdjustments[sport] ? Number(item.perkAdjustments[sport]) : 0;
      console.log(`Perk adjustment for user ${item.userId}:`, item.perkAdjustments, `Raw: ${item.perkAdjustments && item.perkAdjustments[sport]}`, `Result: ${perkAdjustment} points`);
      
      // Log the stringified perkAdjustments to check for nesting issues
      console.log('perkAdjustments stringified:', JSON.stringify(item.perkAdjustments));
      
      // Calculate total points for this user (including perk adjustment)
      const teamPoints = teamSelections.reduce(
        (sum, team) => sum + (team.totalPoints || 0), 
        0
      );
      
      // Add perk adjustment to total points
      const totalPoints = teamPoints + perkAdjustment;
      
      return {
        userId: item.userId,
        username: userInfo.username || item.userId,
        name: userInfo.name,
        totalPoints,
        perkAdjustment,
        teams: teamSelections
      };
    })
    .filter(Boolean); // Remove any null entries
    
    // Sort by total points (highest first)
    userScores.sort((a, b) => b.totalPoints - a.totalPoints);
    
    console.log(`Returning leaderboard with ${userScores.length} user entries`);
    console.log(`First user score example:`, userScores.length > 0 ? JSON.stringify(userScores[0]) : 'No users');
    
    return createCorsResponse(200, { 
      userScores,
      sport
    });
  } catch (error) {
    console.error('Error generating leaderboard:', error);
    return createCorsResponse(500, { 
      message: 'Failed to generate leaderboard',
      error: error.message
    });
  }
}

/**
 * Get overall leaderboard data across all sports
 */
async function getOverallLeaderboard() {
  try {
    // Define sports to include
    const sports = ['football', 'mensbball', 'womensbball', 'baseball', 'softball'];
    
    // Get all users from Cognito
    const allUsersResponse = await getAllUsers();
    const users = allUsersResponse.users || [];
    console.log(`Found ${users.length} users`);
    
    // Get all user team selections
    const userSelectionParams = {
      TableName: process.env.TEAM_SELECTIONS_TABLE
    };
    
    const selectionsCommand = new ScanCommand(userSelectionParams);
    const selectionsResult = await dynamodb.send(selectionsCommand);
    const userSelections = selectionsResult.Items || [];
    console.log(`Found ${userSelections.length} user selection entries`);
    
    // Track combined scores per user
    const userScoresMap = new Map();
    
    // Process each sport
    for (const currentSport of sports) {
      console.log(`Processing sport: ${currentSport}`);
      
      // Get team scores for this sport
      const scoreParams = {
        TableName: process.env.TEAM_SCORES_TABLE,
        FilterExpression: 'sport = :sportValue',
        ExpressionAttributeValues: { ':sportValue': currentSport }
      };
      
      const scoreCommand = new ScanCommand(scoreParams);
      const scoreResult = await dynamodb.send(scoreCommand);
      const teamScores = scoreResult.Items || [];
      console.log(`Found ${teamScores.length} team scores for sport: ${currentSport}`);
      
      // Create a map of team scores for quick lookup
      const scoreMap = {};
      teamScores.forEach(score => {
        scoreMap[score.teamId] = score;
      });
      
      // Calculate score for each user for this sport
      userSelections.forEach(item => {
        const userId = item.userId;
        
        // Skip if user has no team selections
        if (!item.teamSelections) return;
        
        // Get user details
        const userInfo = users.find(u => u.userId === userId) || { 
          userId: userId,
          username: userId
        };
        
        // Ensure we have either a name or a username
        if (!userInfo.name || userInfo.name.trim() === '') {
          userInfo.name = userInfo.username || userInfo.userId;
        }
        
        // Get this user's team selections for this sport
        const sportTeams = item.teamSelections.filter(t => t && t.sport === currentSport);
        
        // Calculate points for this sport
        let sportPoints = 0;
        sportTeams.forEach(team => {
          if (!team || !team.id) return;
          
          // Find score data for this team
          const scoreData = scoreMap[team.id] || {
            regularSeasonPoints: 0,
            postseasonPoints: 0
          };
          
          // Calculate total points for this team
          const regularSeasonPoints = team.regularSeasonPoints || scoreData.regularSeasonPoints || 0;
          const postseasonPoints = team.postseasonPoints || scoreData.postseasonPoints || 0;
          const totalTeamPoints = regularSeasonPoints + postseasonPoints;
          
          sportPoints += totalTeamPoints;
        });
        
        // Add perk adjustments for this sport
        const perkAdjustment = item.perkAdjustments && item.perkAdjustments[currentSport] ? Number(item.perkAdjustments[currentSport]) : 0;
        sportPoints += perkAdjustment;
        
        // Get or create user entry in map
        let userEntry = userScoresMap.get(userId);
        if (!userEntry) {
          userEntry = {
            userId,
            username: userInfo.username || userId,
            name: userInfo.name,
            totalPoints: 0,
            teams: [], // Empty for overall view
            sportPoints: {}
          };
          userScoresMap.set(userId, userEntry);
        }
        
        // Add sport points to user's total
        userEntry.sportPoints[currentSport] = sportPoints;
        userEntry.totalPoints += sportPoints;
      });
    }
    
    // Convert map values to array
    const userScores = Array.from(userScoresMap.values());
    
    // Sort by total points (highest first)
    userScores.sort((a, b) => b.totalPoints - a.totalPoints);
    
    console.log(`Returning overall leaderboard with ${userScores.length} user entries`);
    console.log(`First user score example:`, userScores.length > 0 ? JSON.stringify(userScores[0]) : 'No users');
    
    return createCorsResponse(200, { 
      userScores,
      sport: 'overall'
    });
  } catch (error) {
    console.error('Error generating overall leaderboard:', error);
    return createCorsResponse(500, { 
      message: 'Failed to generate overall leaderboard',
      error: error.message
    });
  }
}

module.exports = {
  getLeaderboard
};