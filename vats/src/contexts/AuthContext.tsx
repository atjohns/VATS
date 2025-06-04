import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import {
  signOut,
  getCurrentUser,
  signInWithRedirect,
  fetchUserAttributes
} from 'aws-amplify/auth';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
          picture: attributes.picture
        });
      } catch (attrError) {
        console.error('Error fetching user attributes:', attrError);
        // If we can't get attributes, just use the basic user
        setUser(userInfo);
      }
      
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
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
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };


  const value = {
    user,
    isAuthenticated,
    isLoading,
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut,
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