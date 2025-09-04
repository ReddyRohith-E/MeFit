import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  FitnessCenter as FitnessCenterIcon,
  Timeline as TimelineIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';

const EnhancedGoalCreation = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [realismCheck, setRealismCheck] = useState(null);
  const [showRealismDialog, setShowRealismDialog] = useState(false);

  const [goalData, setGoalData] = useState({
    title: '',
    description: '',
    type: 'weight_loss',
    targetValue: '',
    targetUnit: 'kg',
    startDate: new Date(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    program: null,
    customWorkouts: [],
    workoutSchedule: {},
    priority: 'medium',
    isPublic: false
  });

  const steps = [
    'Basic Information',
    'Goal Details',
    'Program & Workouts',
    'Schedule & Settings',
    'Review & Create'
  ];

  const goalTypes = [
    { value: 'weight_loss', label: 'Weight Loss', unit: 'kg' },
    { value: 'weight_gain', label: 'Weight Gain', unit: 'kg' },
    { value: 'muscle_gain', label: 'Muscle Gain', unit: 'kg' },
    { value: 'endurance', label: 'Endurance Improvement', unit: 'minutes' },
    { value: 'strength', label: 'Strength Building', unit: 'kg' },
    { value: 'flexibility', label: 'Flexibility', unit: 'score' },
    { value: 'custom', label: 'Custom Goal', unit: 'units' }
  ];

  useEffect(() => {
    fetchPrograms();
    fetchWorkouts();
  }, []);

  const fetchPrograms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/programs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPrograms(data.programs || []);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const fetchWorkouts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/workouts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWorkouts(data.workouts || []);
      }
    } catch (error) {
      console.error('Error fetching workouts:', error);
    }
  };

  const checkGoalRealism = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/goals/check-realism', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(goalData)
      });
      
      if (response.ok) {
        const data = await response.json();
        setRealismCheck(data);
        if (data.warnings && data.warnings.length > 0) {
          setShowRealismDialog(true);
        }
      }
    } catch (error) {
      console.error('Error checking goal realism:', error);
    }
  };

  const handleNext = async () => {
    if (activeStep === 1) {
      // Check realism when moving past goal details
      await checkGoalRealism();
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleGoalTypeChange = (type) => {
    const typeInfo = goalTypes.find(t => t.value === type);
    setGoalData({
      ...goalData,
      type,
      targetUnit: typeInfo?.unit || 'units'
    });
  };

  const addCustomWorkout = (workout) => {
    if (!goalData.customWorkouts.find(w => w._id === workout._id)) {
      setGoalData({
        ...goalData,
        customWorkouts: [...goalData.customWorkouts, workout]
      });
    }
  };

  const removeCustomWorkout = (workoutId) => {
    setGoalData({
      ...goalData,
      customWorkouts: goalData.customWorkouts.filter(w => w._id !== workoutId)
    });
  };

  const generateSchedule = () => {
    const schedule = {};
    const startDate = new Date(goalData.startDate);
    const endDate = new Date(goalData.endDate);
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    let workoutList = [];
    if (goalData.program) {
      const selectedProgram = programs.find(p => p._id === goalData.program);
      workoutList = selectedProgram?.workouts || [];
    } else {
      workoutList = goalData.customWorkouts;
    }

    if (workoutList.length === 0) return;

    // Simple schedule generation - distribute workouts evenly
    const workoutsPerWeek = Math.min(workoutList.length, 5); // Max 5 workouts per week
    const daysBetweenWorkouts = Math.floor(7 / workoutsPerWeek);

    let currentDate = new Date(startDate);
    let workoutIndex = 0;

    while (currentDate <= endDate) {
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) { // Skip weekends
        const dateKey = currentDate.toISOString().split('T')[0];
        schedule[dateKey] = {
          workout: workoutList[workoutIndex % workoutList.length],
          completed: false
        };
        workoutIndex++;
      }
      
      currentDate.setDate(currentDate.getDate() + daysBetweenWorkouts);
    }

    setGoalData({ ...goalData, workoutSchedule: schedule });
  };

  const createGoal = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...goalData,
          workouts: Object.entries(goalData.workoutSchedule).map(([date, workout]) => ({
            workout: workout.workout._id,
            scheduledDate: date,
            completed: false
          }))
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        navigate(`/goals/${data.goal._id}`);
      } else {
        throw new Error('Failed to create goal');
      }
    } catch (error) {
      console.error('Error creating goal:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Goal Title"
                value={goalData.title}
                onChange={(e) => setGoalData({ ...goalData, title: e.target.value })}
                placeholder="e.g., Lose 5kg in 3 months"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={goalData.description}
                onChange={(e) => setGoalData({ ...goalData, description: e.target.value })}
                placeholder="Describe your goal in detail..."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Goal Type</InputLabel>
                <Select
                  value={goalData.type}
                  onChange={(e) => handleGoalTypeChange(e.target.value)}
                  label="Goal Type"
                >
                  {goalTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={goalData.priority}
                  onChange={(e) => setGoalData({ ...goalData, priority: e.target.value })}
                  label="Priority"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Target Value"
                type="number"
                value={goalData.targetValue}
                onChange={(e) => setGoalData({ ...goalData, targetValue: e.target.value })}
                InputProps={{
                  endAdornment: <Typography variant="body2">{goalData.targetUnit}</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Unit"
                value={goalData.targetUnit}
                onChange={(e) => setGoalData({ ...goalData, targetUnit: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={goalData.startDate}
                  onChange={(date) => setGoalData({ ...goalData, startDate: date })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Target Date"
                  value={goalData.endDate}
                  onChange={(date) => setGoalData({ ...goalData, endDate: date })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            {realismCheck && (
              <Grid item xs={12}>
                <Alert 
                  severity={realismCheck.isRealistic ? 'success' : 'warning'}
                  icon={realismCheck.isRealistic ? <CheckCircleIcon /> : <WarningIcon />}
                >
                  <Typography variant="subtitle2">Realism Score: {realismCheck.realismScore}/100</Typography>
                  <Typography variant="body2">{realismCheck.feedback}</Typography>
                  {realismCheck.suggestions && realismCheck.suggestions.length > 0 && (
                    <Box mt={1}>
                      <Typography variant="body2" fontWeight="bold">Suggestions:</Typography>
                      <List dense>
                        {realismCheck.suggestions.map((suggestion, index) => (
                          <ListItem key={index} sx={{ py: 0 }}>
                            <Typography variant="body2">• {suggestion}</Typography>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </Alert>
              </Grid>
            )}
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Choose a Program or Select Custom Workouts
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                    <FitnessCenterIcon sx={{ mr: 1 }} />
                    Pre-built Programs
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel>Select Program</InputLabel>
                    <Select
                      value={goalData.program || ''}
                      onChange={(e) => setGoalData({ 
                        ...goalData, 
                        program: e.target.value,
                        customWorkouts: [] // Clear custom workouts when selecting program
                      })}
                      label="Select Program"
                    >
                      <MenuItem value="">None</MenuItem>
                      {programs.map((program) => (
                        <MenuItem key={program._id} value={program._id}>
                          {program.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  {goalData.program && (
                    <Box mt={2}>
                      {(() => {
                        const selectedProgram = programs.find(p => p._id === goalData.program);
                        return selectedProgram ? (
                          <Alert severity="info">
                            <Typography variant="body2">
                              <strong>{selectedProgram.name}</strong><br />
                              {selectedProgram.description}<br />
                              Duration: {selectedProgram.duration} weeks<br />
                              Difficulty: {selectedProgram.difficulty}
                            </Typography>
                          </Alert>
                        ) : null;
                      })()}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                    <Timeline sx={{ mr: 1 }} />
                    Custom Workouts
                  </Typography>
                  
                  <Autocomplete
                    options={workouts}
                    getOptionLabel={(option) => option.name}
                    onChange={(event, value) => {
                      if (value) {
                        addCustomWorkout(value);
                      }
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Add Workout" placeholder="Search workouts..." />
                    )}
                    disabled={!!goalData.program}
                  />
                  
                  {goalData.customWorkouts.length > 0 && (
                    <Box mt={2}>
                      <Typography variant="subtitle2" gutterBottom>Selected Workouts:</Typography>
                      <List dense>
                        {goalData.customWorkouts.map((workout) => (
                          <ListItem key={workout._id} divider>
                            <ListItemText
                              primary={workout.name}
                              secondary={`${workout.duration} min • ${workout.difficulty}`}
                            />
                            <ListItemSecondaryAction>
                              <IconButton
                                edge="end"
                                onClick={() => removeCustomWorkout(workout._id)}
                              >
                                <RemoveIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                    <ScheduleIcon sx={{ mr: 1 }} />
                    Schedule Generation
                  </Typography>
                  
                  <Button
                    variant="contained"
                    onClick={generateSchedule}
                    disabled={!goalData.program && goalData.customWorkouts.length === 0}
                    sx={{ mb: 2 }}
                  >
                    Generate Workout Schedule
                  </Button>
                  
                  {Object.keys(goalData.workoutSchedule).length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Generated Schedule ({Object.keys(goalData.workoutSchedule).length} workouts):
                      </Typography>
                      <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                        {Object.entries(goalData.workoutSchedule)
                          .sort(([a], [b]) => new Date(a) - new Date(b))
                          .slice(0, 10) // Show first 10 for preview
                          .map(([date, workout]) => (
                            <Chip
                              key={date}
                              label={`${new Date(date).toLocaleDateString()} - ${workout.workout.name}`}
                              sx={{ m: 0.5 }}
                              size="small"
                            />
                          ))}
                        {Object.keys(goalData.workoutSchedule).length > 10 && (
                          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            ... and {Object.keys(goalData.workoutSchedule).length - 10} more
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Additional Settings
                  </Typography>
                  
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={goalData.isPublic}
                        onChange={(e) => setGoalData({ ...goalData, isPublic: e.target.checked })}
                      />
                    }
                    label="Make this goal public (visible to other users)"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      case 4:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom>Review Your Goal</Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Basic Information</Typography>
                  <Typography><strong>Title:</strong> {goalData.title}</Typography>
                  <Typography><strong>Type:</strong> {goalTypes.find(t => t.value === goalData.type)?.label}</Typography>
                  <Typography><strong>Target:</strong> {goalData.targetValue} {goalData.targetUnit}</Typography>
                  <Typography><strong>Duration:</strong> {new Date(goalData.startDate).toLocaleDateString()} - {new Date(goalData.endDate).toLocaleDateString()}</Typography>
                  <Typography><strong>Priority:</strong> {goalData.priority}</Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Workout Plan</Typography>
                  {goalData.program ? (
                    <Typography>
                      <strong>Program:</strong> {programs.find(p => p._id === goalData.program)?.name}
                    </Typography>
                  ) : (
                    <Typography>
                      <strong>Custom Workouts:</strong> {goalData.customWorkouts.length} selected
                    </Typography>
                  )}
                  <Typography>
                    <strong>Total Scheduled Workouts:</strong> {Object.keys(goalData.workoutSchedule).length}
                  </Typography>
                  <Typography>
                    <strong>Public Goal:</strong> {goalData.isPublic ? 'Yes' : 'No'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {realismCheck && (
              <Grid item xs={12}>
                <Alert 
                  severity={realismCheck.isRealistic ? 'success' : 'warning'}
                  icon={<PsychologyIcon />}
                >
                  <Typography variant="subtitle2">
                    AI Realism Analysis: {realismCheck.realismScore}/100
                  </Typography>
                  <Typography variant="body2">{realismCheck.feedback}</Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>Create New Goal</Typography>
        <Typography variant="body1" color="textSecondary">
          Let's set up a personalized fitness goal with AI-powered realism checking
        </Typography>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 3 }}>
          <Button
            color="inherit"
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          {activeStep === steps.length - 1 ? (
            <Button 
              variant="contained" 
              onClick={createGoal}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Goal'}
            </Button>
          ) : (
            <Button 
              variant="contained" 
              onClick={handleNext}
              disabled={
                (activeStep === 0 && !goalData.title) ||
                (activeStep === 1 && (!goalData.targetValue || !goalData.endDate)) ||
                (activeStep === 2 && !goalData.program && goalData.customWorkouts.length === 0)
              }
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>

      {/* Realism Warning Dialog */}
      <Dialog open={showRealismDialog} onClose={() => setShowRealismDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle display="flex" alignItems="center">
          <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
          Goal Realism Check
        </DialogTitle>
        <DialogContent>
          {realismCheck && (
            <Box>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="h6">Realism Score: {realismCheck.realismScore}/100</Typography>
                <Typography>{realismCheck.feedback}</Typography>
              </Alert>
              
              {realismCheck.warnings && realismCheck.warnings.length > 0 && (
                <Box mb={2}>
                  <Typography variant="h6" gutterBottom>Warnings:</Typography>
                  <List>
                    {realismCheck.warnings.map((warning, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={warning} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              
              {realismCheck.suggestions && realismCheck.suggestions.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>AI Suggestions:</Typography>
                  <List>
                    {realismCheck.suggestions.map((suggestion, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={suggestion} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRealismDialog(false)}>
            I Understand
          </Button>
          <Button variant="contained" onClick={() => setShowRealismDialog(false)}>
            Continue Anyway
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnhancedGoalCreation;
