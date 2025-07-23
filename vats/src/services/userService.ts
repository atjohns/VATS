import { get } from 'aws-amplify/api';
import { updateUserAttributes } from 'aws-amplify/auth';

export interface User {
  userId: string;
  username: string;
  email?: string;
  name?: string;
  teamName?: string;
}

export interface UserDisplayData {
  displayName: string;
  teamName?: string;
}

// Cache for storing users to minimize API calls
const userCache: { [key: string]: User } = {};
let cacheInitialized = false;

/**
 * Get all users (admin only)
 * @param forceRefresh Force a refresh of the cache
 */
export const getAllUsers = async (forceRefresh = false): Promise<User[]> => {
  // Return from cache if already initialized and not forcing refresh
  if (cacheInitialized && !forceRefresh) {
    return Object.values(userCache);
  }
  
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
    
    // API endpoint for getting all users
    const path = '/admin/users';
    
    console.log(`Getting user data from ${path}`);
    
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
      const users = parsedBody.users || [];
      
      // Update cache with all users
      users.forEach((user: User) => {
        if (user?.userId) {
          userCache[user.userId] = user;
        }
      });
      
      // Mark cache as initialized
      cacheInitialized = true;
      
      return users;
    } catch (e) {
      console.error('Error parsing response body:', e);
      return [];
    }
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
};

/**
 * Get display names and team names for multiple users at once
 * @param userIds Array of user IDs to look up
 * @returns Object mapping user IDs to display data (display name and team name)
 */
export const getUserDisplayData = async (userIds: string[]): Promise<{[key: string]: UserDisplayData}> => {
  // Filter out IDs that are not in cache
  const missingIds = userIds.filter(id => !userCache[id]);
  
  // If any IDs are missing from cache, fetch all users
  if (missingIds.length > 0 && !cacheInitialized) {
    await getAllUsers();
  }
  
  // Create result map
  const result: {[key: string]: UserDisplayData} = {};
  
  // Map each user ID to its display name and team name
  userIds.forEach(id => {
    const user = userCache[id] || { userId: id, username: id };
    result[id] = {
      displayName: formatUserDisplayName(user),
      teamName: user.teamName || undefined
    };
  });
  
  return result;
};

/**
 * Get display names for multiple users at once (backward compatibility)
 * @param userIds Array of user IDs to look up
 * @returns Object mapping user IDs to display names
 */
export const getUserDisplayNames = async (userIds: string[]): Promise<{[key: string]: string}> => {
  const displayData = await getUserDisplayData(userIds);
  
  // Convert display data to simple name mapping
  const result: {[key: string]: string} = {};
  Object.entries(displayData).forEach(([userId, data]) => {
    result[userId] = data.displayName;
  });
  
  return result;
};

/**
 * Get a user's display name from their user ID
 * @param userId The user ID to look up
 * @returns The user's display name (name, username, or user ID if nothing else available)
 */
export const getUserDisplayName = async (userId: string): Promise<string> => {
  // Return from cache if available
  if (userCache[userId]) {
    return formatUserDisplayName(userCache[userId]);
  }
  
  // Try to fetch all users to populate cache if not initialized
  if (!cacheInitialized) {
    try {
      await getAllUsers();
      
      // Check cache again after fetch
      if (userCache[userId]) {
        return formatUserDisplayName(userCache[userId]);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }
  
  // Return user ID if nothing else is available
  return userId;
};

/**
 * Update a user's team name in Cognito
 * @param teamName The new team name to set
 */
export const updateUserTeamName = async (teamName: string): Promise<void> => {
  try {
    await updateUserAttributes({
      userAttributes: {
        preferred_username: teamName,
      },
    });
  } catch (error) {
    console.error('Error updating team name:', error);
    throw error;
  }
};

/**
 * Format a user object into a display name
 * @param user The user object
 * @returns A formatted display name
 */
export const formatUserDisplayName = (user: User): string => {
  if (!user) return 'Unknown User';
  
  // Return name if available
  if (user.name && user.name.trim() !== '') {
    return user.name;
  }
  
  // Return username if available
  if (user.username && user.username.trim() !== '') {
    return user.username;
  }
  
  // Fall back to user ID
  return user.userId || 'Unknown User';
};
