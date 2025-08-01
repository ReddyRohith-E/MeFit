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
  useTheme,
  InputAdornment,
  IconButton
} from '@mui/material';
import { FitnessCenter, Visibility, VisibilityOff, ArrowBack, CheckCircle } from '@mui/icons-material';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ThemeToggleButton } from '../../components/Common/ThemeToggle.jsx';
import api from '../../utils/api.js';
import './ResetPassword.css';
import './PasswordField.css';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  
  const navigate = useNavigate();
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const theme = useTheme();

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Invalid reset link. Please request a new password reset.');
        setValidating(false);
        return;
      }

      try {
        await api.get(`/auth/reset-password/${token}`);
        setIsValidToken(true);
      } catch (error) {
        setError(error.response?.data?.message || 'Invalid or expired reset link. Please request a new password reset.');
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

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

    try {
      const response = await api.post(`/auth/reset-password/${token}`, {
        password: formData.password
      });
      
      setIsSuccess(true);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
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

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const isFormValid = () => {
    return formData.password && 
           formData.confirmPassword &&
           Object.keys(validationErrors).length === 0;
  };

  if (validating) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
            : 'linear-gradient(135deg, #e0f2fe 0%, #f3e5f5 50%, #e8f5e8 100%)'
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={50} sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Validating reset link...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      className="reset-password-page"
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

      <Container component="main" maxWidth="sm" className="reset-password-container">
        <Box className="reset-password-box">
          <Paper 
            elevation={theme.palette.mode === 'dark' ? 16 : 8}
            className="reset-password-paper"
            sx={{
              maxWidth: 480,
              mx: 'auto',
              borderRadius: 4,
              padding: { xs: 3, sm: 5 },
              position: 'relative',
              overflow: 'hidden',
              backdropFilter: 'blur(20px)',
              background: theme.palette.mode === 'dark'
                ? 'rgba(15, 23, 42, 0.95)'
                : 'rgba(255, 255, 255, 0.95)',
              border: theme.palette.mode === 'dark'
                ? '1px solid rgba(59, 130, 246, 0.2)'
                : '1px solid rgba(226, 232, 240, 0.8)',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                : '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.3)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)'
                  : 'linear-gradient(135deg, rgba(59, 130, 246, 0.02) 0%, rgba(139, 92, 246, 0.02) 100%)',
                pointerEvents: 'none',
                zIndex: 0
              },
              '& > *': {
                position: 'relative',
                zIndex: 1
              },
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 35px 70px -12px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  : '0 35px 70px -12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.5)'
              }
            }}
          >
            {!isValidToken ? (
              <>
                {/* Invalid Token */}
                <Box className="reset-password-invalid" sx={{ textAlign: 'center' }}>
                  <FitnessCenter 
                    sx={{ color: 'error.main', fontSize: 48, mb: 2 }}
                  />
                  <Typography 
                    variant="h5" 
                    sx={{ color: 'text.primary', fontWeight: 600, mb: 2 }}
                  >
                    Invalid Reset Link
                  </Typography>
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/forgot-password')}
                    sx={{
                      borderRadius: 2,
                      fontWeight: 600,
                      textTransform: 'none',
                      mb: 2
                    }}
                  >
                    Request New Reset Link
                  </Button>
                  <Box>
                    <Link
                      component="button"
                      type="button"
                      variant="body2"
                      onClick={handleBackToLogin}
                      startIcon={<ArrowBack />}
                      sx={{
                        color: 'primary.main',
                        textDecoration: 'none',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      Back to Login
                    </Link>
                  </Box>
                </Box>
              </>
            ) : isSuccess ? (
              <>
                {/* Success */}
                <Box className="reset-password-success" sx={{ textAlign: 'center' }}>
                  <CheckCircle 
                    sx={{ color: 'success.main', fontSize: 64, mb: 2 }}
                  />
                  <Typography 
                    variant="h5" 
                    sx={{ color: 'text.primary', fontWeight: 600, mb: 2 }}
                  >
                    Password Reset Successful
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ color: 'text.secondary', mb: 3 }}
                  >
                    Your password has been successfully reset. You can now log in with your new password.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={handleBackToLogin}
                    startIcon={<ArrowBack />}
                    sx={{
                      borderRadius: 2,
                      fontWeight: 600,
                      textTransform: 'none'
                    }}
                  >
                    Go to Login
                  </Button>
                </Box>
              </>
            ) : (
              <>
                {/* Reset Form */}
                <Box className="reset-password-header" sx={{ textAlign: 'center', mb: 3 }}>
                  <FitnessCenter 
                    className="reset-password-icon"
                    sx={{ color: 'primary.main', fontSize: 48, mb: 2 }}
                  />
                  <Typography 
                    component="h1" 
                    variant="h4" 
                    className="reset-password-brand"
                    sx={{ color: 'text.primary', fontWeight: 700, mb: 1 }}
                  >
                    MeFit
                  </Typography>
                  <Typography 
                    component="h2" 
                    variant="h5" 
                    className="reset-password-title"
                    sx={{ color: 'text.primary', mb: 1 }}
                  >
                    Reset Password
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ color: 'text.secondary' }}
                  >
                    Enter your new password
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" className="reset-password-error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} className="reset-password-form">
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    error={!!validationErrors.password}
                    helperText={validationErrors.password}
                    className="reset-password-input"
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
                        height: 56,
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
                        fontSize: '1rem',
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
                    label="Confirm New Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    error={!!validationErrors.confirmPassword}
                    helperText={validationErrors.confirmPassword}
                    className="reset-password-input"
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
                        height: 56,
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
                        fontSize: '1rem',
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
                    className="reset-password-button"
                    disabled={loading || !isFormValid()}
                    sx={{
                      mt: 3,
                      mb: 2,
                      height: 52,
                      borderRadius: 3,
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      textTransform: 'none',
                      position: 'relative',
                      overflow: 'hidden',
                      background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)'
                        : 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)',
                      boxShadow: theme.palette.mode === 'dark'
                        ? '0 8px 32px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                        : '0 4px 20px rgba(37, 99, 235, 0.3)',
                      border: theme.palette.mode === 'dark'
                        ? '1px solid rgba(59, 130, 246, 0.3)'
                        : 'none',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        background: theme.palette.mode === 'dark'
                          ? 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)'
                          : 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 50%, #2563eb 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: theme.palette.mode === 'dark'
                          ? '0 12px 40px rgba(59, 130, 246, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                          : '0 8px 25px rgba(37, 99, 235, 0.4)'
                      },
                      '&:disabled': {
                        background: theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.1)'
                          : theme.palette.action.disabledBackground,
                        color: theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.3)'
                          : theme.palette.action.disabled,
                        transform: 'none',
                        boxShadow: 'none'
                      }
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
                  </Button>
                  
                  <Box className="reset-password-actions" sx={{ textAlign: 'center' }}>
                    <Link
                      component="button"
                      type="button"
                      variant="body2"
                      onClick={handleBackToLogin}
                      disabled={loading}
                      startIcon={<ArrowBack />}
                      sx={{
                        color: 'primary.main',
                        textDecoration: 'none',
                        fontWeight: 500,
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
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
                      Back to Login
                    </Link>
                  </Box>
                </Box>
              </>
            )}
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default ResetPassword;
