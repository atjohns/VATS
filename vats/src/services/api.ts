import { get, put } from 'aws-amplify/api';
import { UserPerkSelection } from '../constants/perks';

// Team selections management
export interface TeamSelection {
  id?: string;
  schoolName: string;
  conference: string;
  selectionType?: string; // Added for admin functionality
  sport?: string; // Added for multi-sport support: 'football', 'mensbball', etc.
  regularSeasonPoints?: number; // Points earned during regular season
  postseasonPoints?: number; // Points earned during postseason
}

// User selections response interface
export interface UserSelections {
  userId: string;
  footballSelections?: TeamSelection[];
  mensbballSelections?: TeamSelection[];
  womensbballSelections?: TeamSelection[];
  baseballSelections?: TeamSelection[];
  softballSelections?: TeamSelection[];
  teamSelections?: TeamSelection[]; // Legacy format
  perks?: UserPerkSelection[]; // User's perk selections
  perkAdjustments?: { [key: string]: number }; // Sport-specific perk point adjustments
}

/**
 * Common function to get team selections for a user (either for self or as admin)
 */
export const getTeamSelections = async (userId: string, admin: boolean): Promise<UserSelections> => {
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
    
    // Determine path based on whether this is an admin request or not
    const path = admin 
      ? `/admin/users/${userId}/team-selections`  // Admin accessing another user
      : `/users/${userId}/team-selections`;       // User accessing own data
    
    
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
      // Return the full selections object with perks
      return {
        userId,
        footballSelections: parsedBody.footballSelections || [],
        mensbballSelections: parsedBody.mensbballSelections || [],
        womensbballSelections: parsedBody.womensbballSelections || [],
        baseballSelections: parsedBody.baseballSelections || [],
        softballSelections: parsedBody.softballSelections || [],
        teamSelections: parsedBody.teamSelections || [],
        perkAdjustments: parsedBody.perkAdjustments || {},
        perks: parsedBody.perks || []
      };
    } catch (e) {
      console.error('Error parsing response');
      throw e;
    }
  } catch (error) {
    console.error('Error getting team selections');
    throw error;
  }
};

/**
 * Common function to update team selections for a user (either self or as admin)
 */
export const updateTeamSelections = async (
  teamSelections: TeamSelection[], 
  userId: string, 
  admin: boolean, 
  perks?: UserPerkSelection[],
  perkAdjustments?: { [key: string]: number }
): Promise<UserSelections> => {
  // Set the sport to football by default for backward compatibility
  const sport = teamSelections[0]?.sport || 'football';
  
  // Remove point information before sending to backend
  const cleanedTeamSelections = teamSelections.map(team => ({
    id: team.id,
    schoolName: team.schoolName,
    conference: team.conference,
    sport: team.sport,
    selectionType: team.selectionType
  }));
  
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
    
    // Determine path based on whether this is an admin request or not
    const path = admin
      ? `/admin/users/${userId}/team-selections`  // Admin updating another user
      : `/users/${userId}/team-selections`;       // User updating own data
    
    
    // Make API request
    const putPromise = put({
      apiName: 'VatsApi',
      path,
      options: {
        headers,
        // Use the appropriate property based on sport with cleaned selections
        body: JSON.stringify(sport === 'football' 
          ? { 
              footballSelections: cleanedTeamSelections,
              perks: perks || [],
              perkAdjustments: perkAdjustments || {}
            } 
          : sport === 'mensbball'
          ? { 
              mensbballSelections: cleanedTeamSelections,
              perks: perks || [],
              perkAdjustments: perkAdjustments || {}
            }
          : sport === 'womensbball'
          ? { 
              womensbballSelections: cleanedTeamSelections,
              perks: perks || [],
              perkAdjustments: perkAdjustments || {}
            }
          : sport === 'baseball'
          ? { 
              baseballSelections: cleanedTeamSelections,
              perks: perks || [],
              perkAdjustments: perkAdjustments || {}
            }
          : { 
              softballSelections: cleanedTeamSelections,
              perks: perks || [],
              perkAdjustments: perkAdjustments || {}
            })
      }
    });
    
    
    // Get and parse the response
    const { body } = await putPromise.response;
    const responseBody = await body.text();
    
    try {
      const parsedBody = JSON.parse(responseBody);
      
      // Return the full user selections with perks
      return {
        userId,
        footballSelections: parsedBody.footballSelections || [],
        mensbballSelections: parsedBody.mensbballSelections || [],
        womensbballSelections: parsedBody.womensbballSelections || [],
        baseballSelections: parsedBody.baseballSelections || [],
        softballSelections: parsedBody.softballSelections || [],
        teamSelections: parsedBody.teamSelections || [],
        perks: parsedBody.perks || [],
        perkAdjustments: parsedBody.perkAdjustments || {}
      };
    } catch (e) {
      console.error('Error parsing response');
      throw e;
    }
  } catch (error) {
    console.error('Error updating team selections');
    throw error;
  }
};

