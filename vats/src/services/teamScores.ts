import { get, put } from 'aws-amplify/api';
import { SportType } from '../constants/sports';

export interface TeamScore {
  teamId: string;
  schoolName: string;
  conference: string;
  sport: SportType;
  regularSeasonPoints: number;
  postseasonPoints: number;
  
  // Football specific scoring fields
  regularSeasonWins?: number;
  regularSeasonChampion?: boolean;
  conferenceChampion?: boolean;
  cfpAppearance?: boolean;
  bowlWin?: boolean;
  cfpWins?: number;
  cfpSemiFinalWin?: boolean;
  cfpChampion?: boolean;
}

/**
 * Get all team scores
 */
export const getTeamScores = async (sport?: SportType): Promise<TeamScore[]> => {
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
    
    // Build path with optional sport query parameter
    const path = sport ? `/admin/team-scores?sport=${sport}` : '/admin/team-scores';
    
    console.log(`Getting team scores from ${path}`);
    
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
      console.log('Team scores response:', parsedBody);
      return parsedBody.teamScores || [];
    } catch (e) {
      console.error('Error parsing response body:', e);
      return [];
    }
  } catch (error) {
    console.error('Error getting team scores:', error);
    throw error;
  }
};

/**
 * Get score for a specific team
 */
export const getTeamScore = async (teamId: string, sport: SportType = SportType.FOOTBALL): Promise<TeamScore | null> => {
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
    
    // Path for specific team score
    const path = `/admin/team-scores/${teamId}?sport=${sport}`;
    
    console.log(`Getting team score from ${path}`);
    
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
      console.log('Team score response:', parsedBody);
      return parsedBody || null;
    } catch (e) {
      console.error('Error parsing response body:', e);
      return null;
    }
  } catch (error) {
    console.error(`Error getting team score for ${teamId}:`, error);
    throw error;
  }
};

/**
 * Update team scores
 */
export const updateTeamScores = async (teamScores: TeamScore[]): Promise<boolean> => {
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
    
    const path = '/admin/team-scores';
    
    console.log(`Updating team scores at ${path}`);
    
    // Make API request
    const putPromise = put({
      apiName: 'VatsApi',
      path,
      options: {
        headers,
        body: JSON.stringify({ teamScores })
      } as any
    });
    
    // Get and parse the response
    const { body } = await putPromise.response;
    const responseBody = await body.text();
    
    try {
      const parsedBody = JSON.parse(responseBody);
      console.log('Update response:', parsedBody);
      return true;
    } catch (e) {
      console.error('Error parsing response body:', e);
      return false;
    }
  } catch (error) {
    console.error('Error updating team scores:', error);
    throw error;
  }
};