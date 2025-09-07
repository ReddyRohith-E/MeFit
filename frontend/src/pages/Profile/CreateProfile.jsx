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
  Stepper,
  Step,
  StepLabel,
  Chip,
  IconButton,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  Alert,
  Paper,
  Grid,
  Tooltip,
  InputAdornment,
  LinearProgress,
  Collapse,
  FormHelperText,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';

import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  FitnessCenter as FitnessIcon,
  Assessment as AssessmentIcon,
  Psychology as PsychologyIcon,
  Info as InfoIcon,
  Height as HeightIcon,
  MonitorWeight as WeightIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext.jsx';
import LoadingSpinner from '../../components/Common/LoadingSpinner.jsx';
import FitnessEvaluationSystem from '../../components/Profile/FitnessEvaluationSystem.jsx';
import { profilesAPI } from '../../utils/api.js';
import './CreateProfile.css';

// Updated steps to include mandatory fitness evaluation - SRS FE-11
const steps = ['Personal Info', 'Physical Stats', 'Fitness Goals', 'Fitness Evaluation'];

const fitnessLevels = [
  { 
    value: 'Beginner', 
    label: 'Beginner', 
    description: 'New to fitness or just starting out',
    icon: '🌱'
  },
  { 
    value: 'Intermediate', 
    label: 'Intermediate', 
    description: 'Some experience with regular exercise',
    icon: '💪'
  },
  { 
    value: 'Advanced', 
    label: 'Advanced', 
    description: 'Experienced with consistent training',
    icon: '🔥'
  },
  { 
    value: 'Expert', 
    label: 'Expert', 
    description: 'Highly experienced athlete or trainer',
    icon: '⭐'
  }
];

const fitnessGoalOptions = [
  { label: 'Weight Loss', icon: '⚖️', description: 'Reduce body weight and fat' },
  { label: 'Muscle Gain', icon: '💪', description: 'Build lean muscle mass' },
  { label: 'Strength Training', icon: '🏋️', description: 'Increase overall strength' },
  { label: 'Endurance', icon: '🏃', description: 'Improve cardiovascular fitness' },
  { label: 'Flexibility', icon: '🧘', description: 'Enhance mobility and flexibility' },
  { label: 'General Fitness', icon: '🎯', description: 'Overall health and wellness' },
  { label: 'Sport Specific', icon: '⚽', description: 'Training for specific sports' },
  { label: 'Rehabilitation', icon: '🏥', description: 'Recovery from injury' },
];

const medicalConditionOptions = [
  { label: 'None', icon: '✅', severity: 'success' },
  { label: 'Diabetes', icon: '🩺', severity: 'warning' },
  { label: 'Hypertension', icon: '❤️', severity: 'warning' },
  { label: 'Heart Disease', icon: '💔', severity: 'error' },
  { label: 'Asthma', icon: '🫁', severity: 'warning' },
  { label: 'Arthritis', icon: '🦴', severity: 'warning' },
  { label: 'Back Problems', icon: '🎯', severity: 'warning' },
  { label: 'Knee Problems', icon: '🦵', severity: 'warning' },
  { label: 'Other', icon: '⚠️', severity: 'info' },
];

const CreateProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formProgress, setFormProgress] = useState(0);

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
    
    // Fitness Evaluation - SRS FE-11 requirement
    fitnessEvaluation: null,
    evaluationCompleted: false
  });

  // Calculate form completion progress
  useEffect(() => {
    const calculateProgress = () => {
      const totalFields = 7; // age, height, weight, fitnessLevel, fitnessGoals, evaluationCompleted
      let completedFields = 0;
      
      if (formData.age) completedFields++;
      if (formData.height) completedFields++;
      if (formData.weight) completedFields++;
      if (formData.fitnessLevel) completedFields++;
      if (formData.fitnessGoals.length > 0) completedFields++;
      if (formData.evaluationCompleted) completedFields += 2; // Give extra weight to evaluation
      
      setFormProgress((completedFields / totalFields) * 100);
    };
    
    calculateProgress();
  }, [formData]);

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
      
      case 3: // Fitness Evaluation - SRS FE-11 requirement
        if (!formData.evaluationCompleted) {
          newErrors.evaluation = 'Fitness evaluation must be completed to proceed';
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
      // If this is the fitness evaluation step and evaluation is completed, proceed to save
      if (activeStep === 3 && formData.evaluationCompleted) {
        handleSubmit();
      } else {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData({
      ...formData,
      [field]: value,
    });
    
    // Mark field as touched
    setTouched({
      ...touched,
      [field]: true,
    });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: '',
      });
    }
    
    // Real-time validation for better UX
    validateField(field, value);
  };

  const validateField = (field, value) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'age':
        if (!value || value < 1 || value > 120) {
          newErrors.age = 'Age must be between 1 and 120 years';
        } else {
          delete newErrors.age;
        }
        break;
      case 'height':
        if (!value || value < 50 || value > 300) {
          newErrors.height = 'Height must be between 50 and 300 cm';
        } else {
          delete newErrors.height;
        }
        break;
      case 'weight':
        if (!value || value < 20 || value > 500) {
          newErrors.weight = 'Weight must be between 20 and 500 kg';
        } else {
          delete newErrors.weight;
        }
        break;
      case 'fitnessLevel':
        if (!value) {
          newErrors.fitnessLevel = 'Please select your fitness level';
        } else {
          delete newErrors.fitnessLevel;
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
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
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Personal Information
              </Typography>
              <Typography variant="body2">
                Tell us about yourself. Only age is required to proceed.
              </Typography>
            </Alert>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Age"
                  type="number"
                  value={formData.age}
                  onChange={handleInputChange('age')}
                  error={!!errors.age && touched.age}
                  helperText={errors.age || 'Required field'}
                  inputProps={{ min: 1, max: 120 }}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: touched.age && !errors.age && formData.age ? (
                      <InputAdornment position="end">
                        <CheckCircleIcon color="success" />
                      </InputAdornment>
                    ) : errors.age && touched.age ? (
                      <InputAdornment position="end">
                        <ErrorIcon color="error" />
                      </InputAdornment>
                    ) : null
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  error={!!errors.phone}
                  helperText={errors.phone || 'Optional - for account security'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="action" />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={formData.address}
                  onChange={handleInputChange('address')}
                  error={!!errors.address}
                  helperText={errors.address || 'Optional - helps us find local fitness facilities'}
                  multiline
                  rows={2}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 2 }}>
                        <HomeIcon color="action" />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                <FitnessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Physical Statistics
              </Typography>
              <Typography variant="body2">
                Your physical stats help us create personalized workout recommendations.
                All fields are required for accurate calculations.
              </Typography>
            </Alert>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Height"
                  type="number"
                  value={formData.height}
                  onChange={handleInputChange('height')}
                  error={!!errors.height && touched.height}
                  helperText={errors.height || 'Enter your height in centimeters'}
                  inputProps={{ min: 50, max: 300, step: 0.1 }}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HeightIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography variant="body2" color="textSecondary">
                          cm
                        </Typography>
                        {touched.height && !errors.height && formData.height ? (
                          <CheckCircleIcon color="success" sx={{ ml: 1 }} />
                        ) : errors.height && touched.height ? (
                          <ErrorIcon color="error" sx={{ ml: 1 }} />
                        ) : null}
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Weight"
                  type="number"
                  value={formData.weight}
                  onChange={handleInputChange('weight')}
                  error={!!errors.weight && touched.weight}
                  helperText={errors.weight || 'Enter your current weight in kilograms'}
                  inputProps={{ min: 20, max: 500, step: 0.1 }}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <WeightIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography variant="body2" color="textSecondary">
                          kg
                        </Typography>
                        {touched.weight && !errors.weight && formData.weight ? (
                          <CheckCircleIcon color="success" sx={{ ml: 1 }} />
                        ) : errors.weight && touched.weight ? (
                          <ErrorIcon color="error" sx={{ ml: 1 }} />
                        ) : null}
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.fitnessLevel && touched.fitnessLevel} required>
                  <InputLabel>Current Fitness Level</InputLabel>
                  <Select
                    value={formData.fitnessLevel}
                    onChange={handleInputChange('fitnessLevel')}
                    label="Current Fitness Level"
                    renderValue={(selected) => {
                      const level = fitnessLevels.find(l => l.value === selected);
                      return level ? `${level.icon} ${level.label}` : '';
                    }}
                  >
                    {fitnessLevels.map((level) => (
                      <MenuItem key={level.value} value={level.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                          <Typography variant="h6">{level.icon}</Typography>
                          <Box>
                            <Typography variant="subtitle1">{level.label}</Typography>
                            <Typography variant="body2" color="textSecondary">
                              {level.description}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {errors.fitnessLevel || 'Choose the level that best describes your current fitness experience'}
                  </FormHelperText>
                </FormControl>
              </Grid>
              
              {formData.height && formData.weight && (
                <Grid item xs={12}>
                  <Alert severity="success" sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">
                      BMI Calculation: {((formData.weight / ((formData.height / 100) ** 2))).toFixed(1)}
                    </Typography>
                    <Typography variant="body2">
                      This helps us understand your current physical status
                    </Typography>
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Fitness Goals & Health Information
              </Typography>
              <Typography variant="body2">
                Select your fitness goals to receive personalized workout recommendations.
                At least one goal is required.
              </Typography>
            </Alert>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Fitness Goals <Typography component="span" color="error">*</Typography>
                </Typography>
                <Autocomplete
                  multiple
                  options={fitnessGoalOptions}
                  value={formData.fitnessGoals}
                  onChange={handleArrayChange('fitnessGoals')}
                  getOptionLabel={(option) => option.label || option}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h6">{option.icon}</Typography>
                      <Box>
                        <Typography variant="subtitle1">{option.label}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {option.description}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={`${option.icon || ''} ${option.label || option}`}
                        {...getTagProps({ index })}
                        key={option.label || option}
                        color="primary"
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      placeholder="Select your fitness goals"
                      error={!!errors.fitnessGoals}
                      helperText={errors.fitnessGoals || 'Choose one or more goals that align with your fitness journey'}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Medical Conditions
                </Typography>
                <Autocomplete
                  multiple
                  options={medicalConditionOptions}
                  value={formData.medicalConditions}
                  onChange={handleArrayChange('medicalConditions')}
                  getOptionLabel={(option) => option.label || option}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h6">{option.icon}</Typography>
                      <Typography variant="subtitle1">{option.label}</Typography>
                    </Box>
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={`${option.icon || ''} ${option.label || option}`}
                        {...getTagProps({ index })}
                        key={option.label || option}
                        color={option.severity === 'success' ? 'success' : 
                               option.severity === 'error' ? 'error' : 'warning'}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      placeholder="Select any medical conditions"
                      helperText="This information helps us create safer workout recommendations. Select 'None' if you have no medical conditions."
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
                  placeholder="Share any additional information about your fitness journey, preferences, injuries, or limitations that might help us create better recommendations for you..."
                  helperText="Optional - Any additional information that might help personalize your experience"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                <PsychologyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                SRS Requirement FE-11: Mandatory Fitness Evaluation
              </Typography>
              <Typography variant="body2">
                This fitness evaluation is required to use the system. It will determine your workout limits and provide personalized recommendations based on your actual capabilities.
              </Typography>
            </Alert>
            
            <FitnessEvaluationSystem 
              userProfile={formData}
              onEvaluationComplete={(evaluation) => {
                setFormData(prev => ({
                  ...prev,
                  fitnessEvaluation: evaluation,
                  evaluationCompleted: true,
                  fitnessLevel: evaluation.level
                }));
              }}
            />
            
            {formData.evaluationCompleted && (
              <Alert severity="success" sx={{ mt: 3 }}>
                <CheckCircleIcon sx={{ mr: 1 }} />
                Fitness evaluation completed successfully! You can now proceed to create your profile.
              </Alert>
            )}
          </Box>
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
      case 3:
        return <PsychologyIcon />;
      default:
        return null;
    }
  };

  if (loading) return <LoadingSpinner />;

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return formData.age && !errors.age;
      case 1:
        return formData.height && formData.weight && formData.fitnessLevel && 
               !errors.height && !errors.weight && !errors.fitnessLevel;
      case 2:
        return formData.fitnessGoals.length > 0;
      case 3:
        return formData.evaluationCompleted;
      default:
        return false;
    }
  };

  return (
    <Box className="create-profile-container">
      <Box className="create-profile-header">
        <IconButton
          onClick={() => navigate('/profile')}
          className="back-btn"
          size="large"
        >
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" className="create-profile-title">
            Set Up Your Profile
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={formProgress} 
              sx={{ flex: 1, height: 8, borderRadius: 4 }}
            />
            <Typography variant="body2" color="textSecondary">
              {Math.round(formProgress)}% Complete
            </Typography>
          </Box>
        </Box>
      </Box>

      <Card className="create-profile-card">
        <CardContent>
          <Stepper activeStep={activeStep} className="profile-stepper">
            {steps.map((label, index) => (
              <Step key={label} completed={activeStep > index}>
                <StepLabel 
                  icon={getStepIcon(index)}
                  error={activeStep === index && Object.keys(errors).length > 0}
                >
                  {label}
                  {activeStep === index && (
                    <Typography variant="caption" display="block" color="textSecondary">
                      {index === 0 && 'Required: Age'}
                      {index === 1 && 'Required: Height, Weight, Fitness Level'}
                      {index === 2 && 'Required: At least one fitness goal'}
                      {index === 3 && 'Required: Complete fitness evaluation'}
                    </Typography>
                  )}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box className="step-content">
            {getStepContent(activeStep)}
          </Box>

          {errors.submit && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <Typography>
                {errors.submit}
              </Typography>
            </Alert>
          )}

          <Box className="step-actions">
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              className="back-step-btn"
              startIcon={<ArrowBackIcon />}
            >
              Back
            </Button>
            <Box className="step-spacer" />
            
            {/* Step completion indicator */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
              {canProceed() ? (
                <CheckCircleIcon color="success" />
              ) : (
                <WarningIcon color="warning" />
              )}
              <Typography variant="body2" color="textSecondary">
                {canProceed() ? 'Ready to proceed' : 'Complete required fields'}
              </Typography>
            </Box>
            
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading || !formData.evaluationCompleted}
                startIcon={<SaveIcon />}
                className="submit-btn"
                size="large"
              >
                {loading ? 'Saving...' : 'Complete Profile'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForwardIcon />}
                className="next-btn"
                disabled={!canProceed()}
                size="large"
              >
                Next Step
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateProfile;
