import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Avatar,
  Tab,
  Tabs,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  Settings,
  Security,
  Notifications,
  Storage,
  AdminPanelSettings,
  Edit,
  Delete,
  Add,
  Save,
  Restore,
  Warning,
  CheckCircle,
  Info,
  Email,
  Sms,
  Cloud,
  Storage as Database,
  Shield,
  Key,
  Lock,
  Visibility,
  VisibilityOff,
  ExpandMore,
  Backup,
  CloudDownload,
  CloudUpload,
  Schedule,
  Speed,
  Memory,
  NetworkCheck
} from '@mui/icons-material';
import { adminApiService, handleApiError } from '../../services/adminAPI';

// Settings Section Card Component
const SettingsCard = ({ title, icon: Icon, children, actions }) => {
  const theme = useTheme();
  
  return (
    <Card sx={{ mb: 3, transition: 'box-shadow 0.3s', '&:hover': { boxShadow: theme.shadows[4] } }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
            <Icon />
          </Avatar>
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
          {actions && (
            <Box ml="auto">
              {actions}
            </Box>
          )}
        </Box>
        {children}
      </CardContent>
    </Card>
  );
};

// Notification Settings Component
const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    userRegistration: true,
    goalCompletion: true,
    systemAlerts: true,
    weeklyReports: true,
    securityAlerts: true
  });

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  return (
    <SettingsCard 
      title="Notification Settings" 
      icon={Notifications}
      actions={
        <Button variant="outlined" startIcon={<Save />}>
          Save Changes
        </Button>
      }
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            General Notifications
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <Email />
              </ListItemIcon>
              <ListItemText primary="Email Notifications" secondary="Receive notifications via email" />
              <ListItemSecondaryAction>
                <Switch
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                />
              </ListItemSecondaryAction>
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <Sms />
              </ListItemIcon>
              <ListItemText primary="SMS Notifications" secondary="Receive critical alerts via SMS" />
              <ListItemSecondaryAction>
                <Switch
                  checked={settings.smsNotifications}
                  onChange={() => handleToggle('smsNotifications')}
                />
              </ListItemSecondaryAction>
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <Notifications />
              </ListItemIcon>
              <ListItemText primary="Push Notifications" secondary="Browser push notifications" />
              <ListItemSecondaryAction>
                <Switch
                  checked={settings.pushNotifications}
                  onChange={() => handleToggle('pushNotifications')}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Event Notifications
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="User Registration" />
              <ListItemSecondaryAction>
                <Switch
                  checked={settings.userRegistration}
                  onChange={() => handleToggle('userRegistration')}
                />
              </ListItemSecondaryAction>
            </ListItem>
            
            <ListItem>
              <ListItemText primary="Goal Completion" />
              <ListItemSecondaryAction>
                <Switch
                  checked={settings.goalCompletion}
                  onChange={() => handleToggle('goalCompletion')}
                />
              </ListItemSecondaryAction>
            </ListItem>
            
            <ListItem>
              <ListItemText primary="System Alerts" />
              <ListItemSecondaryAction>
                <Switch
                  checked={settings.systemAlerts}
                  onChange={() => handleToggle('systemAlerts')}
                />
              </ListItemSecondaryAction>
            </ListItem>
            
            <ListItem>
              <ListItemText primary="Weekly Reports" />
              <ListItemSecondaryAction>
                <Switch
                  checked={settings.weeklyReports}
                  onChange={() => handleToggle('weeklyReports')}
                />
              </ListItemSecondaryAction>
            </ListItem>
            
            <ListItem>
              <ListItemText primary="Security Alerts" />
              <ListItemSecondaryAction>
                <Switch
                  checked={settings.securityAlerts}
                  onChange={() => handleToggle('securityAlerts')}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </Grid>
      </Grid>
    </SettingsCard>
  );
};

