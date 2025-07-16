import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  IconButton,
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FitnessCenter as FitnessIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext.jsx';
import LoadingSpinner from '../../components/Common/LoadingSpinner.jsx';
import { workoutsAPI } from '../../utils/api.js';
import './Workouts.css';

const Workouts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const response = await workoutsAPI.getWorkouts();
      setWorkouts(response.data.workouts);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      setError('Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box className="workouts-container">
      <Box className="workouts-header">
        <Typography variant="h4" className="workouts-title">
          Workouts
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/workouts/create')}
          className="create-btn"
        >
          Create Workout
        </Button>
      </Box>

      {error && (
        <Box className="workouts-error">
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      <Grid container spacing={3}>
        {workouts.length === 0 ? (
          <Grid item xs={12}>
            <Box className="workouts-empty">
              <FitnessIcon className="empty-icon" />
              <Typography variant="h6" color="textSecondary">
                No workouts found
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/workouts/create')}
                className="empty-create-btn"
              >
                Create Your First Workout
              </Button>
            </Box>
          </Grid>
        ) : (
          workouts.map((workout) => (
            <Grid item xs={12} sm={6} md={4} key={workout._id}>
              <Card className="workout-card">
                <CardContent>
                  <Box className="workout-card-header">
                    <Typography variant="h6" className="workout-card-title">
                      {workout.name}
                    </Typography>
                    <Box className="workout-card-actions">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/workouts/${workout._id}/edit`)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  {workout.description && (
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      className="workout-card-description"
                    >
                      {workout.description.length > 100
                        ? `${workout.description.substring(0, 100)}...`
                        : workout.description
                      }
                    </Typography>
                  )}

                  <Box className="workout-card-footer">
                    <Button
                      size="small"
                      onClick={() => navigate(`/workouts/${workout._id}`)}
                      className="view-btn"
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Fab
        color="primary"
        className="workouts-fab"
        onClick={() => navigate('/workouts/create')}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default Workouts;
