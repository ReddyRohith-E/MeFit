import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  TextField,
  MenuItem,
  Chip,
  Avatar,
  LinearProgress,
  Divider,
  useTheme,
  Select,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Analytics,
  TrendingUp,
  TrendingDown,
  People,
  Assignment,
  FitnessCenter,
  Timeline,
  PieChart,
  BarChart,
  ShowChart,
  DateRange,
  Download,
  Refresh,
  FilterList,
  Star,
  CheckCircle,
  Schedule,
  Group,
  Visibility,
  Share,
  AccessTime,
  CalendarToday,
  ArrowUpward,
  ArrowDownward
} from '@mui/icons-material';
import { adminApiService, handleApiError } from '../../services/adminAPI';

// Metric Card Component
const MetricCard = ({ 
  title, 
  value, 
  previousValue, 
  icon: Icon, 
  color = 'primary',
  format = 'number',
  loading = false 
}) => {
  const theme = useTheme();
  
  const calculateChange = () => {
    if (!previousValue || previousValue === 0) return null;
    const change = ((value - previousValue) / previousValue) * 100;
    return change;
  };

  const formatValue = (val) => {
    if (format === 'percentage') return `${val}%`;
    if (format === 'currency') return `$${val.toLocaleString()}`;
    if (format === 'time') return `${val}h`;
    return val.toLocaleString();
  };

  const change = calculateChange();
  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <Card sx={{ 
      height: '100%',
      transition: 'all 0.3s ease',
      '&:hover': { 
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[8]
      }
    }}>
      <CardContent>
        <Box display="flex" alignItems="flex-start" justifyContent="between">
          <Box flex={1}>
            <Typography color="textSecondary" gutterBottom variant="body2" fontWeight={500}>
              {title}
            </Typography>
            
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              <>
                <Typography variant="h3" component="div" fontWeight={700} color={`${color}.main`}>
                  {formatValue(value)}
                </Typography>
                
                {change !== null && (
                  <Box display="flex" alignItems="center" mt={1}>
                    {isPositive ? (
                      <ArrowUpward sx={{ fontSize: 16, color: 'success.main' }} />
                    ) : isNegative ? (
                      <ArrowDownward sx={{ fontSize: 16, color: 'error.main' }} />
                    ) : null}
                    <Typography 
                      variant="body2" 
                      color={isPositive ? 'success.main' : isNegative ? 'error.main' : 'textSecondary'}
                      fontWeight={500}
                      ml={0.5}
                    >
                      {Math.abs(change).toFixed(1)}% vs last period
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
          
          <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main`, width: 56, height: 56 }}>
            <Icon sx={{ fontSize: 28 }} />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

// Chart Card Component (Placeholder for actual charts)
const ChartCard = ({ title, data, type = 'line', color = 'primary', height = 300 }) => {
  const theme = useTheme();
  
  // Simulate chart data visualization
  const renderSimulatedChart = () => {
    if (type === 'pie') {
      return (
        <Box display="flex" flexDirection="column" gap={2}>
          {data.map((item, index) => {
            const percentage = (item.value / data.reduce((sum, d) => sum + d.value, 0)) * 100;
            return (
              <Box key={index}>
                <Box display="flex" justifyContent="between" mb={1}>
                  <Typography variant="body2">{item.label}</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {item.value} ({percentage.toFixed(1)}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  sx={{
                    height: 8,
                    backgroundColor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: theme.palette[color].main
                    }
                  }}
                />
              </Box>
            );
          })}
        </Box>
      );
    }
    
    if (type === 'bar') {
      const maxValue = Math.max(...data.map(d => d.value));
      return (
        <Box display="flex" alignItems="end" gap={1} height={height - 100}>
          {data.map((item, index) => (
            <Box key={index} display="flex" flexDirection="column" alignItems="center" flex={1}>
              <Box
                sx={{
                  width: '100%',
                  backgroundColor: theme.palette[color].main,
                  height: `${(item.value / maxValue) * 100}%`,
                  minHeight: 20,
                  borderRadius: 1,
                  mb: 1
                }}
              />
              <Typography variant="caption" textAlign="center">
                {item.label}
              </Typography>
              <Typography variant="caption" fontWeight={500}>
                {item.value}
              </Typography>
            </Box>
          ))}
        </Box>
      );
    }
    
    // Line chart simulation
    return (
      <Box position="relative" height={height - 100}>
        <svg width="100%" height="100%" viewBox="0 0 400 200">
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={theme.palette[color].main} stopOpacity={0.3} />
              <stop offset="100%" stopColor={theme.palette[color].main} stopOpacity={0} />
            </linearGradient>
          </defs>
          
          {/* Generate line path */}
          <path
            d={`M 0,${150 - (data[0]?.value || 0) * 2} ${data.map((item, index) => 
              `L ${(index * 400) / (data.length - 1)},${150 - item.value * 2}`
            ).join(' ')}`}
            fill="none"
            stroke={theme.palette[color].main}
            strokeWidth="3"
          />
          
          {/* Fill area under curve */}
          <path
            d={`M 0,${150 - (data[0]?.value || 0) * 2} ${data.map((item, index) => 
              `L ${(index * 400) / (data.length - 1)},${150 - item.value * 2}`
            ).join(' ')} L 400,150 L 0,150 Z`}
            fill={`url(#gradient-${color})`}
          />
          
          {/* Data points */}
          {data.map((item, index) => (
            <circle
              key={index}
              cx={(index * 400) / (data.length - 1)}
              cy={150 - item.value * 2}
              r="4"
              fill={theme.palette[color].main}
            />
          ))}
        </svg>
        
        {/* X-axis labels */}
        <Box position="absolute" bottom={0} left={0} right={0} display="flex" justifyContent="between">
          {data.map((item, index) => (
            <Typography key={index} variant="caption" color="textSecondary">
              {item.label}
            </Typography>
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {title}
        </Typography>
        <Box mt={2}>
          {renderSimulatedChart()}
        </Box>
      </CardContent>
    </Card>
  );
};

// Top Performers Component
const TopPerformersCard = ({ users, loading }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Top Performing Users
      </Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <List>
          {users.map((user, index) => (
            <ListItem key={user._id} divider={index < users.length - 1}>
              <ListItemIcon>
                <Avatar sx={{ bgcolor: index < 3 ? 'primary.main' : 'grey.400', width: 32, height: 32 }}>
                  <Typography variant="caption" fontWeight={600}>
                    #{index + 1}
                  </Typography>
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body1" fontWeight={500}>
                      {user.user?.firstName} {user.user?.lastName}
                    </Typography>
                    {index < 3 && <Star fontSize="small" color="warning" />}
                  </Box>
                }
                secondary={`${user.goalCount} goals completed`}
              />
              <Chip
                label={`${((user.goalCount / 10) * 100).toFixed(0)}%`}
                size="small"
                color={index < 3 ? 'primary' : 'default'}
              />
            </ListItem>
          ))}
        </List>
      )}
    </CardContent>
  </Card>
);

// Recent Activity Component
const RecentActivityCard = ({ activities }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Recent Platform Activity
      </Typography>
      
      <List>
        {activities.map((activity, index) => (
          <ListItem key={index} divider={index < activities.length - 1}>
            <ListItemIcon>
              <Avatar sx={{ bgcolor: activity.color + '.light', color: activity.color + '.main', width: 32, height: 32 }}>
                <activity.icon fontSize="small" />
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary={activity.title}
              secondary={activity.description}
            />
            <Typography variant="caption" color="textSecondary">
              {activity.time}
            </Typography>
          </ListItem>
        ))}
      </List>
    </CardContent>
  </Card>
);

// Main Analytics Component
const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('30');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  const [analytics, setAnalytics] = useState({
    userRegistrations: [],
    goalTrends: [],
    activeUsers: [],
    overview: {}
  });

  const [metrics, setMetrics] = useState({
    totalUsers: { current: 0, previous: 0 },
    activeUsers: { current: 0, previous: 0 },
    completedGoals: { current: 0, previous: 0 },
    engagementRate: { current: 0, previous: 0 },
    averageSessionTime: { current: 0, previous: 0 },
    retentionRate: { current: 0, previous: 0 }
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call for analytics data
      const mockAnalytics = {
        userRegistrations: Array.from({ length: 30 }, (_, i) => ({
          label: `Day ${i + 1}`,
          value: Math.floor(Math.random() * 20) + 5
        })),
        goalTrends: [
          { label: 'Active', value: 45 },
          { label: 'Completed', value: 30 },
          { label: 'Paused', value: 15 },
          { label: 'Cancelled', value: 10 }
        ],
        activeUsers: Array.from({ length: 10 }, (_, i) => ({
          _id: `user_${i}`,
          user: {
            firstName: `User${i + 1}`,
            lastName: `LastName${i + 1}`
          },
          goalCount: Math.floor(Math.random() * 15) + 1
        })),
        overview: {
          totalUsers: 1247,
          activeUsers: 892,
          completedGoals: 2156,
          engagementRate: 78.5
        }
      };

      const mockMetrics = {
        totalUsers: { current: 1247, previous: 1180 },
        activeUsers: { current: 892, previous: 845 },
        completedGoals: { current: 2156, previous: 1987 },
        engagementRate: { current: 78.5, previous: 74.2 },
        averageSessionTime: { current: 24, previous: 22 },
        retentionRate: { current: 85.3, previous: 82.1 }
      };

      setAnalytics(mockAnalytics);
      setMetrics(mockMetrics);
      
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const exportData = () => {
    showNotification('Export functionality coming soon!', 'info');
  };

  const recentActivities = [
    {
      icon: People,
      color: 'primary',
      title: 'New User Registration',
      description: '5 new users joined today',
      time: '2 hours ago'
    },
    {
      icon: CheckCircle,
      color: 'success',
      title: 'Goal Completion Spike',
      description: '12 goals completed in the last hour',
      time: '3 hours ago'
    },
    {
      icon: FitnessCenter,
      color: 'secondary',
      title: 'New Exercise Added',
      description: 'Push-up variation added by contributor',
      time: '5 hours ago'
    },
    {
      icon: Schedule,
      color: 'info',
      title: 'Popular Workout',
      description: 'HIIT Workout reached 100 completions',
      time: '1 day ago'
    }
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box mb={4}>
        <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Analytics color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h4" fontWeight={700}>
              Analytics Dashboard
            </Typography>
          </Box>
          
          <Box display="flex" gap={2}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Period</InputLabel>
              <Select
                value={period}
                label="Period"
                onChange={(e) => setPeriod(e.target.value)}
              >
                <MenuItem value="7">Last 7 days</MenuItem>
                <MenuItem value="30">Last 30 days</MenuItem>
                <MenuItem value="90">Last 90 days</MenuItem>
                <MenuItem value="365">Last year</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={exportData}
            >
              Export
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchAnalyticsData}
            >
              Refresh
            </Button>
          </Box>
        </Box>
        
        <Typography variant="body1" color="textSecondary">
          Comprehensive platform analytics and insights for the last {period} days
        </Typography>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Total Users"
            value={metrics.totalUsers.current}
            previousValue={metrics.totalUsers.previous}
            icon={People}
            color="primary"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Active Users"
            value={metrics.activeUsers.current}
            previousValue={metrics.activeUsers.previous}
            icon={TrendingUp}
            color="success"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Completed Goals"
            value={metrics.completedGoals.current}
            previousValue={metrics.completedGoals.previous}
            icon={CheckCircle}
            color="info"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Engagement Rate"
            value={metrics.engagementRate.current}
            previousValue={metrics.engagementRate.previous}
            icon={Star}
            color="warning"
            format="percentage"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Avg Session Time"
            value={metrics.averageSessionTime.current}
            previousValue={metrics.averageSessionTime.previous}
            icon={AccessTime}
            color="secondary"
            format="time"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Retention Rate"
            value={metrics.retentionRate.current}
            previousValue={metrics.retentionRate.previous}
            icon={Group}
            color="primary"
            format="percentage"
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <ChartCard
            title="User Registrations Over Time"
            data={analytics.userRegistrations}
            type="line"
            color="primary"
            height={350}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <ChartCard
            title="Goal Status Distribution"
            data={analytics.goalTrends}
            type="pie"
            color="secondary"
            height={350}
          />
        </Grid>
      </Grid>

      {/* Activity Breakdown */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Platform Usage Analytics
              </Typography>
              
              <Box mb={3}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Most Active Hours
                </Typography>
                <ChartCard
                  title=""
                  data={[
                    { label: '6AM', value: 15 },
                    { label: '9AM', value: 35 },
                    { label: '12PM', value: 28 },
                    { label: '3PM', value: 22 },
                    { label: '6PM', value: 45 },
                    { label: '9PM', value: 38 }
                  ]}
                  type="bar"
                  color="info"
                  height={200}
                />
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Content Engagement
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" justifyContent="between" alignItems="center">
                    <Typography variant="body2">Exercise Views</Typography>
                    <Chip label="2,847" size="small" color="primary" />
                  </Box>
                  <Box display="flex" justifyContent="between" alignItems="center">
                    <Typography variant="body2">Workout Completions</Typography>
                    <Chip label="1,523" size="small" color="secondary" />
                  </Box>
                  <Box display="flex" justifyContent="between" alignItems="center">
                    <Typography variant="body2">Program Enrollments</Typography>
                    <Chip label="892" size="small" color="info" />
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <RecentActivityCard activities={recentActivities} />
        </Grid>
      </Grid>

      {/* Top Performers and Detailed Statistics */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TopPerformersCard users={analytics.activeUsers} loading={loading} />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Performance Insights
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box textAlign="center" p={2}>
                    <Typography variant="h4" fontWeight={700} color="primary.main">
                      94.2%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      System Uptime
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center" p={2}>
                    <Typography variant="h4" fontWeight={700} color="success.main">
                      1.2s
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Avg Load Time
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center" p={2}>
                    <Typography variant="h4" fontWeight={700} color="warning.main">
                      98.7%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Success Rate
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center" p={2}>
                    <Typography variant="h4" fontWeight={700} color="info.main">
                      4.8/5
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      User Rating
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Growth Trends
              </Typography>
              <List dense>
                <ListItem disableGutters>
                  <ListItemText
                    primary="Monthly Active Users"
                    secondary="+12.5% growth this month"
                  />
                  <TrendingUp color="success" />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText
                    primary="Goal Completion Rate"
                    secondary="+8.3% improvement"
                  />
                  <TrendingUp color="success" />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText
                    primary="User Engagement"
                    secondary="+15.7% increase"
                  />
                  <TrendingUp color="success" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default AnalyticsPage;
