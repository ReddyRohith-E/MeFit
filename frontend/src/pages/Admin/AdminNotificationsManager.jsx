import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  Badge,
  LinearProgress,
  useTheme
} from '@mui/material';
import {
  Notifications,
  Add,
  Edit,
  Delete,
  Send,
  Schedule,
  Person,
  Group,
  Security,
  Warning,
  CheckCircle,
  Info,
  Settings,
  ExpandMore,
  Visibility,
  NotificationAdd,
  Campaign,
  TrendingUp,
  Email,
  Sms,
  Computer,
  PhoneAndroid,
  Analytics,
  FilterList,
  Search,
  Download,
  Refresh
} from '@mui/icons-material';
import { formatDistanceToNow, format } from 'date-fns';
import { useNotifications } from '../../components/Common/NotificationSystem';

// Mock data for demonstration
const mockNotificationTemplates = [
  {
    id: 1,
    name: 'Welcome New User',
    type: 'user_registration',
    content: 'Welcome to MeFit! We\'re excited to have you join our fitness community.',
    channels: ['email', 'push'],
    active: true,
    usage: 145
  },
  {
    id: 2,
    name: 'Goal Achievement',
    type: 'goal_completion',
    content: 'Congratulations! You\'ve successfully completed your fitness goal.',
    channels: ['email', 'push', 'sms'],
    active: true,
    usage: 89
  },
  {
    id: 3,
    name: 'Security Alert',
    type: 'security_alert',
    content: 'We detected unusual activity on your account. Please review your recent logins.',
    channels: ['email', 'push'],
    active: true,
    usage: 12
  }
];

const mockCampaigns = [
  {
    id: 1,
    name: 'New Year Fitness Challenge',
    type: 'marketing',
    status: 'active',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
    recipients: 1250,
    opened: 875,
    clicked: 234,
    channels: ['email', 'push']
  },
  {
    id: 2,
    name: 'Feature Update Announcement',
    type: 'product',
    status: 'completed',
    startDate: new Date('2023-12-15'),
    endDate: new Date('2023-12-31'),
    recipients: 2100,
    opened: 1580,
    clicked: 456,
    channels: ['email', 'push', 'in-app']
  }
];

