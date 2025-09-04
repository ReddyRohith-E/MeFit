import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Lightbulb as LightbulbIcon,
  FitnessCenter as FitnessCenterIcon,
  Timeline as TimelineIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material';

const GoalRealismChecker = ({ goalData, onAccept, onModify }) => {
  const [realismCheck, setRealismCheck] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (goalData) {
      checkGoalRealism();
    }
  }, [goalData]);

  const checkGoalRealism = async () => {
    setLoading(true);
    
    try {
      // This would typically be called during goal creation
      // For demo purposes, we'll simulate the realism check
      const mockRealismCheck = {
        isRealistic: goalData.workouts?.length <= 4,
        warnings: goalData.workouts?.length > 4 ? [
          'Based on your beginner fitness level, we recommend no more than 4 workouts per week',
          'Consider starting with fewer workouts per week given your current activity level'
        ] : [],
        suggestions: goalData.workouts?.length > 4 ? [
          'Try our "Zero to Hero" beginner program',
          'Consider shorter, more intense workouts or adjust your time commitment'
        ] : [
          'This goal aligns well with your fitness level',
          'Great choice for building consistency'
        ],
        fitnessScore: 3.5,
        recommendedProgram: 'Zero to Hero - Complete Beginner'
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setRealismCheck(mockRealismCheck);
    } catch (error) {
      console.error('Error checking goal realism:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRealismLevel = () => {
    if (!realismCheck) return null;
    
    if (realismCheck.isRealistic) {
      return { level: 'excellent', color: 'success', text: 'Excellent' };
    } else if (realismCheck.warnings.length <= 2) {
      return { level: 'moderate', color: 'warning', text: 'Moderate' };
    } else {
      return { level: 'challenging', color: 'error', text: 'Challenging' };
    }
  };

  const getFitnessScoreColor = (score) => {
    if (score >= 4) return 'success';
    if (score >= 2.5) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <PsychologyIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">
              Analyzing Goal Realism
            </Typography>
          </Box>
          
          <Box display="flex" alignItems="center" mb={2}>
            <CircularProgress size={20} sx={{ mr: 2 }} />
            <Typography variant="body2" color="textSecondary">
              Evaluating your goal based on your fitness profile...
            </Typography>
          </Box>
          
          <LinearProgress variant="indeterminate" />
          
          <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center' }}>
            Checking fitness level, activity patterns, and goal intensity
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (!realismCheck) return null;

  const realismLevel = getRealismLevel();

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justify="space-between" mb={2}>
          <Box display="flex" alignItems="center">
            <PsychologyIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">
              Goal Realism Analysis
            </Typography>
          </Box>
          
          {realismLevel && (
            <Chip
              icon={realismCheck.isRealistic ? <CheckCircleIcon /> : <WarningIcon />}
              label={realismLevel.text}
              color={realismLevel.color}
              variant="outlined"
            />
          )}
        </Box>

        {/* Fitness Score */}
        <Box mb={2}>
          <Box display="flex" alignItems="center" justify="space-between" mb={1}>
            <Typography variant="body2" fontWeight="medium">
              Fitness Compatibility Score
            </Typography>
            <Chip
              label={`${realismCheck.fitnessScore}/5.0`}
              color={getFitnessScoreColor(realismCheck.fitnessScore)}
              size="small"
            />
          </Box>
          <LinearProgress
            variant="determinate"
            value={(realismCheck.fitnessScore / 5) * 100}
            sx={{ height: 8, borderRadius: 4 }}
            color={getFitnessScoreColor(realismCheck.fitnessScore)}
          />
        </Box>

        {/* Warnings */}
        {realismCheck.warnings.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Considerations:
            </Typography>
            <List dense>
              {realismCheck.warnings.map((warning, index) => (
                <ListItem key={index} sx={{ py: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <WarningIcon color="warning" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={warning}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Alert>
        )}

        {/* Suggestions */}
        {realismCheck.suggestions.length > 0 && (
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom display="flex" alignItems="center">
              <LightbulbIcon sx={{ mr: 1, fontSize: 16 }} />
              Recommendations:
            </Typography>
            <List dense>
              {realismCheck.suggestions.map((suggestion, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircleIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={suggestion}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Recommended Program */}
        {realismCheck.recommendedProgram && !realismCheck.isRealistic && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Recommended Alternative:
            </Typography>
            <Box display="flex" alignItems="center">
              <FitnessCenter sx={{ mr: 1, fontSize: 16 }} />
              <Typography variant="body2">
                {realismCheck.recommendedProgram}
              </Typography>
            </Box>
          </Alert>
        )}

        {/* Additional Details */}
        <Box mb={2}>
          <Button
            variant="text"
            size="small"
            onClick={() => setShowDetails(!showDetails)}
            startIcon={<TimelineIcon />}
          >
            {showDetails ? 'Hide' : 'Show'} Analysis Details
          </Button>
        </Box>

        {showDetails && (
          <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mb: 2 }}>
            <Typography variant="caption" display="block" gutterBottom>
              Analysis Factors:
            </Typography>
            <Typography variant="body2" component="ul" sx={{ mb: 1, pl: 2 }}>
              <li>Current fitness level and activity patterns</li>
              <li>Goal intensity and duration requirements</li>
              <li>Medical conditions and physical limitations</li>
              <li>Time availability and lifestyle factors</li>
              <li>Historical goal completion rates</li>
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Action Buttons */}
        <Box display="flex" gap={2} justifyContent="flex-end">
          {!realismCheck.isRealistic && onModify && (
            <Button
              variant="outlined"
              onClick={onModify}
              startIcon={<WarningIcon />}
            >
              Modify Goal
            </Button>
          )}
          
          <Button
            variant="contained"
            onClick={onAccept}
            color={realismCheck.isRealistic ? 'success' : 'warning'}
            startIcon={<CheckCircleIcon />}
          >
            {realismCheck.isRealistic ? 'Create Goal' : 'Create Anyway'}
          </Button>
        </Box>

        {!realismCheck.isRealistic && (
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
            You can still create this goal, but consider the recommendations for better success.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default GoalRealismChecker;
