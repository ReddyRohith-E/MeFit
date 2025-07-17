import React from 'react';
import { Container, Typography, Button, Box, Paper } from '@mui/material';
import { FitnessCenter } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Box sx={{ mb: 3 }}>
          <FitnessCenter sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" component="h1" gutterBottom>
            Welcome to MeFit
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Your Weekly Workout Goals Management System
          </Typography>
        </Box>
        
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/login')}
            sx={{ mr: 2, mb: 2 }}
          >
            Login
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/register')}
            sx={{ mb: 2 }}
          >
            Sign Up
          </Button>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
          Track your fitness goals, manage workouts, and achieve your health objectives.
        </Typography>
      </Paper>
    </Container>
  );
};

export default Landing;
