import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ExerciseManagement from '../../components/Admin/ExerciseManagement';
import { useAuth } from '../../contexts/AuthContext';

const ContributorExercises = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if user has contributor access
  if (!user?.isContributor && !user?.isAdmin) {
    navigate('/app/contributor');
    return null;
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2}>
        <IconButton onClick={() => navigate('/app/contributor')} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5">Back to Contributor Area</Typography>
      </Box>
      <ExerciseManagement />
    </Box>
  );
};

export default ContributorExercises;
