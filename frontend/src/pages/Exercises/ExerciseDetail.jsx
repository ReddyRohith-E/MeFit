import React from 'react';
import { Typography, Box } from '@mui/material';
import './ExerciseDetail.css';

const ExerciseDetail = () => {
  return (
    <Box className="exercise-detail-container">
      <Typography variant="h4" gutterBottom className="exercise-detail-title">
        Exercise Details
      </Typography>
      <Typography variant="body1">
        Exercise detail page coming soon...
      </Typography>
    </Box>
  );
};

export default ExerciseDetail;
