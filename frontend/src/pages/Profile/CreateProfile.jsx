import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Chip,
  IconButton,
  FormControlLabel,
  Checkbox,
  Autocomplete,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  FitnessCenter as FitnessIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext.jsx';
import LoadingSpinner from '../../components/Common/LoadingSpinner.jsx';
import { profilesAPI } from '../../utils/api.js';
import './CreateProfile.css';

const steps = ['Personal Info', 'Physical Stats', 'Fitness Goals'];

const fitnessLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const fitnessGoalOptions = [
  'Weight Loss',
  'Muscle Gain',
  'Strength Training',
  'Endurance',
  'Flexibility',
  'General Fitness',
  'Sport Specific',
  'Rehabilitation',
];

const medicalConditionOptions = [
  'None',
  'Diabetes',
  'Hypertension',
  'Heart Disease',
  'Asthma',
  'Arthritis',
  'Back Problems',
  'Knee Problems',
  'Other',
];

const CreateProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    // Personal Info
    age: '',
    phone: '',
    address: '',
    
    // Physical Stats
    height: '',
    weight: '',
    fitnessLevel: '',
    
    // Fitness Goals
    fitnessGoals: [],
    medicalConditions: [],
    additionalNotes: '',
  });

  useEffect(() => {
    // Check if profile exists and redirect to edit mode
    checkExistingProfile();
  }, []);

  const checkExistingProfile = async () => {
    try {
      const response = await profilesAPI.getMyProfile();
      if (response.data.profile) {
        // Profile exists, populate form for editing
        const profile = response.data.profile;
        setFormData({
          age: profile.age || '',
          phone: profile.phone || '',
          address: profile.address || '',
          height: profile.height || '',
          weight: profile.weight || '',
          fitnessLevel: profile.fitnessLevel || '',
          fitnessGoals: profile.fitnessGoals || [],
          medicalConditions: profile.medicalConditions || [],
          additionalNotes: profile.additionalNotes || '',
        });
      }
    } catch (error) {
      // No profile exists, continue with creation
      console.log('No existing profile found');
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 0: // Personal Info
        if (!formData.age || formData.age < 1 || formData.age > 120) {
          newErrors.age = 'Please enter a valid age (1-120)';
        }
        break;
      
      case 1: // Physical Stats
        if (!formData.height || formData.height < 50 || formData.height > 300) {
          newErrors.height = 'Please enter a valid height (50-300 cm)';
        }
        if (!formData.weight || formData.weight < 20 || formData.weight > 500) {
          newErrors.weight = 'Please enter a valid weight (20-500 kg)';
        }
        if (!formData.fitnessLevel) {
          newErrors.fitnessLevel = 'Please select your fitness level';
        }
        break;
      
      case 2: // Fitness Goals
        if (formData.fitnessGoals.length === 0) {
          newErrors.fitnessGoals = 'Please select at least one fitness goal';
        }
        break;
      
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: '',
      });
    }
  };

  const handleArrayChange = (field) => (event, newValue) => {
    setFormData({
      ...formData,
      [field]: newValue,
    });
    
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: '',
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) {
      return;
    }

    try {
      setLoading(true);

      // Filter out empty values and prepare data
      const profileData = {
        ...formData,
        age: parseInt(formData.age),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        fitnessGoals: formData.fitnessGoals.filter(goal => goal !== ''),
        medicalConditions: formData.medicalConditions.filter(condition => condition !== '' && condition !== 'None'),
      };

      // Check if updating existing profile
      try {
        const existingProfile = await profilesAPI.getMyProfile();
        await profilesAPI.updateProfile(existingProfile.data.profile._id, profileData);
      } catch (error) {
        // Create new profile
        await profilesAPI.createProfile(profileData);
      }

      navigate('/profile');
    } catch (error) {
      console.error('Error saving profile:', error);
      setErrors({
        submit: error.response?.data?.message || 'Failed to save profile'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Age"
                type="number"
                value={formData.age}
                onChange={handleInputChange('age')}
                error={!!errors.age}
                helperText={errors.age}
                inputProps={{ min: 1, max: 120 }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                error={!!errors.phone}
                helperText={errors.phone}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={handleInputChange('address')}
                error={!!errors.address}
                helperText={errors.address}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Height (cm)"
                type="number"
                value={formData.height}
                onChange={handleInputChange('height')}
                error={!!errors.height}
                helperText={errors.height}
                inputProps={{ min: 50, max: 300 }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Weight (kg)"
                type="number"
                value={formData.weight}
                onChange={handleInputChange('weight')}
                error={!!errors.weight}
                helperText={errors.weight}
                inputProps={{ min: 20, max: 500, step: 0.1 }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.fitnessLevel} required>
                <InputLabel>Fitness Level</InputLabel>
                <Select
                  value={formData.fitnessLevel}
                  onChange={handleInputChange('fitnessLevel')}
                  label="Fitness Level"
                >
                  {fitnessLevels.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
                {errors.fitnessLevel && (
                  <Typography variant="caption" color="error">
                    {errors.fitnessLevel}
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={fitnessGoalOptions}
                value={formData.fitnessGoals}
                onChange={handleArrayChange('fitnessGoals')}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                      key={option}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Fitness Goals"
                    placeholder="Select your fitness goals"
                    error={!!errors.fitnessGoals}
                    helperText={errors.fitnessGoals}
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={medicalConditionOptions}
                value={formData.medicalConditions}
                onChange={handleArrayChange('medicalConditions')}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                      key={option}
                      color={option === 'None' ? 'success' : 'warning'}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Medical Conditions"
                    placeholder="Select any medical conditions"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Notes"
                value={formData.additionalNotes}
                onChange={handleInputChange('additionalNotes')}
                multiline
                rows={4}
                placeholder="Any additional information about your fitness journey, preferences, or limitations..."
              />
            </Grid>
          </Grid>
        );

      default:
        return 'Unknown step';
    }
  };

  const getStepIcon = (step) => {
    switch (step) {
      case 0:
        return <PersonIcon />;
      case 1:
        return <FitnessIcon />;
      case 2:
        return <AssessmentIcon />;
      default:
        return null;
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box className="create-profile-container">
      <Box className="create-profile-header">
        <IconButton
          onClick={() => navigate('/profile')}
          className="back-btn"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" className="create-profile-title">
          Set Up Your Profile
        </Typography>
      </Box>

      <Card className="create-profile-card">
        <CardContent>
          <Stepper activeStep={activeStep} className="profile-stepper">
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel icon={getStepIcon(index)}>
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box className="step-content">
            {getStepContent(activeStep)}
          </Box>

          {errors.submit && (
            <Box className="error-message">
              <Typography color="error">
                {errors.submit}
              </Typography>
            </Box>
          )}

          <Box className="step-actions">
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              className="back-step-btn"
            >
              Back
            </Button>
            <Box className="step-spacer" />
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={<SaveIcon />}
                className="submit-btn"
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForwardIcon />}
                className="next-btn"
              >
                Next
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateProfile;
