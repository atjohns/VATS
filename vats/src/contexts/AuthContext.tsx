import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import {
  signIn,
  signUp,
  confirmSignUp,
  signOut,
  resendSignUpCode,
  resetPassword,
  confirmResetPassword,
  getCurrentUser
} from 'aws-amplify/auth';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, name: string) => Promise<any>;
  confirmSignUp: (email: string, code: string) => Promise<any>;
  signOut: () => Promise<void>;
  resendConfirmationCode: (email: string) => Promise<any>;
  forgotPassword: (email: string) => Promise<any>;
  forgotPasswordSubmit: (email: string, code: string, newPassword: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const userInfo = await getCurrentUser();
      setUser(userInfo);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      const { nextStep, isSignedIn } = await signIn({ username: email, password });
      if (isSignedIn) {
        const userInfo = await getCurrentUser();
        setUser(userInfo);
        setIsAuthenticated(true);
        return userInfo;
      }
      return { nextStep };
    } catch (error) {
      throw error;
    }
  };

  const handleSignUp = async (email: string, password: string, name: string) => {
    try {
      const result = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            given_name: name,
            family_name: ' ',
          }
        }
      });
      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleConfirmSignUp = async (email: string, code: string) => {
    try {
      return await confirmSignUp({ username: email, confirmationCode: code });
    } catch (error) {
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

  const handleResendConfirmationCode = async (email: string) => {
    try {
      return await resendSignUpCode({ username: email });
    } catch (error) {
      throw error;
    }
  };

  const handleForgotPassword = async (email: string) => {
    try {
      return await resetPassword({ username: email });
    } catch (error) {
      throw error;
    }
  };

  const handleForgotPasswordSubmit = async (email: string, code: string, newPassword: string) => {
    try {
      return await confirmResetPassword({ username: email, confirmationCode: code, newPassword });
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    confirmSignUp: handleConfirmSignUp,
    signOut: handleSignOut,
    resendConfirmationCode: handleResendConfirmationCode,
    forgotPassword: handleForgotPassword,
    forgotPasswordSubmit: handleForgotPasswordSubmit,
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