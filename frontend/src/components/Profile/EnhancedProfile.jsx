import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Alert,
  Snackbar,
  Grid,
  } from '@mui/material';

import {
  Edit as EditIcon,
  Person as PersonIcon,
  Cake as CakeIcon,
  Height as HeightIcon,
  MonitorWeight as WeightIcon,
  FitnessCenter as FitnessCenterIcon,
  LocalHospital as LocalHospitalIcon,
  Restaurant as RestaurantIcon,
  Timeline as TimelineIcon,
  Security as SecurityIcon,
  Badge as BadgeIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const EnhancedProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [twoFactorDialog, setTwoFactorDialog] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/profile/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setEditData({
          name: data.profile?.name || '',
          age: data.profile?.age || '',
          height: data.profile?.height || '',
          weight: data.profile?.weight || '',
          fitnessLevel: data.profile?.fitnessLevel || 'beginner',
          goals: data.profile?.goals || [],
          medicalConditions: data.profile?.medicalConditions || [],
          dietaryPreferences: data.profile?.dietaryPreferences || [],
          preferredWorkoutTime: data.profile?.preferredWorkoutTime || 'morning',
          workoutFrequency: data.profile?.workoutFrequency || 3
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching profile data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/profile/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setEditMode(false);
        setSnackbar({
          open: true,
          message: 'Profile updated successfully!',
          severity: 'success'
        });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: 'Error updating profile',
        severity: 'error'
      });
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    // Reset edit data to original values
    setEditData({
      name: profile?.name || '',
      age: profile?.age || '',
      height: profile?.height || '',
      weight: profile?.weight || '',
      fitnessLevel: profile?.fitnessLevel || 'beginner',
      goals: profile?.goals || [],
      medicalConditions: profile?.medicalConditions || [],
      dietaryPreferences: profile?.dietaryPreferences || [],
      preferredWorkoutTime: profile?.preferredWorkoutTime || 'morning',
      workoutFrequency: profile?.workoutFrequency || 3
    });
  };

  const calculateBMI = () => {
    if (profile?.height && profile?.weight) {
      const heightM = profile.height / 100;
      return (profile.weight / (heightM * heightM)).toFixed(1);
    }
    return 'N/A';
  };

  const getBMICategory = (bmi) => {
    if (bmi === 'N/A') return 'Unknown';
    const bmiNum = parseFloat(bmi);
    if (bmiNum < 18.5) return 'Underweight';
    if (bmiNum < 25) return 'Normal';
    if (bmiNum < 30) return 'Overweight';
    return 'Obese';
  };

  const getFitnessLevelColor = (level) => {
    switch (level) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  const bmi = calculateBMI();
  const bmiCategory = getBMICategory(bmi);

  return (
    <Box>
      {/* Profile Header */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar
              sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: 'background.paper',
                color: 'primary.main',
                fontSize: '2rem',
                fontWeight: 'bold'
              }}
            >
              {getInitials(profile?.name || user?.username)}
            </Avatar>
          </Grid>
          <Grid xs>
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
              {profile?.name || user?.username}
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              {user?.email}
            </Typography>
            <Box mt={1} display="flex" gap={1} flexWrap="wrap">
              <Chip 
                label={profile?.fitnessLevel || 'beginner'} 
                color={getFitnessLevelColor(profile?.fitnessLevel)}
                size="small"
                sx={{ color: 'white', fontWeight: 'bold' }}
              />
              {user?.isAdmin && (
                <Chip 
                  label="Admin" 
                  color="secondary" 
                  size="small"
                  sx={{ color: 'white', fontWeight: 'bold' }}
                />
              )}
              {user?.isContributor && (
                <Chip 
                  label="Contributor" 
                  color="info" 
                  size="small"
                  sx={{ color: 'white', fontWeight: 'bold' }}
                />
              )}
            </Box>
          </Grid>
          <Grid item>
            <Box display="flex" gap={1}>
              <Button
                variant="contained"
                startIcon={editMode ? <SaveIcon /> : <EditIcon />}
                onClick={editMode ? handleSave : () => setEditMode(true)}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
              >
                {editMode ? 'Save' : 'Edit Profile'}
              </Button>
              {editMode && (
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white' }}
                >
                  Cancel
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                <PersonIcon sx={{ mr: 1 }} />
                Basic Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  {editMode ? (
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    />
                  ) : (
                    <Box display="flex" alignItems="center" mb={2}>
                      <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="textSecondary">Full Name</Typography>
                        <Typography variant="body1">{profile?.name || 'Not provided'}</Typography>
                      </Box>
                    </Box>
                  )}
                </Grid>

                <Grid item xs={6}>
                  {editMode ? (
                    <TextField
                      fullWidth
                      label="Age"
                      type="number"
                      value={editData.age}
                      onChange={(e) => setEditData({ ...editData, age: parseInt(e.target.value) })}
                    />
                  ) : (
                    <Box display="flex" alignItems="center" mb={2}>
                      <CakeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="textSecondary">Age</Typography>
                        <Typography variant="body1">{profile?.age || 'Not provided'} years</Typography>
                      </Box>
                    </Box>
                  )}
                </Grid>

                <Grid item xs={6}>
                  {editMode ? (
                    <FormControl fullWidth>
                      <InputLabel>Fitness Level</InputLabel>
                      <Select
                        value={editData.fitnessLevel}
                        onChange={(e) => setEditData({ ...editData, fitnessLevel: e.target.value })}
                        label="Fitness Level"
                      >
                        <MenuItem value="beginner">Beginner</MenuItem>
                        <MenuItem value="intermediate">Intermediate</MenuItem>
                        <MenuItem value="advanced">Advanced</MenuItem>
                      </Select>
                    </FormControl>
                  ) : (
                    <Box display="flex" alignItems="center" mb={2}>
                      <FitnessCenterIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="textSecondary">Fitness Level</Typography>
                        <Chip 
                          label={profile?.fitnessLevel || 'Not set'} 
                          color={getFitnessLevelColor(profile?.fitnessLevel)}
                          size="small"
                        />
                      </Box>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Physical Stats */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                <TimelineIcon sx={{ mr: 1 }} />
                Physical Stats
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  {editMode ? (
                    <TextField
                      fullWidth
                      label="Height (cm)"
                      type="number"
                      value={editData.height}
                      onChange={(e) => setEditData({ ...editData, height: parseInt(e.target.value) })}
                    />
                  ) : (
                    <Box display="flex" alignItems="center" mb={2}>
                      <HeightIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="textSecondary">Height</Typography>
                        <Typography variant="body1">
                          {profile?.height ? `${profile.height} cm` : 'Not provided'}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Grid>

                <Grid item xs={6}>
                  {editMode ? (
                    <TextField
                      fullWidth
                      label="Weight (kg)"
                      type="number"
                      value={editData.weight}
                      onChange={(e) => setEditData({ ...editData, weight: parseInt(e.target.value) })}
                    />
                  ) : (
                    <Box display="flex" alignItems="center" mb={2}>
                      <WeightIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="textSecondary">Weight</Typography>
                        <Typography variant="body1">
                          {profile?.weight ? `${profile.weight} kg` : 'Not provided'}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="h6" gutterBottom>BMI Analysis</Typography>
                    <Typography variant="h4" color="primary">{bmi}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Category: {bmiCategory}
                    </Typography>
                    {bmi !== 'N/A' && (
                      <LinearProgress
                        variant="determinate"
                        value={Math.min((parseFloat(bmi) / 40) * 100, 100)}
                        sx={{ mt: 1, height: 8, borderRadius: 4 }}
                      />
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Health Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                <LocalHospitalIcon sx={{ mr: 1 }} />
                Health Information
              </Typography>

              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>Medical Conditions</Typography>
                {profile?.medicalConditions?.length > 0 ? (
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {profile.medicalConditions.map((condition, index) => (
                      <Chip key={index} label={condition} size="small" variant="outlined" />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No medical conditions reported
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom display="flex" alignItems="center">
                  <RestaurantIcon sx={{ mr: 1, fontSize: 16 }} />
                  Dietary Preferences
                </Typography>
                {profile?.dietaryPreferences?.length > 0 ? (
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {profile.dietaryPreferences.map((pref, index) => (
                      <Chip key={index} label={pref} size="small" color="primary" variant="outlined" />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No dietary preferences specified
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Preferences & Security */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                <SecurityIcon sx={{ mr: 1 }} />
                Preferences & Security
              </Typography>

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <FitnessCenterIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Preferred Workout Time"
                    secondary={profile?.preferredWorkoutTime || 'Not set'}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <TimelineIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Weekly Workout Frequency"
                    secondary={`${profile?.workoutFrequency || 0} times per week`}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Two-Factor Authentication"
                    secondary={user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setTwoFactorDialog(true)}
                  >
                    {user?.twoFactorEnabled ? 'Manage' : 'Enable'}
                  </Button>
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <BadgeIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Account Type"
                    secondary={
                      user?.isAdmin ? 'Administrator' : 
                      user?.isContributor ? 'Contributor' : 'Regular User'
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Two-Factor Auth Dialog */}
      <Dialog open={twoFactorDialog} onClose={() => setTwoFactorDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Two-Factor Authentication</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Two-factor authentication adds an extra layer of security to your account.
          </Typography>
          {user?.twoFactorEnabled ? (
            <Alert severity="success">
              Two-factor authentication is currently enabled for your account.
            </Alert>
          ) : (
            <Alert severity="info">
              Two-factor authentication is not enabled. You can enable it from the Security page.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTwoFactorDialog(false)}>Close</Button>
          <Button variant="contained" href="/security">
            Manage Security
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnhancedProfile;
