import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Autocomplete,
  FormHelperText,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FitnessCenter,
  ExpandMore,
  Search as SearchIcon,
  FilterList,
  Timer,
  Remove as RemoveIcon
} from '@mui/icons-material';
import { workoutsAPI, exercisesAPI } from '../../utils/api';
import LoadingSpinner from '../Common/LoadingSpinner';

const WorkoutManagement = () => {
  const [workouts, setWorkouts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterDuration, setFilterDuration] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    difficulty: 'Beginner',
    estimatedDuration: '',
    category: '',
    equipment: [],
    exercises: [],
    restPeriods: '',
    warmupNotes: '',
    cooldownNotes: '',
    instructions: ''
  });

  const [errors, setErrors] = useState({});

  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
  const categories = [
    'Cardio', 'Strength', 'HIIT', 'Flexibility', 'Core', 'Upper Body',
    'Lower Body', 'Full Body', 'Endurance', 'Power'
  ];

  const equipmentOptions = [
    'None', 'Dumbbells', 'Barbells', 'Resistance Bands', 'Kettlebells',
    'Pull-up Bar', 'Yoga Mat', 'Stability Ball', 'Medicine Ball',
    'Cable Machine', 'Treadmill', 'Stationary Bike'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [workoutsRes, exercisesRes] = await Promise.all([
        workoutsAPI.getWorkouts(),
        exercisesAPI.getExercises()
      ]);
      
      setWorkouts(workoutsRes.data.workouts || []);
      setExercises(exercisesRes.data.exercises || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      difficulty: 'Beginner',
      estimatedDuration: '',
      category: '',
      equipment: [],
      exercises: [],
      restPeriods: '',
      warmupNotes: '',
      cooldownNotes: '',
      instructions: ''
    });
    setErrors({});
    setEditingWorkout(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Workout name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.estimatedDuration || isNaN(formData.estimatedDuration) || formData.estimatedDuration < 1) {
      newErrors.estimatedDuration = 'Valid duration in minutes is required';
    }

    if (formData.exercises.length === 0) {
      newErrors.exercises = 'At least one exercise is required';
    }

    // Validate exercise details
    const exerciseErrors = formData.exercises.some(ex => 
      !ex.sets || !ex.reps || ex.sets < 1 || (ex.reps < 1 && !ex.duration)
    );
    if (exerciseErrors) {
      newErrors.exercises = 'All exercises must have valid sets and reps/duration';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const workoutData = {
        ...formData,
        estimatedDuration: parseInt(formData.estimatedDuration),
        exercises: formData.exercises.map(ex => ({
          exercise: ex.exercise._id || ex.exercise,
          sets: parseInt(ex.sets),
          reps: ex.reps ? parseInt(ex.reps) : undefined,
          duration: ex.duration ? parseInt(ex.duration) : undefined,
          weight: ex.weight ? parseFloat(ex.weight) : undefined,
          restTime: ex.restTime ? parseInt(ex.restTime) : undefined,
          notes: ex.notes || ''
        }))
      };

      if (editingWorkout) {
        await workoutsAPI.updateWorkout(editingWorkout._id, workoutData);
      } else {
        await workoutsAPI.createWorkout(workoutData);
      }

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving workout:', error);
      setErrors({ 
        submit: error.response?.data?.message || 'Failed to save workout' 
      });
    }
  };

  const handleEdit = (workout) => {
    setFormData({
      name: workout.name || '',
      description: workout.description || '',
      difficulty: workout.difficulty || 'Beginner',
      estimatedDuration: workout.estimatedDuration?.toString() || '',
      category: workout.category || '',
      equipment: workout.equipment || [],
      exercises: workout.exercises?.map(ex => ({
        exercise: ex.exercise,
        sets: ex.sets?.toString() || '1',
        reps: ex.reps?.toString() || '',
        duration: ex.duration?.toString() || '',
        weight: ex.weight?.toString() || '',
        restTime: ex.restTime?.toString() || '',
        notes: ex.notes || ''
      })) || [],
      restPeriods: workout.restPeriods || '',
      warmupNotes: workout.warmupNotes || '',
      cooldownNotes: workout.cooldownNotes || '',
      instructions: workout.instructions || ''
    });
    setEditingWorkout(workout);
    setDialogOpen(true);
  };

  const handleDelete = async (workoutId) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      try {
        await workoutsAPI.deleteWorkout(workoutId);
        fetchData();
      } catch (error) {
        console.error('Error deleting workout:', error);
      }
    }
  };

  const addExerciseToWorkout = () => {
    setFormData({
      ...formData,
      exercises: [
        ...formData.exercises,
        {
          exercise: null,
          sets: '1',
          reps: '',
          duration: '',
          weight: '',
          restTime: '',
          notes: ''
        }
      ]
    });
  };

  const updateExerciseInWorkout = (index, field, value) => {
    const newExercises = [...formData.exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setFormData({ ...formData, exercises: newExercises });
  };

  const removeExerciseFromWorkout = (index) => {
    const newExercises = formData.exercises.filter((_, i) => i !== index);
    setFormData({ ...formData, exercises: newExercises });
  };

  const filteredWorkouts = workouts.filter(workout => {
    const matchesSearch = workout.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workout.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = !filterDifficulty || workout.difficulty === filterDifficulty;
    
    let matchesDuration = true;
    if (filterDuration) {
      const duration = workout.estimatedDuration || 0;
      switch (filterDuration) {
        case 'short':
          matchesDuration = duration <= 30;
          break;
        case 'medium':
          matchesDuration = duration > 30 && duration <= 60;
          break;
        case 'long':
          matchesDuration = duration > 60;
          break;
      }
    }
    
    return matchesSearch && matchesDifficulty && matchesDuration;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom display="flex" alignItems="center">
            <Timer sx={{ mr: 2 }} />
            Workout Management - SRS FE-09
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Create and manage workout routines for the MeFit platform
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
        >
          Add Workout
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search workouts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Difficulty</InputLabel>
                <Select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  label="Difficulty"
                >
                  <MenuItem value="">All Difficulties</MenuItem>
                  {difficulties.map(diff => (
                    <MenuItem key={diff} value={diff}>{diff}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Duration</InputLabel>
                <Select
                  value={filterDuration}
                  onChange={(e) => setFilterDuration(e.target.value)}
                  label="Duration"
                >
                  <MenuItem value="">All Durations</MenuItem>
                  <MenuItem value="short">≤30 min</MenuItem>
                  <MenuItem value="medium">31-60 min</MenuItem>
                  <MenuItem value="long">&gt;60 min</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setSearchTerm('');
                  setFilterDifficulty('');
                  setFilterDuration('');
                }}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Workout List */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Difficulty</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Exercises</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredWorkouts.map((workout) => (
              <TableRow key={workout._id}>
                <TableCell>
                  <Typography variant="subtitle2">{workout.name}</Typography>
                  <Typography variant="body2" color="textSecondary" noWrap>
                    {workout.description?.substring(0, 50)}...
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={workout.category} size="small" />
                </TableCell>
                <TableCell>
                  <Chip
                    label={workout.difficulty}
                    size="small"
                    color={
                      workout.difficulty === 'Beginner' ? 'success' :
                      workout.difficulty === 'Intermediate' ? 'warning' : 'error'
                    }
                  />
                </TableCell>
                <TableCell>{workout.estimatedDuration} min</TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {workout.exercises?.length || 0} exercises
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => handleEdit(workout)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(workout._id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredWorkouts.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No workouts found. {searchTerm || filterDifficulty || filterDuration ? 'Try adjusting your filters.' : 'Create your first workout!'}
        </Alert>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {editingWorkout ? 'Edit Workout' : 'Create New Workout'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Workout Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                error={!!errors.description}
                helperText={errors.description}
                multiline
                rows={3}
                required
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth error={!!errors.category}>
                <InputLabel>Category *</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  label="Category *"
                >
                  {categories.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
                {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Difficulty</InputLabel>
                <Select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  label="Difficulty"
                >
                  {difficulties.map(diff => (
                    <MenuItem key={diff} value={diff}>{diff}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Estimated Duration (minutes)"
                type="number"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                error={!!errors.estimatedDuration}
                helperText={errors.estimatedDuration}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={equipmentOptions}
                value={formData.equipment}
                onChange={(_, newValue) => setFormData({ ...formData, equipment: newValue })}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} key={option} />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} label="Equipment" placeholder="Select equipment needed" />
                )}
              />
            </Grid>

            {/* Exercise Configuration */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Exercises *
              </Typography>
              {formData.exercises.map((exerciseItem, index) => (
                <Card key={index} sx={{ mb: 2, p: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <Autocomplete
                        options={exercises}
                        getOptionLabel={(option) => option.name}
                        value={exerciseItem.exercise}
                        onChange={(_, newValue) => updateExerciseInWorkout(index, 'exercise', newValue)}
                        renderInput={(params) => (
                          <TextField {...params} label="Exercise" required />
                        )}
                      />
                    </Grid>

                    <Grid item xs={6} md={2}>
                      <TextField
                        fullWidth
                        label="Sets"
                        type="number"
                        value={exerciseItem.sets}
                        onChange={(e) => updateExerciseInWorkout(index, 'sets', e.target.value)}
                        required
                      />
                    </Grid>

                    <Grid item xs={6} md={2}>
                      <TextField
                        fullWidth
                        label="Reps"
                        type="number"
                        value={exerciseItem.reps}
                        onChange={(e) => updateExerciseInWorkout(index, 'reps', e.target.value)}
                        placeholder="e.g., 12"
                      />
                    </Grid>

                    <Grid item xs={6} md={2}>
                      <TextField
                        fullWidth
                        label="Duration (sec)"
                        type="number"
                        value={exerciseItem.duration}
                        onChange={(e) => updateExerciseInWorkout(index, 'duration', e.target.value)}
                        placeholder="e.g., 30"
                      />
                    </Grid>

                    <Grid item xs={6} md={1}>
                      <TextField
                        fullWidth
                        label="Weight"
                        type="number"
                        value={exerciseItem.weight}
                        onChange={(e) => updateExerciseInWorkout(index, 'weight', e.target.value)}
                        placeholder="lbs"
                      />
                    </Grid>

                    <Grid item xs={12} md={1}>
                      <IconButton
                        onClick={() => removeExerciseFromWorkout(index)}
                        color="error"
                      >
                        <RemoveIcon />
                      </IconButton>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Exercise Notes"
                        value={exerciseItem.notes}
                        onChange={(e) => updateExerciseInWorkout(index, 'notes', e.target.value)}
                        placeholder="Form cues, modifications, etc."
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Card>
              ))}

              <Button
                onClick={addExerciseToWorkout}
                startIcon={<AddIcon />}
                variant="outlined"
                fullWidth
              >
                Add Exercise
              </Button>
              {errors.exercises && (
                <FormHelperText error sx={{ mt: 1 }}>{errors.exercises}</FormHelperText>
              )}
            </Grid>

            {/* Additional Notes */}
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>Additional Workout Details</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Warmup Instructions"
                        value={formData.warmupNotes}
                        onChange={(e) => setFormData({ ...formData, warmupNotes: e.target.value })}
                        multiline
                        rows={2}
                        placeholder="Specific warmup routine for this workout..."
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Cooldown Instructions"
                        value={formData.cooldownNotes}
                        onChange={(e) => setFormData({ ...formData, cooldownNotes: e.target.value })}
                        multiline
                        rows={2}
                        placeholder="Post-workout stretches and recovery..."
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Rest Period Guidelines"
                        value={formData.restPeriods}
                        onChange={(e) => setFormData({ ...formData, restPeriods: e.target.value })}
                        placeholder="e.g., 60-90 seconds between sets, 2-3 minutes between exercises"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="General Instructions"
                        value={formData.instructions}
                        onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                        multiline
                        rows={3}
                        placeholder="Overall workout guidance, safety notes, progressions..."
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {errors.submit && (
              <Grid item xs={12}>
                <Alert severity="error">{errors.submit}</Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingWorkout ? 'Update' : 'Create'} Workout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkoutManagement;
