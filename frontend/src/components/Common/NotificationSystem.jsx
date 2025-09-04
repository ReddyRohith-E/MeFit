import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  Box,
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Typography,
  Button,
  Divider,
  Avatar,
  Chip,
  Alert,
  Card,
  CardContent,
  Menu,
  MenuItem,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
  NotificationsOff,
  Circle,
  Person,
  Security,
  Warning,
  CheckCircle,
  Info,
  Error,
  Assignment,
  TrendingUp,
  Schedule,
  Close,
  Settings,
  MarkEmailRead,
  Delete,
  FilterList,
  Add,
  Send
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

// Notification Context
const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

// Notification Types
const NOTIFICATION_TYPES = {
  USER_REGISTRATION: 'user_registration',
  CONTRIBUTOR_REQUEST: 'contributor_request',
  GOAL_COMPLETION: 'goal_completion',
  SECURITY_ALERT: 'security_alert',
  SYSTEM_UPDATE: 'system_update',
  CONTENT_REPORT: 'content_report',
  PERFORMANCE_ALERT: 'performance_alert',
  BACKUP_STATUS: 'backup_status',
  USER_ACTIVITY: 'user_activity',
  ADMIN_MESSAGE: 'admin_message'
};

// Mock notification data
const mockNotifications = [
  {
    id: 1,
    type: NOTIFICATION_TYPES.USER_REGISTRATION,
    title: 'New User Registration',
    message: 'John Doe has registered as a new user',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    read: false,
    priority: 'low',
    actionUrl: '/admin/users',
    metadata: { userId: '123', userName: 'John Doe' }
  },
  {
    id: 2,
    type: NOTIFICATION_TYPES.CONTRIBUTOR_REQUEST,
    title: 'Contributor Request',
    message: 'Sarah Wilson wants to become a contributor',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    read: false,
    priority: 'medium',
    actionUrl: '/admin/contributors',
    metadata: { userId: '456', userName: 'Sarah Wilson' }
  },
  {
    id: 3,
    type: NOTIFICATION_TYPES.SECURITY_ALERT,
    title: 'Security Alert',
    message: 'Failed login attempts detected from IP 192.168.1.100',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    read: true,
    priority: 'high',
    actionUrl: '/admin/security',
    metadata: { ip: '192.168.1.100', attempts: 5 }
  },
  {
    id: 4,
    type: NOTIFICATION_TYPES.GOAL_COMPLETION,
    title: 'Goal Achievements',
    message: '15 users completed their fitness goals today',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: true,
    priority: 'low',
    actionUrl: '/admin/analytics',
    metadata: { completedGoals: 15 }
  },
  {
    id: 5,
    type: NOTIFICATION_TYPES.SYSTEM_UPDATE,
    title: 'System Maintenance',
    message: 'Scheduled maintenance will begin in 2 hours',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    read: false,
    priority: 'high',
    actionUrl: '/admin/settings',
    metadata: { maintenanceTime: '2024-01-15T22:00:00Z' }
  }
];

// Notification Icon Component
const NotificationIcon = ({ type, priority }) => {
  const iconProps = { fontSize: 'small' };
  
  switch (type) {
    case NOTIFICATION_TYPES.USER_REGISTRATION:
      return <Person {...iconProps} color="primary" />;
    case NOTIFICATION_TYPES.CONTRIBUTOR_REQUEST:
      return <Assignment {...iconProps} color="info" />;
    case NOTIFICATION_TYPES.SECURITY_ALERT:
      return <Security {...iconProps} color="error" />;
    case NOTIFICATION_TYPES.GOAL_COMPLETION:
      return <CheckCircle {...iconProps} color="success" />;
    case NOTIFICATION_TYPES.SYSTEM_UPDATE:
      return <Info {...iconProps} color="warning" />;
    case NOTIFICATION_TYPES.CONTENT_REPORT:
      return <Warning {...iconProps} color="warning" />;
    case NOTIFICATION_TYPES.PERFORMANCE_ALERT:
      return <TrendingUp {...iconProps} color="error" />;
    case NOTIFICATION_TYPES.BACKUP_STATUS:
      return <Schedule {...iconProps} color="info" />;
    default:
      return <Notifications {...iconProps} />;
  }
};

