import { createTheme } from '@mui/material/styles';

// Professional color palette for admin dashboard
const adminColors = {
  primary: {
    main: '#1e3a8a', // Deep blue
    light: '#3b82f6',
    dark: '#1e40af',
    contrastText: '#ffffff'
  },
  secondary: {
    main: '#7c3aed', // Purple
    light: '#a855f7',
    dark: '#6d28d9',
    contrastText: '#ffffff'
  },
  success: {
    main: '#059669', // Emerald green
    light: '#10b981',
    dark: '#047857',
    contrastText: '#ffffff'
  },
  warning: {
    main: '#f59e0b', // Amber
    light: '#fbbf24',
    dark: '#d97706',
    contrastText: '#000000'
  },
  error: {
    main: '#dc2626', // Red
    light: '#ef4444',
    dark: '#b91c1c',
    contrastText: '#ffffff'
  },
  info: {
    main: '#0ea5e9', // Sky blue
    light: '#38bdf8',
    dark: '#0284c7',
    contrastText: '#ffffff'
  },
  grey: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a'
  }
};

const adminTheme = createTheme({
  palette: {
    mode: 'light',
    ...adminColors,
    background: {
      default: '#f8fafc',
      paper: '#ffffff'
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b'
    },
    divider: '#e2e8f0'
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
          backgroundColor: '#f8fafc',
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
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
          backgroundColor: '#dcfce7',
          color: '#166534',
          '& .MuiChip-deleteIcon': {
            color: '#166534'
          }
        },
        colorError: {
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          '& .MuiChip-deleteIcon': {
            color: '#991b1b'
          }
        },
        colorWarning: {
          backgroundColor: '#fef3c7',
          color: '#92400e',
          '& .MuiChip-deleteIcon': {
            color: '#92400e'
          }
        },
        colorInfo: {
          backgroundColor: '#dbeafe',
          color: '#1e40af',
          '& .MuiChip-deleteIcon': {
            color: '#1e40af'
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
          color: '#1e293b',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          borderBottom: '1px solid #e2e8f0'
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e2e8f0'
        }
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          '&.Mui-selected': {
            backgroundColor: '#e0f2fe',
            color: '#0369a1',
            '& .MuiListItemIcon-root': {
              color: '#0369a1'
            }
          },
          '&:hover': {
            backgroundColor: '#f1f5f9',
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
            '& fieldset': {
              borderColor: '#d1d5db'
            },
            '&:hover fieldset': {
              borderColor: '#9ca3af'
            },
            '&.Mui-focused fieldset': {
              borderColor: '#3b82f6'
            }
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
          backgroundColor: '#f8fafc',
          fontWeight: 600,
          color: '#374151',
          borderBottom: '2px solid #e5e7eb'
        }
      }
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 8,
          backgroundColor: '#e5e7eb'
        },
        bar: {
          borderRadius: 4
        }
      }
    }
  }
});

// Dark theme variant for admin dashboard
const adminDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#a855f7',
      light: '#c084fc',
      dark: '#9333ea',
      contrastText: '#ffffff'
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b'
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1'
    },
    divider: '#334155'
  },
  typography: adminTheme.typography,
  shape: adminTheme.shape,
  components: {
    ...adminTheme.components,
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b',
          borderColor: '#334155'
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b',
          color: '#f8fafc',
          borderBottomColor: '#334155'
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1e293b',
          borderRightColor: '#334155'
        }
      }
    }
  }
});

export { adminTheme, adminDarkTheme, adminColors };
export default adminTheme;