// Security Settings Component
const SecuritySettings = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAttempts: 5,
    ipWhitelist: true
  });

  return (
    <SettingsCard 
      title="Security Settings" 
      icon={Security}
      actions={
        <Button variant="outlined" startIcon={<Save />}>
          Save Security Settings
        </Button>
      }
    >
      <Grid container spacing={3}>
        {/* Password Change */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Change Password
          </Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Current Password"
              type={showPassword ? 'text' : 'password'}
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                )
              }}
            />
            <TextField
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
            />
            <TextField
              label="Confirm New Password"
              type={showPassword ? 'text' : 'password'}
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            />
            <Button variant="contained" startIcon={<Key />}>
              Change Password
            </Button>
          </Box>
        </Grid>
        
        {/* Security Options */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Security Options
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <Shield />
              </ListItemIcon>
              <ListItemText 
                primary="Two-Factor Authentication" 
                secondary="Enhanced security with 2FA"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={securitySettings.twoFactorAuth}
                  onChange={(e) => setSecuritySettings(prev => ({ 
                    ...prev, 
                    twoFactorAuth: e.target.checked 
                  }))}
                />
              </ListItemSecondaryAction>
            </ListItem>
            
            <ListItem>
              <ListItemText 
                primary="Session Timeout" 
                secondary={`${securitySettings.sessionTimeout} minutes`}
              />
            </ListItem>
            <ListItem>
              <Box width="100%">
                <Slider
                  value={securitySettings.sessionTimeout}
                  onChange={(e, value) => setSecuritySettings(prev => ({ 
                    ...prev, 
                    sessionTimeout: value 
                  }))}
                  min={15}
                  max={120}
                  step={15}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <Lock />
              </ListItemIcon>
              <ListItemText 
                primary="IP Whitelist" 
                secondary="Restrict access to specific IPs"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={securitySettings.ipWhitelist}
                  onChange={(e) => setSecuritySettings(prev => ({ 
                    ...prev, 
                    ipWhitelist: e.target.checked 
                  }))}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </Grid>
      </Grid>
    </SettingsCard>
  );
};

