import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  IconButton,
  Chip,
  Autocomplete,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useAuth } from '../../contexts/AuthContext.jsx';
import LoadingSpinner from '../../components/Common/LoadingSpinner.jsx';
import { goalsAPI, workoutsAPI } from '../../utils/api.js';
import './CreateGoal.css';

const CreateGoal = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Not Started',
    startDate: dayjs(),
    endDate: dayjs().add(30, 'day'), // 30 days from now
    workouts: [],
    completed: false,
  });

  const [availableWorkouts, setAvailableWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchWorkouts();
    if (isEditing) {
      fetchGoal();
    }
  }, [id]);

  const fetchWorkouts = async () => {
    try {
      const response = await workoutsAPI.getWorkouts();
      setAvailableWorkouts(response.data.workouts);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    }
  };

  const fetchGoal = async () => {
    try {
      setLoading(true);
      const response = await goalsAPI.getGoal(id);
      const goal = response.data.goal;
      
      setFormData({
        name: goal.name,
        description: goal.description || '',
        status: goal.status,
        startDate: new Date(goal.startDate),
        endDate: new Date(goal.endDate),
        workouts: goal.workouts || [],
        completed: goal.completed || false,
      });
    } catch (error) {
      console.error('Error fetching goal:', error);
      navigate('/goals');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Goal name is required';
    }

    if (formData.startDate >= formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (formData.name.length > 100) {
      newErrors.name = 'Goal name must be less than 100 characters';
    }

    if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const goalData = {
        ...formData,
        workouts: formData.workouts.map(w => w._id || w),
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
      };

      if (isEditing) {
        await goalsAPI.updateGoal(id, goalData);
      } else {
        await goalsAPI.createGoal(goalData);
      }

      navigate('/goals');
    } catch (error) {
      console.error('Error saving goal:', error);
      setErrors({
        submit: error.response?.data?.message || 'Failed to save goal'
      });
    } finally {
      setSubmitting(false);
    }
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

  const handleDateChange = (field) => (date) => {
    setFormData({
      ...formData,
      [field]: date,
    });
    
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: '',
      });
    }
  };

  const handleWorkoutsChange = (event, newValue) => {
    setFormData({
      ...formData,
      workouts: newValue,
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box className="create-goal-container">
        <Box className="create-goal-header">
          <IconButton
            onClick={() => navigate('/goals')}
            className="back-btn"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" className="create-goal-title">
            {isEditing ? 'Edit Goal' : 'Create New Goal'}
          </Typography>
        </Box>

        <Card className="create-goal-card">
          <CardContent>
            <Box component="form" onSubmit={handleSubmit} className="create-goal-form">
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Goal Name"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    error={!!errors.name}
                    helperText={errors.name}
                    required
                    variant="outlined"
                    className="form-field"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={formData.description}
                    onChange={handleInputChange('description')}
                    error={!!errors.description}
                    helperText={errors.description}
                    multiline
                    rows={4}
                    variant="outlined"
                    className="form-field"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined" className="form-field">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status}
                      onChange={handleInputChange('status')}
                      label="Status"
                    >
                      <MenuItem value="Not Started">Not Started</MenuItem>
                      <MenuItem value="In Progress">In Progress</MenuItem>
                      <MenuItem value="Completed">Completed</MenuItem>
                      <MenuItem value="Paused">Paused</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.completed}
                        onChange={(e) => setFormData({
                          ...formData,
                          completed: e.target.checked
                        })}
                        color="primary"
                      />
                    }
                    label="Mark as Completed"
                    className="form-field"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Start Date"
                    value={formData.startDate}
                    onChange={handleDateChange('startDate')}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: "outlined",
                        className: "form-field"
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="End Date"
                    value={formData.endDate}
                    onChange={handleDateChange('endDate')}
                    minDate={formData.startDate}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: "outlined",
                        error: !!errors.endDate,
                        helperText: errors.endDate,
                        className: "form-field"
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    options={availableWorkouts}
                    getOptionLabel={(option) => option.name}
                    value={formData.workouts}
                    onChange={handleWorkoutsChange}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          variant="outlined"
                          label={option.name}
                          {...getTagProps({ index })}
                          key={option._id}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Associated Workouts"
                        placeholder="Select workouts"
                        className="form-field"
                      />
                    )}
                  />
                </Grid>

                {errors.submit && (
                  <Grid item xs={12}>
                    <Box className="error-message">
                      <Typography color="error">
                        {errors.submit}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Box className="form-actions">
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/goals')}
                      className="cancel-btn"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={submitting}
                      startIcon={<SaveIcon />}
                      className="submit-btn"
                    >
                      {submitting ? 'Saving...' : (isEditing ? 'Update Goal' : 'Create Goal')}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </LocalizationProvider>
  );
};

export default CreateGoal;
