import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Badge,
  Button,
  Tabs,
  Tab,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  PersonAdd as PersonAddIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkReadIcon,
  MarkEmailUnread as MarkUnreadIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { adminApiService } from '../../services/adminAPI';

const AdminNotificationsManager = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState({
    type: '',
    isRead: ''
  });

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = {
        page: 1,
        limit: 50,
        ...(filter.type && { type: filter.type }),
        ...(filter.isRead && { isRead: filter.isRead })
      };

      const response = await adminApiService.get('/notifications', { params });
      
      if (response.data.success) {
        setNotifications(response.data.data.notifications);
      } else {
        setError('Failed to fetch notifications');
      }
    } catch (err) {
      setError('Error fetching notifications: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await adminApiService.get('/notifications/unread-count');
      if (response.data.success) {
        setUnreadCount(response.data.data.count);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await adminApiService.patch(`/notifications/${notificationId}/read`);
      if (response.data.success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        );
        fetchUnreadCount();
      }
    } catch (err) {
      setError('Error marking notification as read: ' + (err.response?.data?.message || err.message));
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await adminApiService.patch('/notifications/read-all');
      if (response.data.success) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      setError('Error marking all notifications as read: ' + (err.response?.data?.message || err.message));
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await adminApiService.delete(`/notifications/${notificationId}`);
      if (response.data.success) {
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
        fetchUnreadCount();
      }
    } catch (err) {
      setError('Error deleting notification: ' + (err.response?.data?.message || err.message));
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'contributor_request':
        return <PersonAddIcon color="primary" />;
      case 'user_registration':
        return <PersonAddIcon color="success" />;
      case 'system_alert':
        return <WarningIcon color="warning" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (tabValue === 0) return !notification.isRead; // Unread
    if (tabValue === 1) return notification.isRead;   // Read
    return true; // All
  });

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setDialogOpen(true);
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon sx={{ mr: 1 }} />
          </Badge>
          Notifications
        </Typography>
        <Box display="flex" gap={1}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={filter.type}
              label="Type"
              onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="contributor_request">Contributor Requests</MenuItem>
              <MenuItem value="user_registration">User Registrations</MenuItem>
              <MenuItem value="system_alert">System Alerts</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            startIcon={<MarkReadIcon />}
          >
            Mark All Read
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
        >
          <Tab 
            label={
              <Badge badgeContent={unreadCount} color="error">
                Unread
              </Badge>
            } 
          />
          <Tab label="Read" />
          <Tab label="All" />
        </Tabs>

        <Divider />

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : filteredNotifications.length === 0 ? (
          <Box p={3} textAlign="center">
            <Typography color="textSecondary">
              No notifications to display
            </Typography>
          </Box>
        ) : (
          <List>
            {filteredNotifications.map((notification, index) => (
              <React.Fragment key={notification._id}>
                <ListItem 
                  button 
                  onClick={() => handleNotificationClick(notification)}
                  sx={{ 
                    bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                    '&:hover': { bgcolor: 'action.selected' }
                  }}
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography 
                          variant="subtitle1" 
                          fontWeight={notification.isRead ? 'normal' : 'bold'}
                        >
                          {notification.title}
                        </Typography>
                        <Chip 
                          label={notification.priority}
                          size="small"
                          color={getPriorityColor(notification.priority)}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatDate(notification.createdAt)}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification._id);
                      }}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < filteredNotifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Notification Detail Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedNotification && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={1}>
                {getNotificationIcon(selectedNotification.type)}
                <Typography variant="h6">
                  {selectedNotification.title}
                </Typography>
                <Chip 
                  label={selectedNotification.priority}
                  size="small"
                  color={getPriorityColor(selectedNotification.priority)}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" gutterBottom>
                {selectedNotification.message}
              </Typography>
              
              {selectedNotification.userName && (
                <Box mt={2}>
                  <Typography variant="subtitle2" color="primary">
                    User Information:
                  </Typography>
                  <Typography variant="body2">
                    Name: {selectedNotification.userName}
                  </Typography>
                  <Typography variant="body2">
                    Email: {selectedNotification.userEmail}
                  </Typography>
                </Box>
              )}

              {selectedNotification.data?.applicationText && (
                <Box mt={2}>
                  <Typography variant="subtitle2" color="primary">
                    Application Text:
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'grey.50' }}>
                    <Typography variant="body2">
                      {selectedNotification.data.applicationText}
                    </Typography>
                  </Paper>
                </Box>
              )}

              <Box mt={2}>
                <Typography variant="caption" color="textSecondary">
                  Created: {formatDate(selectedNotification.createdAt)}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>
                Close
              </Button>
              {selectedNotification.type === 'contributor_request' && (
                <Button 
                  variant="contained" 
                  onClick={() => {
                    // Navigate to contributor requests page
                    setDialogOpen(false);
                    // This could trigger navigation to the contributor management page
                  }}
                >
                  Review Application
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AdminNotificationsManager;
