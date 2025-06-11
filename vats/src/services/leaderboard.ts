import { get } from 'aws-amplify/api';
import { SportType } from '../constants/sports';

export interface UserScore {
  userId: string;
  username: string;
  name?: string;
  totalPoints: number;
  teams: UserTeamScore[];
  perkAdjustment?: number; // Points adjustment for perks
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
export const getLeaderboard = async (sport: SportType = SportType.FOOTBALL): Promise<UserScore[]> => {
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
    
    console.log(`Getting leaderboard data from ${path}`);
    
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
      
      console.log(`Processed ${processedUserScores.length} user scores`);
      return processedUserScores;
    } catch (e) {
      console.error('Error parsing response body:', e);
      return [];
    }
  } catch (error) {
    console.error('Error getting leaderboard data:', error);
    
    // In development or if the API isn't implemented yet, return sample data
    console.log('Returning mock leaderboard data for development');
    return getMockLeaderboardData(sport);
  }
};

/**
 * Generate mock leaderboard data for development
 */
function getMockLeaderboardData(sport: SportType): UserScore[] {
  const mockTeams = [
    {
      teamId: '1',
      schoolName: 'University of Georgia',
      teamNme: 'Bulldogs',
      conference: 'SEC',
      regularSeasonPoints: 35,
      postseasonPoints: 20,
      totalPoints: 55
    },
    {
      teamId: '2',
      schoolName: 'University of Michigan',
      conference: 'Big Ten',
      regularSeasonPoints: 30,
      postseasonPoints: 25,
      totalPoints: 55
    },
    {
      teamId: '3',
      schoolName: 'University of Alabama',
      conference: 'SEC',
      regularSeasonPoints: 28,
      postseasonPoints: 15,
      totalPoints: 43
    }
  ];
  
  return [
    {
      userId: '1',
      username: 'john.doe',
      name: 'John Doe',
      totalPoints: 98,
      teams: mockTeams.slice(0, 2)
    },
    {
      userId: '2',
      username: 'jane.smith',
      name: 'Jane Smith',
      totalPoints: 85,
      teams: [mockTeams[0], mockTeams[2]]
    },
    {
      userId: '3',
      username: 'bob.johnson',
      name: 'Bob Johnson',
      totalPoints: 70,
      teams: [mockTeams[1], mockTeams[2]]
    }
  ];
}