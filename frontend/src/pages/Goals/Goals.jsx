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
  LinearProgress,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext.jsx';
import LoadingSpinner from '../../components/Common/LoadingSpinner.jsx';
import { goalsAPI } from '../../utils/api.js';
import './Goals.css';

const Goals = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [filteredGoals, setFilteredGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    completed: '',
    search: '',
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [goals, filters]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await goalsAPI.getGoals();
      setGoals(response.data.goals);
    } catch (error) {
      console.error('Error fetching goals:', error);
      setError('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...goals];

    if (filters.search) {
      filtered = filtered.filter(goal =>
        goal.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        goal.description?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter(goal => goal.status === filters.status);
    }

    if (filters.completed !== '') {
      const isCompleted = filters.completed === 'true';
      filtered = filtered.filter(goal => goal.completed === isCompleted);
    }

    setFilteredGoals(filtered);
  };

  const handleDeleteClick = (goal) => {
    setGoalToDelete(goal);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!goalToDelete) return;

    try {
      await goalsAPI.deleteGoal(goalToDelete._id);
      setGoals(goals.filter(g => g._id !== goalToDelete._id));
      setDeleteDialogOpen(false);
      setGoalToDelete(null);
    } catch (error) {
      console.error('Error deleting goal:', error);
      setError('Failed to delete goal');
    }
  };

  const handleComplete = async (goalId, completed) => {
    try {
      await goalsAPI.updateGoal(goalId, { completed: !completed });
      setGoals(goals.map(goal =>
        goal._id === goalId ? { ...goal, completed: !completed } : goal
      ));
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

  const calculateProgress = (goal) => {
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

  const resetFilters = () => {
    setFilters({
      status: '',
      completed: '',
      search: '',
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box className="goals-container">
      <Box className="goals-header">
        <Typography variant="h4" className="goals-title">
          My Goals
        </Typography>
        <Box className="goals-actions">
          <IconButton
            onClick={() => setFilterDialogOpen(true)}
            className="filter-btn"
          >
            <FilterIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/goals/create')}
            className="create-btn"
          >
            Create Goal
          </Button>
        </Box>
      </Box>

      {error && (
        <Box className="goals-error">
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      <Box className="goals-stats">
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Card className="stat-card">
              <CardContent>
                <Typography variant="h6" className="stat-number">
                  {goals.length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Goals
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card className="stat-card">
              <CardContent>
                <Typography variant="h6" className="stat-number">
                  {goals.filter(g => g.completed).length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Completed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card className="stat-card">
              <CardContent>
                <Typography variant="h6" className="stat-number">
                  {goals.filter(g => g.status === 'In Progress').length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  In Progress
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card className="stat-card">
              <CardContent>
                <Typography variant="h6" className="stat-number">
                  {Math.round((goals.filter(g => g.completed).length / (goals.length || 1)) * 100)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Success Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3} className="goals-grid">
        {filteredGoals.length === 0 ? (
          <Grid item xs={12}>
            <Box className="goals-empty">
              <Typography variant="h6" color="textSecondary">
                {goals.length === 0 ? 'No goals created yet' : 'No goals match your filters'}
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/goals/create')}
                className="empty-create-btn"
              >
                Create Your First Goal
              </Button>
            </Box>
          </Grid>
        ) : (
          filteredGoals.map((goal) => (
            <Grid item xs={12} sm={6} md={4} key={goal._id}>
              <Card className="goal-card">
                <CardContent>
                  <Box className="goal-card-header">
                    <Typography variant="h6" className="goal-card-title">
                      {goal.name}
                    </Typography>
                    <Box className="goal-card-actions">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/goals/${goal._id}/edit`)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(goal)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box className="goal-card-status">
                    <Chip
                      label={goal.status}
                      color={getStatusColor(goal.status)}
                      size="small"
                    />
                    {goal.completed && (
                      <CheckCircleIcon color="success" fontSize="small" />
                    )}
                  </Box>

                  {goal.description && (
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      className="goal-card-description"
                    >
                      {goal.description.length > 100
                        ? `${goal.description.substring(0, 100)}...`
                        : goal.description
                      }
                    </Typography>
                  )}

                  <Box className="goal-card-progress">
                    <Typography variant="body2" gutterBottom>
                      Progress: {Math.round(calculateProgress(goal))}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={calculateProgress(goal)}
                      className="progress-bar"
                    />
                  </Box>

                  <Box className="goal-card-dates">
                    <Typography variant="caption" color="textSecondary">
                      {new Date(goal.startDate).toLocaleDateString()} - {new Date(goal.endDate).toLocaleDateString()}
                    </Typography>
                  </Box>

                  <Box className="goal-card-footer">
                    <Button
                      size="small"
                      onClick={() => navigate(`/goals/${goal._id}`)}
                      className="view-btn"
                    >
                      View Details
                    </Button>
                    <Button
                      size="small"
                      variant={goal.completed ? "outlined" : "contained"}
                      color={goal.completed ? "default" : "success"}
                      onClick={() => handleComplete(goal._id, goal.completed)}
                      className="complete-btn"
                    >
                      {goal.completed ? 'Undo' : 'Complete'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Filter Dialog */}
      <Dialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Filter Goals</DialogTitle>
        <DialogContent>
          <Box className="filter-form">
            <TextField
              fullWidth
              label="Search"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Not Started">Not Started</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Paused">Paused</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Completion</InputLabel>
              <Select
                value={filters.completed}
                onChange={(e) => setFilters({ ...filters, completed: e.target.value })}
                label="Completion"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="true">Completed</MenuItem>
                <MenuItem value="false">Not Completed</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetFilters}>Reset</Button>
          <Button onClick={() => setFilterDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Goal</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{goalToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        className="goals-fab"
        onClick={() => navigate('/goals/create')}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default Goals;
