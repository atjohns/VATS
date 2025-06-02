import { API } from 'aws-amplify';
import { Auth } from 'aws-amplify';
import { Storage } from 'aws-amplify';

// Profile management
export interface UserProfile {
  userId: string;
  name: string;
  profilePictureUrl?: string;
}

export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const user = await Auth.currentAuthenticatedUser();
    const userId = user.attributes.sub;
    
    const response = await API.get('VatsApi', `/users/${userId}`, {});
    return response;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (name: string, profilePicture?: File): Promise<UserProfile> => {
  try {
    const user = await Auth.currentAuthenticatedUser();
    const userId = user.attributes.sub;
    
    let profilePictureBase64;
    if (profilePicture) {
      // Convert the file to base64
      const reader = new FileReader();
      profilePictureBase64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(profilePicture);
      });
    }
    
    const response = await API.put('VatsApi', `/users/${userId}`, {
      body: {
        name,
        profilePictureBase64,
      },
    });
    
    return response;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Team selections management
export interface TeamSelection {
  schoolName: string;
  teamName: string;
  location: string;
  conference: string;
}

export const getTeamSelections = async (): Promise<TeamSelection[]> => {
  try {
    const user = await Auth.currentAuthenticatedUser();
    const userId = user.attributes.sub;
    
    const response = await API.get('VatsApi', `/users/${userId}/team-selections`, {});
    return response.teamSelections || [];
  } catch (error) {
    console.error('Error getting team selections:', error);
    throw error;
  }
};

export const updateTeamSelections = async (teamSelections: TeamSelection[]): Promise<TeamSelection[]> => {
  try {
    const user = await Auth.currentAuthenticatedUser();
    const userId = user.attributes.sub;
    
    const response = await API.put('VatsApi', `/users/${userId}/team-selections`, {
      body: {
        teamSelections,
      },
    });
    
    return response.teamSelections;
  } catch (error) {
    console.error('Error updating team selections:', error);
    throw error;
  }
};