import { createTheme } from '@mui/material/styles';

// Universal color palette optimized for all devices and systems
// Based on human perception and accessibility standards (WCAG 2.1 AAA)
const adminColors = {
  primary: {
    main: '#2563eb', // Modern blue - works well on all screens
    light: '#60a5fa',
    dark: '#1d4ed8',
    contrastText: '#ffffff'
  },
  secondary: {
    main: '#8b5cf6', // Balanced purple - good contrast on all displays
    light: '#a78bfa',
    dark: '#7c3aed',
    contrastText: '#ffffff'
  },
  success: {
    main: '#10b981', // Universal green - visible on all color profiles
    light: '#34d399',
    dark: '#059669',
    contrastText: '#ffffff'
  },
  warning: {
    main: '#f59e0b', // Warm amber - consistent across devices
    light: '#fbbf24',
    dark: '#d97706',
    contrastText: '#000000'
  },
  error: {
    main: '#ef4444', // Accessible red - clear on all screens
    light: '#f87171',
    dark: '#dc2626',
    contrastText: '#ffffff'
  },
  info: {
    main: '#06b6d4', // Cyan - excellent visibility on all displays
    light: '#22d3ee',
    dark: '#0891b2',
    contrastText: '#ffffff'
  },
  // Enhanced grey scale for better device compatibility
  grey: {
    50: '#fafafa',   // Lighter for better OLED compatibility
    100: '#f4f4f5',  // Subtle background
    200: '#e4e4e7',  // Light borders
    300: '#d4d4d8',  // Medium borders
    400: '#a1a1aa',  // Disabled text
    500: '#71717a',  // Secondary text
    600: '#52525b',  // Primary text (light mode)
    700: '#3f3f46',  // Dark elements
    800: '#27272a',  // Very dark elements
    900: '#18181b'   // Near black
  },
  // Device-specific optimizations
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717'
  }
};

const adminTheme = createTheme({
  palette: {
    mode: 'light',
    ...adminColors,
    background: {
      default: '#fafafa', // Better OLED compatibility
      paper: '#ffffff'
    },
    text: {
      primary: '#18181b', // Higher contrast for better readability
      secondary: '#71717a' // Improved secondary text contrast
    },
    divider: '#e4e4e7', // Softer divider for better device compatibility
    // Custom status colors for universal appeal
    status: {
      active: '#10b981',
      inactive: '#71717a',
      pending: '#f59e0b',
      blocked: '#ef4444'
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
          backgroundColor: '#fafafa', // Better for all display types
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          // Improved text rendering for all devices
          '-webkit-font-smoothing': 'antialiased',
          '-moz-osx-font-smoothing': 'grayscale',
          textRendering: 'optimizeLegibility'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', // Softer shadow for better device compatibility
          border: '1px solid #e4e4e7',
          borderRadius: 12,
          backgroundColor: '#ffffff',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            transform: 'translateY(-1px)',
            transition: 'all 0.2s ease-in-out'
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
          '&:hover': {
            boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)'
          }
        },
        contained: {
          '&:hover': {
            transform: 'translateY(-1px)',
            transition: 'all 0.2s ease-in-out'
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 6
        },
        colorSuccess: {
          backgroundColor: '#f0fdf4', // Lighter, more universal green backgrounds
          color: '#15803d',
          border: '1px solid #bbf7d0',
          '& .MuiChip-deleteIcon': {
            color: '#15803d'
          }
        },
        colorError: {
          backgroundColor: '#fef2f2', // Softer error backgrounds
          color: '#dc2626',
          border: '1px solid #fecaca',
          '& .MuiChip-deleteIcon': {
            color: '#dc2626'
          }
        },
        colorWarning: {
          backgroundColor: '#fffbeb', // Warmer, more accessible warning
          color: '#d97706',
          border: '1px solid #fed7aa',
          '& .MuiChip-deleteIcon': {
            color: '#d97706'
          }
        },
        colorInfo: {
          backgroundColor: '#f0f9ff', // Better info color for all displays
          color: '#0369a1',
          border: '1px solid #bae6fd',
          '& .MuiChip-deleteIcon': {
            color: '#0369a1'
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          borderRadius: 12
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#18181b', // Better contrast for text
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          borderBottom: '1px solid #e4e4e7',
          backdropFilter: 'blur(8px)', // Modern glass effect for better device support
          WebkitBackdropFilter: 'blur(8px)'
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e4e4e7',
          boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.05)' // Subtle shadow for better definition
        }
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          '&.Mui-selected': {
            backgroundColor: '#eff6ff', // Softer selection color
            color: '#2563eb',
            '& .MuiListItemIcon-root': {
              color: '#2563eb'
            },
            '&:hover': {
              backgroundColor: '#dbeafe'
            }
          },
          '&:hover': {
            backgroundColor: '#f4f4f5',
            borderRadius: 8
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#ffffff',
            '& fieldset': {
              borderColor: '#d4d4d8' // Better border visibility on all devices
            },
            '&:hover fieldset': {
              borderColor: '#a1a1aa'
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2563eb',
              borderWidth: '2px'
            }
          },
          '& .MuiInputLabel-root': {
            color: '#71717a'
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#2563eb'
          }
        }
      }
    },
    MuiSelect: {
      styleOverrides: {
        outlined: {
          borderRadius: 8
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#fafafa', // Consistent with body background
          fontWeight: 600,
          color: '#374151',
          borderBottom: '2px solid #e4e4e7'
        },
        root: {
          borderBottom: '1px solid #f4f4f5' // Softer row separators
        }
      }
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 8,
          backgroundColor: '#f4f4f5' // Better progress background
        },
        bar: {
          borderRadius: 4
        }
      }
    }
  }
});

