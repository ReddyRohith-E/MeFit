import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Paper,
  Container,
  Avatar,
  CircularProgress,
  Divider,
  useTheme
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  AdminPanelSettings,
  Security,
  Login as LoginIcon
} from '@mui/icons-material';
import { adminApiService, adminTokenManager, handleApiError } from '../../services/adminAPI';
import { ThemeToggleButton } from '../../components/Common/ThemeToggle.jsx';

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      if (adminTokenManager.isAuthenticated()) {
        try {
          await adminApiService.auth.getMe();
          // Redirect to intended page or dashboard
          const from = location.state?.from?.pathname || '/admin/dashboard';
          navigate(from, { replace: true });
        } catch (error) {
          // Token is invalid, remove it
          adminTokenManager.removeToken();
        }
      }
    };
    checkAuth();
  }, [navigate, location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await adminApiService.auth.login(formData);
      
      if (response.data.success) {
        // Redirect to intended page or dashboard
        const from = location.state?.from?.pathname || '/admin/dashboard';
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Admin login error:', err);
      const errorMessage = handleApiError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTestCredentials = () => {
    setFormData({
      email: 'admin@mefit.com',
      password: 'Admin123!'
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 3,
        position: 'relative'
      }}
    >
      {/* Theme Toggle */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 1000
        }}
      >
        <ThemeToggleButton />
      </Box>

      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            backgroundColor: 'background.paper',
            border: `1px solid ${theme.palette.divider}`,
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}
        >
          {/* Header Section */}
          <Box
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
              color: 'white',
              p: 4,
              textAlign: 'center'
            }}
          >
            <Avatar
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 2
              }}
            >
              <AdminPanelSettings sx={{ fontSize: 40 }} />
            </Avatar>
            
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Admin Portal
            </Typography>
            
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              MeFit Administration Dashboard
            </Typography>
          </Box>

          {/* Form Section */}
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" mb={3}>
              <Security sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={600}>
                Secure Access Required
              </Typography>
            </Box>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2 
                }}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
                autoComplete="email"
                autoFocus
                variant="outlined"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                required
                autoComplete="current-password"
                variant="outlined"
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={togglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                sx={{
                  mt: 2,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: 6
                  }
                }}
              >
                {loading ? 'Signing In...' : 'Sign In to Admin Portal'}
              </Button>

              <Button
                fullWidth
                variant="outlined"
                onClick={handleTestCredentials}
                disabled={loading}
                sx={{
                  mt: 2,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 500,
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    transform: 'translateY(-1px)',
                    boxShadow: 4
                  }
                }}
              >
                Use Test Credentials
              </Button>

              <Button
                fullWidth
                variant="text"
                onClick={() => navigate('/admin/token-login')}
                disabled={loading}
                sx={{
                  mt: 1,
                  py: 1,
                  borderRadius: 2,
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'grey.100',
                    color: 'text.primary'
                  }
                }}
              >
                Use Token Login (Developers)
              </Button>

              <Button
                fullWidth
                variant="text"
                onClick={() => navigate('/')}
                disabled={loading}
                sx={{
                  mt: 1,
                  py: 1,
                  borderRadius: 2,
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'grey.100',
                    color: 'text.primary'
                  }
                }}
              >
                Back to Main Site
              </Button>
            </form>

            <Divider sx={{ my: 3 }} />

            {/* Security Notice */}
            <Box
              sx={{
                bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' ? 'grey.700' : 'grey.200'
              }}
            >
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                <strong>Security Notice:</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                This is a secure admin area. All access attempts are logged and monitored. 
                Only authorized administrators should access this portal.
              </Typography>
            </Box>

            {/* Developer Info */}
            <Box
              sx={{
                bgcolor: theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.light',
                color: theme.palette.mode === 'dark' ? 'primary.contrastText' : 'primary.dark',
                p: 2,
                borderRadius: 2,
                mt: 2
              }}
            >
              <Typography variant="caption" display="block" gutterBottom>
                <strong>Test Credentials:</strong>
              </Typography>
              <Typography variant="caption">
                Email: admin@mefit.com<br />
                Password: Admin123!
              </Typography>
            </Box>
          </CardContent>
        </Paper>

        {/* Footer */}
        <Box textAlign="center" mt={3}>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Need help? Contact your system administrator
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default AdminLogin;
