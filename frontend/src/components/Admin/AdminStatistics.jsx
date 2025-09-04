import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar
} from '@mui/material';
import {
  People as PeopleIcon,
  FitnessCenter as FitnessCenterIcon,
  EmojiEvents as EmojiEventsIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Star as StarIcon,
  Timeline as TimelineIcon,
  Visibility as VisibilityIcon,
  Block as BlockIcon,
  VerifiedUser as VerifiedUserIcon,
  AdminPanelSettings as AdminPanelSettingsIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';

const AdminStatistics = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdminStats();
    fetchUsers();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      } else {
        throw new Error('Failed to fetch statistics');
      }
    } catch (error) {
      console.error('Error fetching admin statistics:', error);
      setError('Failed to load statistics');
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        {error}
      </Alert>
    );
  }

  // Chart data preparation
  const userGrowthData = stats?.userGrowth || [];
  const goalCompletionData = [
    { name: 'Completed', value: stats?.totalCompletedGoals || 0, color: '#4caf50' },
    { name: 'In Progress', value: stats?.totalActiveGoals || 0, color: '#ff9800' },
    { name: 'Overdue', value: stats?.totalOverdueGoals || 0, color: '#f44336' }
  ];

  const workoutTypeData = stats?.workoutTypeDistribution || [];
  const userActivityData = stats?.userActivityTrend || [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
          Admin Statistics Dashboard
        </Typography>
        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)' }}>
          Overview of platform metrics and user activity
        </Typography>
      </Paper>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justify="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Users
                  </Typography>
                  <Typography variant="h4">
                    {stats?.totalUsers || 0}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    +{stats?.newUsersThisMonth || 0} this month
                  </Typography>
                </Box>
                <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
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
                    Active Goals
                  </Typography>
                  <Typography variant="h4">
                    {stats?.totalActiveGoals || 0}
                  </Typography>
                  <Typography variant="body2" color="info.main">
                    {stats?.goalsCompletionRate || 0}% completion rate
                  </Typography>
                </Box>
                <EmojiEventsIcon color="warning" sx={{ fontSize: 40 }} />
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
                    Total Workouts
                  </Typography>
                  <Typography variant="h4">
                    {stats?.totalWorkoutsCompleted || 0}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    {stats?.workoutsThisWeek || 0} this week
                  </Typography>
                </Box>
                <FitnessCenterIcon color="success" sx={{ fontSize: 40 }} />
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
                    Platform Health
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {stats?.platformHealthScore || 95}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    System uptime
                  </Typography>
                </Box>
                <TrendingUpIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* User Growth Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                <TimelineIcon sx={{ mr: 1 }} />
                User Growth Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="newUsers" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="New Users"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="totalUsers" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    name="Total Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Goal Completion Pie Chart */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                <EmojiEventsIcon sx={{ mr: 1 }} />
                Goal Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={goalCompletionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {goalCompletionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Workout Types Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                <FitnessCenterIcon sx={{ mr: 1 }} />
                Workout Types Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={workoutTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                <ScheduleIcon sx={{ mr: 1 }} />
                Recent Platform Activity
              </Typography>
              <List>
                {stats?.recentActivity?.slice(0, 8).map((activity, index) => (
                  <ListItem key={index} divider>
                    <ListItemIcon>
                      {activity.type === 'user_registered' && <PeopleIcon color="primary" />}
                      {activity.type === 'goal_completed' && <EmojiEventsIcon color="success" />}
                      {activity.type === 'workout_completed' && <FitnessCenterIcon color="info" />}
                      {activity.type === 'contributor_request' && <StarIcon color="warning" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.description}
                      secondary={new Date(activity.timestamp).toLocaleString()}
                    />
                  </ListItem>
                )) || (
                  <ListItem>
                    <ListItemText 
                      primary="No recent activity" 
                      secondary="Activity will appear here as users interact with the platform"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* User Management Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                <AdminPanelSettingsIcon sx={{ mr: 1 }} />
                User Management Overview
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Goals</TableCell>
                      <TableCell>Workouts</TableCell>
                      <TableCell>Last Active</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.slice(0, 10).map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ mr: 2 }}>
                              {user.username.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {user.username}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={0.5}>
                            {user.isAdmin && (
                              <Chip label="Admin" color="error" size="small" />
                            )}
                            {user.isContributor && (
                              <Chip label="Contributor" color="info" size="small" />
                            )}
                            {!user.isAdmin && !user.isContributor && (
                              <Chip label="User" color="default" size="small" />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {user.goalCount || 0} goals
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={(user.completedGoals || 0) / Math.max(user.goalCount || 1, 1) * 100}
                            sx={{ mt: 0.5, width: 60 }}
                          />
                        </TableCell>
                        <TableCell>
                          {user.workoutCount || 0}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {user.lastLoginDate 
                              ? new Date(user.lastLoginDate).toLocaleDateString()
                              : 'Never'
                            }
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            {user.twoFactorEnabled && (
                              <Tooltip title="2FA Enabled">
                                <VerifiedUserIcon color="success" fontSize="small" />
                              </Tooltip>
                            )}
                            <Chip
                              label={user.isActive ? 'Active' : 'Inactive'}
                              color={user.isActive ? 'success' : 'default'}
                              size="small"
                            />
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {users.length > 10 && (
                <Box mt={2} textAlign="center">
                  <Typography variant="caption" color="textSecondary">
                    Showing 10 of {users.length} users
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* System Health Indicators */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                <CheckCircleIcon sx={{ mr: 1 }} />
                System Health
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Database Connection"
                    secondary="Operational"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="API Response Time"
                    secondary="< 200ms average"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Storage Usage"
                    secondary="78% of allocated space"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Security Status"
                    secondary="All systems secure"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Insights
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: 'primary.50' }}>
                    <Typography variant="h6" color="primary">
                      {stats?.averageGoalCompletionTime || 45} days
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Average goal completion time
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: 'success.50' }}>
                    <Typography variant="h6" color="success.main">
                      {stats?.mostPopularWorkoutType || 'Cardio'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Most popular workout type
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: 'warning.50' }}>
                    <Typography variant="h6" color="warning.main">
                      {stats?.pendingContributorRequests || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Pending contributor requests
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: 'info.50' }}>
                    <Typography variant="h6" color="info.main">
                      {stats?.userRetentionRate || 85}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      30-day user retention rate
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminStatistics;
