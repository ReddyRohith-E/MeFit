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
  FilterList
} from '@mui/icons-material';
import { exercisesAPI } from '../../utils/api';
import LoadingSpinner from '../Common/LoadingSpinner';

const ExerciseManagement = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    difficulty: 'Beginner',
    duration: '',
    equipment: [],
    targetMuscles: [],
    instructions: [''],
    tips: [''],
    modifications: [''],
    safetyNotes: ''
  });

  const [errors, setErrors] = useState({});

  const categories = [
    'Cardio', 'Strength', 'Flexibility', 'Balance', 'Core', 'Upper Body',
    'Lower Body', 'Full Body', 'Functional', 'Rehabilitation'
  ];

  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  const equipmentOptions = [
    'None', 'Dumbbells', 'Barbells', 'Resistance Bands', 'Kettlebells',
    'Pull-up Bar', 'Yoga Mat', 'Stability Ball', 'Medicine Ball',
    'Cable Machine', 'Treadmill', 'Stationary Bike'
  ];

  const muscleGroups = [
    'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Core', 'Abs',
    'Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Full Body'
  ];

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const response = await exercisesAPI.getExercises();
      setExercises(response.data.exercises || []);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      difficulty: 'Beginner',
      duration: '',
      equipment: [],
      targetMuscles: [],
      instructions: [''],
      tips: [''],
      modifications: [''],
      safetyNotes: ''
    });
    setErrors({});
    setEditingExercise(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Exercise name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.duration || isNaN(formData.duration) || formData.duration < 1) {
      newErrors.duration = 'Valid duration in minutes is required';
    }

    if (formData.targetMuscles.length === 0) {
      newErrors.targetMuscles = 'At least one target muscle group is required';
    }

    if (formData.instructions.some(inst => !inst.trim())) {
      newErrors.instructions = 'All instruction steps must be filled';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const exerciseData = {
        ...formData,
        duration: parseInt(formData.duration),
        instructions: formData.instructions.filter(inst => inst.trim()),
        tips: formData.tips.filter(tip => tip.trim()),
        modifications: formData.modifications.filter(mod => mod.trim())
      };

      if (editingExercise) {
        await exercisesAPI.updateExercise(editingExercise._id, exerciseData);
      } else {
        await exercisesAPI.createExercise(exerciseData);
      }

      setDialogOpen(false);
      resetForm();
      fetchExercises();
    } catch (error) {
      console.error('Error saving exercise:', error);
      setErrors({ 
        submit: error.response?.data?.message || 'Failed to save exercise' 
      });
    }
  };

  const handleEdit = (exercise) => {
    setFormData({
      name: exercise.name || '',
      description: exercise.description || '',
      category: exercise.category || '',
      difficulty: exercise.difficulty || 'Beginner',
      duration: exercise.duration?.toString() || '',
      equipment: exercise.equipment || [],
      targetMuscles: exercise.targetMuscles || [],
      instructions: exercise.instructions?.length > 0 ? exercise.instructions : [''],
      tips: exercise.tips?.length > 0 ? exercise.tips : [''],
      modifications: exercise.modifications?.length > 0 ? exercise.modifications : [''],
      safetyNotes: exercise.safetyNotes || ''
    });
    setEditingExercise(exercise);
    setDialogOpen(true);
  };

  const handleDelete = async (exerciseId) => {
    if (window.confirm('Are you sure you want to delete this exercise?')) {
      try {
        await exercisesAPI.deleteExercise(exerciseId);
        fetchExercises();
      } catch (error) {
        console.error('Error deleting exercise:', error);
      }
    }
  };

  const handleArrayFieldChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayField = (field) => {
    setFormData({
      ...formData,
      [field]: [...formData[field], '']
    });
  };

  const removeArrayField = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || exercise.category === filterCategory;
    const matchesDifficulty = !filterDifficulty || exercise.difficulty === filterDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom display="flex" alignItems="center">
            <FitnessCenter sx={{ mr: 2 }} />
            Exercise Management - SRS FE-08
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Create and manage exercise library for the MeFit platform
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
          Add Exercise
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
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
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('');
                  setFilterDifficulty('');
                }}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Exercise List */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Difficulty</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Target Muscles</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredExercises.map((exercise) => (
              <TableRow key={exercise._id}>
                <TableCell>
                  <Typography variant="subtitle2">{exercise.name}</Typography>
                  <Typography variant="body2" color="textSecondary" noWrap>
                    {exercise.description?.substring(0, 50)}...
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={exercise.category} size="small" />
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
                <TableCell>{exercise.duration} min</TableCell>
                <TableCell>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {exercise.targetMuscles?.slice(0, 2).map((muscle, index) => (
                      <Chip key={index} label={muscle} size="small" variant="outlined" />
                    ))}
                    {exercise.targetMuscles?.length > 2 && (
                      <Chip label={`+${exercise.targetMuscles.length - 2}`} size="small" />
                    )}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => handleEdit(exercise)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(exercise._id)}
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

      {filteredExercises.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No exercises found. {searchTerm || filterCategory || filterDifficulty ? 'Try adjusting your filters.' : 'Create your first exercise!'}
        </Alert>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingExercise ? 'Edit Exercise' : 'Create New Exercise'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Exercise Name"
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
                label="Duration (minutes)"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                error={!!errors.duration}
                helperText={errors.duration}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
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
                  <TextField {...params} label="Equipment" placeholder="Select equipment" />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Autocomplete
                multiple
                options={muscleGroups}
                value={formData.targetMuscles}
                onChange={(_, newValue) => setFormData({ ...formData, targetMuscles: newValue })}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} key={option} />
                  ))
                }
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Target Muscles" 
                    placeholder="Select target muscles"
                    error={!!errors.targetMuscles}
                    helperText={errors.targetMuscles}
                    required
                  />
                )}
              />
            </Grid>

            {/* Instructions */}
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>Instructions *</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {formData.instructions.map((instruction, index) => (
                    <Box key={index} display="flex" alignItems="center" mb={1}>
                      <TextField
                        fullWidth
                        label={`Step ${index + 1}`}
                        value={instruction}
                        onChange={(e) => handleArrayFieldChange('instructions', index, e.target.value)}
                        sx={{ mr: 1 }}
                      />
                      <IconButton
                        onClick={() => removeArrayField('instructions', index)}
                        disabled={formData.instructions.length === 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                  <Button onClick={() => addArrayField('instructions')} startIcon={<AddIcon />}>
                    Add Step
                  </Button>
                  {errors.instructions && (
                    <FormHelperText error>{errors.instructions}</FormHelperText>
                  )}
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* Tips */}
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>Tips & Form Cues</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {formData.tips.map((tip, index) => (
                    <Box key={index} display="flex" alignItems="center" mb={1}>
                      <TextField
                        fullWidth
                        label={`Tip ${index + 1}`}
                        value={tip}
                        onChange={(e) => handleArrayFieldChange('tips', index, e.target.value)}
                        sx={{ mr: 1 }}
                      />
                      <IconButton onClick={() => removeArrayField('tips', index)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                  <Button onClick={() => addArrayField('tips')} startIcon={<AddIcon />}>
                    Add Tip
                  </Button>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* Modifications */}
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>Modifications & Progressions</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {formData.modifications.map((modification, index) => (
                    <Box key={index} display="flex" alignItems="center" mb={1}>
                      <TextField
                        fullWidth
                        label={`Modification ${index + 1}`}
                        value={modification}
                        onChange={(e) => handleArrayFieldChange('modifications', index, e.target.value)}
                        sx={{ mr: 1 }}
                      />
                      <IconButton onClick={() => removeArrayField('modifications', index)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                  <Button onClick={() => addArrayField('modifications')} startIcon={<AddIcon />}>
                    Add Modification
                  </Button>
                </AccordionDetails>
              </Accordion>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Safety Notes"
                value={formData.safetyNotes}
                onChange={(e) => setFormData({ ...formData, safetyNotes: e.target.value })}
                multiline
                rows={2}
                placeholder="Important safety considerations or contraindications..."
              />
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
            {editingExercise ? 'Update' : 'Create'} Exercise
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExerciseManagement;
