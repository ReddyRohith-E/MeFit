import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  IconButton,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  People,
  Assignment,
  CheckCircle,
  TrendingUp,
  PersonAdd,
  AdminPanelSettings,
  FitnessCenter,
  SportsGymnastics,
  Schedule,
  Refresh,
  TrendingDown,
  Group,
  Star,
  Warning,
  Visibility
} from '@mui/icons-material';
import { adminApiService, handleApiError } from '../../services/adminAPI';

// Enhanced StatCard with animations and better visuals
const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'primary', 
  subtitle, 
  trend,
  loading = false 
}) => {
  const theme = useTheme();
  
  const getColorValue = (colorName) => {
    return theme.palette[colorName]?.main || theme.palette.primary.main;
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8]
        },
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          background: `linear-gradient(135deg, ${getColorValue(color)}15, ${getColorValue(color)}05)`,
          borderRadius: '50%',
          zIndex: 0
        }}
      />
      
      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
          <Box flex={1}>
            <Typography 
              color="textSecondary" 
              gutterBottom 
              variant="body2"
              sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1 }}
            >
              {title}
            </Typography>
            
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              <Typography 
                variant="h3" 
                component="div" 
                sx={{ 
                  fontWeight: 700,
                  color: getColorValue(color),
                  mb: 1
                }}
              >
                {value}
              </Typography>
            )}
            
            {subtitle && (
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" color="textSecondary">
                  {subtitle}
                </Typography>
                {trend && (
                  <Chip
                    size="small"
                    icon={trend > 0 ? <TrendingUp /> : <TrendingDown />}
                    label={`${trend > 0 ? '+' : ''}${trend}%`}
                    color={trend > 0 ? 'success' : 'error'}
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
            )}
          </Box>
          
          <Avatar
            sx={{
              bgcolor: `${getColorValue(color)}15`,
              color: getColorValue(color),
              width: 56,
              height: 56
            }}
          >
            <Icon sx={{ fontSize: 28 }} />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

// User Activity Component
const UserActivityCard = ({ users, loading }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6" fontWeight={600}>
          Recent Users
        </Typography>
        <Chip label="Last 30 days" size="small" color="primary" />
      </Box>
      
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : users?.length > 0 ? (
        <Box>
          {users.slice(0, 5).map((user, index) => (
            <Box
              key={user._id}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              py={1.5}
              borderBottom={index < 4 ? 1 : 0}
              borderColor="divider"
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    width: 40,
                    height: 40,
                    fontSize: '0.875rem'
                  }}
                >
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {user.email}
                  </Typography>
                </Box>
              </Box>
              
              <Box display="flex" alignItems="center" gap={1}>
                {user.isAdmin && (
                  <Chip label="Admin" size="small" color="error" />
                )}
                {user.isContributor && (
                  <Chip label="Contributor" size="small" color="secondary" />
                )}
                <Typography variant="caption" color="textSecondary">
                  {new Date(user.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Box textAlign="center" py={4}>
          <Typography color="textSecondary">
            No new users in the last 30 days
          </Typography>
        </Box>
      )}
    </CardContent>
  </Card>
);

// Goal Statistics Chart Component
const GoalStatsCard = ({ goalsByStatus, loading }) => {
  const theme = useTheme();
  
  const statusConfig = {
    active: { color: theme.palette.info.main, label: 'Active' },
    completed: { color: theme.palette.success.main, label: 'Completed' },
    paused: { color: theme.palette.warning.main, label: 'Paused' },
    cancelled: { color: theme.palette.error.main, label: 'Cancelled' }
  };

  const total = Object.values(goalsByStatus || {}).reduce((sum, count) => sum + count, 0);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} mb={3}>
          Goal Distribution
        </Typography>
        
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : total > 0 ? (
          <Box>
            {Object.entries(goalsByStatus || {}).map(([status, count]) => {
              const percentage = ((count / total) * 100).toFixed(1);
              const config = statusConfig[status];
              
              return (
                <Box key={status} mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      {config?.label || status}
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {count} ({percentage}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={parseFloat(percentage)}
                    sx={{
                      height: 8,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: config?.color || theme.palette.primary.main
                      }
                    }}
                  />
                </Box>
              );
            })}
          </Box>
        ) : (
          <Typography color="textSecondary" textAlign="center">
            No goal data available
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

// Main Admin Dashboard Component
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApiService.dashboard.getStats();
      setStats(response.data.data);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Dashboard stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardStats();
    setRefreshing(false);
  };

  if (loading && !stats) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error && !stats) {
    return (
      <Box p={3}>
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={fetchDashboardStats}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  const { overview, recentUsers, userGrowth, goalsByStatus } = stats || {};

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="text.primary">
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={1}>
            Welcome back! Here's what's happening with MeFit today.
          </Typography>
        </Box>
        
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          disabled={refreshing}
          sx={{ minWidth: 120 }}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>
      
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Main Statistics Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={overview?.totalUsers || 0}
            icon={People}
            color="primary"
            subtitle={`${overview?.activeUsers || 0} active users`}
            loading={loading}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Goals"
            value={overview?.totalGoals || 0}
            icon={Assignment}
            color="secondary"
            subtitle={`${overview?.goalCompletionRate || 0}% completion rate`}
            loading={loading}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed Goals"
            value={overview?.completedGoals || 0}
            icon={CheckCircle}
            color="success"
            loading={loading}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active (7 days)"
            value={overview?.activeUsersLast7Days || 0}
            icon={TrendingUp}
            color="info"
            subtitle="Recent activity"
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Content Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Exercises"
            value={overview?.totalExercises || 0}
            icon={FitnessCenter}
            color="warning"
            loading={loading}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Workouts"
            value={overview?.totalWorkouts || 0}
            icon={SportsGymnastics}
            color="info"
            loading={loading}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Programs"
            value={overview?.totalPrograms || 0}
            icon={Schedule}
            color="secondary"
            loading={loading}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Requests"
            value={overview?.contributorRequests || 0}
            icon={PersonAdd}
            color="error"
            subtitle="Contributor requests"
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* User Role Distribution */}
      {overview?.usersByRole && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={3}>
                  User Distribution by Role
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <Box textAlign="center">
                      <Avatar
                        sx={{
                          bgcolor: theme.palette.error.light,
                          color: theme.palette.error.contrastText,
                          width: 64,
                          height: 64,
                          mx: 'auto',
                          mb: 2
                        }}
                      >
                        <AdminPanelSettings sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Typography variant="h4" fontWeight={700} color="error.main">
                        {overview.usersByRole.admin}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Administrators
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Box textAlign="center">
                      <Avatar
                        sx={{
                          bgcolor: theme.palette.secondary.light,
                          color: theme.palette.secondary.contrastText,
                          width: 64,
                          height: 64,
                          mx: 'auto',
                          mb: 2
                        }}
                      >
                        <Star sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Typography variant="h4" fontWeight={700} color="secondary.main">
                        {overview.usersByRole.contributor}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Contributors
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Box textAlign="center">
                      <Avatar
                        sx={{
                          bgcolor: theme.palette.primary.light,
                          color: theme.palette.primary.contrastText,
                          width: 64,
                          height: 64,
                          mx: 'auto',
                          mb: 2
                        }}
                      >
                        <Group sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Typography variant="h4" fontWeight={700} color="primary.main">
                        {overview.usersByRole.regular}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Regular Users
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Bottom Section - Recent Activity & Goal Distribution */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <UserActivityCard users={recentUsers} loading={loading} />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <GoalStatsCard goalsByStatus={goalsByStatus} loading={loading} />
        </Grid>
      </Grid>

      {/* User Growth Trend */}
      {userGrowth?.length > 0 && (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={3}>
                  User Growth Trend (Last 6 months)
                </Typography>
                <Box>
                  {userGrowth.map((item, index) => (
                    <Box
                      key={index}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      py={1.5}
                      borderBottom={index < userGrowth.length - 1 ? 1 : 0}
                      borderColor="divider"
                    >
                      <Typography variant="body1" fontWeight={500}>
                        {new Date(item.month + '-01').toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long'
                        })}
                      </Typography>
                      <Chip
                        label={`+${item.users} users`}
                        color="primary"
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AdminDashboard;