// System Settings Component
const SystemSettings = () => {
  const [systemConfig, setSystemConfig] = useState({
    maintenanceMode: false,
    debugMode: false,
    cacheEnabled: true,
    autoBackup: true,
    compressionEnabled: true
  });

  const [systemStats, setSystemStats] = useState({
    serverUptime: '15 days, 4 hours',
    memoryUsage: 68,
    diskUsage: 45,
    activeConnections: 1247,
    lastBackup: '2 hours ago'
  });

  return (
    <SettingsCard 
      title="System Configuration" 
      icon={Settings}
      actions={
        <Box display="flex" gap={1}>
          <Button variant="outlined" startIcon={<Backup />}>
            Backup Now
          </Button>
          <Button variant="outlined" startIcon={<Save />}>
            Save Config
          </Button>
        </Box>
      }
    >
      <Grid container spacing={3}>
        {/* System Status */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            System Status
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <Schedule />
              </ListItemIcon>
              <ListItemText 
                primary="Server Uptime" 
                secondary={systemStats.serverUptime}
              />
              <Chip label="Online" color="success" size="small" />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <Memory />
              </ListItemIcon>
              <ListItemText 
                primary="Memory Usage" 
                secondary={`${systemStats.memoryUsage}% used`}
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <Storage />
              </ListItemIcon>
              <ListItemText 
                primary="Disk Usage" 
                secondary={`${systemStats.diskUsage}% used`}
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <NetworkCheck />
              </ListItemIcon>
              <ListItemText 
                primary="Active Connections" 
                secondary={systemStats.activeConnections.toLocaleString()}
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <CloudDownload />
              </ListItemIcon>
              <ListItemText 
                primary="Last Backup" 
                secondary={systemStats.lastBackup}
              />
            </ListItem>
          </List>
        </Grid>
        
        {/* System Configuration */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Configuration
          </Typography>
          
          <List>
            <ListItem>
              <ListItemText 
                primary="Maintenance Mode" 
                secondary="Enable to perform system updates"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={systemConfig.maintenanceMode}
                  onChange={(e) => setSystemConfig(prev => ({ 
                    ...prev, 
                    maintenanceMode: e.target.checked 
                  }))}
                />
              </ListItemSecondaryAction>
            </ListItem>
            
            <ListItem>
              <ListItemText 
                primary="Debug Mode" 
                secondary="Enable detailed logging"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={systemConfig.debugMode}
                  onChange={(e) => setSystemConfig(prev => ({ 
                    ...prev, 
                    debugMode: e.target.checked 
                  }))}
                />
              </ListItemSecondaryAction>
            </ListItem>
            
            <ListItem>
              <ListItemText 
                primary="Cache Enabled" 
                secondary="Improve performance with caching"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={systemConfig.cacheEnabled}
                  onChange={(e) => setSystemConfig(prev => ({ 
                    ...prev, 
                    cacheEnabled: e.target.checked 
                  }))}
                />
              </ListItemSecondaryAction>
            </ListItem>
            
            <ListItem>
              <ListItemText 
                primary="Auto Backup" 
                secondary="Automatic daily backups"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={systemConfig.autoBackup}
                  onChange={(e) => setSystemConfig(prev => ({ 
                    ...prev, 
                    autoBackup: e.target.checked 
                  }))}
                />
              </ListItemSecondaryAction>
            </ListItem>
            
            <ListItem>
              <ListItemText 
                primary="Compression" 
                secondary="Enable data compression"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={systemConfig.compressionEnabled}
                  onChange={(e) => setSystemConfig(prev => ({ 
                    ...prev, 
                    compressionEnabled: e.target.checked 
                  }))}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </Grid>
      </Grid>
    </SettingsCard>
  );
};

// Database Management Component
const DatabaseManagement = () => {
  const [backupHistory, setBackupHistory] = useState([
    { id: 1, date: '2024-01-15 10:30:00', size: '2.4 GB', status: 'Success', type: 'Automatic' },
    { id: 2, date: '2024-01-14 10:30:00', size: '2.3 GB', status: 'Success', type: 'Automatic' },
    { id: 3, date: '2024-01-13 10:30:00', size: '2.2 GB', status: 'Success', type: 'Manual' },
    { id: 4, date: '2024-01-12 10:30:00', size: '2.1 GB', status: 'Failed', type: 'Automatic' },
  ]);

  return (
    <SettingsCard 
      title="Database Management" 
      icon={Database}
      actions={
        <Box display="flex" gap={1}>
          <Button variant="outlined" startIcon={<CloudUpload />}>
            Create Backup
          </Button>
          <Button variant="outlined" startIcon={<Restore />}>
            Restore
          </Button>
        </Box>
      }
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Database Statistics
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="Total Records" 
                secondary="1,247,893"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Database Size" 
                secondary="2.4 GB"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Last Optimization" 
                secondary="3 days ago"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Query Performance" 
                secondary="98.7% efficiency"
              />
            </ListItem>
          </List>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Backup History
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {backupHistory.map((backup) => (
                  <TableRow key={backup.id}>
                    <TableCell>{backup.date}</TableCell>
                    <TableCell>{backup.size}</TableCell>
                    <TableCell>
                      <Chip 
                        label={backup.type} 
                        size="small" 
                        color={backup.type === 'Automatic' ? 'primary' : 'secondary'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={backup.status} 
                        size="small" 
                        color={backup.status === 'Success' ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <CloudDownload />
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
        </Grid>
      </Grid>
    </SettingsCard>
  );
};

// Main Admin Settings Component
const AdminSettingsPage = () => {
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const tabs = [
    { label: 'General', icon: Settings },
    { label: 'Security', icon: Security },
    { label: 'Notifications', icon: Notifications },
    { label: 'System', icon: AdminPanelSettings },
    { label: 'Database', icon: Database }
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box mb={4}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Settings color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" fontWeight={700}>
            Admin Settings
          </Typography>
        </Box>
        <Typography variant="body1" color="textSecondary">
          Configure system settings, security, and platform preferences
        </Typography>
      </Box>

      {/* Settings Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              icon={<tab.icon />}
              label={tab.label}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Card>

      {/* Tab Content */}
      <Box>
        {tabValue === 0 && (
          <Box>
            {/* General Settings */}
            <SettingsCard 
              title="General Settings" 
              icon={Settings}
              actions={
                <Button variant="outlined" startIcon={<Save />}>
                  Save Changes
                </Button>
              }
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Platform Name"
                    defaultValue="MeFit"
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Support Email"
                    defaultValue="support@mefit.com"
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Max File Upload Size (MB)"
                    type="number"
                    defaultValue="10"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Default User Role</InputLabel>
                    <Select defaultValue="user">
                      <MenuItem value="user">Regular User</MenuItem>
                      <MenuItem value="contributor">Contributor</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Default Theme</InputLabel>
                    <Select defaultValue="light">
                      <MenuItem value="light">Light</MenuItem>
                      <MenuItem value="dark">Dark</MenuItem>
                      <MenuItem value="auto">Auto</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Enable User Registration"
                    sx={{ mt: 2 }}
                  />
                </Grid>
              </Grid>
            </SettingsCard>
          </Box>
        )}

        {tabValue === 1 && <SecuritySettings />}
        {tabValue === 2 && <NotificationSettings />}
        {tabValue === 3 && <SystemSettings />}
        {tabValue === 4 && <DatabaseManagement />}
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

export default AdminSettingsPage;