// Admin API Functions
export interface UserData {
  userId: string;
  username: string;
  email?: string;
  name?: string;
}

// Get all users (admin only)
export const getAllUsers = async (): Promise<UserData[]> => {
  try {
    // Import auth functions
    const authModule = await import('aws-amplify/auth');
    const { fetchAuthSession } = authModule;
    
    // Get authentication session and check token payload
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken;
    if (idToken?.payload) {
    }
    
    const token = session.tokens?.idToken?.toString() || '';
    
    // Create request headers with token
    const headers = {
      Authorization: `Bearer ${token}`
    };
    
    
    // Get all users
    const getPromise = get({
      apiName: 'VatsApi',
      path: '/admin/users',
      options: {
        headers: headers
      }
    });
    
    try {
      const { body } = await getPromise.response;
      
      const responseBody = await body.text();
      
      const parsedBody = JSON.parse(responseBody);
      return parsedBody.users || [];
    } catch (responseError) {
      console.error('Error processing API response');
      throw new Error('API response error');
    }
  } catch (error) {
    console.error('Error getting all users');
    throw error;
  }
};

// Get team selections for specific user (admin only)
export const getUserTeamSelections = async (userId: string): Promise<UserSelections> => {
  // Use the common getTeamSelections function with the userId parameter
  return getTeamSelections(userId, true);
};

// Update team selections for specific user (admin only)
export const updateUserTeamSelections = async (
  userId: string,
  teamSelections: TeamSelection[],
  perks?: UserPerkSelection[],
  perkAdjustments?: { [key: string]: number }
): Promise<UserSelections> => {
  // Use the common updateTeamSelections function with the userId parameter
  return updateTeamSelections(teamSelections, userId, true, perks, perkAdjustments);
};

/**
 * Get all team selections across all users (admin only)
 * This is used to show which teams have been selected by any user
 */
export const getAllTeamSelections = async (sport: string = 'football'): Promise<TeamSelection[]> => {
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
    
    // API endpoint for getting all team selections across users
    const path = `/admin/all-team-selections?sport=${sport}`;
    
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
      return parsedBody.teamSelections || [];
    } catch (e) {
      console.error('Error parsing response');
      return [];
    }
  } catch (error) {
    console.error(`Error getting all team selections:`, error);
    
    // If the API endpoint doesn't exist yet, we'll need to get all users and their selections
    // This is a fallback implementation that should work even without a dedicated endpoint
    try {
      const users = await getAllUsers();
      
      // Get team selections for each user
      const allSelectionsPromises = users.map(user => getUserTeamSelections(user.userId));
      const allSelectionsArrays = await Promise.all(allSelectionsPromises);
      
      // Flatten and deduplicate by team ID
      const teamMap = new Map();
      allSelectionsArrays.forEach(userSelections => {
        // Extract team selections from the response
        const sportTeams = userSelections.footballSelections || userSelections.mensbballSelections || userSelections.teamSelections || [];
        
        // Filter and process teams
        sportTeams
          .filter((team: TeamSelection) => !team.sport || team.sport === sport)
          .forEach((team: TeamSelection) => {
            // Use schoolName as the unique identifier
            teamMap.set(team.schoolName, team);
          });
      });
      
      return Array.from(teamMap.values());
    } catch (fallbackError) {
      console.error('Fallback implementation failed:', fallbackError);
      throw error; // Throw the original error
    }
  }
};