import { get } from 'aws-amplify/api';
import { SportType } from '../constants/sports';

export interface UserScore {
  userId: string;
  username: string;
  name?: string;
  totalPoints: number;
  teams: UserTeamScore[];
  perkAdjustment?: number; // Points adjustment for perks
  sportPoints?: { [key: string]: number }; // For overall view, points per sport
}

export interface UserTeamScore {
  teamId: string;
  schoolName: string;
  conference: string;
  regularSeasonPoints: number;
  postseasonPoints: number;
  totalPoints: number;
}

/**
 * Get the leaderboard data for all users
 */
/**
 * Get leaderboard data from all sports combined
 */
export const getAllSportsLeaderboard = async (): Promise<UserScore[]> => {
  try {
    // Import auth functions
    const authModule = await import('aws-amplify/auth');
    const { fetchAuthSession } = authModule;

    // Get authentication session
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString() || '';
    
    // Create request headers with token
    const headers = {
      Authorization: `Bearer ${token}`
    };
    
    // API endpoint for getting overall leaderboard
    const path = `/leaderboard?sport=overall`;
    
    
    // Make API request
    const getPromise = get({
      apiName: 'VatsApi',
      path,
      options: { headers }
    });
    
    // Get and parse the response
    const { body } = await getPromise.response;
    const responseBody = await body.text();
    
    try {
      const parsedBody = JSON.parse(responseBody);
      // Extract userScores array from the response
      const userScores = parsedBody.userScores || [];
      return userScores;
    } catch (e) {
      console.error('Error parsing leaderboard data');
      return [];
    }
  } catch (error) {
    console.error('Error getting overall leaderboard data');
    return [];
  }
};

export const getLeaderboard = async (sport: SportType): Promise<UserScore[]> => {
  try {
    // Import auth functions
    const authModule = await import('aws-amplify/auth');
    const { fetchAuthSession } = authModule;

    // Get authentication session
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString() || '';
    
    // Create request headers with token
    const headers = {
      Authorization: `Bearer ${token}`
    };
    
    // API endpoint for getting leaderboard
    const path = `/leaderboard?sport=${sport}`;
    
    
    // Make API request
    const getPromise = get({
      apiName: 'VatsApi',
      path,
      options: { headers }
    });
    
    // Get and parse the response
    const { body } = await getPromise.response;
    const responseBody = await body.text();
    
    try {
      const parsedBody = JSON.parse(responseBody);
      // Extract userScores array from the response
      const userScores = parsedBody.userScores || [];
      
      // Process each user's data to ensure all required fields are present
      const processedUserScores = userScores.map((user: any) => {
        // Process team data to ensure all fields are available
        const processedTeams = (user.teams || []).map((team: any) => ({
          teamId: team.teamId || '',
          schoolName: team.schoolName || 'Unknown School',
          conference: team.conference || 'Unknown',
          regularSeasonPoints: team.regularSeasonPoints || 0,
          postseasonPoints: team.postseasonPoints || 0,
          totalPoints: team.totalPoints || (team.regularSeasonPoints || 0) + (team.postseasonPoints || 0)
        }));
        
        // Return user with processed team data
        return {
          userId: user.userId || '',
          username: user.username || 'Anonymous',
          name: user.name || user.username || 'Anonymous',
          totalPoints: user.totalPoints || 0,
          perkAdjustment: user.perkAdjustment || 0,
          teams: processedTeams
        };
      });
      
      return processedUserScores;
    } catch (e) {
      console.error('Error parsing leaderboard data');
      return [];
    }
  } catch (error) {
    console.error('Error getting leaderboard data');
    return [];
  }
};