// Notification Templates Tab
const NotificationTemplatesTab = () => {
  const [templates, setTemplates] = useState(mockNotificationTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'user_registration',
    content: '',
    channels: [],
    active: true
  });

  const notificationTypes = [
    { value: 'user_registration', label: 'User Registration' },
    { value: 'goal_completion', label: 'Goal Completion' },
    { value: 'security_alert', label: 'Security Alert' },
    { value: 'system_update', label: 'System Update' },
    { value: 'workout_reminder', label: 'Workout Reminder' },
    { value: 'marketing', label: 'Marketing' }
  ];

  const channels = [
    { value: 'email', label: 'Email', icon: <Email /> },
    { value: 'push', label: 'Push Notification', icon: <Computer /> },
    { value: 'sms', label: 'SMS', icon: <PhoneAndroid /> },
    { value: 'in-app', label: 'In-App', icon: <Notifications /> }
  ];

  const handleOpenDialog = (template = null) => {
    if (template) {
      setSelectedTemplate(template);
      setFormData({
        name: template.name,
        type: template.type,
        content: template.content,
        channels: template.channels,
        active: template.active
      });
    } else {
      setSelectedTemplate(null);
      setFormData({
        name: '',
        type: 'user_registration',
        content: '',
        channels: [],
        active: true
      });
    }
    setDialogOpen(true);
  };

  const handleSaveTemplate = () => {
    if (selectedTemplate) {
      // Update existing template
      setTemplates(prev => prev.map(t => t.id === selectedTemplate.id ? { ...t, ...formData } : t));
    } else {
      // Create new template
      const newTemplate = {
        id: Date.now(),
        ...formData,
        usage: 0
      };
      setTemplates(prev => [...prev, newTemplate]);
    }
    setDialogOpen(false);
  };

  const handleDeleteTemplate = () => {
    setTemplates(prev => prev.filter(t => t.id !== templateToDelete.id));
    setDeleteDialogOpen(false);
    setTemplateToDelete(null);
  };

  const toggleTemplateStatus = (templateId) => {
    setTemplates(prev => prev.map(t => 
      t.id === templateId ? { ...t, active: !t.active } : t
    ));
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight={600}>
          Notification Templates
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Create Template
        </Button>
      </Box>

      {/* Templates Grid */}
      <Grid container spacing={3}>
        {templates.map((template) => (
          <Grid item xs={12} md={6} lg={4} key={template.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6" fontWeight={600}>
                    {template.name}
                  </Typography>
                  <Switch
                    checked={template.active}
                    onChange={() => toggleTemplateStatus(template.id)}
                    size="small"
                  />
                </Box>
                
                <Chip 
                  label={template.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} 
                  size="small" 
                  color="primary" 
                  sx={{ mb: 2 }}
                />
                
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {template.content.length > 100 
                    ? `${template.content.substring(0, 100)}...` 
                    : template.content
                  }
                </Typography>
                
                <Box display="flex" gap={1} mb={2}>
                  {template.channels.map((channel) => (
                    <Chip
                      key={channel}
                      label={channel.toUpperCase()}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="textSecondary">
                    Used {template.usage} times
                  </Typography>
                  <Box>
                    <IconButton size="small" onClick={() => handleOpenDialog(template)}>
                      <Edit />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => {
                        setTemplateToDelete(template);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Template Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedTemplate ? 'Edit Template' : 'Create Template'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Template Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
            />
            
            <FormControl fullWidth>
              <InputLabel>Notification Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              >
                {notificationTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              multiline
              rows={4}
              fullWidth
              placeholder="Enter the notification content..."
            />
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Delivery Channels
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {channels.map((channel) => (
                  <FormControlLabel
                    key={channel.value}
                    control={
                      <Switch
                        checked={formData.channels.includes(channel.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({ 
                              ...prev, 
                              channels: [...prev.channels, channel.value] 
                            }));
                          } else {
                            setFormData(prev => ({ 
                              ...prev, 
                              channels: prev.channels.filter(c => c !== channel.value) 
                            }));
                          }
                        }}
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        {channel.icon}
                        {channel.label}
                      </Box>
                    }
                  />
                ))}
              </Box>
            </Box>
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.active}
                  onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                />
              }
              label="Active Template"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveTemplate} variant="contained">
            {selectedTemplate ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Template</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the template "{templateToDelete?.name}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteTemplate} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Campaigns Tab
const CampaignsTab = () => {
  const [campaigns, setCampaigns] = useState(mockCampaigns);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'info';
      case 'paused': return 'warning';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const calculateEngagementRate = (opened, recipients) => {
    return recipients > 0 ? ((opened / recipients) * 100).toFixed(1) : 0;
  };

  const calculateClickRate = (clicked, opened) => {
    return opened > 0 ? ((clicked / opened) * 100).toFixed(1) : 0;
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight={600}>
          Notification Campaigns
        </Typography>
        <Button variant="contained" startIcon={<Campaign />}>
          Create Campaign
        </Button>
      </Box>

      {/* Campaign Statistics Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'primary.light' }}>
                  <Campaign />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    {campaigns.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Campaigns
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'success.light' }}>
                  <Send />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    {campaigns.reduce((sum, c) => sum + c.recipients, 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Messages Sent
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'info.light' }}>
                  <Visibility />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    {campaigns.reduce((sum, c) => sum + c.opened, 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Messages Opened
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'warning.light' }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    {(campaigns.reduce((sum, c) => sum + c.opened, 0) / campaigns.reduce((sum, c) => sum + c.recipients, 0) * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Avg. Open Rate
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Campaigns Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Campaign Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Period</TableCell>
                <TableCell>Recipients</TableCell>
                <TableCell>Open Rate</TableCell>
                <TableCell>Click Rate</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {campaigns
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {campaign.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={campaign.type} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={campaign.status.toUpperCase()} 
                        size="small" 
                        color={getStatusColor(campaign.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(campaign.startDate, 'MMM dd')} - {format(campaign.endDate, 'MMM dd, yyyy')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {campaign.recipients.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {calculateEngagementRate(campaign.opened, campaign.recipients)}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={parseFloat(calculateEngagementRate(campaign.opened, campaign.recipients))}
                          sx={{ mt: 0.5, height: 4 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {calculateClickRate(campaign.clicked, campaign.opened)}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <Analytics />
                      </IconButton>
                      <IconButton size="small">
                        <Edit />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={campaigns.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>
    </Box>
  );
};

// Settings Tab
const NotificationSettingsTab = () => {
  const [settings, setSettings] = useState({
    globalNotifications: true,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    rateLimiting: true,
    maxDailyNotifications: 50,
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '07:00'
    },
    retryPolicy: {
      enabled: true,
      maxRetries: 3,
      retryDelay: 5
    }
  });

  const handleSettingChange = (path, value) => {
    const keys = path.split('.');
    setSettings(prev => {
      const newSettings = { ...prev };
      let current = newSettings;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Notification Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Global Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Global Settings
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemText
                    primary="Enable Notifications"
                    secondary="Master switch for all notifications"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.globalNotifications}
                      onChange={(e) => handleSettingChange('globalNotifications', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemText
                    primary="Email Notifications"
                    secondary="Send notifications via email"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemText
                    primary="Push Notifications"
                    secondary="Send browser push notifications"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.pushNotifications}
                      onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemText
                    primary="SMS Notifications"
                    secondary="Send critical alerts via SMS"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.smsNotifications}
                      onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Rate Limiting */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Rate Limiting
              </Typography>
              
              <Box display="flex" flexDirection="column" gap={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.rateLimiting}
                      onChange={(e) => handleSettingChange('rateLimiting', e.target.checked)}
                    />
                  }
                  label="Enable Rate Limiting"
                />
                
                <TextField
                  label="Max Daily Notifications per User"
                  type="number"
                  value={settings.maxDailyNotifications}
                  onChange={(e) => handleSettingChange('maxDailyNotifications', parseInt(e.target.value))}
                  disabled={!settings.rateLimiting}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quiet Hours */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quiet Hours
              </Typography>
              
              <Box display="flex" flexDirection="column" gap={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.quietHours.enabled}
                      onChange={(e) => handleSettingChange('quietHours.enabled', e.target.checked)}
                    />
                  }
                  label="Enable Quiet Hours"
                />
                
                <Box display="flex" gap={2}>
                  <TextField
                    label="Start Time"
                    type="time"
                    value={settings.quietHours.start}
                    onChange={(e) => handleSettingChange('quietHours.start', e.target.value)}
                    disabled={!settings.quietHours.enabled}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="End Time"
                    type="time"
                    value={settings.quietHours.end}
                    onChange={(e) => handleSettingChange('quietHours.end', e.target.value)}
                    disabled={!settings.quietHours.enabled}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Retry Policy */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Retry Policy
              </Typography>
              
              <Box display="flex" flexDirection="column" gap={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.retryPolicy.enabled}
                      onChange={(e) => handleSettingChange('retryPolicy.enabled', e.target.checked)}
                    />
                  }
                  label="Enable Retry Policy"
                />
                
                <TextField
                  label="Max Retries"
                  type="number"
                  value={settings.retryPolicy.maxRetries}
                  onChange={(e) => handleSettingChange('retryPolicy.maxRetries', parseInt(e.target.value))}
                  disabled={!settings.retryPolicy.enabled}
                />
                
                <TextField
                  label="Retry Delay (minutes)"
                  type="number"
                  value={settings.retryPolicy.retryDelay}
                  onChange={(e) => handleSettingChange('retryPolicy.retryDelay', parseInt(e.target.value))}
                  disabled={!settings.retryPolicy.enabled}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mt={3}>
        <Button variant="contained" startIcon={<Settings />}>
          Save Settings
        </Button>
      </Box>
    </Box>
  );
};

// Main Admin Notifications Manager Component
const AdminNotificationsManager = () => {
  const [tabValue, setTabValue] = useState(0);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const tabs = [
    { label: 'Templates', icon: <NotificationAdd /> },
    { label: 'Campaigns', icon: <Campaign /> },
    { label: 'Analytics', icon: <Analytics /> },
    { label: 'Settings', icon: <Settings /> }
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box mb={4}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Notifications color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" fontWeight={700}>
            Notification Management
          </Typography>
        </Box>
        <Typography variant="body1" color="textSecondary">
          Manage notification templates, campaigns, and delivery settings
        </Typography>
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              icon={tab.icon}
              label={tab.label}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Card>

      {/* Tab Content */}
      <Box>
        {tabValue === 0 && <NotificationTemplatesTab />}
        {tabValue === 1 && <CampaignsTab />}
        {tabValue === 2 && (
          <Box textAlign="center" py={8}>
            <Analytics sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              Analytics Dashboard Coming Soon
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Detailed notification analytics and insights
            </Typography>
          </Box>
        )}
        {tabValue === 3 && <NotificationSettingsTab />}
      </Box>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminNotificationsManager;
