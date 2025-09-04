import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  TextField,
  InputAdornment,
  Tooltip,
  Tabs,
  Tab,
  LinearProgress,
  CircularProgress,
  Avatar,
  Rating,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CardHeader,
  CardActions,
  useTheme
} from '@mui/material';
import {
  FitnessCenter,
  SportsGymnastics,
  Schedule,
  Search,
  Add,
  Edit,
  Delete,
  Visibility,
  TrendingUp,
  Category,
  Star,
  People,
  PlayArrow,
  Timer,
  BarChart,
  FilterList,
  Assignment,
  BookmarkBorder,
  Bookmark,
  Share,
  Download,
  Upload,
  Refresh,
  Warning,
  CheckCircle,
  AccessTime,
  Group
} from '@mui/icons-material';
import { adminApiService, handleApiError } from '../../services/adminAPI';

// Stats Card Component
const ContentStatsCard = ({ title, value, icon: Icon, color, subtitle, items, loading }) => {
  const theme = useTheme();
  
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
        <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
          <Box flex={1}>
            <Typography color="textSecondary" gutterBottom variant="body2" fontWeight={500}>
              {title}
            </Typography>
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              <Typography variant="h3" component="div" fontWeight={700} color={`${color}.main`}>
                {value}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="textSecondary" mt={1}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main`, width: 56, height: 56 }}>
            <Icon sx={{ fontSize: 28 }} />
          </Avatar>
        </Box>
        
        {items && items.length > 0 && (
          <Box>
            <Divider sx={{ mb: 2 }} />
            {items.map((item, index) => (
              <Box key={index} display="flex" justifyContent="between" alignItems="center" py={0.5}>
                <Typography variant="body2" color="textSecondary">
                  {item.label}
                </Typography>
                <Chip 
                  label={item.value} 
                  size="small" 
                  variant="outlined"
                  color={color}
                />
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Content Item Card Component
const ContentItemCard = ({ item, type, onEdit, onDelete, onView }) => {
  const [bookmarked, setBookmarked] = useState(false);
  
  const getTypeConfig = () => {
    switch (type) {
      case 'exercises':
        return {
          icon: FitnessCenter,
          color: 'primary',
          difficulty: item.difficulty,
          category: item.category,
          muscleGroups: item.muscleGroups
        };
      case 'workouts':
        return {
          icon: SportsGymnastics,
          color: 'secondary',
          difficulty: item.difficulty,
          duration: item.duration,
          exercises: item.exercises?.length
        };
      case 'programs':
        return {
          icon: Schedule,
          color: 'info',
          difficulty: item.difficulty,
          duration: item.duration,
          workouts: item.workouts?.length
        };
      default:
        return { icon: Assignment, color: 'default' };
    }
  };

  const config = getTypeConfig();
  const IconComponent = config.icon;

  return (
    <Card sx={{ 
      height: '100%',
      transition: 'all 0.3s ease',
      '&:hover': { 
        transform: 'translateY(-2px)',
        boxShadow: (theme) => theme.shadows[4]
      }
    }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: `${config.color}.main` }}>
            <IconComponent />
          </Avatar>
        }
        title={
          <Typography variant="h6" fontWeight={600} noWrap>
            {item.name || item.title}
          </Typography>
        }
        subheader={
          <Box display="flex" gap={1} mt={1}>
            {config.difficulty && (
              <Chip 
                label={config.difficulty} 
                size="small" 
                color={config.difficulty === 'beginner' ? 'success' : 
                       config.difficulty === 'intermediate' ? 'warning' : 'error'} 
              />
            )}
            {config.category && (
              <Chip label={config.category} size="small" variant="outlined" />
            )}
          </Box>
        }
        action={
          <IconButton onClick={() => setBookmarked(!bookmarked)}>
            {bookmarked ? <Bookmark color="primary" /> : <BookmarkBorder />}
          </IconButton>
        }
      />
      
      <CardContent sx={{ pt: 0 }}>
        <Typography variant="body2" color="textSecondary" paragraph>
          {item.description || 'No description available'}
        </Typography>
        
        <Box display="flex" gap={2} mb={2}>
          {config.duration && (
            <Box display="flex" alignItems="center" gap={0.5}>
              <Timer fontSize="small" color="action" />
              <Typography variant="caption">{config.duration} min</Typography>
            </Box>
          )}
          {config.exercises && (
            <Box display="flex" alignItems="center" gap={0.5}>
              <FitnessCenter fontSize="small" color="action" />
              <Typography variant="caption">{config.exercises} exercises</Typography>
            </Box>
          )}
          {config.workouts && (
            <Box display="flex" alignItems="center" gap={0.5}>
              <SportsGymnastics fontSize="small" color="action" />
              <Typography variant="caption">{config.workouts} workouts</Typography>
            </Box>
          )}
        </Box>
        
        {config.muscleGroups && (
          <Box>
            <Typography variant="caption" color="textSecondary" gutterBottom>
              Muscle Groups:
            </Typography>
            <Box display="flex" gap={0.5} flexWrap="wrap">
              {config.muscleGroups.slice(0, 3).map((muscle, index) => (
                <Chip 
                  key={index}
                  label={muscle}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              ))}
              {config.muscleGroups.length > 3 && (
                <Chip 
                  label={`+${config.muscleGroups.length - 3}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              )}
            </Box>
          </Box>
        )}
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'between', px: 2, pb: 2 }}>
        <Box display="flex" gap={1}>
          <Tooltip title="View Details">
            <IconButton size="small" onClick={() => onView(item)}>
              <Visibility />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => onEdit(item)}>
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => onDelete(item)}>
              <Delete />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton size="small">
            <Share fontSize="small" />
          </IconButton>
          <Typography variant="caption" color="textSecondary">
            {new Date(item.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
      </CardActions>
    </Card>
  );
};