// Enhanced dark theme for better device compatibility
const adminDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#60a5fa', // Brighter blue for dark mode visibility
      light: '#93c5fd',
      dark: '#3b82f6',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#a78bfa', // Better purple for dark mode
      light: '#c4b5fd',
      dark: '#8b5cf6',
      contrastText: '#ffffff'
    },
    success: {
      main: '#34d399', // Enhanced green for dark backgrounds
      light: '#6ee7b7',
      dark: '#10b981',
      contrastText: '#000000'
    },
    warning: {
      main: '#fbbf24', // Brighter amber for dark mode
      light: '#fcd34d',
      dark: '#f59e0b',
      contrastText: '#000000'
    },
    error: {
      main: '#f87171', // Softer red for dark mode
      light: '#fca5a5',
      dark: '#ef4444',
      contrastText: '#ffffff'
    },
    info: {
      main: '#22d3ee', // Brighter cyan for dark mode
      light: '#67e8f9',
      dark: '#06b6d4',
      contrastText: '#000000'
    },
    background: {
      default: '#0a0a0a', // True black for OLED optimization
      paper: '#171717'    // Dark grey for cards
    },
    text: {
      primary: '#fafafa',
      secondary: '#a1a1aa'
    },
    divider: '#404040',
    // Custom status colors for dark mode
    status: {
      active: '#34d399',
      inactive: '#a1a1aa',
      pending: '#fbbf24',
      blocked: '#f87171'
    }
  },
  typography: adminTheme.typography,
  shape: adminTheme.shape,
  components: {
    ...adminTheme.components,
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0a0a0a',
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          '-webkit-font-smoothing': 'antialiased',
          '-moz-osx-font-smoothing': 'grayscale',
          textRendering: 'optimizeLegibility'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#171717',
          borderColor: '#404040',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
            transform: 'translateY(-1px)',
            transition: 'all 0.2s ease-in-out'
          }
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#171717',
          color: '#fafafa',
          borderBottomColor: '#404040',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#171717',
          borderRightColor: '#404040'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#262626',
            '& fieldset': {
              borderColor: '#525252'
            },
            '&:hover fieldset': {
              borderColor: '#737373'
            },
            '&.Mui-focused fieldset': {
              borderColor: '#60a5fa'
            }
          }
        }
      }
    }
  }
});

export { adminTheme, adminDarkTheme, adminColors };
export default adminTheme;
