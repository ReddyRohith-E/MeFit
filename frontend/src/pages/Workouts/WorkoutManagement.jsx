import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Fab,
  Tabs,
  Tab,
  CircularProgress,
  LinearProgress,
  Autocomplete,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';

import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FitnessCenter as FitnessCenterIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
  PlayArrow as PlayArrowIcon,
  ExpandMore as ExpandMoreIcon,
  Timer as TimerIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';

const WORKOUT_TYPES = [
  'strength', 'cardio', 'flexibility', 'sports', 'yoga', 'pilates', 'crossfit', 'mixed'
];

const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'];

const WorkoutManagement = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workoutDialog, setWorkoutDialog] = useState({ open: false, workout: null, mode: 'create' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, workout: null });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    difficulty: '',
    duration: ''
  });

  // Form state for workout creation/editing
  const [workoutForm, setWorkoutForm] = useState({
    name: '',
    description: '',
    type: 'strength',
    difficulty: 'beginner',
    estimatedDuration: '',
    sets: [{ exercise: null, reps: '', weight: '', duration: '', rest: '' }],
    notes: '',
    isPublic: true
  });

  useEffect(() => {
    if (user?.isContributor || user?.isAdmin) {
      fetchWorkouts();
      fetchExercises();
    }
  }, [user]);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/workouts/my/created', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWorkouts(data.workouts || []);
      } else {
        showNotification('Failed to fetch workouts', 'error');
      }
    } catch (error) {
      console.error('Error fetching workouts:', error);
      showNotification('Error loading workouts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchExercises = async () => {
    try {
      const response = await fetch('/api/exercises', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Flatten the grouped exercises into a single array
        const exerciseArray = Object.values(data.exercises || {}).flat();
        setExercises(exerciseArray);
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const handleWorkoutSubmit = async () => {
    try {
      // Validate sets
      const validSets = workoutForm.sets.filter(set => set.exercise);
      if (validSets.length === 0) {
        showNotification('Please add at least one exercise to the workout', 'error');
        return;
      }

      const url = workoutDialog.mode === 'create' 
        ? '/api/workouts' 
        : `/api/workouts/${workoutDialog.workout._id}`;
      
      const method = workoutDialog.mode === 'create' ? 'POST' : 'PATCH';
      
      const workoutData = {
        ...workoutForm,
        sets: validSets.map(set => ({
          exercise: set.exercise._id,
          reps: parseInt(set.reps) || undefined,
          weight: parseFloat(set.weight) || undefined,
          duration: parseInt(set.duration) || undefined,
          rest: parseInt(set.rest) || undefined
        }))
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(workoutData)
      });

      if (response.ok) {
        showNotification(
          `Workout ${workoutDialog.mode === 'create' ? 'created' : 'updated'} successfully`, 
          'success'
        );
        setWorkoutDialog({ open: false, workout: null, mode: 'create' });
        resetForm();
        fetchWorkouts();
      } else {
        const errorData = await response.json();
        showNotification(errorData.message || 'Failed to save workout', 'error');
      }
    } catch (error) {
      console.error('Error saving workout:', error);
      showNotification('Error saving workout', 'error');
    }
  };

  const handleDeleteWorkout = async () => {
    try {
      const response = await fetch(`/api/workouts/${deleteDialog.workout._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        showNotification('Workout deleted successfully', 'success');
        setDeleteDialog({ open: false, workout: null });
        fetchWorkouts();
      } else {
        const errorData = await response.json();
        showNotification(errorData.message || 'Failed to delete workout', 'error');
      }
    } catch (error) {
      console.error('Error deleting workout:', error);
      showNotification('Error deleting workout', 'error');
    }
  };

  const openWorkoutDialog = (workout = null, mode = 'create') => {
    if (workout && mode === 'edit') {
      setWorkoutForm({
        name: workout.name || '',
        description: workout.description || '',
        type: workout.type || 'strength',
        difficulty: workout.difficulty || 'beginner',
        estimatedDuration: workout.estimatedDuration || '',
        sets: workout.sets?.map(set => ({
          exercise: set.exercise,
          reps: set.reps || '',
          weight: set.weight || '',
          duration: set.duration || '',
          rest: set.rest || ''
        })) || [{ exercise: null, reps: '', weight: '', duration: '', rest: '' }],
        notes: workout.notes || '',
        isPublic: workout.isPublic !== false
      });
    } else {
      resetForm();
    }
    setWorkoutDialog({ open: true, workout, mode });
  };

  const resetForm = () => {
    setWorkoutForm({
      name: '',
      description: '',
      type: 'strength',
      difficulty: 'beginner',
      estimatedDuration: '',
      sets: [{ exercise: null, reps: '', weight: '', duration: '', rest: '' }],
      notes: '',
      isPublic: true
    });
  };

  const addSet = () => {
    setWorkoutForm(prev => ({
      ...prev,
      sets: [...prev.sets, { exercise: null, reps: '', weight: '', duration: '', rest: '' }]
    }));
  };

  const updateSet = (index, field, value) => {
    setWorkoutForm(prev => ({
      ...prev,
      sets: prev.sets.map((set, i) => i === index ? { ...set, [field]: value } : set)
    }));
  };

  const removeSet = (index) => {
    setWorkoutForm(prev => ({
      ...prev,
      sets: prev.sets.filter((_, i) => i !== index)
    }));
  };

  const filteredWorkouts = workouts.filter(workout => {
    const matchesSearch = workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workout.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filters.type || workout.type === filters.type;
    const matchesDifficulty = !filters.difficulty || workout.difficulty === filters.difficulty;
    const matchesDuration = !filters.duration || 
                           (filters.duration === 'short' && workout.estimatedDuration <= 30) ||
                           (filters.duration === 'medium' && workout.estimatedDuration > 30 && workout.estimatedDuration <= 60) ||
                           (filters.duration === 'long' && workout.estimatedDuration > 60);

    return matchesSearch && matchesType && matchesDifficulty && matchesDuration;
  });

  if (!user?.isContributor && !user?.isAdmin) {
    return (
      <Box p={3}>
        <Alert severity="warning">
          You need contributor privileges to manage workouts. Please request contributor access from your profile settings.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Workout Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openWorkoutDialog()}
          size="large"
        >
          Create Workout
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justify="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Workouts
                  </Typography>
                  <Typography variant="h4">
                    {workouts.length}
                  </Typography>
                </Box>
                <FitnessCenterIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justify="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Workout Types
                  </Typography>
                  <Typography variant="h4">
                    {new Set(workouts.map(w => w.type)).size}
                  </Typography>
                </Box>
                <FilterListIcon color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justify="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Avg Duration
                  </Typography>
                  <Typography variant="h4">
                    {workouts.length > 0 
                      ? Math.round(workouts.reduce((sum, w) => sum + w.estimatedDuration, 0) / workouts.length)
                      : 0
                    }m
                  </Typography>
                </Box>
                <TimerIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justify="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Sets
                  </Typography>
                  <Typography variant="h4">
                    {workouts.reduce((sum, w) => sum + (w.sets?.length || 0), 0)}
                  </Typography>
                </Box>
                <PlayArrowIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search workouts"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  label="Type"
                >
                  <MenuItem value="">All</MenuItem>
                  {WORKOUT_TYPES.map(type => (
                    <MenuItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Difficulty</InputLabel>
                <Select
                  value={filters.difficulty}
                  onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                  label="Difficulty"
                >
                  <MenuItem value="">All</MenuItem>
                  {DIFFICULTY_LEVELS.map(level => (
                    <MenuItem key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Duration</InputLabel>
                <Select
                  value={filters.duration}
                  onChange={(e) => setFilters(prev => ({ ...prev, duration: e.target.value }))}
                  label="Duration"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="short">Short (≤30 min)</MenuItem>
                  <MenuItem value="medium">Medium (31-60 min)</MenuItem>
                  <MenuItem value="long">Long (&gt;60 min)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setFilters({ type: '', difficulty: '', duration: '' })}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Workouts Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            My Workouts ({filteredWorkouts.length})
          </Typography>
          
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Difficulty</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Exercises</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredWorkouts.map((workout) => (
                    <TableRow key={workout._id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {workout.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {workout.description?.substring(0, 60)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={workout.type.charAt(0).toUpperCase() + workout.type.slice(1)} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={workout.difficulty.charAt(0).toUpperCase() + workout.difficulty.slice(1)} 
                          size="small" 
                          color={
                            workout.difficulty === 'beginner' ? 'success' :
                            workout.difficulty === 'intermediate' ? 'warning' : 'error'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <AccessTimeIcon fontSize="small" color="action" />
                          {workout.estimatedDuration} min
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {workout.sets?.length || 0} exercises
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={() => openWorkoutDialog(workout, 'edit')}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            onClick={() => setDeleteDialog({ open: true, workout })}
                            size="small"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredWorkouts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="textSecondary">
                          {searchTerm || Object.values(filters).some(f => f) 
                            ? 'No workouts match your search criteria' 
                            : 'You haven\'t created any workouts yet'}
                        </Typography>
                        {!searchTerm && !Object.values(filters).some(f => f) && (
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => openWorkoutDialog()}
                            sx={{ mt: 2 }}
                          >
                            Create Your First Workout
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Workout Create/Edit Dialog */}
      <Dialog 
        open={workoutDialog.open} 
        onClose={() => setWorkoutDialog({ open: false, workout: null, mode: 'create' })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {workoutDialog.mode === 'create' ? 'Create New Workout' : 'Edit Workout'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Workout Name"
                  value={workoutForm.name}
                  onChange={(e) => setWorkoutForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Estimated Duration (minutes)"
                  type="number"
                  value={workoutForm.estimatedDuration}
                  onChange={(e) => setWorkoutForm(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={workoutForm.description}
                  onChange={(e) => setWorkoutForm(prev => ({ ...prev, description: e.target.value }))}
                  multiline
                  rows={3}
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={workoutForm.type}
                    onChange={(e) => setWorkoutForm(prev => ({ ...prev, type: e.target.value }))}
                    label="Type"
                  >
                    {WORKOUT_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Difficulty</InputLabel>
                  <Select
                    value={workoutForm.difficulty}
                    onChange={(e) => setWorkoutForm(prev => ({ ...prev, difficulty: e.target.value }))}
                    label="Difficulty"
                  >
                    {DIFFICULTY_LEVELS.map((level) => (
                      <MenuItem key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Visibility</InputLabel>
                  <Select
                    value={workoutForm.isPublic}
                    onChange={(e) => setWorkoutForm(prev => ({ ...prev, isPublic: e.target.value }))}
                    label="Visibility"
                  >
                    <MenuItem value={true}>Public</MenuItem>
                    <MenuItem value={false}>Private</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Exercises
                </Typography>
                {workoutForm.sets.map((set, index) => (
                  <Accordion key={index} sx={{ mb: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>
                        Exercise {index + 1}: {set.exercise?.name || 'Select Exercise'}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Autocomplete
                            options={exercises}
                            getOptionLabel={(option) => option.name}
                            value={set.exercise}
                            onChange={(e, newValue) => updateSet(index, 'exercise', newValue)}
                            renderInput={(params) => (
                              <TextField {...params} label="Exercise" required />
                            )}
                          />
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <TextField
                            fullWidth
                            label="Reps"
                            type="number"
                            value={set.reps}
                            onChange={(e) => updateSet(index, 'reps', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <TextField
                            fullWidth
                            label="Weight (kg)"
                            type="number"
                            value={set.weight}
                            onChange={(e) => updateSet(index, 'weight', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <TextField
                            fullWidth
                            label="Duration (sec)"
                            type="number"
                            value={set.duration}
                            onChange={(e) => updateSet(index, 'duration', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <TextField
                            fullWidth
                            label="Rest (sec)"
                            type="number"
                            value={set.rest}
                            onChange={(e) => updateSet(index, 'rest', e.target.value)}
                          />
                        </Grid>
                        {workoutForm.sets.length > 1 && (
                          <Grid item xs={12}>
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={() => removeSet(index)}
                              startIcon={<DeleteIcon />}
                              size="small"
                            >
                              Remove Exercise
                            </Button>
                          </Grid>
                        )}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}
                <Button
                  variant="outlined"
                  onClick={addSet}
                  startIcon={<AddIcon />}
                  sx={{ mt: 1 }}
                >
                  Add Exercise
                </Button>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes (optional)"
                  value={workoutForm.notes}
                  onChange={(e) => setWorkoutForm(prev => ({ ...prev, notes: e.target.value }))}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setWorkoutDialog({ open: false, workout: null, mode: 'create' })}
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleWorkoutSubmit}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={!workoutForm.name || !workoutForm.description || !workoutForm.estimatedDuration}
          >
            {workoutDialog.mode === 'create' ? 'Create' : 'Save'} Workout
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, workout: null })}
      >
        <DialogTitle>Delete Workout</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.workout?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, workout: null })}>
            Cancel
          </Button>
          <Button onClick={handleDeleteWorkout} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
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

export default WorkoutManagement;
