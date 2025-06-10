import { get } from 'aws-amplify/api';

export interface User {
  userId: string;
  username: string;
  email?: string;
  name?: string;
}

// Cache for storing users to minimize API calls
const userCache: { [key: string]: User } = {};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (): Promise<User[]> => {
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
 * Get a user's display name from their user ID
 * @param userId The user ID to look up
 * @returns The user's display name (name, username, or user ID if nothing else available)
 */
export const getUserDisplayName = async (userId: string): Promise<string> => {
  // Return from cache if available
  if (userCache[userId]) {
    return formatUserDisplayName(userCache[userId]);
  }
  
  // Try to fetch all users to populate cache
  try {
    await getAllUsers();
    
    // Check cache again after fetch
    if (userCache[userId]) {
      return formatUserDisplayName(userCache[userId]);
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
  
  // Return user ID if nothing else is available
  return userId;
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