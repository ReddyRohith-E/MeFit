import React from 'react';
import { Typography, Box, Card, CardContent, Grid, Button, Paper } from '@mui/material';
import { FitnessCenter, Create, TrendingUp, Group, Assessment } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './ContributorArea.css';

const ContributorArea = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user?.isContributor && !user?.isAdmin) {
    return (
      <Box p={3}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Contributor Access Required
          </Typography>
          <Typography variant="body1" color="textSecondary" mb={2}>
            You need contributor privileges to access this area. Please request contributor access from your profile settings.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/app/profile/settings')}
          >
            Go to Profile Settings
          </Button>
        </Paper>
      </Box>
    );
  }

  const contributorFeatures = [
    {
      title: 'Exercise Management',
      description: 'Create, edit, and manage exercise library',
      icon: <FitnessCenter sx={{ fontSize: 40 }} />,
      action: () => navigate('/app/contributor/exercises'),
      color: 'primary'
    },
    {
      title: 'Workout Management',
      description: 'Create and manage workout routines',
      icon: <Create sx={{ fontSize: 40 }} />,
      action: () => navigate('/app/contributor/workouts'),
      color: 'secondary'
    },
    {
      title: 'Program Creation',
      description: 'Create comprehensive fitness programs',
      icon: <Assessment sx={{ fontSize: 40 }} />,
      action: () => navigate('/app/contributor/programs'),
      color: 'info'
    },
    {
      title: 'Performance Analytics',
      description: 'View your content performance and user engagement',
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      action: () => {},
      color: 'success'
    }
  ];

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom className="contributor-title">
        Contributor Area
      </Typography>
      <Typography variant="body1" color="textSecondary" mb={4}>
        Welcome to the contributor dashboard! Here you can create and manage fitness content to help the MeFit community reach their goals.
      </Typography>

      <Grid container spacing={3}>
        {contributorFeatures.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              sx={{ 
                height: '100%', 
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={feature.action}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box mb={2} color={`${feature.color}.main`}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Stats */}
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Your Contribution Statistics
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                0
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Exercises Created
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="secondary">
                0
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Programs Created
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                0
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Views
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                0
              </Typography>
              <Typography variant="body2" color="textSecondary">
                User Ratings
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ContributorArea;
