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
  Avatar,
  Tab,
  Tabs,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  LinearProgress,
  Badge,
  useTheme
} from '@mui/material';
import {
  Person,
  Security,
  Notifications,
  Palette,
  Language,
  Security as Privacy,
  Edit,
  PhotoCamera,
  Visibility,
  VisibilityOff,
  Key,
  Shield,
  Email,
  Sms,
  VolumeUp,
  Brightness4,
  Brightness7,
  Save,
  Cancel,
  Delete,
  Check,
  Warning,
  Info,
  Settings,
  AccountCircle,
  Lock,
  ColorLens,
  Translate,
  VpnKey,
  PhoneAndroid,
  Computer,
  Schedule,
  FitnessCenter,
  TrendingUp,
  ExpandMore,
  CloudUpload,
  Psychology,
  Accessibility,
  Speed
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import TwoFactorSetup from '../../components/Security/TwoFactorSetup';
import ContributorRequestCard from '../../components/Profile/ContributorRequestCard';
import { UniversalThemeContext } from '../../contexts/UniversalThemeContext';

// Profile Header Component
const ProfileHeader = ({ userProfile, onPhotoChange }) => {
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  
  return (
    <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <CardContent sx={{ color: 'white', textAlign: 'center', py: 4 }}>
        <Box position="relative" display="inline-block" mb={2}>
          <Avatar
            sx={{ 
              width: 120, 
              height: 120, 
              border: '4px solid white',
              boxShadow: 3,
              margin: '0 auto'
            }}
            src={userProfile?.profilePicture}
          >
            {userProfile?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <IconButton
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
            onClick={() => setPhotoDialogOpen(true)}
          >
            <PhotoCamera />
          </IconButton>
        </Box>
        
        <Typography variant="h4" fontWeight={600} gutterBottom>
          {userProfile?.name || 'User Name'}
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }} gutterBottom>
          {userProfile?.email}
        </Typography>
        
        <Box display="flex" justifyContent="center" gap={2} mt={2}>
          <Chip 
            label={userProfile?.role || 'User'} 
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
          />
          <Chip 
            label={`${userProfile?.workouts?.length || 0} Workouts`} 
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
          />
          <Chip 
            label={`${userProfile?.goals?.length || 0} Goals`} 
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
          />
        </Box>

        {/* Photo Upload Dialog */}
        <Dialog open={photoDialogOpen} onClose={() => setPhotoDialogOpen(false)}>
          <DialogTitle>Change Profile Photo</DialogTitle>
          <DialogContent>
            <Box textAlign="center" py={2}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="photo-upload"
                type="file"
                onChange={onPhotoChange}
              />
              <label htmlFor="photo-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<CloudUpload />}
                  sx={{ mb: 2 }}
                >
                  Choose Photo
                </Button>
              </label>
              <Typography variant="body2" color="textSecondary">
                Recommended: Square image, max 5MB
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPhotoDialogOpen(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

// Personal Information Tab
const PersonalInformationTab = ({ userProfile, onSave }) => {
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
    bio: userProfile?.bio || '',
    location: userProfile?.location || '',
    website: userProfile?.website || '',
    dateOfBirth: userProfile?.dateOfBirth || '',
    gender: userProfile?.gender || '',
    height: userProfile?.height || '',
    weight: userProfile?.weight || '',
    fitnessLevel: userProfile?.fitnessLevel || 'beginner'
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  return (
    <Grid container spacing={3}>
      {/* Basic Information */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={600}>
                Basic Information
              </Typography>
              <Button
                startIcon={isEditing ? <Save /> : <Edit />}
                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                variant={isEditing ? "contained" : "outlined"}
              >
                {isEditing ? 'Save' : 'Edit'}
              </Button>
            </Box>
            
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Full Name"
                value={formData.name}
                onChange={handleChange('name')}
                disabled={!isEditing}
                fullWidth
              />
              <TextField
                label="Email"
                value={formData.email}
                onChange={handleChange('email')}
                disabled={!isEditing}
                fullWidth
                type="email"
              />
              <TextField
                label="Phone Number"
                value={formData.phone}
                onChange={handleChange('phone')}
                disabled={!isEditing}
                fullWidth
              />
              <TextField
                label="Location"
                value={formData.location}
                onChange={handleChange('location')}
                disabled={!isEditing}
                fullWidth
              />
              <TextField
                label="Website"
                value={formData.website}
                onChange={handleChange('website')}
                disabled={!isEditing}
                fullWidth
              />
              <TextField
                label="Bio"
                value={formData.bio}
                onChange={handleChange('bio')}
                disabled={!isEditing}
                fullWidth
                multiline
                rows={3}
                placeholder="Tell us about yourself..."
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Fitness Information */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Fitness Profile
            </Typography>
            
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange('dateOfBirth')}
                disabled={!isEditing}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              
              <FormControl fullWidth disabled={!isEditing}>
                <InputLabel>Gender</InputLabel>
                <Select value={formData.gender} onChange={handleChange('gender')}>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                  <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                </Select>
              </FormControl>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Height (cm)"
                    type="number"
                    value={formData.height}
                    onChange={handleChange('height')}
                    disabled={!isEditing}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Weight (kg)"
                    type="number"
                    value={formData.weight}
                    onChange={handleChange('weight')}
                    disabled={!isEditing}
                    fullWidth
                  />
                </Grid>
              </Grid>
              
              <FormControl fullWidth disabled={!isEditing}>
                <InputLabel>Fitness Level</InputLabel>
                <Select value={formData.fitnessLevel} onChange={handleChange('fitnessLevel')}>
                  <MenuItem value="beginner">Beginner</MenuItem>
                  <MenuItem value="intermediate">Intermediate</MenuItem>
                  <MenuItem value="advanced">Advanced</MenuItem>
                  <MenuItem value="expert">Expert</MenuItem>
                </Select>
              </FormControl>

              {/* Fitness Stats */}
              <Box mt={2}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Fitness Progress
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Workouts Completed</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {userProfile?.completedWorkouts || 0}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(userProfile?.completedWorkouts || 0) % 100} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Security Settings Tab
const SecurityTab = () => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [trustedDevices, setTrustedDevices] = useState([
    { id: 1, name: 'Chrome on Windows', lastActive: '2 minutes ago', current: true },
    { id: 2, name: 'Mobile App', lastActive: '1 hour ago', current: false },
    { id: 3, name: 'Firefox on MacOS', lastActive: '1 day ago', current: false }
  ]);

  return (
    <Grid container spacing={3}>
      {/* Password Change */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Change Password
            </Typography>
            
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Current Password"
                type={showPasswords ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={() => setShowPasswords(!showPasswords)}>
                      {showPasswords ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  )
                }}
              />
              <TextField
                label="New Password"
                type={showPasswords ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Confirm New Password"
                type={showPasswords ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                fullWidth
              />
              <Button variant="contained" startIcon={<Key />}>
                Update Password
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Two-Factor Authentication */}
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <TwoFactorSetup />
          </CardContent>
        </Card>
      </Grid>

      {/* Trusted Devices */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Trusted Devices
            </Typography>
            
            <List>
              {trustedDevices.map((device) => (
                <ListItem key={device.id} divider>
                  <ListItemIcon>
                    {device.name.includes('Mobile') ? <PhoneAndroid /> : <Computer />}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        {device.name}
                        {device.current && (
                          <Chip label="Current" size="small" color="primary" />
                        )}
                      </Box>
                    }
                    secondary={`Last active: ${device.lastActive}`}
                  />
                  <ListItemSecondaryAction>
                    {!device.current && (
                      <IconButton color="error">
                        <Delete />
                      </IconButton>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Login Activity */}
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Recent Activity
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemText
                  primary="Successful login"
                  secondary="Today at 2:30 PM • Chrome on Windows"
                />
                <Check color="success" />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Password changed"
                  secondary="Yesterday at 4:15 PM"
                />
                <Info color="info" />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Failed login attempt"
                  secondary="2 days ago • Unknown device"
                />
                <Warning color="warning" />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Notification Settings Tab
const NotificationSettingsTab = () => {
  const [emailNotifications, setEmailNotifications] = useState({
    workoutReminders: true,
    goalUpdates: true,
    weeklyProgress: true,
    newFeatures: false,
    marketingEmails: false,
    securityAlerts: true
  });

  const [pushNotifications, setPushNotifications] = useState({
    workoutTime: true,
    goalDeadlines: true,
    socialUpdates: false,
    achievements: true,
    messages: true
  });

  const [soundSettings, setSoundSettings] = useState({
    notificationSounds: true,
    volume: 70,
    vibration: true
  });

  return (
    <Grid container spacing={3}>
      {/* Email Notifications */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Email color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Email Notifications
              </Typography>
            </Box>
            
            <List>
              {Object.entries(emailNotifications).map(([key, value]) => (
                <ListItem key={key}>
                  <ListItemText
                    primary={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    secondary={getNotificationDescription(key)}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={value}
                      onChange={(e) => setEmailNotifications(prev => ({
                        ...prev,
                        [key]: e.target.checked
                      }))}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Push Notifications */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Notifications color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Push Notifications
              </Typography>
            </Box>
            
            <List>
              {Object.entries(pushNotifications).map(([key, value]) => (
                <ListItem key={key}>
                  <ListItemText
                    primary={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    secondary={getNotificationDescription(key)}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={value}
                      onChange={(e) => setPushNotifications(prev => ({
                        ...prev,
                        [key]: e.target.checked
                      }))}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Sound Settings */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <VolumeUp color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Sound & Vibration
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={soundSettings.notificationSounds}
                      onChange={(e) => setSoundSettings(prev => ({
                        ...prev,
                        notificationSounds: e.target.checked
                      }))}
                    />
                  }
                  label="Notification Sounds"
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography gutterBottom>Volume</Typography>
                <Slider
                  value={soundSettings.volume}
                  onChange={(e, value) => setSoundSettings(prev => ({ ...prev, volume: value }))}
                  valueLabelDisplay="auto"
                  disabled={!soundSettings.notificationSounds}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={soundSettings.vibration}
                      onChange={(e) => setSoundSettings(prev => ({
                        ...prev,
                        vibration: e.target.checked
                      }))}
                    />
                  }
                  label="Vibration"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Theme and Appearance Tab
const ThemeAppearanceTab = () => {
  const { isDarkMode, toggleTheme, primaryColor, setPrimaryColor } = useContext(UniversalThemeContext);
  const theme = useTheme();
  
  const [displaySettings, setDisplaySettings] = useState({
    compactMode: false,
    animations: true,
    fontSize: 'medium',
    language: 'en'
  });

  const colorPresets = [
    { name: 'Blue', value: '#1976d2' },
    { name: 'Purple', value: '#9c27b0' },
    { name: 'Green', value: '#2e7d32' },
    { name: 'Orange', value: '#ed6c02' },
    { name: 'Red', value: '#d32f2f' },
    { name: 'Teal', value: '#0097a7' }
  ];

  return (
    <Grid container spacing={3}>
      {/* Theme Settings */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Palette color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Theme Settings
              </Typography>
            </Box>
            
            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom>
                Color Scheme
              </Typography>
              <Box display="flex" gap={1} mb={2}>
                <Button
                  variant={!isDarkMode ? "contained" : "outlined"}
                  startIcon={<Brightness7 />}
                  onClick={() => !isDarkMode || toggleTheme()}
                >
                  Light
                </Button>
                <Button
                  variant={isDarkMode ? "contained" : "outlined"}
                  startIcon={<Brightness4 />}
                  onClick={() => isDarkMode || toggleTheme()}
                >
                  Dark
                </Button>
              </Box>
            </Box>

            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom>
                Primary Color
              </Typography>
              <Grid container spacing={1}>
                {colorPresets.map((color) => (
                  <Grid key={color.name}>
                    <IconButton
                      onClick={() => setPrimaryColor(color.value)}
                      sx={{
                        bgcolor: color.value,
                        width: 40,
                        height: 40,
                        border: primaryColor === color.value ? `3px solid ${theme.palette.text.primary}` : 'none',
                        '&:hover': { bgcolor: color.value, opacity: 0.8 }
                      }}
                    >
                      {primaryColor === color.value && <Check sx={{ color: 'white' }} />}
                    </IconButton>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Display Settings */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Settings color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Display Settings
              </Typography>
            </Box>
            
            <List>
              <ListItem>
                <ListItemText
                  primary="Compact Mode"
                  secondary="Reduce spacing and padding"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={displaySettings.compactMode}
                    onChange={(e) => setDisplaySettings(prev => ({
                      ...prev,
                      compactMode: e.target.checked
                    }))}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary="Animations"
                  secondary="Enable smooth transitions"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={displaySettings.animations}
                    onChange={(e) => setDisplaySettings(prev => ({
                      ...prev,
                      animations: e.target.checked
                    }))}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>

            <Box mt={2}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Font Size</InputLabel>
                <Select
                  value={displaySettings.fontSize}
                  onChange={(e) => setDisplaySettings(prev => ({
                    ...prev,
                    fontSize: e.target.value
                  }))}
                >
                  <MenuItem value="small">Small</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="large">Large</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Language</InputLabel>
                <Select
                  value={displaySettings.language}
                  onChange={(e) => setDisplaySettings(prev => ({
                    ...prev,
                    language: e.target.value
                  }))}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                  <MenuItem value="de">German</MenuItem>
                  <MenuItem value="it">Italian</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Privacy Settings Tab
const PrivacyTab = () => {
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    workoutVisibility: 'friends',
    goalVisibility: 'private',
    allowMessages: true,
    allowFollowRequests: true,
    showOnlineStatus: true,
    dataSharing: false,
    analyticsTracking: true
  });

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Privacy color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Profile Privacy
              </Typography>
            </Box>
            
            <Box display="flex" flexDirection="column" gap={2}>
              <FormControl fullWidth>
                <InputLabel>Profile Visibility</InputLabel>
                <Select
                  value={privacySettings.profileVisibility}
                  onChange={(e) => setPrivacySettings(prev => ({
                    ...prev,
                    profileVisibility: e.target.value
                  }))}
                >
                  <MenuItem value="public">Public</MenuItem>
                  <MenuItem value="friends">Friends Only</MenuItem>
                  <MenuItem value="private">Private</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Workout Visibility</InputLabel>
                <Select
                  value={privacySettings.workoutVisibility}
                  onChange={(e) => setPrivacySettings(prev => ({
                    ...prev,
                    workoutVisibility: e.target.value
                  }))}
                >
                  <MenuItem value="public">Public</MenuItem>
                  <MenuItem value="friends">Friends Only</MenuItem>
                  <MenuItem value="private">Private</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Goal Visibility</InputLabel>
                <Select
                  value={privacySettings.goalVisibility}
                  onChange={(e) => setPrivacySettings(prev => ({
                    ...prev,
                    goalVisibility: e.target.value
                  }))}
                >
                  <MenuItem value="public">Public</MenuItem>
                  <MenuItem value="friends">Friends Only</MenuItem>
                  <MenuItem value="private">Private</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Shield color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Communication & Data
              </Typography>
            </Box>
            
            <List>
              <ListItem>
                <ListItemText
                  primary="Allow Messages"
                  secondary="Let others send you messages"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={privacySettings.allowMessages}
                    onChange={(e) => setPrivacySettings(prev => ({
                      ...prev,
                      allowMessages: e.target.checked
                    }))}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary="Follow Requests"
                  secondary="Allow others to follow you"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={privacySettings.allowFollowRequests}
                    onChange={(e) => setPrivacySettings(prev => ({
                      ...prev,
                      allowFollowRequests: e.target.checked
                    }))}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary="Show Online Status"
                  secondary="Display when you're active"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={privacySettings.showOnlineStatus}
                    onChange={(e) => setPrivacySettings(prev => ({
                      ...prev,
                      showOnlineStatus: e.target.checked
                    }))}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary="Data Sharing"
                  secondary="Share data with third parties"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={privacySettings.dataSharing}
                    onChange={(e) => setPrivacySettings(prev => ({
                      ...prev,
                      dataSharing: e.target.checked
                    }))}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary="Analytics Tracking"
                  secondary="Help improve the app"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={privacySettings.analyticsTracking}
                    onChange={(e) => setPrivacySettings(prev => ({
                      ...prev,
                      analyticsTracking: e.target.checked
                    }))}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Helper function for notification descriptions
const getNotificationDescription = (key) => {
  const descriptions = {
    workoutReminders: 'Get reminded about scheduled workouts',
    goalUpdates: 'Updates on your fitness goals progress',
    weeklyProgress: 'Weekly summary of your activities',
    newFeatures: 'Learn about new app features',
    marketingEmails: 'Promotional offers and tips',
    securityAlerts: 'Important security notifications',
    workoutTime: 'Reminders when it\'s time to workout',
    goalDeadlines: 'Alerts for approaching goal deadlines',
    socialUpdates: 'Friend activities and updates',
    achievements: 'Celebration of your accomplishments',
    messages: 'Direct messages from other users'
  };
  return descriptions[key] || '';
};

// Main Profile Settings Component
const ProfileSettingsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      // Simulate API call
      setUserProfile({
        name: user?.name || 'John Doe',
        email: user?.email || 'john@example.com',
        role: user?.role || 'user',
        workouts: [],
        goals: [],
        completedWorkouts: 15
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (formData) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUserProfile(prev => ({ ...prev, ...formData }));
      showNotification('Profile updated successfully!');
    } catch (error) {
      showNotification('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Handle photo upload
      showNotification('Photo uploaded successfully!');
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const tabs = [
    { label: 'Personal Info', icon: Person },
    { label: 'Security', icon: Security },
    { label: 'Notifications', icon: Notifications },
    { label: 'Appearance', icon: Palette },
    { label: 'Privacy', icon: Privacy },
    { label: 'Contributor', icon: PersonAdd }
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Profile Header */}
      <ProfileHeader userProfile={userProfile} onPhotoChange={handlePhotoChange} />

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
          <PersonalInformationTab 
            userProfile={userProfile} 
            onSave={handleProfileSave} 
          />
        )}
        {tabValue === 1 && <SecurityTab />}
        {tabValue === 2 && <NotificationSettingsTab />}
        {tabValue === 3 && <ThemeAppearanceTab />}
        {tabValue === 4 && <PrivacyTab />}
        {tabValue === 5 && <ContributorRequestCard />}
      </Box>

      {/* Save Button */}
      <Box display="flex" justifyContent="center" mt={4}>
        <Button
          variant="contained"
          size="large"
          startIcon={<Save />}
          disabled={loading}
          sx={{ minWidth: 200 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Save All Changes'}
        </Button>
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

export default ProfileSettingsPage;
