import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, tokenManager } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is already logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await tokenManager.getAccessToken();
      if (token) {
        const userData = await authAPI.getCurrentUser();
        setUser(userData);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.log('Not authenticated:', error);
      await tokenManager.clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const data = await authAPI.login(username, password);
      // Fetch user profile after login
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
      setIsLoggedIn(true);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed. Please check your credentials.',
      };
    }
  };

  const register = async (userData) => {
    try {
      const data = await authAPI.register(userData);
      setUser(data.user);
      setIsLoggedIn(true);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.username?.[0] ||
        error.response?.data?.email?.[0] ||
        error.response?.data?.password?.[0] ||
        'Registration failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (userData) => {
    try {
      const updatedUser = await authAPI.updateProfile(userData);
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  };

  const googleLogin = async (idToken) => {
    try {
      const data = await authAPI.googleAuth(idToken);
      setUser(data.user);
      setIsLoggedIn(true);
      return { success: true, isNewUser: data.created };
    } catch (error) {
      console.error('Google login error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Google login failed.',
      };
    }
  };

  const facebookLogin = async (accessToken) => {
    try {
      const data = await authAPI.facebookAuth(accessToken);
      setUser(data.user);
      setIsLoggedIn(true);
      return { success: true, isNewUser: data.created };
    } catch (error) {
      console.error('Facebook login error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Facebook login failed.',
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        googleLogin,
        facebookLogin,
      }}
    >
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

export default AuthContext;
