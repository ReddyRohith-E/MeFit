import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Divider,
  CircularProgress,
  Grid,
  Alert
} from '@mui/material';

import {
  TrendingUp as TrendingUpIcon,
  FitnessCenter as FitnessCenterIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarTodayIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  LocalFireDepartment as LocalFireDepartmentIcon,
  Timer as TimerIcon,
  EmojiEvents as EmojiEventsIcon,
  Today as TodayIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';

const EnhancedDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [currentGoal, setCurrentGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
    fetchCurrentGoal();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      // Updated to use SRS-compliant singular API paths
      const response = await fetch('/goal/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchCurrentGoal = async () => {
    try {
      const token = localStorage.getItem('token');
      // Updated to use SRS-compliant singular API paths
      const response = await fetch('/goal/current', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentGoal(data.goal);
      }
    } catch (error) {
      console.error('Error fetching current goal:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = () => {
    if (!currentGoal) return 0;
    const today = new Date();
    const endDate = new Date(currentGoal.endDate);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getTodaysWorkout = () => {
    if (!currentGoal?.workouts) return null;
    const today = new Date().toDateString();
    return currentGoal.workouts.find(workout => {
      const workoutDate = new Date(workout.scheduledDate);
      return workoutDate.toDateString() === today;
    });
  };

  const getMotivationalMessage = () => {
    if (!currentGoal) {
      return "Ready to start your fitness journey? Set your first goal!";
    }

    const completionPercentage = currentGoal.progress?.completionPercentage || 0;
    const daysLeft = getDaysRemaining();

    if (completionPercentage === 100) {
      return "🎉 Goal completed! Time for a new challenge!";
    } else if (daysLeft === 0) {
      return "⏰ Goal deadline reached. How did you do?";
    } else if (daysLeft <= 3) {
      return `⚡ Final push! ${daysLeft} days remaining!`;
    } else if (completionPercentage >= 75) {
      return "🔥 Almost there! You're crushing it!";
    } else if (completionPercentage >= 50) {
      return "💪 Halfway there! Keep up the momentum!";
    } else if (completionPercentage >= 25) {
      return "🌟 Great progress! Stay consistent!";
    } else {
      return "🚀 Every journey begins with a single step!";
    }
  };

  const getWeekDays = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay()); // Start of week (Sunday)
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getWorkoutsForDate = (date) => {
    if (!currentGoal) return [];
    
    return currentGoal.workouts.filter(workout => {
      const workoutDate = new Date(workout.scheduledDate);
      return workoutDate.toDateString() === date.toDateString();
    });
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const isToday = (date) => {
    return date.toDateString() === new Date().toDateString();
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDayName = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const weekDays = getWeekDays();
  const weekProgress = dashboardData?.stats?.weekProgress || { completed: 0, total: 0, percentage: 0 };
  const todaysWorkout = getTodaysWorkout();

  return (
    <Box>
      {/* Motivational Header */}
      {currentGoal && (
        <Alert 
          severity="info" 
          sx={{ mb: 3, fontSize: '1.1rem' }}
          icon={<TodayIcon fontSize="inherit" />}
        >
          <Typography variant="h6" component="div">
            {getMotivationalMessage()}
          </Typography>
          {getDaysRemaining() > 0 && (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
              {getDaysRemaining()} days remaining in your current goal
            </Typography>
          )}
        </Alert>
      )}

      {/* Today's Workout Card */}
      {todaysWorkout && (
        <Card sx={{ mb: 3, bgcolor: todaysWorkout.completed ? 'success.50' : 'primary.50' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center">
              <TodayIcon sx={{ mr: 1, color: 'primary.main' }} />
              Today's Workout
            </Typography>
            <Box display="flex" justify="space-between" alignItems="center">
              <Box>
                <Typography variant="h5">{todaysWorkout.workout?.name || 'Scheduled Workout'}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {todaysWorkout.workout?.type} • {todaysWorkout.workout?.estimatedDuration || 45} minutes
                </Typography>
              </Box>
              <Chip
                label={todaysWorkout.completed ? '✅ Completed' : '▶️ Start Now'}
                color={todaysWorkout.completed ? 'success' : 'primary'}
                size="large"
                clickable={!todaysWorkout.completed}
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* SRS FE-03: Large Progress Component - Main Dashboard Feature */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            minHeight: 200
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" gutterBottom display="flex" alignItems="center">
                <EmojiEventsIcon sx={{ mr: 2, fontSize: 48 }} />
                Weekly Goal Progress
              </Typography>
              
              {currentGoal ? (
                <Box>
                  <Typography variant="h5" gutterBottom sx={{ opacity: 0.9 }}>
                    {currentGoal.title}
                  </Typography>
                  
                  <Box display="flex" alignItems="center" mb={3}>
                    <Box flex={1} mr={4}>
                      <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {currentGoal.progress?.completionPercentage || 0}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={currentGoal.progress?.completionPercentage || 0}
                        sx={{ 
                          height: 12, 
                          borderRadius: 6,
                          bgcolor: 'rgba(255,255,255,0.3)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: '#4caf50'
                          }
                        }}
                      />
                      <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
                        {currentGoal.progress?.completedWorkouts || 0} of {currentGoal.workouts?.length || 0} workouts completed
                      </Typography>
                    </Box>
                    
                    <Box textAlign="center" mr={3}>
                      <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                        {getDaysRemaining()}
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        Days Left
                      </Typography>
                    </Box>
                    
                    <Box textAlign="center">
                      <Button 
                        variant="contained" 
                        size="large"
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.2)', 
                          color: 'white',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                        }}
                        href={`/app/goals/${currentGoal._id}`}
                      >
                        View Details
                      </Button>
                    </Box>
                  </Box>
                </Box>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="h5" gutterBottom sx={{ opacity: 0.9 }}>
                    No Active Goal This Week
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, opacity: 0.8 }}>
                    Set your weekly fitness goal to start tracking progress
                  </Typography>
                  <Button 
                    variant="contained" 
                    size="large"
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                    }}
                    href="/app/goals/create"
                  >
                    Create Weekly Goal
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Header Stats */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justify="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Goals
                  </Typography>
                  <Typography variant="h4">
                    {dashboardData?.stats?.totalGoals || 0}
                  </Typography>
                </Box>
                <EmojiEventsIcon color="primary" sx={{ fontSize: 40 }} />
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
                    Completed Goals
                  </Typography>
                  <Typography variant="h4">
                    {dashboardData?.stats?.completedGoals || 0}
                  </Typography>
                </Box>
                <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
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
                    Workouts Done
                  </Typography>
                  <Typography variant="h4">
                    {dashboardData?.stats?.totalWorkoutsCompleted || 0}
                  </Typography>
                </Box>
                <FitnessCenterIcon color="info" sx={{ fontSize: 40 }} />
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
                    This Week
                  </Typography>
                  <Typography variant="h4">
                    {weekProgress.percentage}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={weekProgress.percentage} 
                    sx={{ mt: 1 }}
                  />
                  <Typography variant="caption" color="textSecondary">
                    {weekProgress.completed} of {weekProgress.total} workouts
                  </Typography>
                </Box>
                <TrendingUpIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Current Goal Overview */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                <CalendarTodayIcon sx={{ mr: 1 }} />
                Weekly Calendar
                {currentGoal && (
                  <Chip 
                    label={currentGoal.title} 
                    variant="outlined" 
                    size="small" 
                    sx={{ ml: 2 }}
                  />
                )}
              </Typography>

              {/* Calendar Navigation */}
              <Box display="flex" alignItems="center" justify="space-between" mb={2}>
                <IconButton onClick={() => navigateWeek(-1)}>
                  <ChevronLeftIcon />
                </IconButton>
                <Typography variant="h6">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Typography>
                <IconButton onClick={() => navigateWeek(1)}>
                  <ChevronRightIcon />
                </IconButton>
              </Box>

              {/* Calendar Grid */}
              <Grid container spacing={1}>
                {weekDays.map((day, index) => {
                  const dayWorkouts = getWorkoutsForDate(day);
                  const isCurrentDay = isToday(day);
                  
                  return (
                    <Grid item xs key={index}>
                      <Paper
                        sx={{
                          p: 1,
                          minHeight: 100,
                          bgcolor: isCurrentDay ? 'primary.50' : 'background.paper',
                          border: isCurrentDay ? '2px solid' : '1px solid',
                          borderColor: isCurrentDay ? 'primary.main' : 'divider'
                        }}
                      >
                        <Typography variant="caption" fontWeight="bold" display="block">
                          {getDayName(day)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" mb={1}>
                          {formatDate(day)}
                        </Typography>
                        
                        {dayWorkouts.map((workout, workoutIndex) => (
                          <Chip
                            key={workoutIndex}
                            label={workout.workout?.name || 'Workout'}
                            size="small"
                            color={workout.completed ? 'success' : 'default'}
                            variant={workout.completed ? 'filled' : 'outlined'}
                            sx={{ 
                              fontSize: '0.6rem', 
                              height: 20, 
                              mb: 0.5,
                              display: 'block',
                              '& .MuiChip-label': {
                                px: 1
                              }
                            }}
                          />
                        ))}
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>

              {!currentGoal && (
                <Box textAlign="center" py={4}>
                  <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary">
                    No Active Goal
                  </Typography>
                  <Typography variant="body2" color="textSecondary" mb={2}>
                    Create a new goal to start tracking your fitness journey.
                  </Typography>
                  <Button variant="contained" href="/app/goals/create">
                    Create Goal
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Goal Progress & Quick Actions */}
        <Grid item xs={12} md={4}>
          {currentGoal ? (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                  <TrendingUpIcon sx={{ mr: 1 }} />
                  Current Goal Progress
                </Typography>

                <Typography variant="h5" gutterBottom>
                  {currentGoal.title}
                </Typography>

                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Overall Progress
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={currentGoal.progress?.completionPercentage || 0}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="textSecondary">
                    {currentGoal.progress?.completedWorkouts || 0} of {currentGoal.workouts?.length || 0} workouts completed
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Quick Stats */}
                <Box display="flex" justify="space-between" mb={2}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="primary">
                      {currentGoal.progress?.totalCaloriesBurned || 0}
                    </Typography>
                    <Typography variant="caption" display="flex" alignItems="center" justifyContent="center">
                      <LocalFireDepartmentIcon sx={{ fontSize: 12, mr: 0.5 }} />
                      Calories
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h6" color="primary">
                      {Math.floor((currentGoal.progress?.totalDuration || 0) / 60)}h {(currentGoal.progress?.totalDuration || 0) % 60}m
                    </Typography>
                    <Typography variant="caption" display="flex" alignItems="center" justifyContent="center">
                      <TimerIcon sx={{ fontSize: 12, mr: 0.5 }} />
                      Time
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Upcoming Workouts */}
                <Typography variant="subtitle2" gutterBottom>
                  Upcoming This Week
                </Typography>
                <List dense>
                  {currentGoal.workouts
                    ?.filter(w => !w.completed && new Date(w.scheduledDate) >= new Date())
                    ?.slice(0, 3)
                    ?.map((workout, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <FitnessCenterIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={workout.workout?.name || 'Workout'}
                          secondary={new Date(workout.scheduledDate).toLocaleDateString()}
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                    ))}
                </List>

                <Button
                  variant="contained"
                  fullWidth
                  sx={{ mt: 2 }}
                  href={`/app/goals/${currentGoal._id}`}
                >
                  View Goal Details
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Button variant="contained" fullWidth href="/app/goals/create">
                    Create New Goal
                  </Button>
                  <Button variant="outlined" fullWidth href="/app/programs">
                    Browse Programs
                  </Button>
                  <Button variant="outlined" fullWidth href="/app/workouts">
                    Explore Workouts
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default EnhancedDashboard;
