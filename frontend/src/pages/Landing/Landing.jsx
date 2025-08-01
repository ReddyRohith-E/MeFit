import React from 'react';
import { Container, Typography, Button, Box, Paper, useTheme } from '@mui/material';
import { FitnessCenter } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ThemeToggleButton } from '../../components/Common/ThemeToggle.jsx';

const Landing = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', position: 'relative' }}>
      {/* Theme Toggle */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 1000
        }}
      >
        <ThemeToggleButton />
      </Box>

      <Container maxWidth="sm" sx={{ pt: 8 }}>
        <Paper 
          elevation={6} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            backgroundColor: 'background.paper',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            transition: 'all 0.3s ease'
          }}
        >
          <Box sx={{ mb: 3 }}>
            <FitnessCenter 
              sx={{ 
                fontSize: 80, 
                color: 'primary.main', 
                mb: 2,
                filter: `drop-shadow(0 4px 8px ${theme.palette.primary.main}40)`
              }} 
            />
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 700,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Welcome to MeFit
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              paragraph
              sx={{ fontWeight: 400 }}
            >
              Your Weekly Workout Goals Management System
            </Typography>
          </Box>
          
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/login')}
              sx={{ 
                mr: 2, 
                mb: 2,
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: `0 4px 12px ${theme.palette.primary.main}40`,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 6px 16px ${theme.palette.primary.main}60`,
                }
              }}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/register')}
              sx={{ 
                mb: 2,
                mr: 2,
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-2px)',
                }
              }}
            >
              Sign Up
            </Button>
            <Button
              variant="text"
              size="large"
              onClick={() => navigate('/theme-showcase')}
              sx={{ 
                mb: 2,
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  transform: 'translateY(-2px)',
                }
              }}
            >
              🎨 Theme Demo
            </Button>
          </Box>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mt: 4,
              fontStyle: 'italic',
              opacity: 0.8
            }}
          >
            Track your fitness goals, manage workouts, and achieve your health objectives.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Landing;
