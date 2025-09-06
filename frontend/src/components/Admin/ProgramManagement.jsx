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
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assessment,
  ExpandMore,
  Search as SearchIcon,
  FilterList,
  Schedule,
  Remove as RemoveIcon,
  Reorder as ReorderIcon
} from '@mui/icons-material';
import { programsAPI, workoutsAPI } from '../../utils/api';
import LoadingSpinner from '../Common/LoadingSpinner';

const ProgramManagement = () => {
  const [programs, setPrograms] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterDuration, setFilterDuration] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    difficulty: 'Beginner',
    durationWeeks: '',
    category: '',
    goals: [],
    targetAudience: '',
    schedule: [],
    prerequisites: '',
    overview: '',
    expectations: ''
  });

  const [errors, setErrors] = useState({});

  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
  const categories = [
    'Weight Loss', 'Muscle Building', 'Strength', 'Endurance', 'Flexibility',
    'Rehabilitation', 'Sports Performance', 'General Fitness', 'Conditioning'
  ];

  const fitnessGoals = [
    'Weight Loss', 'Muscle Gain', 'Strength Building', 'Endurance Improvement',
    'Flexibility Enhancement', 'Core Strengthening', 'Cardiovascular Health',
    'Posture Improvement', 'Athletic Performance', 'Injury Prevention'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [programsRes, workoutsRes] = await Promise.all([
        programsAPI.getPrograms(),
        workoutsAPI.getWorkouts()
      ]);
      
      setPrograms(programsRes.data.programs || []);
      setWorkouts(workoutsRes.data.workouts || []);
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
      durationWeeks: '',
      category: '',
      goals: [],
      targetAudience: '',
      schedule: [],
      prerequisites: '',
      overview: '',
      expectations: ''
    });
    setErrors({});
    setEditingProgram(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Program name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.durationWeeks || isNaN(formData.durationWeeks) || formData.durationWeeks < 1) {
      newErrors.durationWeeks = 'Valid duration in weeks is required';
    }

    if (formData.goals.length === 0) {
      newErrors.goals = 'At least one fitness goal is required';
    }

    if (formData.schedule.length === 0) {
      newErrors.schedule = 'Program schedule is required';
    }

    // Validate schedule items
    const scheduleErrors = formData.schedule.some(week => 
      week.workouts.length === 0 || !week.weekNumber
    );
    if (scheduleErrors) {
      newErrors.schedule = 'All weeks must have at least one workout';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const programData = {
        ...formData,
        durationWeeks: parseInt(formData.durationWeeks),
        schedule: formData.schedule.map(week => ({
          weekNumber: parseInt(week.weekNumber),
          workouts: week.workouts.map(w => ({
            workout: w.workout._id || w.workout,
            dayOfWeek: w.dayOfWeek,
            notes: w.notes || ''
          })),
          weeklyGoals: week.weeklyGoals || '',
          notes: week.notes || ''
        }))
      };

      if (editingProgram) {
        await programsAPI.updateProgram(editingProgram._id, programData);
      } else {
        await programsAPI.createProgram(programData);
      }

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving program:', error);
      setErrors({ 
        submit: error.response?.data?.message || 'Failed to save program' 
      });
    }
  };

  const handleEdit = (program) => {
    setFormData({
      name: program.name || '',
      description: program.description || '',
      difficulty: program.difficulty || 'Beginner',
      durationWeeks: program.durationWeeks?.toString() || '',
      category: program.category || '',
      goals: program.goals || [],
      targetAudience: program.targetAudience || '',
      schedule: program.schedule?.map(week => ({
        weekNumber: week.weekNumber?.toString() || '1',
        workouts: week.workouts?.map(w => ({
          workout: w.workout,
          dayOfWeek: w.dayOfWeek || 1,
          notes: w.notes || ''
        })) || [],
        weeklyGoals: week.weeklyGoals || '',
        notes: week.notes || ''
      })) || [],
      prerequisites: program.prerequisites || '',
      overview: program.overview || '',
      expectations: program.expectations || ''
    });
    setEditingProgram(program);
    setDialogOpen(true);
  };

  const handleDelete = async (programId) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      try {
        await programsAPI.deleteProgram(programId);
        fetchData();
      } catch (error) {
        console.error('Error deleting program:', error);
      }
    }
  };

  const addWeekToSchedule = () => {
    const newWeekNumber = formData.schedule.length + 1;
    setFormData({
      ...formData,
      schedule: [
        ...formData.schedule,
        {
          weekNumber: newWeekNumber.toString(),
          workouts: [],
          weeklyGoals: '',
          notes: ''
        }
      ]
    });
  };

  const addWorkoutToWeek = (weekIndex) => {
    const newSchedule = [...formData.schedule];
    newSchedule[weekIndex].workouts.push({
      workout: null,
      dayOfWeek: 1,
      notes: ''
    });
    setFormData({ ...formData, schedule: newSchedule });
  };

  const updateWeekData = (weekIndex, field, value) => {
    const newSchedule = [...formData.schedule];
    newSchedule[weekIndex] = { ...newSchedule[weekIndex], [field]: value };
    setFormData({ ...formData, schedule: newSchedule });
  };

  const updateWorkoutInWeek = (weekIndex, workoutIndex, field, value) => {
    const newSchedule = [...formData.schedule];
    newSchedule[weekIndex].workouts[workoutIndex] = {
      ...newSchedule[weekIndex].workouts[workoutIndex],
      [field]: value
    };
    setFormData({ ...formData, schedule: newSchedule });
  };

  const removeWorkoutFromWeek = (weekIndex, workoutIndex) => {
    const newSchedule = [...formData.schedule];
    newSchedule[weekIndex].workouts.splice(workoutIndex, 1);
    setFormData({ ...formData, schedule: newSchedule });
  };

  const removeWeekFromSchedule = (weekIndex) => {
    const newSchedule = formData.schedule.filter((_, i) => i !== weekIndex);
    // Renumber weeks
    newSchedule.forEach((week, index) => {
      week.weekNumber = (index + 1).toString();
    });
    setFormData({ ...formData, schedule: newSchedule });
  };

  const getDayName = (dayNumber) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber] || 'Unknown';
  };

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = !filterDifficulty || program.difficulty === filterDifficulty;
    
    let matchesDuration = true;
    if (filterDuration) {
      const duration = program.durationWeeks || 0;
      switch (filterDuration) {
        case 'short':
          matchesDuration = duration <= 4;
          break;
        case 'medium':
          matchesDuration = duration > 4 && duration <= 12;
          break;
        case 'long':
          matchesDuration = duration > 12;
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
            <Assessment sx={{ mr: 2 }} />
            Program Management - SRS FE-10
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Create and manage comprehensive fitness programs for the MeFit platform
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
          Add Program
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search programs..."
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
                  <MenuItem value="short">≤4 weeks</MenuItem>
                  <MenuItem value="medium">5-12 weeks</MenuItem>
                  <MenuItem value="long">&gt;12 weeks</MenuItem>
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

      {/* Program List */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Difficulty</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Goals</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPrograms.map((program) => (
              <TableRow key={program._id}>
                <TableCell>
                  <Typography variant="subtitle2">{program.name}</Typography>
                  <Typography variant="body2" color="textSecondary" noWrap>
                    {program.description?.substring(0, 50)}...
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={program.category} size="small" />
                </TableCell>
                <TableCell>
                  <Chip
                    label={program.difficulty}
                    size="small"
                    color={
                      program.difficulty === 'Beginner' ? 'success' :
                      program.difficulty === 'Intermediate' ? 'warning' : 'error'
                    }
                  />
                </TableCell>
                <TableCell>{program.durationWeeks} weeks</TableCell>
                <TableCell>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {program.goals?.slice(0, 2).map((goal, index) => (
                      <Chip key={index} label={goal} size="small" variant="outlined" />
                    ))}
                    {program.goals?.length > 2 && (
                      <Chip label={`+${program.goals.length - 2}`} size="small" />
                    )}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => handleEdit(program)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(program._id)}
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

      {filteredPrograms.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No programs found. {searchTerm || filterDifficulty || filterDuration ? 'Try adjusting your filters.' : 'Create your first program!'}
        </Alert>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xl" fullWidth>
        <DialogTitle>
          {editingProgram ? 'Edit Program' : 'Create New Program'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Basic Information</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Program Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Target Audience"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                placeholder="e.g., Beginners, Athletes, Seniors"
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
                label="Duration (weeks)"
                type="number"
                value={formData.durationWeeks}
                onChange={(e) => setFormData({ ...formData, durationWeeks: e.target.value })}
                error={!!errors.durationWeeks}
                helperText={errors.durationWeeks}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={fitnessGoals}
                value={formData.goals}
                onChange={(_, newValue) => setFormData({ ...formData, goals: newValue })}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} key={option} />
                  ))
                }
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Fitness Goals" 
                    placeholder="Select program goals"
                    error={!!errors.goals}
                    helperText={errors.goals}
                    required
                  />
                )}
              />
            </Grid>

            {/* Program Schedule */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                <Schedule sx={{ mr: 1 }} />
                Program Schedule *
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Stepper orientation="vertical">
                {formData.schedule.map((week, weekIndex) => (
                  <Step key={weekIndex} active={true}>
                    <StepLabel>
                      Week {week.weekNumber}
                      <IconButton
                        size="small"
                        onClick={() => removeWeekFromSchedule(weekIndex)}
                        color="error"
                        sx={{ ml: 1 }}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                    </StepLabel>
                    <StepContent>
                      <Card sx={{ p: 2, mb: 2 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Weekly Goals"
                              value={week.weeklyGoals}
                              onChange={(e) => updateWeekData(weekIndex, 'weeklyGoals', e.target.value)}
                              placeholder="What should be achieved this week?"
                              size="small"
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                              Workouts
                            </Typography>
                            {week.workouts.map((workout, workoutIndex) => (
                              <Card key={workoutIndex} sx={{ mb: 1, p: 1 }}>
                                <Grid container spacing={1} alignItems="center">
                                  <Grid item xs={12} sm={5}>
                                    <Autocomplete
                                      options={workouts}
                                      getOptionLabel={(option) => option.name}
                                      value={workout.workout}
                                      onChange={(_, newValue) => updateWorkoutInWeek(weekIndex, workoutIndex, 'workout', newValue)}
                                      renderInput={(params) => (
                                        <TextField {...params} label="Workout" size="small" />
                                      )}
                                    />
                                  </Grid>

                                  <Grid item xs={12} sm={3}>
                                    <FormControl fullWidth size="small">
                                      <InputLabel>Day</InputLabel>
                                      <Select
                                        value={workout.dayOfWeek}
                                        onChange={(e) => updateWorkoutInWeek(weekIndex, workoutIndex, 'dayOfWeek', e.target.value)}
                                        label="Day"
                                      >
                                        {[0, 1, 2, 3, 4, 5, 6].map(day => (
                                          <MenuItem key={day} value={day}>{getDayName(day)}</MenuItem>
                                        ))}
                                      </Select>
                                    </FormControl>
                                  </Grid>

                                  <Grid item xs={12} sm={3}>
                                    <TextField
                                      fullWidth
                                      label="Notes"
                                      value={workout.notes}
                                      onChange={(e) => updateWorkoutInWeek(weekIndex, workoutIndex, 'notes', e.target.value)}
                                      size="small"
                                      placeholder="Optional notes"
                                    />
                                  </Grid>

                                  <Grid item xs={12} sm={1}>
                                    <IconButton
                                      onClick={() => removeWorkoutFromWeek(weekIndex, workoutIndex)}
                                      color="error"
                                      size="small"
                                    >
                                      <RemoveIcon />
                                    </IconButton>
                                  </Grid>
                                </Grid>
                              </Card>
                            ))}

                            <Button
                              onClick={() => addWorkoutToWeek(weekIndex)}
                              startIcon={<AddIcon />}
                              size="small"
                              variant="outlined"
                            >
                              Add Workout
                            </Button>
                          </Grid>

                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Week Notes"
                              value={week.notes}
                              onChange={(e) => updateWeekData(weekIndex, 'notes', e.target.value)}
                              multiline
                              rows={2}
                              size="small"
                              placeholder="Additional notes for this week..."
                            />
                          </Grid>
                        </Grid>
                      </Card>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>

              <Button
                onClick={addWeekToSchedule}
                startIcon={<AddIcon />}
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
              >
                Add Week
              </Button>
              {errors.schedule && (
                <FormHelperText error sx={{ mt: 1 }}>{errors.schedule}</FormHelperText>
              )}
            </Grid>

            {/* Additional Information */}
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>Additional Program Details</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Program Overview"
                        value={formData.overview}
                        onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                        multiline
                        rows={3}
                        placeholder="Detailed overview of the program structure and methodology..."
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Prerequisites"
                        value={formData.prerequisites}
                        onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                        multiline
                        rows={2}
                        placeholder="Required fitness level, experience, equipment, etc..."
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Expected Outcomes"
                        value={formData.expectations}
                        onChange={(e) => setFormData({ ...formData, expectations: e.target.value })}
                        multiline
                        rows={3}
                        placeholder="What participants can expect to achieve by completing this program..."
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
            {editingProgram ? 'Update' : 'Create'} Program
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProgramManagement;
