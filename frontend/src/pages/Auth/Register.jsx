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
  Grid,
  useTheme,
  InputAdornment,
  IconButton
} from '@mui/material';
import { FitnessCenter, Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { ThemeToggleButton } from '../../components/Common/ThemeToggle.jsx';
import './Register.css';
import './PasswordField.css';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const theme = useTheme();

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

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <Box
      className="register-page"
      sx={{
        minHeight: '100vh',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
          : 'linear-gradient(135deg, #e0f2fe 0%, #f3e5f5 50%, #e8f5e8 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme.palette.mode === 'dark'
            ? 'radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)'
            : 'radial-gradient(circle at 30% 50%, rgba(37, 99, 235, 0.05) 0%, transparent 50%), radial-gradient(circle at 70% 20%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)',
          pointerEvents: 'none'
        }
      }}
    >
      {/* Theme Toggle positioned absolutely */}
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

      <Container component="main" maxWidth="md" className="register-container">
        <Box className="register-box">
          <Paper 
            elevation={theme.palette.mode === 'dark' ? 12 : 8}
            className="register-paper"
            sx={{
              backgroundColor: 'background.paper',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
              padding: 5,
              backdropFilter: 'blur(20px)',
              background: theme.palette.mode === 'dark'
                ? 'rgba(23, 23, 23, 0.95)'
                : 'rgba(255, 255, 255, 0.95)',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                : '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 32px 64px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                  : '0 32px 64px -12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.5)'
              }
            }}
          >
            <Box className="register-header">
              <FitnessCenter 
                className="register-icon"
                sx={{ color: 'primary.main', fontSize: 48 }}
              />
              <Typography 
                component="h1" 
                variant="h4" 
                className="register-brand"
                sx={{ color: 'text.primary', fontWeight: 700 }}
              >
                MeFit
              </Typography>
            </Box>
            
            <Typography 
              component="h2" 
              variant="h5" 
              className="register-title"
              sx={{ color: 'text.primary', mb: 2 }}
            >
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
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.02)' 
                          : 'rgba(0, 0, 0, 0.02)',
                        backdropFilter: 'blur(10px)',
                        '& fieldset': {
                          borderColor: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.1)' 
                            : 'rgba(0, 0, 0, 0.1)',
                          borderWidth: '1px'
                        },
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          backgroundColor: theme.palette.mode === 'dark' 
                            ? 'rgba(59, 130, 246, 0.05)' 
                            : 'rgba(37, 99, 235, 0.02)',
                          boxShadow: theme.palette.mode === 'dark'
                            ? `0 8px 32px rgba(59, 130, 246, 0.15)`
                            : `0 4px 12px ${theme.palette.primary.main}20`,
                          '& fieldset': {
                            borderColor: theme.palette.mode === 'dark' 
                              ? 'rgba(59, 130, 246, 0.3)' 
                              : theme.palette.primary.main
                          }
                        },
                        '&.Mui-focused': {
                          transform: 'translateY(-2px)',
                          backgroundColor: theme.palette.mode === 'dark' 
                            ? 'rgba(59, 130, 246, 0.08)' 
                            : 'rgba(37, 99, 235, 0.05)',
                          boxShadow: theme.palette.mode === 'dark'
                            ? `0 8px 32px rgba(59, 130, 246, 0.25)`
                            : `0 4px 12px ${theme.palette.primary.main}30`,
                          '& fieldset': {
                            borderColor: theme.palette.primary.main,
                            borderWidth: '2px'
                          }
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.7)' 
                          : 'rgba(0, 0, 0, 0.6)',
                        '&.Mui-focused': {
                          color: theme.palette.primary.main
                        }
                      },
                      '& .MuiOutlinedInput-input': {
                        color: theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.95)' 
                          : 'rgba(0, 0, 0, 0.87)'
                      }
                    }}
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
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.02)' 
                          : 'rgba(0, 0, 0, 0.02)',
                        backdropFilter: 'blur(10px)',
                        '& fieldset': {
                          borderColor: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.1)' 
                            : 'rgba(0, 0, 0, 0.1)',
                          borderWidth: '1px'
                        },
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          backgroundColor: theme.palette.mode === 'dark' 
                            ? 'rgba(59, 130, 246, 0.05)' 
                            : 'rgba(37, 99, 235, 0.02)',
                          boxShadow: theme.palette.mode === 'dark'
                            ? `0 8px 32px rgba(59, 130, 246, 0.15)`
                            : `0 4px 12px ${theme.palette.primary.main}20`,
                          '& fieldset': {
                            borderColor: theme.palette.mode === 'dark' 
                              ? 'rgba(59, 130, 246, 0.3)' 
                              : theme.palette.primary.main
                          }
                        },
                        '&.Mui-focused': {
                          transform: 'translateY(-2px)',
                          backgroundColor: theme.palette.mode === 'dark' 
                            ? 'rgba(59, 130, 246, 0.08)' 
                            : 'rgba(37, 99, 235, 0.05)',
                          boxShadow: theme.palette.mode === 'dark'
                            ? `0 8px 32px rgba(59, 130, 246, 0.25)`
                            : `0 4px 12px ${theme.palette.primary.main}30`,
                          '& fieldset': {
                            borderColor: theme.palette.primary.main,
                            borderWidth: '2px'
                          }
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.7)' 
                          : 'rgba(0, 0, 0, 0.6)',
                        '&.Mui-focused': {
                          color: theme.palette.primary.main
                        }
                      },
                      '& .MuiOutlinedInput-input': {
                        color: theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.95)' 
                          : 'rgba(0, 0, 0, 0.87)'
                      }
                    }}
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.02)' 
                      : 'rgba(0, 0, 0, 0.02)',
                    backdropFilter: 'blur(10px)',
                    '& fieldset': {
                      borderColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.1)' 
                        : 'rgba(0, 0, 0, 0.1)',
                      borderWidth: '1px'
                    },
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(59, 130, 246, 0.05)' 
                        : 'rgba(37, 99, 235, 0.02)',
                      boxShadow: theme.palette.mode === 'dark'
                        ? `0 8px 32px rgba(59, 130, 246, 0.15)`
                        : `0 4px 12px ${theme.palette.primary.main}20`,
                      '& fieldset': {
                        borderColor: theme.palette.mode === 'dark' 
                          ? 'rgba(59, 130, 246, 0.3)' 
                          : theme.palette.primary.main
                      }
                    },
                    '&.Mui-focused': {
                      transform: 'translateY(-2px)',
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(59, 130, 246, 0.08)' 
                        : 'rgba(37, 99, 235, 0.05)',
                      boxShadow: theme.palette.mode === 'dark'
                        ? `0 8px 32px rgba(59, 130, 246, 0.25)`
                        : `0 4px 12px ${theme.palette.primary.main}30`,
                      '& fieldset': {
                        borderColor: theme.palette.primary.main,
                        borderWidth: '2px'
                      }
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.7)' 
                      : 'rgba(0, 0, 0, 0.6)',
                    '&.Mui-focused': {
                      color: theme.palette.primary.main
                    }
                  },
                  '& .MuiOutlinedInput-input': {
                    color: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.95)' 
                      : 'rgba(0, 0, 0, 0.87)'
                  }
                }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                error={!!validationErrors.password}
                helperText={validationErrors.password}
                className="register-input"
                InputProps={{
                  endAdornment: formData.password ? (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        disabled={loading}
                        sx={{
                          color: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.5)' 
                            : 'rgba(0, 0, 0, 0.5)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            color: theme.palette.primary.main,
                            backgroundColor: theme.palette.mode === 'dark' 
                              ? 'rgba(59, 130, 246, 0.1)' 
                              : 'rgba(37, 99, 235, 0.1)',
                            transform: 'scale(1.1)'
                          }
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ) : null
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.02)' 
                      : 'rgba(0, 0, 0, 0.02)',
                    backdropFilter: 'blur(10px)',
                    '& fieldset': {
                      borderColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.1)' 
                        : 'rgba(0, 0, 0, 0.1)',
                      borderWidth: '1px'
                    },
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(59, 130, 246, 0.05)' 
                        : 'rgba(37, 99, 235, 0.02)',
                      boxShadow: theme.palette.mode === 'dark'
                        ? `0 8px 32px rgba(59, 130, 246, 0.15)`
                        : `0 4px 12px ${theme.palette.primary.main}20`,
                      '& fieldset': {
                        borderColor: theme.palette.mode === 'dark' 
                          ? 'rgba(59, 130, 246, 0.3)' 
                          : theme.palette.primary.main
                      }
                    },
                    '&.Mui-focused': {
                      transform: 'translateY(-2px)',
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(59, 130, 246, 0.08)' 
                        : 'rgba(37, 99, 235, 0.05)',
                      boxShadow: theme.palette.mode === 'dark'
                        ? `0 8px 32px rgba(59, 130, 246, 0.25)`
                        : `0 4px 12px ${theme.palette.primary.main}30`,
                      '& fieldset': {
                        borderColor: theme.palette.primary.main,
                        borderWidth: '2px'
                      }
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.7)' 
                      : 'rgba(0, 0, 0, 0.6)',
                    '&.Mui-focused': {
                      color: theme.palette.primary.main
                    }
                  },
                  '& .MuiOutlinedInput-input': {
                    color: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.95)' 
                      : 'rgba(0, 0, 0, 0.87)',
                    // Hide browser's default password reveal button
                    '&::-ms-reveal': {
                      display: 'none'
                    },
                    '&::-ms-clear': {
                      display: 'none'
                    },
                    '&::-webkit-credentials-auto-fill-button': {
                      visibility: 'hidden',
                      display: 'none !important',
                      pointerEvents: 'none',
                      height: 0,
                      width: 0,
                      margin: 0
                    }
                  }
                }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                error={!!validationErrors.confirmPassword}
                helperText={validationErrors.confirmPassword}
                className="register-input"
                InputProps={{
                  endAdornment: formData.confirmPassword ? (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={handleClickShowConfirmPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        disabled={loading}
                        sx={{
                          color: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.5)' 
                            : 'rgba(0, 0, 0, 0.5)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            color: theme.palette.primary.main,
                            backgroundColor: theme.palette.mode === 'dark' 
                              ? 'rgba(59, 130, 246, 0.1)' 
                              : 'rgba(37, 99, 235, 0.1)',
                            transform: 'scale(1.1)'
                          }
                        }}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ) : null
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.02)' 
                      : 'rgba(0, 0, 0, 0.02)',
                    backdropFilter: 'blur(10px)',
                    '& fieldset': {
                      borderColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.1)' 
                        : 'rgba(0, 0, 0, 0.1)',
                      borderWidth: '1px'
                    },
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(59, 130, 246, 0.05)' 
                        : 'rgba(37, 99, 235, 0.02)',
                      boxShadow: theme.palette.mode === 'dark'
                        ? `0 8px 32px rgba(59, 130, 246, 0.15)`
                        : `0 4px 12px ${theme.palette.primary.main}20`,
                      '& fieldset': {
                        borderColor: theme.palette.mode === 'dark' 
                          ? 'rgba(59, 130, 246, 0.3)' 
                          : theme.palette.primary.main
                      }
                    },
                    '&.Mui-focused': {
                      transform: 'translateY(-2px)',
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(59, 130, 246, 0.08)' 
                        : 'rgba(37, 99, 235, 0.05)',
                      boxShadow: theme.palette.mode === 'dark'
                        ? `0 8px 32px rgba(59, 130, 246, 0.25)`
                        : `0 4px 12px ${theme.palette.primary.main}30`,
                      '& fieldset': {
                        borderColor: theme.palette.primary.main,
                        borderWidth: '2px'
                      }
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.7)' 
                      : 'rgba(0, 0, 0, 0.6)',
                    '&.Mui-focused': {
                      color: theme.palette.primary.main
                    }
                  },
                  '& .MuiOutlinedInput-input': {
                    color: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.95)' 
                      : 'rgba(0, 0, 0, 0.87)',
                    // Hide browser's default password reveal button
                    '&::-ms-reveal': {
                      display: 'none'
                    },
                    '&::-ms-clear': {
                      display: 'none'
                    },
                    '&::-webkit-credentials-auto-fill-button': {
                      visibility: 'hidden',
                      display: 'none !important',
                      pointerEvents: 'none',
                      height: 0,
                      width: 0,
                      margin: 0
                    }
                  }
                }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                className="register-button"
                disabled={loading || !isFormValid()}
                sx={{
                  mt: 3,
                  mb: 2,
                  height: 48,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(45deg, #2563eb, #3b82f6)'
                    : 'linear-gradient(45deg, #1d4ed8, #2563eb)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: theme.palette.mode === 'dark'
                      ? 'linear-gradient(45deg, #1d4ed8, #2563eb)'
                      : 'linear-gradient(45deg, #1e40af, #1d4ed8)',
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 25px ${theme.palette.primary.main}40`
                  },
                  '&:disabled': {
                    background: theme.palette.action.disabledBackground,
                    transform: 'none',
                    boxShadow: 'none'
                  }
                }}
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
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      color: 'primary.dark',
                      textDecoration: 'underline',
                      transform: 'translateY(-1px)'
                    },
                    '&:disabled': {
                      color: 'text.disabled',
                      cursor: 'not-allowed'
                    }
                  }}
                >
                  Already have an account? Sign In
                </Link>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Register;
