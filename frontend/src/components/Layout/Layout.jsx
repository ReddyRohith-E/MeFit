import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Person,
  FitnessCenter,
  TrackChanges,
  SportsGymnastics,
  List as ListIcon,
  People,
  ExitToApp,
  Settings,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext.jsx';
import './Layout.css';

const drawerWidth = 240;

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout, isContributor } = useAuth();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleProfileMenuClose();
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Profile', icon: <Person />, path: '/profile' },
    { text: 'Goals', icon: <TrackChanges />, path: '/goals' },
    { text: 'Workouts', icon: <FitnessCenter />, path: '/workouts' },
    { text: 'Exercises', icon: <SportsGymnastics />, path: '/exercises' },
    { text: 'Programs', icon: <ListIcon />, path: '/programs' },
  ];

  if (isContributor()) {
    menuItems.push({ text: 'Contributor Area', icon: <People />, path: '/contributor' });
  }

  const drawer = (
    <div className="layout-drawer">
      <div className="layout-drawer-header">
        <Typography variant="h6" className="layout-brand">
          MeFit
        </Typography>
      </div>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              navigate(item.path);
              if (isMobile) setMobileOpen(false);
            }}
            className={location.pathname === item.path ? 'layout-nav-active' : ''}
          >
            <ListItemIcon className="layout-nav-icon">
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  if (!user) {
    return null;
  }

  return (
    <Box className="layout-root">
      <AppBar
        position="fixed"
        className="layout-appbar"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            MeFit - Fitness Goals Management
          </Typography>
          <Box className="layout-user-menu">
            <Button
              color="inherit"
              onClick={handleProfileMenuOpen}
              startIcon={
                <Avatar sx={{ width: 32, height: 32 }}>
                  {user.username?.charAt(0).toUpperCase()}
                </Avatar>
              }
            >
              {user.username}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={() => { navigate('/profile'); handleProfileMenuClose(); }}>
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                Profile Settings
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <ExitToApp fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" className="layout-drawer-container">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        className="layout-main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar />
        <div className="layout-content">
          <Outlet />
        </div>
      </Box>
    </Box>
  );
};

export default Layout;
