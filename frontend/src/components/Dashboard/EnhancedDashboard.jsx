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
  CircularProgress
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
  EmojiEvents as EmojiEventsIcon
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
      const response = await fetch('/api/goals/dashboard/stats', {
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
      const response = await fetch('/api/goals/current', {
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

  return (
    <Box>
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
                    <Grid xs key={index}>
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
                  <Button variant="contained" href="/goals/create">
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
                  href={`/goals/${currentGoal._id}`}
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
                  <Button variant="contained" fullWidth href="/goals/create">
                    Create New Goal
                  </Button>
                  <Button variant="outlined" fullWidth href="/programs">
                    Browse Programs
                  </Button>
                  <Button variant="outlined" fullWidth href="/workouts">
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
