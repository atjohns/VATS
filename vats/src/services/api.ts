import { get, put } from 'aws-amplify/api';

// Profile management
export interface UserProfile {
  userId: string;
  name: string;
  profilePictureUrl?: string;
}

export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    // Import auth functions in a way that doesn't trigger TypeScript warning
    const authModule = await import('aws-amplify/auth');
    const { getCurrentUser, fetchAuthSession } = authModule;
    
    // Get current user ID
    const { userId } = await getCurrentUser();
    
    // Get authentication session
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString() || '';
    
    // Create request headers with token
    const headers = {
      Authorization: `Bearer ${token}`
    };
    
    // Make API request
    const getPromise = get({
      apiName: 'VatsApi',
      path: `/users/${userId}`,
      options: {
        headers: headers
      }
    });
    
    // Get the response
    const response = getPromise;
    return (response as any).body;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (name: string, profilePicture?: File): Promise<UserProfile> => {
  try {
    // Import auth functions
    const authModule = await import('aws-amplify/auth');
    const { getCurrentUser, fetchAuthSession } = authModule;
    
    // Get current user ID
    const { userId } = await getCurrentUser();
    
    // Get authentication session
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString() || '';
    
    // Create request headers with token
    const headers = {
      Authorization: `Bearer ${token}`
    };
    
    let profilePictureBase64;
    if (profilePicture) {
      // Convert the file to base64
      const reader = new FileReader();
      profilePictureBase64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(profilePicture);
      });
    }
    
    // Make API request
    const putPromise = put({
      apiName: 'VatsApi',
      path: `/users/${userId}`,
      options: {
        headers: headers,
        body: JSON.stringify({
          name,
          profilePictureBase64,
        })
      } as any
    });
    
    // Get the response
    const response = putPromise;
    
    return (response as any).body;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Team selections management
export interface TeamSelection {
  id?: string;
  schoolName: string;
  teamName: string;
  location: string;
  conference: string;
  selectionType?: string; // Added for admin functionality
}

export const getTeamSelections = async (): Promise<TeamSelection[]> => {
  try {
    // Import auth functions
    const authModule = await import('aws-amplify/auth');
    const { getCurrentUser, fetchAuthSession } = authModule;
    
    // Get current user ID
    const { userId } = await getCurrentUser();
    console.log('Current user ID:', userId);
    
    // Debug authentication session
    const session = await fetchAuthSession();
    console.log('Auth session exists:', !!session);
    console.log('Access token exists:', !!session.tokens?.accessToken);
    console.log('ID token exists:', !!session.tokens?.idToken);
    
    // Use ID token instead of access token for Cognito User Pools Authorizer
    // This is because API Gateway Cognito Authorizer requires ID token, not access token
    const token = session.tokens?.idToken?.toString() || '';
    console.log('Using ID Token! Preview (first 20 chars):', token.substring(0, 20));
    
    // Create request headers with token
    const headers = {
      Authorization: `Bearer ${token}`
    };
    console.log('Setting request headers:', headers);
    
    console.log('Making API request to:', `/users/${userId}/team-selections`);
    let responseBody;
    try {
      // Make API request
      const getPromise = get({
        apiName: 'VatsApi',
        path: `/users/${userId}/team-selections`,
        options: {
          headers: headers
        }
      });
      
      // Get the response
      const { body } = await getPromise.response;
      responseBody = await body.text();
    } catch (err) {
      console.error('API request failed:', err);
      throw err;
    }

    let teamSelectionsFromResponse;

    try {
      const parsedBody = JSON.parse(responseBody);
      console.log('Parsed body:', parsedBody);
      teamSelectionsFromResponse = parsedBody.teamSelections;
    } catch (e) {
      console.error('Error parsing response body:', e);
    }
    
    // Return teamSelections if it exists, otherwise an empty array
    return teamSelectionsFromResponse || [];
  } catch (error) {
    console.error('Error getting team selections:', error);
    throw error;
  }
};

export const updateTeamSelections = async (teamSelections: TeamSelection[]): Promise<TeamSelection[]> => {
  try {
    // Import and use auth functions
    const authModule = await import('aws-amplify/auth');
    const { getCurrentUser, fetchAuthSession } = authModule;
    
    // Get current user ID
    const { userId } = await getCurrentUser();
    
    // Get authentication session
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString() || '';
    
    // Create request headers with token
    const headers = {
      Authorization: `Bearer ${token}`
    };
    
    // Make API request
    const putPromise = put({
      apiName: 'VatsApi',
      path: `/users/${userId}/team-selections`,
      options: {
        headers: headers,
        body: JSON.stringify({
          teamSelections,
        })
      } as any
    });
    
    // Get the response
    const response = putPromise;
    
    return (response as any).body?.teamSelections;
  } catch (error) {
    console.error('Error updating team selections:', error);
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
    
    // Get authentication session
    const session = await fetchAuthSession();
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
    
    const { body } = await getPromise.response;
    const responseBody = await body.text();
    const parsedBody = JSON.parse(responseBody);
    
    return parsedBody.users || [];
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

// Get team selections for specific user (admin only)
export const getUserTeamSelections = async (userId: string): Promise<TeamSelection[]> => {
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
    
    // Get team selections for specific user
    const getPromise = get({
      apiName: 'VatsApi',
      path: `/admin/users/${userId}/team-selections`,
      options: {
        headers: headers
      }
    });
    
    const { body } = await getPromise.response;
    const responseBody = await body.text();
    const parsedBody = JSON.parse(responseBody);
    
    return parsedBody.teamSelections || [];
  } catch (error) {
    console.error(`Error getting team selections for user ${userId}:`, error);
    throw error;
  }
};

// Update team selections for specific user (admin only)
export const updateUserTeamSelections = async (
  userId: string,
  teamSelections: TeamSelection[]
): Promise<TeamSelection[]> => {
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
    
    // Update team selections for specific user
    const putPromise = put({
      apiName: 'VatsApi',
      path: `/admin/users/${userId}/team-selections`,
      options: {
        headers: headers,
        body: JSON.stringify({
          teamSelections,
        })
      } as any
    });
    
    const { body } = await putPromise.response;
    const responseBody = await body.text();
    const parsedBody = JSON.parse(responseBody);
    
    return parsedBody.teamSelections || [];
  } catch (error) {
    console.error(`Error updating team selections for user ${userId}:`, error);
    throw error;
  }
};