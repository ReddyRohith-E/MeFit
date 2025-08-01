import React from 'react';
import {
  IconButton,
  Tooltip,
  Box,
  Switch,
  FormControlLabel,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  LightMode,
  DarkMode,
  Brightness4,
  SettingsBrightness,
  Palette
} from '@mui/icons-material';
import { useTheme } from '../../contexts/UniversalThemeContext.jsx';

// Simple toggle button component
export const ThemeToggleButton = ({ size = 'medium', showTooltip = true }) => {
  const { themeMode, toggleTheme, isDarkMode } = useTheme();

  const button = (
    <IconButton
      onClick={toggleTheme}
      size={size}
      sx={{
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'rotate(180deg)',
          backgroundColor: 'action.hover'
        }
      }}
    >
      {isDarkMode ? (
        <LightMode sx={{ color: 'warning.main' }} />
      ) : (
        <DarkMode sx={{ color: 'primary.main' }} />
      )}
    </IconButton>
  );

  if (!showTooltip) return button;

  return (
    <Tooltip 
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      placement="bottom"
    >
      {button}
    </Tooltip>
  );
};

// Switch component for forms/settings
export const ThemeToggleSwitch = ({ label = 'Dark Mode', labelPlacement = 'start' }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <FormControlLabel
      control={
        <Switch
          checked={isDarkMode}
          onChange={toggleTheme}
          sx={{
            '& .MuiSwitch-thumb': {
              backgroundColor: isDarkMode ? 'warning.main' : 'primary.main'
            }
          }}
        />
      }
      label={label}
      labelPlacement={labelPlacement}
    />
  );
};

// Advanced theme selector with menu
export const ThemeSelector = () => {
  const { themeMode, setTheme } = useTheme();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeSelect = (mode) => {
    setTheme(mode);
    handleClose();
  };

  const themeOptions = [
    {
      mode: 'light',
      label: 'Light Theme',
      icon: <LightMode />,
      description: 'Clean and bright interface'
    },
    {
      mode: 'dark',
      label: 'Dark Theme',
      icon: <DarkMode />,
      description: 'Easy on the eyes in low light'
    },
    {
      mode: 'system',
      label: 'System Default',
      icon: <SettingsBrightness />,
      description: 'Follow system preference'
    }
  ];

  return (
    <Box>
      <Tooltip title="Theme Options">
        <IconButton
          onClick={handleClick}
          size="medium"
          sx={{
            transition: 'all 0.3s ease',
            backgroundColor: open ? 'action.selected' : 'transparent'
          }}
        >
          <Palette />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 8,
          sx: {
            mt: 1.5,
            minWidth: 220,
            borderRadius: 2,
            '& .MuiMenuItem-root': {
              borderRadius: 1,
              margin: '4px 8px',
              padding: '8px 12px'
            }
          }
        }}
      >
        {themeOptions.map((option) => (
          <MenuItem
            key={option.mode}
            onClick={() => handleThemeSelect(option.mode)}
            selected={themeMode === option.mode}
            sx={{
              flexDirection: 'column',
              alignItems: 'flex-start',
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '& .MuiListItemIcon-root': {
                  color: 'inherit'
                }
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                {option.icon}
              </ListItemIcon>
              <ListItemText primary={option.label} />
            </Box>
            <Box sx={{ 
              fontSize: '0.75rem', 
              opacity: 0.7, 
              mt: 0.5,
              ml: 4.5
            }}>
              {option.description}
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

// Compact inline theme toggle
export const InlineThemeToggle = () => {
  const { themeMode, toggleTheme, isDarkMode } = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        padding: '4px 8px',
        borderRadius: 2,
        backgroundColor: 'action.hover',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: 'action.selected'
        }
      }}
      onClick={toggleTheme}
    >
      <LightMode 
        sx={{ 
          fontSize: 16, 
          color: !isDarkMode ? 'primary.main' : 'text.disabled'
        }} 
      />
      <Switch
        checked={isDarkMode}
        size="small"
        sx={{
          '& .MuiSwitch-thumb': {
            width: 14,
            height: 14
          }
        }}
      />
      <DarkMode 
        sx={{ 
          fontSize: 16, 
          color: isDarkMode ? 'primary.main' : 'text.disabled'
        }} 
      />
    </Box>
  );
};

export default ThemeToggleButton;
