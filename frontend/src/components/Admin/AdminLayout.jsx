import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Tooltip,
  useTheme,
  useMediaQuery,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Dashboard,
  People,
  PersonAdd,
  Analytics,
  Settings,
  Logout,
  Menu as MenuIcon,
  FitnessCenter,
  Assignment,
  AdminPanelSettings,
  Notifications,
  Search,
  MoreVert,
  Schedule,
  Help
} from '@mui/icons-material';
import { adminApiService, adminTokenManager, handleApiError } from '../../services/adminAPI';
import { ThemeToggleButton } from '../Common/ThemeToggle.jsx';

const drawerWidth = 280;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [quickStats, setQuickStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Navigation items
  const navigationItems = [
    {
      text: 'Dashboard',
      icon: Dashboard,
      path: '/admin/dashboard',
      color: theme.palette.primary.main
    },
    {
      text: 'User Management',
      icon: People,
      path: '/admin/users',
      color: theme.palette.secondary.main
    },
    {
      text: 'Contributor Requests',
      icon: PersonAdd,
      path: '/admin/contributors',
      color: theme.palette.warning.main,
      badge: quickStats?.pendingRequests > 0 ? quickStats.pendingRequests : null
    },
    {
      text: 'Content Management',
      icon: FitnessCenter,
      path: '/admin/content',
      color: theme.palette.success.main
    },
    {
      text: 'Analytics',
      icon: Analytics,
      path: '/admin/analytics',
      color: theme.palette.info.main
    },
    {
      text: 'System Settings',
      icon: Settings,
      path: '/admin/settings',
      color: theme.palette.grey[600]
    }
  ];

  useEffect(() => {
    // Check authentication
    if (!adminTokenManager.isAuthenticated()) {
      navigate('/admin/login');
      return;
    }

    // Load user data and quick stats
    loadUserData();
    loadQuickStats();
  }, [navigate]);

  const loadUserData = () => {
    const userData = adminTokenManager.getUserData();
    setCurrentUser(userData);
  };

  const loadQuickStats = async () => {
    try {
      setLoading(true);
      const response = await adminApiService.auth.getQuickStats();
      setQuickStats(response.data.data);
    } catch (error) {
      console.error('Failed to load quick stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setUserMenuOpen(true);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
    setUserMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await adminApiService.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      adminTokenManager.removeToken();
      navigate('/admin/login');
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  // Drawer content
  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Brand */}
      <Box
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white'
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              width: 48,
              height: 48
            }}
          >
            <AdminPanelSettings />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              MeFit Admin
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Administration Portal
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* User Info */}
      {currentUser && (
        <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 40,
                height: 40,
                fontSize: '0.875rem'
              }}
            >
              {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
            </Avatar>
            <Box flex={1}>
              <Typography variant="body2" fontWeight={600}>
                {currentUser.firstName} {currentUser.lastName}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Administrator
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Navigation */}
      <List sx={{ flex: 1, p: 2 }}>
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={isActivePath(item.path)}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: `${item.color}15`,
                  color: item.color,
                  '& .MuiListItemIcon-root': {
                    color: item.color
                  },
                  '&:hover': {
                    bgcolor: `${item.color}20`
                  }
                },
                '&:hover': {
                  bgcolor: 'grey.100'
                }
              }}
            >
              <ListItemIcon>
                <Badge
                  badgeContent={item.badge}
                  color="error"
                  invisible={!item.badge}
                >
                  <item.icon />
                </Badge>
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: isActivePath(item.path) ? 600 : 400
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Quick Stats */}
      {quickStats && (
        <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Typography variant="caption" color="textSecondary" gutterBottom>
            Quick Overview
          </Typography>
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Chip
              label={`${quickStats.totalUsers} Users`}
              size="small"
              color="primary"
            />
            <Chip
              label={`${quickStats.activeUsers} Active`}
              size="small"
              color="success"
            />
          </Box>
        </Box>
      )}

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="textSecondary" align="center" display="block">
          MeFit Admin v1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          ml: { lg: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 1
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { lg: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {navigationItems.find(item => isActivePath(item.path))?.text || 'Admin Panel'}
          </Typography>

          {/* Top Bar Actions */}
          <Box display="flex" alignItems="center" gap={1}>
            {/* Theme Toggle */}
            <ThemeToggleButton />

            <Tooltip title="Help & Documentation">
              <IconButton color="inherit">
                <Help />
              </IconButton>
            </Tooltip>

            <Tooltip title="Notifications">
              <IconButton color="inherit">
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* User Menu */}
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleUserMenuOpen}
                color="inherit"
                sx={{ ml: 1 }}
              >
                {currentUser ? (
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: theme.palette.primary.main,
                      fontSize: '0.75rem'
                    }}
                  >
                    {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
                  </Avatar>
                ) : (
                  <MoreVert />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={userMenuOpen}
        onClose={handleUserMenuClose}
        onClick={handleUserMenuClose}
        PaperProps={{
          elevation: 4,
          sx: {
            mt: 1.5,
            minWidth: 200,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1
            }
          }
        }}
      >
        {currentUser && (
          <Box sx={{ px: 2, py: 1, bgcolor: 'grey.50' }}>
            <Typography variant="body2" fontWeight={600}>
              {currentUser.fullName}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {currentUser.email}
            </Typography>
          </Box>
        )}
        <Divider />
        <MenuItem onClick={() => navigate('/admin/profile')}>
          <ListItemIcon>
            <AdminPanelSettings fontSize="small" />
          </ListItemIcon>
          Profile Settings
        </MenuItem>
        <MenuItem onClick={() => navigate('/admin/settings')}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          System Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Logout fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth
            }
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth
            }
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default'
        }}
      >
        <Toolbar /> {/* Spacer for app bar */}
        
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        ) : (
          <Outlet />
        )}
      </Box>
    </Box>
  );
};

export default AdminLayout;
