import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import {
  signOut,
  getCurrentUser,
  signInWithRedirect,
  fetchUserAttributes,
  fetchAuthSession
} from 'aws-amplify/auth';

interface UserInfo {
  username: string;
  userId: string;
  friendlyUsername?: string;
  email?: string;
  picture?: string;
  groups?: string[]; // Add groups for admin check
  teamName?: string; // Add team name
}

interface AuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean; // Add isAdmin flag
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<void>;
  refreshUserAttributes: () => Promise<void>; // Add refresh function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false); // Add isAdmin state

  useEffect(() => {
    checkAuth();
    // Handle OAuth redirect callback when page loads
    handleOAuthRedirect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOAuthRedirect = async () => {
    try {
      // Check if we have returned from a redirect sign-in 
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      
      // If this is a redirect from OAuth
      if (code && state) {
        setIsLoading(true);
        // Clear URL parameters after processing to avoid repeat auth attempts
        window.history.replaceState({}, document.title, window.location.pathname);
        // Handle sign in completion
        await checkAuth();
      }
    } catch (error) {
      console.error('Error handling OAuth redirect:', error);
      setIsLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const userInfo = await getCurrentUser();
      
      // For Google sign-in users (which is all we support now), get the proper profile
      try {
        const attributes = await fetchUserAttributes();
        
        // Check if user is in admin group by checking their Cognito tokens
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken;
        let userGroups: string[] = [];
        let isUserAdmin = false;
        
        if (idToken) {
          const payload = idToken.payload;
          console.log('ID Token payload:', payload);
          
          // Method 1: Check for cognito:groups in token claims
          if (payload['cognito:groups']) {
            userGroups = payload['cognito:groups'] as string[];
            // Check if user is in the admin group (note: group name is 'admins' not 'admin')
            isUserAdmin = userGroups.includes('admins');
          }
        }
        
        console.log('User groups:', userGroups);
        console.log('Is admin:', isUserAdmin);
        
        // Update isAdmin state
        setIsAdmin(isUserAdmin);
        
        // Enhance the user object with attributes from Google
        setUser({
          ...userInfo,
          // Name from Google profile
          friendlyUsername: attributes.name || 
            (attributes.given_name && attributes.family_name
              ? `${attributes.given_name} ${attributes.family_name}`
              : (attributes.given_name || userInfo.username)),
          // Add other useful attributes
          email: attributes.email,
          picture: attributes.picture,
          groups: userGroups, // Add groups to the user object
          teamName: attributes.preferred_username // Add team name from preferred_username
        });
      } catch (attrError) {
        console.error('Error fetching user attributes:', attrError);
        // If we can't get attributes, just use the basic user
        setUser(userInfo);
        setIsAdmin(false);
      }
      
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignInWithGoogle = async () => {
    try {
      // Initiate Google sign in with redirect
      await signInWithRedirect({ provider: 'Google' });
      return true;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Function to refresh user attributes after updates
  const refreshUserAttributes = async () => {
    try {
      await checkAuth();
    } catch (error) {
      console.error('Error refreshing user attributes:', error);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    isAdmin, // Add isAdmin to the context value
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut,
    refreshUserAttributes, // Add refresh function to context
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};