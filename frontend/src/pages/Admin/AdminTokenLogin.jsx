import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Alert,
  Container,
  TextField,
  Divider,
  Grid,
  Paper
} from '@mui/material';
import {
  AdminPanelSettings,
  Token,
  Login as LoginIcon,
  ContentCopy
} from '@mui/icons-material';
import { adminTokenManager, adminApiService } from '../../services/adminAPI';

const AdminTokenLogin = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-generated admin token (from your generate-admin-token.js script)
  const testToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGJkOWIwYTVkNDc4NDg0Y2YxMzA3MDIiLCJpc0FkbWluIjp0cnVlLCJpc0NvbnRyaWJ1dG9yIjp0cnVlLCJlbWFpbCI6ImFkbWluQG1lZml0LmNvbSIsImZpcnN0TmFtZSI6IkFkbWluIiwibGFzdE5hbWUiOiJVc2VyIiwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzU3MjU3MjU0LCJzZWN1cml0eUxldmVsIjoiYWRtaW4iLCJleHAiOjE3NTczNDM2NTR9.aYMTiKT2zKtHYoVXHYO1KOSPKnr2teq8YQb2pMbaIdg`;

  const handleTokenLogin = async () => {
    if (!token.trim()) {
      setError('Please enter a token');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Set token
      adminTokenManager.setToken(token.trim());
      
      // Test the token by making an API call
      const response = await adminApiService.auth.getMe();
      
      if (response.data.success) {
        setSuccess('Token validated successfully! Redirecting...');
        
        // Store user data
        adminTokenManager.setUserData(response.data.data.user);
        
        // Redirect to admin dashboard
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1000);
      }
    } catch (err) {
      console.error('Token validation error:', err);
      adminTokenManager.removeToken();
      
      if (err.response?.status === 401) {
        setError('Invalid or expired token. Please generate a new one.');
      } else {
        setError('Failed to validate token. Please check the token and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUseTestToken = () => {
    setToken(testToken);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('Token copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const generateNewToken = () => {
    setError('');
    setSuccess('');
    alert(`To generate a new admin token:

1. Open terminal in backend directory
2. Run: cd scripts
3. Run: node generate-admin-token.js
4. Copy the generated token
5. Paste it in the token field above`);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card elevation={8} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box textAlign="center" mb={4}>
            <AdminPanelSettings 
              sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} 
            />
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Admin Token Login
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Use a pre-generated admin token to access the admin dashboard
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              {success}
            </Alert>
          )}

          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Enter Admin Token:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your admin JWT token here..."
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontFamily: 'monospace',
                  fontSize: '0.875rem'
                }
              }}
            />
          </Box>

          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleTokenLogin}
                disabled={loading}
                startIcon={<LoginIcon />}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600
                }}
              >
                {loading ? 'Validating...' : 'Login with Token'}
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={handleUseTestToken}
                disabled={loading}
                startIcon={<Token />}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600
                }}
              >
                Use Test Token
              </Button>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box>
            <Typography variant="h6" gutterBottom>
              Generate New Token:
            </Typography>
            <Paper 
              elevation={1} 
              sx={{ 
                p: 2, 
                bgcolor: 'grey.50',
                borderRadius: 2,
                mb: 2
              }}
            >
              <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                cd backend/scripts
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                node generate-admin-token.js
              </Typography>
            </Paper>
            
            <Button
              variant="outlined"
              onClick={generateNewToken}
              startIcon={<Token />}
              sx={{ borderRadius: 2 }}
            >
              Show Token Generation Instructions
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box>
            <Typography variant="h6" gutterBottom>
              Current Test Token:
            </Typography>
            <Paper 
              elevation={1} 
              sx={{ 
                p: 2, 
                bgcolor: 'grey.50',
                borderRadius: 2,
                position: 'relative'
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                  fontSize: '0.75rem',
                  pr: 5
                }}
              >
                {testToken}
              </Typography>
              <Button
                size="small"
                onClick={() => copyToClipboard(testToken)}
                startIcon={<ContentCopy />}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  minWidth: 'auto'
                }}
              >
                Copy
              </Button>
            </Paper>
          </Box>

          <Box textAlign="center" mt={3}>
            <Button
              variant="text"
              onClick={() => navigate('/admin/login')}
              sx={{ borderRadius: 2 }}
            >
              Back to Admin Login
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AdminTokenLogin;
