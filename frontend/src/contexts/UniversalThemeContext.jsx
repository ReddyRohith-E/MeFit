import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const ThemeContext = createContext();

export const UniversalThemeContext = ThemeContext;

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Universal color palette optimized for all devices and environments
const createUniversalTheme = (mode) => {
  const isLight = mode === 'light';
  
  return createTheme({
    palette: {
      mode,
      primary: {
        main: isLight ? '#2563eb' : '#60a5fa',
        light: isLight ? '#60a5fa' : '#93c5fd',
        dark: isLight ? '#1d4ed8' : '#3b82f6',
        contrastText: '#ffffff'
      },
      secondary: {
        main: isLight ? '#8b5cf6' : '#a78bfa',
        light: isLight ? '#a78bfa' : '#c4b5fd',
        dark: isLight ? '#7c3aed' : '#8b5cf6',
        contrastText: '#ffffff'
      },
      success: {
        main: isLight ? '#10b981' : '#34d399',
        light: isLight ? '#34d399' : '#6ee7b7',
        dark: isLight ? '#059669' : '#10b981',
        contrastText: isLight ? '#ffffff' : '#000000'
      },
      warning: {
        main: isLight ? '#f59e0b' : '#fbbf24',
        light: isLight ? '#fbbf24' : '#fcd34d',
        dark: isLight ? '#d97706' : '#f59e0b',
        contrastText: '#000000'
      },
      error: {
        main: isLight ? '#ef4444' : '#f87171',
        light: isLight ? '#f87171' : '#fca5a5',
        dark: isLight ? '#dc2626' : '#ef4444',
        contrastText: '#ffffff'
      },
      info: {
        main: isLight ? '#06b6d4' : '#22d3ee',
        light: isLight ? '#22d3ee' : '#67e8f9',
        dark: isLight ? '#0891b2' : '#06b6d4',
        contrastText: isLight ? '#ffffff' : '#000000'
      },
      background: {
        default: isLight ? '#fafafa' : '#0a0a0a',
        paper: isLight ? '#ffffff' : '#171717'
      },
      text: {
        primary: isLight ? '#18181b' : '#fafafa',
        secondary: isLight ? '#71717a' : '#a1a1aa',
        disabled: isLight ? '#d4d4d8' : '#525252'
      },
      divider: isLight ? '#e4e4e7' : '#404040',
      // Custom status colors for universal appeal
      status: {
        active: isLight ? '#10b981' : '#34d399',
        inactive: isLight ? '#71717a' : '#a1a1aa',
        pending: isLight ? '#f59e0b' : '#fbbf24',
        blocked: isLight ? '#ef4444' : '#f87171'
      },
      // Environment-adaptive colors
      surface: {
        low: isLight ? '#f8f9fa' : '#111111',
        medium: isLight ? '#f1f3f4' : '#1a1a1a',
        high: isLight ? '#ffffff' : '#242424'
      }
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: '-0.025em'
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: '-0.025em'
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        lineHeight: 1.3
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.4
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.4
      },
      h6: {
        fontSize: '1.125rem',
        fontWeight: 600,
        lineHeight: 1.4
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5
      },
      button: {
        fontSize: '0.875rem',
        fontWeight: 500,
        letterSpacing: '0.025em',
        textTransform: 'none'
      }
    },
    shape: {
      borderRadius: 12
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isLight ? '#fafafa' : '#0a0a0a',
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility',
            transition: 'background-color 0.3s ease, color 0.3s ease'
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: isLight ? '#ffffff' : '#171717',
            border: `1px solid ${isLight ? '#e4e4e7' : '#404040'}`,
            borderRadius: 12,
            boxShadow: isLight 
              ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' 
              : '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: isLight
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                : '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)'
            }
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: '0.875rem',
            fontWeight: 500,
            textTransform: 'none',
            boxShadow: 'none',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: isLight
                ? '0 2px 4px 0 rgba(0, 0, 0, 0.1)'
                : '0 2px 4px 0 rgba(0, 0, 0, 0.3)'
            }
          }
        }
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              backgroundColor: isLight ? '#ffffff' : '#262626',
              transition: 'all 0.2s ease-in-out',
              '& fieldset': {
                borderColor: isLight ? '#d4d4d8' : '#525252'
              },
              '&:hover fieldset': {
                borderColor: isLight ? '#a1a1aa' : '#737373'
              },
              '&.Mui-focused fieldset': {
                borderColor: isLight ? '#2563eb' : '#60a5fa',
                borderWidth: '2px'
              }
            },
            '& .MuiInputLabel-root': {
              color: isLight ? '#71717a' : '#a1a1aa'
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: isLight ? '#2563eb' : '#60a5fa'
            }
          }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isLight ? '#ffffff' : '#171717',
            color: isLight ? '#18181b' : '#fafafa',
            boxShadow: isLight
              ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              : '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
            borderBottom: `1px solid ${isLight ? '#e4e4e7' : '#404040'}`,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            transition: 'all 0.3s ease'
          }
        }
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isLight ? '#ffffff' : '#171717',
            borderRight: `1px solid ${isLight ? '#e4e4e7' : '#404040'}`,
            transition: 'all 0.3s ease'
          }
        }
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '4px 8px',
            transition: 'all 0.2s ease-in-out',
            '&.Mui-selected': {
              backgroundColor: isLight ? '#eff6ff' : '#1e3a8a',
              color: isLight ? '#2563eb' : '#60a5fa',
              '& .MuiListItemIcon-root': {
                color: isLight ? '#2563eb' : '#60a5fa'
              },
              '&:hover': {
                backgroundColor: isLight ? '#dbeafe' : '#1e40af'
              }
            },
            '&:hover': {
              backgroundColor: isLight ? '#f4f4f5' : '#262626',
              borderRadius: 8
            }
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
            borderRadius: 6,
            transition: 'all 0.2s ease-in-out'
          },
          colorSuccess: {
            backgroundColor: isLight ? '#f0fdf4' : '#14532d',
            color: isLight ? '#15803d' : '#bbf7d0',
            border: `1px solid ${isLight ? '#bbf7d0' : '#16a34a'}`
          },
          colorError: {
            backgroundColor: isLight ? '#fef2f2' : '#7f1d1d',
            color: isLight ? '#dc2626' : '#fca5a5',
            border: `1px solid ${isLight ? '#fecaca' : '#dc2626'}`
          },
          colorWarning: {
            backgroundColor: isLight ? '#fffbeb' : '#78350f',
            color: isLight ? '#d97706' : '#fcd34d',
            border: `1px solid ${isLight ? '#fed7aa' : '#f59e0b'}`
          },
          colorInfo: {
            backgroundColor: isLight ? '#f0f9ff' : '#164e63',
            color: isLight ? '#0369a1' : '#67e8f9',
            border: `1px solid ${isLight ? '#bae6fd' : '#0891b2'}`
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: isLight ? '#ffffff' : '#171717',
            borderRadius: 12,
            transition: 'all 0.3s ease'
          }
        }
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            backgroundColor: isLight ? '#fafafa' : '#262626',
            fontWeight: 600,
            color: isLight ? '#374151' : '#d1d5db',
            borderBottom: `2px solid ${isLight ? '#e4e4e7' : '#404040'}`
          },
          root: {
            borderBottom: `1px solid ${isLight ? '#f4f4f5' : '#262626'}`,
            transition: 'all 0.2s ease'
          }
        }
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            height: 8,
            backgroundColor: isLight ? '#f4f4f5' : '#404040'
          },
          bar: {
            borderRadius: 4
          }
        }
      }
    }
  });
};

export const UniversalThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('themeMode');
    if (savedTheme) {
      return savedTheme;
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const theme = createUniversalTheme(themeMode);

  useEffect(() => {
    // Save theme preference
    localStorage.setItem('themeMode', themeMode);
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Only auto-switch if no manual preference is saved
      const savedTheme = localStorage.getItem('themeMode');
      if (!savedTheme) {
        setThemeMode(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
  };

  const setTheme = (mode) => {
    setThemeMode(mode);
  };

  const value = {
    themeMode,
    toggleTheme,
    setTheme,
    isDarkMode: themeMode === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default UniversalThemeProvider;
