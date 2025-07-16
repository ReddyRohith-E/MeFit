import React from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';
import './LoadingSpinner.css';

const LoadingSpinner = ({ message = 'Loading...', size = 40 }) => {
  return (
    <Box className="loading-spinner-container">
      <CircularProgress size={size} className="loading-spinner" />
      {message && (
        <Typography variant="body1" className="loading-message">
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingSpinner;
