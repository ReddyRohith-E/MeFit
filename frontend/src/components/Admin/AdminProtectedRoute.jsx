import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { adminTokenManager, adminApiService } from '../../services/adminAPI';

const AdminProtectedRoute = ({ children }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      console.log('AdminProtectedRoute: Checking authentication...');
      
      // Check if token exists and is valid
      if (!adminTokenManager.isAuthenticated()) {
        console.log('AdminProtectedRoute: No valid token found');
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      console.log('AdminProtectedRoute: Token found, verifying with server...');
      
      // Verify token with server
      const response = await adminApiService.auth.getMe();
      console.log('AdminProtectedRoute: Server verification successful', response.data);
      
      setIsAuthenticated(true);
    } catch (error) {
      console.error('AdminProtectedRoute: Token verification failed', error);
      
      // Token is invalid or expired
      adminTokenManager.removeToken();
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
      >
        <CircularProgress size={60} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Verifying admin access...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    console.log('AdminProtectedRoute: Redirecting to admin login');
    // Redirect to login page with return URL
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminProtectedRoute;
