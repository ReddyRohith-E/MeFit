import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext.jsx';
import LoadingSpinner from '../../components/Common/LoadingSpinner.jsx';
import { goalsAPI } from '../../utils/api.js';
import './GoalDetail.css';

const GoalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchGoal();
  }, [id]);

  const fetchGoal = async () => {
    try {
      setLoading(true);
      const response = await goalsAPI.getGoal(id);
      setGoal(response.data.goal);
    } catch (error) {
      console.error('Error fetching goal:', error);
      setError('Failed to load goal details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await goalsAPI.deleteGoal(id);
      navigate('/goals');
    } catch (error) {
      console.error('Error deleting goal:', error);
      setError('Failed to delete goal');
    }
    setDeleteDialogOpen(false);
  };

  const handleComplete = async () => {
    try {
      await goalsAPI.updateGoal(id, { completed: !goal.completed });
      fetchGoal();
    } catch (error) {
      console.error('Error updating goal:', error);
      setError('Failed to update goal');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Not Started':
        return 'default';
      case 'In Progress':
        return 'primary';
      case 'Completed':
        return 'success';
      case 'Paused':
        return 'warning';
      default:
        return 'default';
    }
  };

  const calculateProgress = () => {
    if (!goal) return 0;
    if (goal.completed) return 100;
    
    const startDate = new Date(goal.startDate);
    const endDate = new Date(goal.endDate);
    const currentDate = new Date();
    
    if (currentDate < startDate) return 0;
    if (currentDate > endDate) return 100;
    
    const totalDuration = endDate - startDate;
    const elapsedDuration = currentDate - startDate;
    
    return Math.min(100, Math.max(0, (elapsedDuration / totalDuration) * 100));
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <Box className="goal-detail-error">
        <Typography color="error" variant="h6">
          {error}
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/goals')}
          className="goal-detail-back-btn"
        >
          Back to Goals
        </Button>
      </Box>
    );
  }

  if (!goal) {
    return (
      <Box className="goal-detail-not-found">
        <Typography variant="h6">Goal not found</Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/goals')}
          className="goal-detail-back-btn"
        >
          Back to Goals
        </Button>
      </Box>
    );
  }

  return (
    <Box className="goal-detail-container">
      <Box className="goal-detail-header">
        <IconButton
          onClick={() => navigate('/goals')}
          className="goal-detail-back-icon"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" className="goal-detail-title">
          Goal Details
        </Typography>
        {user?._id === goal.user && (
          <Box className="goal-detail-actions">
            <IconButton
              color="primary"
              onClick={() => navigate(`/goals/${id}/edit`)}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              color="error"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        )}
      </Box>

      <Card className="goal-detail-card">
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h5" className="goal-detail-name">
                {goal.name}
              </Typography>
              
              <Box className="goal-detail-status-row">
                <Chip
                  label={goal.status}
                  color={getStatusColor(goal.status)}
                  className="goal-detail-status-chip"
                />
                {goal.completed && (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="Completed"
                    color="success"
                    variant="outlined"
                  />
                )}
              </Box>

              {goal.description && (
                <Box className="goal-detail-description">
                  <Typography variant="h6" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {goal.description}
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={4}>
              <Box className="goal-detail-progress">
                <Typography variant="h6" gutterBottom>
                  Progress
                </Typography>
                <Box className="goal-detail-progress-bar">
                  <LinearProgress
                    variant="determinate"
                    value={calculateProgress()}
                    className="progress-bar"
                  />
                  <Typography variant="body2" className="progress-text">
                    {Math.round(calculateProgress())}%
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box className="goal-detail-dates">
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Start Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(goal.startDate).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      End Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(goal.endDate).toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {goal.workouts && goal.workouts.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Associated Workouts
                </Typography>
                <Box className="goal-detail-workouts">
                  {goal.workouts.map((workout) => (
                    <Chip
                      key={workout._id}
                      label={workout.name}
                      onClick={() => navigate(`/workouts/${workout._id}`)}
                      className="workout-chip"
                    />
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>

          {user?._id === goal.user && (
            <Box className="goal-detail-complete-section">
              <Button
                variant={goal.completed ? "outlined" : "contained"}
                color={goal.completed ? "default" : "success"}
                onClick={handleComplete}
                startIcon={<CheckCircleIcon />}
                className="complete-btn"
              >
                {goal.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Goal</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this goal? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GoalDetail;