// Priority Chip Component
const PriorityChip = ({ priority }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  return (
    <Chip
      label={priority.toUpperCase()}
      size="small"
      color={getPriorityColor(priority)}
      variant="outlined"
    />
  );
};

// Individual Notification Item
const NotificationItem = ({ notification, onRead, onDelete, onAction }) => {
  const theme = useTheme();
  
  return (
    <ListItem
      sx={{
        bgcolor: notification.read ? 'transparent' : theme.palette.action.hover,
        borderLeft: notification.read ? 'none' : `4px solid ${theme.palette.primary.main}`,
        '&:hover': { bgcolor: theme.palette.action.selected }
      }}
    >
      <ListItemIcon>
        <NotificationIcon type={notification.type} priority={notification.priority} />
      </ListItemIcon>
      
      <ListItemText
        primary={
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <Typography variant="subtitle2" fontWeight={notification.read ? 400 : 600}>
              {notification.title}
            </Typography>
            <PriorityChip priority={notification.priority} />
          </Box>
        }
        secondary={
          <Box>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {notification.message}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
            </Typography>
          </Box>
        }
      />
      
      <ListItemSecondaryAction>
        <Box display="flex" flexDirection="column" gap={0.5}>
          {!notification.read && (
            <IconButton size="small" onClick={() => onRead(notification.id)}>
              <MarkEmailRead fontSize="small" />
            </IconButton>
          )}
          {notification.actionUrl && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => onAction(notification)}
            >
              View
            </Button>
          )}
          <IconButton size="small" onClick={() => onDelete(notification.id)}>
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

