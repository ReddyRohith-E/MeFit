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
import { FitnessCenter, Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { ThemeToggleButton } from '../../components/Common/ThemeToggle.jsx';
import './Login.css';
import './PasswordField.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
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

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <Box
      className="login-page"
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

      <Container component="main" maxWidth="sm" className="login-container">
        <Box className="login-box">
          <Paper
            elevation={theme.palette.mode === 'dark' ? 16 : 8}
            className="login-paper"
            sx={{
              backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(23, 23, 23, 0.98)'
                : 'rgba(255, 255, 255, 0.98)',
              border: theme.palette.mode === 'dark'
                ? `1px solid rgba(59, 130, 246, 0.2)`
                : `1px solid ${theme.palette.divider}`,
              borderRadius: 4,
              padding: 5,
              backdropFilter: 'blur(24px)',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 32px 64px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                : '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.3)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': theme.palette.mode === 'dark' ? {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.4), transparent)',
                opacity: 0.6
              } : {},
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 40px 80px -12px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                  : '0 32px 64px -12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.5)'
              }
            }}
          >
            <Box className="login-header">
              <FitnessCenter
                className="login-icon"
                sx={{ color: 'primary.main', fontSize: 48 }}
              />
              <Typography
                component="h1"
                variant="h4"
                className="login-brand"
                sx={{ color: 'text.primary', fontWeight: 700 }}
              >
                MeFit
              </Typography>
            </Box>

            <Typography
              component="h2"
              variant="h5"
              className="login-title"
              sx={{ color: 'text.primary', mb: 2 }}
            >
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
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className="login-input"
                inputProps={{
                  // Additional props to disable browser password features
                  'data-testid': 'password-input',
                  style: {
                    paddingRight: formData.password ? '48px' : '14px' // Space for our custom button
                  }
                }}
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
                          position: 'relative',
                          zIndex: 2,
                          '&:hover': {
                            color: theme.palette.primary.main,
                            transform: 'scale(1.1)'
                          }
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                  // Override any browser styling
                  style: {
                    position: 'relative'
                  }
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
                    // Hide browser's default password reveal button - Enhanced
                    '&::-ms-reveal': {
                      display: 'none !important'
                    },
                    '&::-ms-clear': {
                      display: 'none !important'
                    },
                    '&::-webkit-credentials-auto-fill-button': {
                      visibility: 'hidden !important',
                      display: 'none !important',
                      pointerEvents: 'none !important',
                      height: 0,
                      width: 0,
                      margin: 0,
                      padding: 0
                    },
                    '&::-webkit-strong-password-auto-fill-button': {
                      visibility: 'hidden !important',
                      display: 'none !important',
                      pointerEvents: 'none !important',
                      height: 0,
                      width: 0,
                      margin: 0,
                      padding: 0
                    },
                    '&[type="password"]::-webkit-textfield-decoration-container': {
                      visibility: 'hidden !important',
                      display: 'none !important'
                    }
                  },
                  // Additional styles to ensure input container handles the spacing correctly
                  '& .MuiOutlinedInput-root input[type="password"]': {
                    paddingRight: formData.password ? '14px' : '14px' // Consistent padding
                  }
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                className="login-button"
                disabled={loading || !formData.email || !formData.password}
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
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: theme.palette.mode === 'dark'
                      ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)'
                      : 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                    transition: 'left 0.5s ease'
                  },
                  '&:hover': {
                    background: theme.palette.mode === 'dark'
                      ? 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #3b82f6 100%)'
                      : 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 50%, #2563eb 100%)',
                    transform: 'translateY(-3px)',
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 16px 48px rgba(59, 130, 246, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                      : `0 8px 30px rgba(37, 99, 235, 0.4)`,
                    '&::before': {
                      left: '100%'
                    }
                  },
                  '&:active': {
                    transform: 'translateY(-1px)',
                    transition: 'transform 0.1s ease'
                  },
                  '&:disabled': {
                    background: theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.1)'
                      : theme.palette.action.disabledBackground,
                    color: theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.3)'
                      : theme.palette.action.disabled,
                    transform: 'none',
                    boxShadow: 'none',
                    border: theme.palette.mode === 'dark'
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : 'none'
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>

              <Box className="login-actions" sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={() => navigate('/forgot-password')}
                  disabled={loading}
                  className="forgot-password-link"
                  sx={{
                    color: 'text.secondary',
                    textDecoration: 'none',
                    fontWeight: 400,
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      color: 'primary.main',
                      textDecoration: 'underline'
                    },
                    '&:disabled': {
                      color: 'text.disabled',
                      cursor: 'not-allowed'
                    }
                  }}
                >
                  Forgot your password?
                </Link>

                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={() => navigate('/register')}
                  disabled={loading}
                  className="login-link"
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
                  Don't have an account? Sign Up
                </Link>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
