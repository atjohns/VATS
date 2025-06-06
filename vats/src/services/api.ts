import { get, put } from 'aws-amplify/api';

// Team selections management
export interface TeamSelection {
  id?: string;
  schoolName: string;
  teamName: string;
  location: string;
  conference: string;
  selectionType?: string; // Added for admin functionality
  sport?: string; // Added for multi-sport support: 'football', 'mensbball', etc.
  regularSeasonPoints?: number; // Points earned during regular season
  postseasonPoints?: number; // Points earned during postseason
}

/**
 * Common function to get team selections for a user (either for self or as admin)
 */
export const getTeamSelections = async (userId: string, admin: boolean): Promise<TeamSelection[]> => {
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
    
    console.log(`Getting team selections from ${path}`);
    
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
      console.log('Team selections response:', parsedBody);
      // Return sport-specific selections if available, fall back to legacy format if needed
      return parsedBody.footballSelections || parsedBody.teamSelections || [];
    } catch (e) {
      console.error('Error parsing response body:', e);
      return [];
    }
  } catch (error) {
    console.error(`Error getting team selections${userId ? ` for user ${userId}` : ''}:`, error);
    throw error;
  }
};

/**
 * Common function to update team selections for a user (either self or as admin)
 */
export const updateTeamSelections = async (teamSelections: TeamSelection[], userId: string, admin: boolean): Promise<TeamSelection[]> => {
  // Set the sport to football by default for backward compatibility
  const sport = teamSelections[0]?.sport || 'football';
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
    
    console.log(`Updating team selections at ${path}`);
    
    // Make API request
    const putPromise = put({
      apiName: 'VatsApi',
      path,
      options: {
        headers,
        // Use the appropriate property based on sport
        body: JSON.stringify(sport === 'football' 
          ? { footballSelections: teamSelections } 
          : { mensbballSelections: teamSelections })
      } as any
    });
    
    // Get and parse the response
    const { body } = await putPromise.response;
    const responseBody = await body.text();
    
    try {
      const parsedBody = JSON.parse(responseBody);
      console.log('Update response:', parsedBody);
      // Return sport-specific selections if available, fall back to legacy format if needed
      return (sport === 'football' ? parsedBody.footballSelections : parsedBody.mensbballSelections) || parsedBody.teamSelections || [];
    } catch (e) {
      console.error('Error parsing response body:', e);
      return [];
    }
  } catch (error) {
    console.error(`Error updating team selections${userId ? ` for user ${userId}` : ''}:`, error);
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
      console.log('ID token payload for admin request:', idToken.payload);
    }
    
    const token = session.tokens?.idToken?.toString() || '';
    console.log('Token for admin API call:', token.substring(0, 20) + '...');
    
    // Create request headers with token
    const headers = {
      Authorization: `Bearer ${token}`
    };
    
    console.log('Sending admin API request to /admin/users');
    
    // Get all users
    const getPromise = get({
      apiName: 'VatsApi',
      path: '/admin/users',
      options: {
        headers: headers
      }
    });
    
    try {
      const { body, statusCode, headers: responseHeaders } = await getPromise.response;
      console.log('Admin API response status:', statusCode);
      console.log('Admin API response headers:', responseHeaders);
      
      const responseBody = await body.text();
      console.log('Admin API raw response:', responseBody);
      
      const parsedBody = JSON.parse(responseBody);
      return parsedBody.users || [];
    } catch (responseError) {
      console.error('Error processing API response:', responseError);
      throw new Error(`API response error: ${responseError}`);
    }
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

// Get team selections for specific user (admin only)
export const getUserTeamSelections = async (userId: string): Promise<TeamSelection[]> => {
  // Use the common getTeamSelections function with the userId parameter
  return getTeamSelections(userId, true);
};

// Update team selections for specific user (admin only)
export const updateUserTeamSelections = async (
  userId: string,
  teamSelections: TeamSelection[]
): Promise<TeamSelection[]> => {
  // Use the common updateTeamSelections function with the userId parameter
  return updateTeamSelections(teamSelections, userId, true);
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
    
    console.log(`Getting all team selections from ${path}`);
    
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
      console.log('All team selections response:', parsedBody);
      return parsedBody.teamSelections || [];
    } catch (e) {
      console.error('Error parsing response body:', e);
      return [];
    }
  } catch (error) {
    console.error(`Error getting all team selections:`, error);
    
    // If the API endpoint doesn't exist yet, we'll need to get all users and their selections
    // This is a fallback implementation that should work even without a dedicated endpoint
    try {
      console.log('Trying fallback implementation to get all team selections');
      const users = await getAllUsers();
      
      // Get team selections for each user
      const allSelectionsPromises = users.map(user => getUserTeamSelections(user.userId));
      const allSelectionsArrays = await Promise.all(allSelectionsPromises);
      
      // Flatten and deduplicate by team ID
      const teamMap = new Map();
      allSelectionsArrays.forEach(selections => {
        selections.filter(s => !s.sport || s.sport === sport).forEach(team => {
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