// Content Details Dialog
const ContentDetailsDialog = ({ open, onClose, item, type }) => {
  if (!item) return null;

  const getDetailFields = () => {
    switch (type) {
      case 'exercises':
        return [
          { label: 'Category', value: item.category },
          { label: 'Difficulty', value: item.difficulty },
          { label: 'Equipment', value: item.equipment?.join(', ') || 'None' },
          { label: 'Muscle Groups', value: item.muscleGroups?.join(', ') || 'None' },
          { label: 'Instructions', value: item.instructions?.length || 0 },
          { label: 'Tips', value: item.tips?.length || 0 }
        ];
      case 'workouts':
        return [
          { label: 'Difficulty', value: item.difficulty },
          { label: 'Duration', value: `${item.duration} minutes` },
          { label: 'Exercises', value: item.exercises?.length || 0 },
          { label: 'Tags', value: item.tags?.join(', ') || 'None' },
          { label: 'Created By', value: item.createdBy?.firstName || 'System' }
        ];
      case 'programs':
        return [
          { label: 'Difficulty', value: item.difficulty },
          { label: 'Duration', value: `${item.duration} weeks` },
          { label: 'Workouts', value: item.workouts?.length || 0 },
          { label: 'Participants', value: item.participants?.length || 0 },
          { label: 'Tags', value: item.tags?.join(', ') || 'None' }
        ];
      default:
        return [];
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {type === 'exercises' ? <FitnessCenter /> :
             type === 'workouts' ? <SportsGymnastics /> : <Schedule />}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {item.name || item.title}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {type.charAt(0).toUpperCase() + type.slice(1, -1)} Details
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="body1" paragraph>
              {item.description || 'No description available.'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Details
            </Typography>
            <List dense>
              {getDetailFields().map((field, index) => (
                <ListItem key={index} disableGutters>
                  <ListItemText
                    primary={field.label}
                    secondary={field.value}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                    secondaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Metadata
            </Typography>
            <List dense>
              <ListItem disableGutters>
                <ListItemText
                  primary="Created"
                  secondary={new Date(item.createdAt).toLocaleDateString()}
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary="Last Updated"
                  secondary={new Date(item.updatedAt).toLocaleDateString()}
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                />
              </ListItem>
              {item.createdBy && (
                <ListItem disableGutters>
                  <ListItemText
                    primary="Created By"
                    secondary={`${item.createdBy.firstName} ${item.createdBy.lastName}`}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                  />
                </ListItem>
              )}
            </List>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" startIcon={<Edit />}>
          Edit {type.slice(0, -1)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Component
const ContentManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  const [content, setContent] = useState({
    exercises: [],
    workouts: [],
    programs: []
  });
  
  const [stats, setStats] = useState({
    exercisesByCategory: [],
    workoutsByDifficulty: [],
    programsByDifficulty: []
  });

  useEffect(() => {
    fetchContentData();
  }, []);

  const fetchContentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, we'll simulate the API calls since we need to implement the content endpoints
      // In a real implementation, these would be actual API calls
      const mockStats = {
        exercisesByCategory: [
          { _id: 'strength', count: 25 },
          { _id: 'cardio', count: 15 },
          { _id: 'flexibility', count: 10 },
          { _id: 'balance', count: 8 }
        ],
        workoutsByDifficulty: [
          { _id: 'beginner', count: 12 },
          { _id: 'intermediate', count: 18 },
          { _id: 'advanced', count: 8 }
        ],
        programsByDifficulty: [
          { _id: 'beginner', count: 5 },
          { _id: 'intermediate', count: 7 },
          { _id: 'advanced', count: 3 }
        ]
      };
      
      const mockContent = {
        exercises: Array.from({ length: 12 }, (_, i) => ({
          _id: `exercise_${i}`,
          name: `Exercise ${i + 1}`,
          description: `Description for exercise ${i + 1}`,
          category: ['strength', 'cardio', 'flexibility'][i % 3],
          difficulty: ['beginner', 'intermediate', 'advanced'][i % 3],
          muscleGroups: ['chest', 'legs', 'back', 'arms'][i % 4],
          equipment: ['dumbbells', 'barbell', 'bodyweight'][i % 3],
          createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        })),
        workouts: Array.from({ length: 8 }, (_, i) => ({
          _id: `workout_${i}`,
          name: `Workout ${i + 1}`,
          description: `Description for workout ${i + 1}`,
          difficulty: ['beginner', 'intermediate', 'advanced'][i % 3],
          duration: [30, 45, 60][i % 3],
          exercises: Array.from({ length: (i % 5) + 3 }, (_, j) => ({ _id: `ex_${j}` })),
          tags: ['strength', 'cardio', 'hiit'][i % 3],
          createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        })),
        programs: Array.from({ length: 6 }, (_, i) => ({
          _id: `program_${i}`,
          name: `Program ${i + 1}`,
          description: `Description for program ${i + 1}`,
          difficulty: ['beginner', 'intermediate', 'advanced'][i % 3],
          duration: [4, 8, 12][i % 3],
          workouts: Array.from({ length: (i % 3) + 2 }, (_, j) => ({ _id: `workout_${j}` })),
          participants: Array.from({ length: i * 5 }, (_, j) => ({ _id: `user_${j}` })),
          tags: ['strength', 'weight-loss', 'muscle-gain'][i % 3],
          createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        }))
      };
      
      setStats(mockStats);
      setContent(mockContent);
      
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

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setDetailsDialogOpen(true);
  };

  const handleEdit = (item) => {
    showNotification('Edit functionality coming soon!', 'info');
  };

  const handleDelete = (item) => {
    showNotification('Delete functionality coming soon!', 'info');
  };

  const getFilteredContent = () => {
    const contentTypes = ['exercises', 'workouts', 'programs'];
    const currentType = contentTypes[tabValue];
    const items = content[currentType] || [];
    
    return items.filter(item =>
      (item.name || item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getTabStats = () => {
    const contentTypes = ['exercises', 'workouts', 'programs'];
    const statsKeys = ['exercisesByCategory', 'workoutsByDifficulty', 'programsByDifficulty'];
    const currentStats = stats[statsKeys[tabValue]] || [];
    
    return currentStats.map(stat => ({
      label: stat._id,
      value: stat.count
    }));
  };

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
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Category color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" fontWeight={700}>
            Content Management
          </Typography>
        </Box>
        <Typography variant="body1" color="textSecondary">
          Manage exercises, workouts, and programs across the platform
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <ContentStatsCard
            title="Total Exercises"
            value={content.exercises?.length || 0}
            icon={FitnessCenter}
            color="primary"
            subtitle="Available exercises"
            items={stats.exercisesByCategory?.slice(0, 3).map(cat => ({
              label: cat._id,
              value: cat.count
            }))}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ContentStatsCard
            title="Total Workouts"
            value={content.workouts?.length || 0}
            icon={SportsGymnastics}
            color="secondary"
            subtitle="Available workouts"
            items={stats.workoutsByDifficulty?.map(diff => ({
              label: diff._id,
              value: diff.count
            }))}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ContentStatsCard
            title="Total Programs"
            value={content.programs?.length || 0}
            icon={Schedule}
            color="info"
            subtitle="Available programs"
            items={stats.programsByDifficulty?.map(diff => ({
              label: diff._id,
              value: diff.count
            }))}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ContentStatsCard
            title="Active Users"
            value="247"
            icon={People}
            color="success"
            subtitle="Using content"
            items={[
              { label: 'This week', value: '+12%' },
              { label: 'Engagement', value: '89%' }
            ]}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap" justifyContent="between">
            <TextField
              size="small"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />
            
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => showNotification('Create functionality coming soon!', 'info')}
              >
                Create Content
              </Button>
              <Button
                variant="outlined"
                startIcon={<Upload />}
                onClick={() => showNotification('Import functionality coming soon!', 'info')}
              >
                Import
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => showNotification('Export functionality coming soon!', 'info')}
              >
                Export
              </Button>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchContentData}
              >
                Refresh
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="fullWidth"
          >
            <Tab
              icon={<FitnessCenter />}
              label={`Exercises (${content.exercises?.length || 0})`}
              iconPosition="start"
            />
            <Tab
              icon={<SportsGymnastics />}
              label={`Workouts (${content.workouts?.length || 0})`}
              iconPosition="start"
            />
            <Tab
              icon={<Schedule />}
              label={`Programs (${content.programs?.length || 0})`}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <CardContent>
          <Grid container spacing={3}>
            {getFilteredContent().map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
                <ContentItemCard
                  item={item}
                  type={['exercises', 'workouts', 'programs'][tabValue]}
                  onView={handleViewDetails}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </Grid>
            ))}
          </Grid>
          
          {getFilteredContent().length === 0 && (
            <Box textAlign="center" py={8}>
              <Category sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No content found
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {searchTerm ? 'Try adjusting your search criteria' : 'Create your first content item to get started'}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Content Details Dialog */}
      <ContentDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        item={selectedItem}
        type={['exercises', 'workouts', 'programs'][tabValue]}
      />

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

export default ContentManagement;
