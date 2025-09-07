import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Card, CardContent, Alert } from '@mui/material';
import { adminTokenManager } from '../../services/adminAPI';

const AdminTokenSetter = () => {
  const navigate = useNavigate();

  const setTestToken = () => {
    const testToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGJkOWIwYTVkNDc4NDg0Y2YxMzA3MDIiLCJpc0FkbWluIjp0cnVlLCJpc0NvbnRyaWJ1dG9yIjp0cnVlLCJlbWFpbCI6ImFkbWluQG1lZml0LmNvbSIsImZpcnN0TmFtZSI6IkFkbWluIiwibGFzdE5hbWUiOiJVc2VyIiwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU3MjU3MjU0LCJzZWN1cml0eUxldmVsIjoiYWRtaW4iLCJleHAiOjE3NTczNDM2NTR9.aYMTiKT2zKtHYoVXHYO1KOSPKnr2teq8YQb2pMbaIdg`;
    
    console.log('Setting admin token:', testToken);
    adminTokenManager.setToken(testToken);
    
    alert('Admin token set! You can now access admin routes.');
    navigate('/admin/dashboard');
  };

  const clearToken = () => {
    adminTokenManager.removeToken();
    alert('Admin token cleared!');
  };

  const checkToken = () => {
    const token = adminTokenManager.getToken();
    const isAuth = adminTokenManager.isAuthenticated();
    console.log('Current token:', token);
    console.log('Is authenticated:', isAuth);
    alert(`Token exists: ${!!token}\nIs valid: ${isAuth}`);
  };

  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Admin Token Debugger
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            This is a development tool to test admin authentication
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
            <Button 
              variant="contained" 
              onClick={setTestToken}
              size="large"
            >
              Set Test Admin Token
            </Button>
            
            <Button 
              variant="outlined" 
              onClick={checkToken}
              size="large"
            >
              Check Current Token
            </Button>
            
            <Button 
              variant="outlined" 
              color="error"
              onClick={clearToken}
              size="large"
            >
              Clear Token
            </Button>

            <Button 
              variant="text" 
              onClick={() => navigate('/admin/login')}
              size="large"
            >
              Go to Admin Login
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminTokenSetter;
