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
  LinearProgress
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
  PlayArrow as PlayArrowIcon
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';

const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Glutes', 'Calves', 'Forearms', 'Full Body'
];

const EQUIPMENT_TYPES = [
  'None', 'Dumbbells', 'Barbell', 'Resistance Bands', 'Cable Machine', 
  'Pull-up Bar', 'Bench', 'Kettlebell', 'Medicine Ball', 'Treadmill', 'Stationary Bike'
];

const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const ExerciseManagement = () => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [exerciseDialog, setExerciseDialog] = useState({ open: false, exercise: null, mode: 'create' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, exercise: null });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    muscleGroup: '',
    equipment: '',
    difficulty: ''
  });

  // Form state for exercise creation/editing
  const [exerciseForm, setExerciseForm] = useState({
    name: '',
    description: '',
    instructions: [''],
    category: '',
    muscleGroups: [],
    equipment: [],
    difficulty: 'Beginner',
    duration: '',
    calories: '',
    videoUrl: '',
    imageUrl: ''
  });

  useEffect(() => {
    if (user?.isContributor || user?.isAdmin) {
      fetchExercises();
    }
  }, [user]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/exercises/my/created', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setExercises(data.exercises || []);
      } else {
        showNotification('Failed to fetch exercises', 'error');
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
      showNotification('Error loading exercises', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const handleExerciseSubmit = async () => {
    try {
      const url = exerciseDialog.mode === 'create' 
        ? '/api/exercises' 
        : `/api/exercises/${exerciseDialog.exercise._id}`;
      
      const method = exerciseDialog.mode === 'create' ? 'POST' : 'PATCH';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...exerciseForm,
          instructions: exerciseForm.instructions.filter(instruction => instruction.trim() !== '')
        })
      });

      if (response.ok) {
        showNotification(
          `Exercise ${exerciseDialog.mode === 'create' ? 'created' : 'updated'} successfully`, 
          'success'
        );
        setExerciseDialog({ open: false, exercise: null, mode: 'create' });
        resetForm();
        fetchExercises();
      } else {
        const errorData = await response.json();
        showNotification(errorData.message || 'Failed to save exercise', 'error');
      }
    } catch (error) {
      console.error('Error saving exercise:', error);
      showNotification('Error saving exercise', 'error');
    }
  };

  const handleDeleteExercise = async () => {
    try {
      const response = await fetch(`/api/exercises/${deleteDialog.exercise._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        showNotification('Exercise deleted successfully', 'success');
        setDeleteDialog({ open: false, exercise: null });
        fetchExercises();
      } else {
        const errorData = await response.json();
        showNotification(errorData.message || 'Failed to delete exercise', 'error');
      }
    } catch (error) {
      console.error('Error deleting exercise:', error);
      showNotification('Error deleting exercise', 'error');
    }
  };

  const openExerciseDialog = (exercise = null, mode = 'create') => {
    if (exercise && mode === 'edit') {
      setExerciseForm({
        name: exercise.name || '',
        description: exercise.description || '',
        instructions: exercise.instructions || [''],
        category: exercise.category || '',
        muscleGroups: exercise.muscleGroups || [],
        equipment: exercise.equipment || [],
        difficulty: exercise.difficulty || 'Beginner',
        duration: exercise.duration || '',
        calories: exercise.calories || '',
        videoUrl: exercise.videoUrl || '',
        imageUrl: exercise.imageUrl || ''
      });
    } else {
      resetForm();
    }
    setExerciseDialog({ open: true, exercise, mode });
  };

  const resetForm = () => {
    setExerciseForm({
      name: '',
      description: '',
      instructions: [''],
      category: '',
      muscleGroups: [],
      equipment: [],
      difficulty: 'Beginner',
      duration: '',
      calories: '',
      videoUrl: '',
      imageUrl: ''
    });
  };

  const addInstruction = () => {
    setExerciseForm(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const updateInstruction = (index, value) => {
    setExerciseForm(prev => ({
      ...prev,
      instructions: prev.instructions.map((instruction, i) => i === index ? value : instruction)
    }));
  };

  const removeInstruction = (index) => {
    setExerciseForm(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filters.category || exercise.category === filters.category;
    const matchesMuscleGroup = !filters.muscleGroup || exercise.muscleGroups.includes(filters.muscleGroup);
    const matchesEquipment = !filters.equipment || exercise.equipment.includes(filters.equipment);
    const matchesDifficulty = !filters.difficulty || exercise.difficulty === filters.difficulty;

    return matchesSearch && matchesCategory && matchesMuscleGroup && matchesEquipment && matchesDifficulty;
  });

  if (!user?.isContributor && !user?.isAdmin) {
    return (
      <Box p={3}>
        <Alert severity="warning">
          You need contributor privileges to manage exercises. Please request contributor access from your profile settings.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Exercise Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openExerciseDialog()}
          size="large"
        >
          Create Exercise
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
                    Total Exercises
                  </Typography>
                  <Typography variant="h4">
                    {exercises.length}
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
                    Categories
                  </Typography>
                  <Typography variant="h4">
                    {new Set(exercises.map(e => e.category)).size}
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
                    Muscle Groups
                  </Typography>
                  <Typography variant="h4">
                    {new Set(exercises.flatMap(e => e.muscleGroups)).size}
                  </Typography>
                </Box>
                <PlayArrowIcon color="success" sx={{ fontSize: 40 }} />
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
                    Equipment Types
                  </Typography>
                  <Typography variant="h4">
                    {new Set(exercises.flatMap(e => e.equipment)).size}
                  </Typography>
                </Box>
                <VisibilityIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Search exercises"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Muscle Group</InputLabel>
                <Select
                  value={filters.muscleGroup}
                  onChange={(e) => setFilters(prev => ({ ...prev, muscleGroup: e.target.value }))}
                  label="Muscle Group"
                >
                  <MenuItem value="">All</MenuItem>
                  {MUSCLE_GROUPS.map(group => (
                    <MenuItem key={group} value={group}>{group}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Equipment</InputLabel>
                <Select
                  value={filters.equipment}
                  onChange={(e) => setFilters(prev => ({ ...prev, equipment: e.target.value }))}
                  label="Equipment"
                >
                  <MenuItem value="">All</MenuItem>
                  {EQUIPMENT_TYPES.map(equipment => (
                    <MenuItem key={equipment} value={equipment}>{equipment}</MenuItem>
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
                    <MenuItem key={level} value={level}>{level}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setFilters({ category: '', muscleGroup: '', equipment: '', difficulty: '' })}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Exercises Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            My Exercises ({filteredExercises.length})
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
                    <TableCell>Category</TableCell>
                    <TableCell>Muscle Groups</TableCell>
                    <TableCell>Equipment</TableCell>
                    <TableCell>Difficulty</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredExercises.map((exercise) => (
                    <TableRow key={exercise._id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {exercise.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {exercise.description?.substring(0, 60)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={exercise.category} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" flexWrap="wrap" gap={0.5}>
                          {exercise.muscleGroups?.slice(0, 2).map((group, index) => (
                            <Chip key={index} label={group} size="small" />
                          ))}
                          {exercise.muscleGroups?.length > 2 && (
                            <Chip 
                              label={`+${exercise.muscleGroups.length - 2}`} 
                              size="small" 
                              variant="outlined" 
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" flexWrap="wrap" gap={0.5}>
                          {exercise.equipment?.slice(0, 2).map((item, index) => (
                            <Chip key={index} label={item} size="small" color="info" variant="outlined" />
                          ))}
                          {exercise.equipment?.length > 2 && (
                            <Chip 
                              label={`+${exercise.equipment.length - 2}`} 
                              size="small" 
                              variant="outlined" 
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={exercise.difficulty} 
                          size="small" 
                          color={
                            exercise.difficulty === 'Beginner' ? 'success' :
                            exercise.difficulty === 'Intermediate' ? 'warning' : 'error'
                          }
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={() => openExerciseDialog(exercise, 'edit')}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            onClick={() => setDeleteDialog({ open: true, exercise })}
                            size="small"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredExercises.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="textSecondary">
                          {searchTerm || Object.values(filters).some(f => f) 
                            ? 'No exercises match your search criteria' 
                            : 'You haven\'t created any exercises yet'}
                        </Typography>
                        {!searchTerm && !Object.values(filters).some(f => f) && (
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => openExerciseDialog()}
                            sx={{ mt: 2 }}
                          >
                            Create Your First Exercise
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

      {/* Exercise Create/Edit Dialog */}
      <Dialog 
        open={exerciseDialog.open} 
        onClose={() => setExerciseDialog({ open: false, exercise: null, mode: 'create' })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {exerciseDialog.mode === 'create' ? 'Create New Exercise' : 'Edit Exercise'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Exercise Name"
                  value={exerciseForm.name}
                  onChange={(e) => setExerciseForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Category"
                  value={exerciseForm.category}
                  onChange={(e) => setExerciseForm(prev => ({ ...prev, category: e.target.value }))}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={exerciseForm.description}
                  onChange={(e) => setExerciseForm(prev => ({ ...prev, description: e.target.value }))}
                  multiline
                  rows={3}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Muscle Groups</InputLabel>
                  <Select
                    multiple
                    value={exerciseForm.muscleGroups}
                    onChange={(e) => setExerciseForm(prev => ({ ...prev, muscleGroups: e.target.value }))}
                    input={<OutlinedInput label="Muscle Groups" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {MUSCLE_GROUPS.map((group) => (
                      <MenuItem key={group} value={group}>
                        {group}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Equipment</InputLabel>
                  <Select
                    multiple
                    value={exerciseForm.equipment}
                    onChange={(e) => setExerciseForm(prev => ({ ...prev, equipment: e.target.value }))}
                    input={<OutlinedInput label="Equipment" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {EQUIPMENT_TYPES.map((equipment) => (
                      <MenuItem key={equipment} value={equipment}>
                        {equipment}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Difficulty</InputLabel>
                  <Select
                    value={exerciseForm.difficulty}
                    onChange={(e) => setExerciseForm(prev => ({ ...prev, difficulty: e.target.value }))}
                    label="Difficulty"
                  >
                    {DIFFICULTY_LEVELS.map((level) => (
                      <MenuItem key={level} value={level}>{level}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Duration (minutes)"
                  type="number"
                  value={exerciseForm.duration}
                  onChange={(e) => setExerciseForm(prev => ({ ...prev, duration: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Calories (estimate)"
                  type="number"
                  value={exerciseForm.calories}
                  onChange={(e) => setExerciseForm(prev => ({ ...prev, calories: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Video URL (optional)"
                  value={exerciseForm.videoUrl}
                  onChange={(e) => setExerciseForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Image URL (optional)"
                  value={exerciseForm.imageUrl}
                  onChange={(e) => setExerciseForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Instructions
                </Typography>
                {exerciseForm.instructions.map((instruction, index) => (
                  <Box key={index} display="flex" alignItems="center" gap={1} mb={1}>
                    <TextField
                      fullWidth
                      label={`Step ${index + 1}`}
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      multiline
                    />
                    {exerciseForm.instructions.length > 1 && (
                      <IconButton onClick={() => removeInstruction(index)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}
                <Button
                  variant="outlined"
                  onClick={addInstruction}
                  startIcon={<AddIcon />}
                  size="small"
                >
                  Add Step
                </Button>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setExerciseDialog({ open: false, exercise: null, mode: 'create' })}
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleExerciseSubmit}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={!exerciseForm.name || !exerciseForm.category || !exerciseForm.description}
          >
            {exerciseDialog.mode === 'create' ? 'Create' : 'Save'} Exercise
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, exercise: null })}
      >
        <DialogTitle>Delete Exercise</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.exercise?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, exercise: null })}>
            Cancel
          </Button>
          <Button onClick={handleDeleteExercise} color="error" variant="contained">
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

export default ExerciseManagement;
