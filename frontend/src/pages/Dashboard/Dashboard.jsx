import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  IconButton
} from '@mui/material';
import {
  FitnessCenter,
  TrendingUp,
  CalendarToday,
  Timer,
  LocalFireDepartment,
  Add,
  Refresh
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import LoadingSpinner from '../../components/Common/LoadingSpinner.jsx';
import api from '../../utils/api.js';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentDate] = useState(new Date());
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load current goals and recent activities
      const [goalsResponse, workoutsResponse] = await Promise.all([
        api.get('/goals'),
        api.get('/workouts')
      ]);

      const goals = goalsResponse.data.goals || [];
      const workouts = workoutsResponse.data.workouts || [];
      
      // Calculate dashboard statistics
      const currentGoal = goals.find(goal => 
        new Date(goal.startDate) <= new Date() && 
        new Date(goal.endDate) >= new Date()
      );

      const thisWeekStart = new Date();
      thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
      thisWeekStart.setHours(0, 0, 0, 0);

      const thisWeekWorkouts = workouts.filter(workout => 
        new Date(workout.date) >= thisWeekStart
      );

      const completedWorkouts = thisWeekWorkouts.filter(workout => workout.completed);

      const stats = {
        totalGoals: goals.length,
        activeGoals: goals.filter(goal => 
          new Date(goal.startDate) <= new Date() && 
          new Date(goal.endDate) >= new Date()
        ).length,
        completedGoals: goals.filter(goal => goal.achieved).length,
        weeklyWorkouts: thisWeekWorkouts.length,
        completedWeeklyWorkouts: completedWorkouts.length,
        totalWorkouts: workouts.length
      };

      setDashboardData({
        currentGoal,
        stats,
        recentWorkouts: workouts.slice(0, 5),
        upcomingGoals: goals
          .filter(goal => new Date(goal.startDate) > new Date())
          .slice(0, 3)
      });
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDayOfWeek = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[currentDate.getDay()];
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProgressPercentage = (current, target) => {
    if (!target || target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  if (loading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  if (error) {
    return (
      <Box className="dashboard-error">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={loadDashboardData} startIcon={<Refresh />}>
          Retry
        </Button>
      </Box>
    );
  }

  const { currentGoal, stats, recentWorkouts, upcomingGoals } = dashboardData || {};

  return (
    <Box className="dashboard">
      <div className="dashboard-header">
        <Typography variant="h4" className="dashboard-title">
          Welcome back, {user?.firstName || user?.username}!
        </Typography>
        <IconButton onClick={loadDashboardData} className="dashboard-refresh">
          <Refresh />
        </IconButton>
      </div>

      {/* Current Date and Day */}
      <Card className="dashboard-date-card">
        <CardContent>
          <Box className="dashboard-date-content">
            <CalendarToday className="dashboard-date-icon" />
            <Box>
              <Typography variant="h5" className="dashboard-day">
                {getCurrentDayOfWeek()}
              </Typography>
              <Typography variant="body1" className="dashboard-date">
                {formatDate(currentDate)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3} className="dashboard-stats">
        {/* Quick Stats */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard-stat-card">
            <CardContent>
              <Box className="dashboard-stat-content">
                <FitnessCenter className="dashboard-stat-icon primary" />
                <Box>
                  <Typography variant="h4" className="dashboard-stat-number">
                    {stats?.activeGoals || 0}
                  </Typography>
                  <Typography variant="body2" className="dashboard-stat-label">
                    Active Goals
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard-stat-card">
            <CardContent>
              <Box className="dashboard-stat-content">
                <TrendingUp className="dashboard-stat-icon success" />
                <Box>
                  <Typography variant="h4" className="dashboard-stat-number">
                    {stats?.completedGoals || 0}
                  </Typography>
                  <Typography variant="body2" className="dashboard-stat-label">
                    Completed Goals
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard-stat-card">
            <CardContent>
              <Box className="dashboard-stat-content">
                <Timer className="dashboard-stat-icon warning" />
                <Box>
                  <Typography variant="h4" className="dashboard-stat-number">
                    {stats?.completedWeeklyWorkouts || 0}
                  </Typography>
                  <Typography variant="body2" className="dashboard-stat-label">
                    This Week
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard-stat-card">
            <CardContent>
              <Box className="dashboard-stat-content">
                <LocalFireDepartment className="dashboard-stat-icon error" />
                <Box>
                  <Typography variant="h4" className="dashboard-stat-number">
                    {stats?.totalWorkouts || 0}
                  </Typography>
                  <Typography variant="body2" className="dashboard-stat-label">
                    Total Workouts
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} className="dashboard-content">
        {/* Current Goal */}
        <Grid item xs={12} md={8}>
          <Card className="dashboard-goal-card">
            <CardContent>
              <Typography variant="h6" className="dashboard-section-title">
                Current Goal
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {currentGoal ? (
                <Box className="dashboard-current-goal">
                  <Box className="dashboard-goal-header">
                    <Typography variant="h6" className="dashboard-goal-title">
                      {currentGoal.title}
                    </Typography>
                    <Chip 
                      label={currentGoal.type} 
                      color="primary" 
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" className="dashboard-goal-description">
                    {currentGoal.description}
                  </Typography>
                  
                  <Box className="dashboard-goal-progress">
                    <Box className="dashboard-progress-header">
                      <Typography variant="body2">
                        Progress: {currentGoal.currentValue || 0} / {currentGoal.targetValue}
                      </Typography>
                      <Typography variant="body2" className="dashboard-progress-percentage">
                        {Math.round(getProgressPercentage(currentGoal.currentValue, currentGoal.targetValue))}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={getProgressPercentage(currentGoal.currentValue, currentGoal.targetValue)}
                      className="dashboard-progress-bar"
                    />
                  </Box>
                  
                  <Box className="dashboard-goal-actions">
                    <Button 
                      variant="contained" 
                      onClick={() => navigate(`/goals/${currentGoal._id}`)}
                      size="small"
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="outlined" 
                      onClick={() => navigate('/workouts')}
                      size="small"
                    >
                      Log Workout
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box className="dashboard-no-goal">
                  <Typography variant="body1" color="textSecondary" className="dashboard-no-goal-text">
                    No active goals found. Create your first goal to get started!
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => navigate('/goals/create')}
                    startIcon={<Add />}
                    className="dashboard-create-goal-btn"
                  >
                    Create Goal
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card className="dashboard-actions-card">
            <CardContent>
              <Typography variant="h6" className="dashboard-section-title">
                Quick Actions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box className="dashboard-quick-actions">
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/goals/create')}
                  startIcon={<Add />}
                  className="dashboard-action-btn"
                >
                  Create New Goal
                </Button>
                
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/workouts')}
                  startIcon={<FitnessCenter />}
                  className="dashboard-action-btn"
                >
                  Log Workout
                </Button>
                
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/exercises')}
                  startIcon={<FitnessCenter />}
                  className="dashboard-action-btn"
                >
                  Browse Exercises
                </Button>
                
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/programs')}
                  startIcon={<FitnessCenter />}
                  className="dashboard-action-btn"
                >
                  View Programs
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
