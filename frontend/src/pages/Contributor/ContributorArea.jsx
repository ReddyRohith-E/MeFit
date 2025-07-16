import React from 'react';
import { Typography, Box } from '@mui/material';
import './ContributorArea.css';

const ContributorArea = () => {
  return (
    <Box className="contributor-container">
      <Typography variant="h4" gutterBottom className="contributor-title">
        Contributor Area
      </Typography>
      <Typography variant="body1">
        Contributor area coming soon...
      </Typography>
    </Box>
  );
};

export default ContributorArea;
