import React from 'react';
import { Typography, Box } from '@mui/material';
import './WorkoutDetail.css';

const WorkoutDetail = () => {
  return (
    <Box className="workout-detail-container">
      <Typography variant="h4" gutterBottom className="workout-detail-title">
        Workout Details
      </Typography>
      <Typography variant="body1">
        Workout detail page coming soon...
      </Typography>
    </Box>
  );
};

export default WorkoutDetail;
