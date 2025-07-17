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
  CircularProgress,
  Grid
} from '@mui/material';
import { FitnessCenter } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

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
    
    // Clear validation error for this field
    if (validationErrors[e.target.name]) {
      setValidationErrors({
        ...validationErrors,
        [e.target.name]: ''
      });
    }
    
    // Clear general error
    if (error) setError('');
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    const registrationData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      username: `${formData.firstName.trim()}${formData.lastName.trim()}`.toLowerCase()
    };

    const result = await register(registrationData);
    
    if (result.success) {
      navigate('/app/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const isFormValid = () => {
    return formData.firstName && 
           formData.lastName && 
           formData.email && 
           formData.password && 
           formData.confirmPassword &&
           Object.keys(validationErrors).length === 0;
  };

  return (
    <div className="register-page">
      <Container component="main" maxWidth="md" className="register-container">
        <Box className="register-box">
          <Paper elevation={6} className="register-paper">
            <Box className="register-header">
              <FitnessCenter className="register-icon" />
              <Typography component="h1" variant="h4" className="register-brand">
                MeFit
              </Typography>
            </Box>
            
            <Typography component="h2" variant="h5" className="register-title">
              Create Account
            </Typography>

            {error && (
              <Alert severity="error" className="register-error">
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} className="register-form">
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="firstName"
                    label="First Name"
                    name="firstName"
                    autoComplete="given-name"
                    autoFocus
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={loading}
                    error={!!validationErrors.firstName}
                    helperText={validationErrors.firstName}
                    className="register-input"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    name="lastName"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={loading}
                    error={!!validationErrors.lastName}
                    helperText={validationErrors.lastName}
                    className="register-input"
                  />
                </Grid>
              </Grid>
              
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                error={!!validationErrors.email}
                helperText={validationErrors.email}
                className="register-input"
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                error={!!validationErrors.password}
                helperText={validationErrors.password}
                className="register-input"
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                error={!!validationErrors.confirmPassword}
                helperText={validationErrors.confirmPassword}
                className="register-input"
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                className="register-button"
                disabled={loading || !isFormValid()}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
              </Button>
              
              <Box className="register-link-container">
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={() => navigate('/login')}
                  disabled={loading}
                  className="register-link"
                >
                  Already have an account? Sign In
                </Link>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </div>
  );
};

export default Register;