// Notification Filter Component
const NotificationFilter = ({ filters, onFilterChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        <FilterList />
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem>
          <FormControlLabel
            control={
              <Switch
                checked={filters.showUnreadOnly}
                onChange={(e) => onFilterChange('showUnreadOnly', e.target.checked)}
              />
            }
            label="Unread Only"
          />
        </MenuItem>
        
        <MenuItem>
          <FormControlLabel
            control={
              <Switch
                checked={filters.highPriorityOnly}
                onChange={(e) => onFilterChange('highPriorityOnly', e.target.checked)}
              />
            }
            label="High Priority Only"
          />
        </MenuItem>
        
        <Divider />
        
        {Object.values(NOTIFICATION_TYPES).map((type) => (
          <MenuItem key={type}>
            <FormControlLabel
              control={
                <Switch
                  checked={filters.types[type] !== false}
                  onChange={(e) => onFilterChange('types', { ...filters.types, [type]: e.target.checked })}
                />
              }
              label={type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

// Create Notification Dialog
const CreateNotificationDialog = ({ open, onClose, onSend }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: NOTIFICATION_TYPES.ADMIN_MESSAGE,
    priority: 'medium',
    targetUsers: 'all'
  });

  const handleSend = () => {
    onSend(formData);
    setFormData({
      title: '',
      message: '',
      type: NOTIFICATION_TYPES.ADMIN_MESSAGE,
      priority: 'medium',
      targetUsers: 'all'
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create Notification</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            fullWidth
          />
          
          <TextField
            label="Message"
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            fullWidth
            multiline
            rows={3}
          />
          
          <Box display="flex" gap={2}>
            <TextField
              select
              label="Priority"
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
              sx={{ flex: 1 }}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </TextField>
            
            <TextField
              select
              label="Target Users"
              value={formData.targetUsers}
              onChange={(e) => setFormData(prev => ({ ...prev, targetUsers: e.target.value }))}
              sx={{ flex: 1 }}
            >
              <MenuItem value="all">All Users</MenuItem>
              <MenuItem value="admins">Admins Only</MenuItem>
              <MenuItem value="contributors">Contributors</MenuItem>
              <MenuItem value="users">Regular Users</MenuItem>
            </TextField>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSend} variant="contained" startIcon={<Send />}>
          Send Notification
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Notifications Component
const NotificationsComponent = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [anchorEl, setAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    showUnreadOnly: false,
    highPriorityOnly: false,
    types: {}
  });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const open = Boolean(anchorEl);

  // Filter notifications based on current filters
  const filteredNotifications = notifications.filter(notification => {
    if (filters.showUnreadOnly && notification.read) return false;
    if (filters.highPriorityOnly && notification.priority !== 'high') return false;
    if (filters.types[notification.type] === false) return false;
    return true;
  });

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDelete = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleAction = (notification) => {
    if (notification.actionUrl) {
      // Navigate to the action URL
      window.location.href = notification.actionUrl;
    }
    handleMarkAsRead(notification.id);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleSendNotification = (notificationData) => {
    const newNotification = {
      id: Date.now(),
      ...notificationData,
      timestamp: new Date(),
      read: false,
      actionUrl: null,
      metadata: {}
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        color="inherit"
        sx={{ ml: 1 }}
      >
        <Badge badgeContent={unreadCount} color="error">
          {unreadCount > 0 ? <NotificationsActive /> : <Notifications />}
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { width: 400, maxHeight: 600 }
        }}
      >
        <Box p={2}>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={600}>
              Notifications
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <NotificationFilter filters={filters} onFilterChange={handleFilterChange} />
              <IconButton size="small" onClick={() => setCreateDialogOpen(true)}>
                <Add />
              </IconButton>
              <IconButton size="small" onClick={handleClose}>
                <Close />
              </IconButton>
            </Box>
          </Box>

          {/* Actions */}
          {unreadCount > 0 && (
            <Box mb={2}>
              <Button
                size="small"
                onClick={handleMarkAllAsRead}
                startIcon={<MarkEmailRead />}
              >
                Mark all as read ({unreadCount})
              </Button>
            </Box>
          )}

          {/* Notifications List */}
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {filteredNotifications.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary="No notifications"
                  secondary="You're all caught up!"
                />
              </ListItem>
            ) : (
              filteredNotifications.map((notification) => (
                <React.Fragment key={notification.id}>
                  <NotificationItem
                    notification={notification}
                    onRead={handleMarkAsRead}
                    onDelete={handleDelete}
                    onAction={handleAction}
                  />
                  <Divider />
                </React.Fragment>
              ))
            )}
          </List>

          {/* Footer */}
          <Box mt={2} textAlign="center">
            <Button size="small" href="/admin/notifications">
              View All Notifications
            </Button>
          </Box>
        </Box>
      </Popover>

      {/* Create Notification Dialog */}
      <CreateNotificationDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSend={handleSendNotification}
      />
    </>
  );
};

// Notification Provider Component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [settings, setSettings] = useState({
    enabled: true,
    sound: true,
    desktop: true,
    email: true
  });

  // Real-time notification simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate receiving new notifications
      const randomNotifications = [
        {
          id: Date.now(),
          type: NOTIFICATION_TYPES.USER_REGISTRATION,
          title: 'New User Registration',
          message: 'A new user has joined the platform',
          timestamp: new Date(),
          read: false,
          priority: 'low'
        },
        {
          id: Date.now() + 1,
          type: NOTIFICATION_TYPES.SECURITY_ALERT,
          title: 'Security Alert',
          message: 'Unusual login activity detected',
          timestamp: new Date(),
          read: false,
          priority: 'high'
        }
      ];

      // Randomly add new notifications (10% chance every interval)
      if (Math.random() < 0.1) {
        const randomNotification = randomNotifications[Math.floor(Math.random() * randomNotifications.length)];
        setNotifications(prev => [randomNotification, ...prev]);
        
        // Show browser notification if enabled
        if (settings.desktop && 'Notification' in window && Notification.permission === 'granted') {
          new Notification(randomNotification.title, {
            body: randomNotification.message,
            icon: '/favicon.ico'
          });
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [settings.desktop]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const value = {
    notifications,
    settings,
    addNotification,
    markAsRead,
    deleteNotification,
    updateSettings,
    unreadCount: notifications.filter(n => !n.read).length
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationsComponent;
