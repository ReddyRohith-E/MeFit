import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  CircularProgress
} from '@mui/material';
import { FitnessCenter } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/app/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/app/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="login-page">
      <Container component="main" maxWidth="sm" className="login-container">
        <Box className="login-box">
          <Paper elevation={6} className="login-paper">
            <Box className="login-header">
              <FitnessCenter className="login-icon" />
              <Typography component="h1" variant="h4" className="login-brand">
                MeFit
              </Typography>
            </Box>
            
            <Typography component="h2" variant="h5" className="login-title">
              Sign In
            </Typography>

            {error && (
              <Alert severity="error" className="login-error">
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} className="login-form">
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                type="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className="login-input"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className="login-input"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                className="login-button"
                disabled={loading || !formData.email || !formData.password}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>
              <Box className="login-link-container">
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={() => navigate('/register')}
                  disabled={loading}
                  className="login-link"
                >
                  Don't have an account? Sign Up
                </Link>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </div>
  );
};

export default Login;
