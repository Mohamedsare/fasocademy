import React, { createContext, useState, useContext, useEffect } from 'react';
import { AuthAPI } from '@/lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    refreshUser();
  }, []);

  const refreshUser = async () => {
    try {
      setAuthError(null);
      setIsLoadingAuth(true);
      const currentUser = await AuthAPI.me();

      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }

      setIsLoadingAuth(false);
    } catch (error) {
      console.error('Auth refresh failed:', error);
      setAuthError({
        type: 'unknown',
        message: error.message || 'An unexpected error occurred'
      });
      setIsLoadingAuth(false);
    }
  };

  const logout = (shouldRedirect = true) => {
    AuthAPI.signOut()
      .catch((e) => {
        console.error('Logout error:', e);
      })
      .finally(() => {
        setUser(null);
        setIsAuthenticated(false);
        if (shouldRedirect) {
          window.location.href = '/';
        }
      });
  };

  const navigateToLogin = () => {
    // Simple: redirect to profile page which can host login / signup UI
    window.location.href = '/Profile';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      authError,
      logout,
      navigateToLogin,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
