import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('/auth/me');
          setUser(response.data.user);
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('token');
          setToken(null);
          delete api.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  const login = async (email, password, twoFactorToken = null) => {
    try {
      const loginData = { email, password };
      if (twoFactorToken) {
        loginData.twoFactorToken = twoFactorToken;
      }

      const response = await api.post('/auth/login', loginData);
      
      // SRS SEC-01: Handle 2FA requirement
      if (response.data.requiresTwoFactor) {
        return { 
          success: false, 
          requiresTwoFactor: true,
          userId: response.data.userId,
          message: response.data.message 
        };
      }

      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      
      // Check if it's a 2FA error
      if (error.response?.data?.requiresTwoFactor) {
        return {
          success: false,
          requiresTwoFactor: true,
          userId: error.response.data.userId,
          error: error.response.data.message
        };
      }
      
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token: newToken, user: newUser } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const isContributor = () => {
    return user?.role === 'Contributor' || user?.role === 'Admin';
  };

  const isAdmin = () => {
    return user?.role === 'Admin';
  };

  const forgotPassword = async (email, newPassword) => {
    try {
      const response = await api.post('/auth/forgot-password', { email, newPassword });
      return { 
        success: true, 
        message: response.data.message 
      };
    } catch (error) {
      console.error('Forgot password failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update password' 
      };
    }
  };

  // 2FA functions - SRS SEC-01: 2FA Support
  const setup2FA = async () => {
    try {
      const response = await api.post('/2fa/setup');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('2FA setup failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to setup 2FA'
      };
    }
  };

  const verify2FA = async (token) => {
    try {
      const response = await api.post('/2fa/verify', { token });
      // Update user to reflect 2FA is now enabled
      if (user) {
        setUser({ ...user, twoFactorEnabled: true });
      }
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('2FA verification failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to verify 2FA'
      };
    }
  };

  const disable2FA = async (token, password) => {
    try {
      const response = await api.post('/2fa/disable', { token, password });
      // Update user to reflect 2FA is now disabled
      if (user) {
        setUser({ ...user, twoFactorEnabled: false });
      }
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('2FA disable failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to disable 2FA'
      };
    }
  };

  const get2FAStatus = async () => {
    try {
      const response = await api.get('/2fa/status');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Get 2FA status failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get 2FA status'
      };
    }
  };

  // DEPRECATED: Token-based reset methods - no longer needed with direct password reset
  /*
  const resetPassword = async (token, password) => {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { password });
      return { 
        success: true, 
        message: response.data.message 
      };
    } catch (error) {
      console.error('Reset password failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to reset password' 
      };
    }
  };

  const validateResetToken = async (token) => {
    try {
      const response = await api.get(`/auth/reset-password/${token}`);
      return { 
        success: true, 
        message: response.data.message 
      };
    } catch (error) {
      console.error('Token validation failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Invalid reset token' 
      };
    }
  };
  */

  const value = {
    user,
    loading,
    token,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated,
    hasRole,
    isContributor,
    isAdmin,
    forgotPassword,
    setup2FA,
    verify2FA,
    disable2FA,
    get2FAStatus,
    // resetPassword, // Commented out - no longer needed
    // validateResetToken, // Commented out - no longer needed
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
