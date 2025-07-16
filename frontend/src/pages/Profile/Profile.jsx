import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
} from '@mui/material';
import {
  Edit as EditIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  FitnessCenter as FitnessIcon,
  Height as HeightIcon,
  MonitorWeight as WeightIcon,
  Cake as AgeIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext.jsx';
import LoadingSpinner from '../../components/Common/LoadingSpinner.jsx';
import { profilesAPI } from '../../utils/api.js';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await profilesAPI.getMyProfile();
      setProfile(response.data.profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 404) {
        // No profile exists, user can create one
        setProfile(null);
      } else {
        setError('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    try {
      await profilesAPI.deleteProfile(profile._id);
      setProfile(null);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting profile:', error);
      setError('Failed to delete profile');
    }
  };

  const calculateBMI = () => {
    if (!profile?.height || !profile?.weight) return null;
    const heightInMeters = profile.height / 100;
    const bmi = profile.weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const getBMICategory = (bmi) => {
    if (!bmi) return null;
    if (bmi < 18.5) return { category: 'Underweight', color: 'info' };
    if (bmi < 25) return { category: 'Normal', color: 'success' };
    if (bmi < 30) return { category: 'Overweight', color: 'warning' };
    return { category: 'Obese', color: 'error' };
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <Box className="profile-error">
        <Typography color="error" variant="h6">
          {error}
        </Typography>
        <Button
          variant="contained"
          onClick={fetchProfile}
          className="retry-btn"
        >
          Try Again
        </Button>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box className="profile-empty">
        <Typography variant="h4" className="empty-title">
          Create Your Profile
        </Typography>
        <Typography variant="body1" className="empty-description">
          Set up your fitness profile to track your progress and get personalized recommendations.
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => navigate('/profile/create')}
          className="create-profile-btn"
        >
          Create Profile
        </Button>
      </Box>
    );
  }

  const bmi = calculateBMI();
  const bmiCategory = getBMICategory(bmi);

  return (
    <Box className="profile-container">
      <Box className="profile-header">
        <Typography variant="h4" className="profile-title">
          My Profile
        </Typography>
        <Box className="profile-actions">
          <IconButton
            color="primary"
            onClick={() => navigate('/profile/create')}
            className="edit-btn"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => setDeleteDialogOpen(true)}
            className="delete-btn"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Basic Info Card */}
        <Grid item xs={12} md={4}>
          <Card className="profile-card basic-info-card">
            <CardContent>
              <Box className="profile-avatar-section">
                <Avatar className="profile-avatar">
                  {getInitials(user?.firstName + ' ' + user?.lastName)}
                </Avatar>
                <Typography variant="h6" className="profile-name">
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Chip
                  label={user?.role}
                  color="primary"
                  size="small"
                  className="role-chip"
                />
              </Box>

              <List className="profile-info-list">
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={user?.email}
                  />
                </ListItem>
                {profile.phone && (
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Phone"
                      secondary={profile.phone}
                    />
                  </ListItem>
                )}
                {profile.address && (
                  <ListItem>
                    <ListItemIcon>
                      <LocationIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Address"
                      secondary={profile.address}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Physical Stats Card */}
        <Grid item xs={12} md={4}>
          <Card className="profile-card stats-card">
            <CardContent>
              <Typography variant="h6" className="card-title">
                Physical Stats
              </Typography>
              
              <List>
                {profile.age && (
                  <ListItem>
                    <ListItemIcon>
                      <AgeIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Age"
                      secondary={`${profile.age} years old`}
                    />
                  </ListItem>
                )}
                {profile.height && (
                  <ListItem>
                    <ListItemIcon>
                      <HeightIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Height"
                      secondary={`${profile.height} cm`}
                    />
                  </ListItem>
                )}
                {profile.weight && (
                  <ListItem>
                    <ListItemIcon>
                      <WeightIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Weight"
                      secondary={`${profile.weight} kg`}
                    />
                  </ListItem>
                )}
                {profile.fitnessLevel && (
                  <ListItem>
                    <ListItemIcon>
                      <FitnessIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Fitness Level"
                      secondary={profile.fitnessLevel}
                    />
                  </ListItem>
                )}
              </List>

              {bmi && (
                <>
                  <Divider className="stats-divider" />
                  <Box className="bmi-section">
                    <Typography variant="subtitle1" className="bmi-title">
                      BMI Index
                    </Typography>
                    <Box className="bmi-value">
                      <Typography variant="h4" className="bmi-number">
                        {bmi}
                      </Typography>
                      <Chip
                        label={bmiCategory.category}
                        color={bmiCategory.color}
                        size="small"
                        className="bmi-category"
                      />
                    </Box>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Goals & Preferences Card */}
        <Grid item xs={12} md={4}>
          <Card className="profile-card goals-card">
            <CardContent>
              <Typography variant="h6" className="card-title">
                Fitness Goals
              </Typography>
              
              {profile.fitnessGoals && profile.fitnessGoals.length > 0 ? (
                <Box className="goals-list">
                  {profile.fitnessGoals.map((goal, index) => (
                    <Chip
                      key={index}
                      label={goal}
                      variant="outlined"
                      className="goal-chip"
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No fitness goals set
                </Typography>
              )}

              {profile.medicalConditions && profile.medicalConditions.length > 0 && (
                <>
                  <Divider className="goals-divider" />
                  <Typography variant="subtitle2" className="conditions-title">
                    Medical Conditions
                  </Typography>
                  <Box className="conditions-list">
                    {profile.medicalConditions.map((condition, index) => (
                      <Chip
                        key={index}
                        label={condition}
                        size="small"
                        color="warning"
                        variant="outlined"
                        className="condition-chip"
                      />
                    ))}
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Completeness */}
        <Grid item xs={12}>
          <Paper className="completeness-card">
            <Typography variant="h6" className="completeness-title">
              Profile Completeness
            </Typography>
            <Box className="completeness-progress">
              {/* Add progress calculation based on filled fields */}
              <Typography variant="body2" color="textSecondary">
                Keep your profile updated for better recommendations
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Profile</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete your profile? This action cannot be undone.
            You can always create a new profile later.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteProfile} color="error" variant="contained">
            Delete Profile
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
