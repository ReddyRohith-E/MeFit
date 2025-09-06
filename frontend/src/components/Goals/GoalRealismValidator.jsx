import React, { useState, useEffect } from 'react';
import {
  Box,
  Alert,
  Typography,
  Chip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress
} from '@mui/material';
import {
  Warning,
  CheckCircle,
  Info,
  FitnessCenter,
  Timer,
  Speed,
  TrendingUp
} from '@mui/icons-material';

const GoalRealismChecker = ({ goal, userProfile, userEvaluation }) => {
  const [realismAnalysis, setRealismAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (goal && userProfile && userEvaluation) {
      analyzeGoalRealism();
    }
  }, [goal, userProfile, userEvaluation]);

  const analyzeGoalRealism = () => {
    setLoading(true);
    
    // Simulate analysis delay
    setTimeout(() => {
      const analysis = performRealismCheck();
      setRealismAnalysis(analysis);
      setLoading(false);
    }, 1000);
  };

  const performRealismCheck = () => {
    const warnings = [];
    const recommendations = [];
    let overallScore = 100;
    let riskLevel = 'low';

    // Check workout frequency against fitness level
    const maxWeeklyWorkouts = userEvaluation.maxWeeklyWorkouts || 3;
    const goalWorkouts = goal.workouts?.length || 0;
    
    if (goalWorkouts > maxWeeklyWorkouts) {
      warnings.push({
        type: 'frequency',
        severity: 'high',
        message: `Goal includes ${goalWorkouts} workouts per week, but your fitness level supports maximum ${maxWeeklyWorkouts} workouts`,
        recommendation: `Consider reducing to ${maxWeeklyWorkouts} workouts or less per week`
      });
      overallScore -= 30;
      riskLevel = 'high';
    } else if (goalWorkouts === maxWeeklyWorkouts && userEvaluation.level === 'Beginner') {
      warnings.push({
        type: 'frequency',
        severity: 'medium',
        message: `Goal is at your maximum recommended frequency (${goalWorkouts}/week)`,
        recommendation: 'Consider starting with fewer workouts and gradually increasing'
      });
      overallScore -= 15;
      riskLevel = 'medium';
    }

    // Check workout duration against fitness level
    const maxDuration = userEvaluation.maxWorkoutDuration || 30;
    const avgDuration = goal.workouts?.reduce((acc, w) => acc + (w.estimatedDuration || 45), 0) / (goal.workouts?.length || 1);
    
    if (avgDuration > maxDuration) {
      warnings.push({
        type: 'duration',
        severity: 'high',
        message: `Average workout duration (${Math.round(avgDuration)} min) exceeds your recommended maximum (${maxDuration} min)`,
        recommendation: `Consider shortening workouts to ${maxDuration} minutes or less`
      });
      overallScore -= 25;
      riskLevel = 'high';
    }

    // Check intensity based on fitness level
    const userMaxIntensity = getUserMaxIntensity(userEvaluation.level);
    const goalIntensity = calculateGoalIntensity(goal);
    
    if (goalIntensity > userMaxIntensity) {
      warnings.push({
        type: 'intensity',
        severity: 'high',
        message: `Goal intensity (${getIntensityLabel(goalIntensity)}) is higher than recommended for ${userEvaluation.level} level`,
        recommendation: `Consider ${getIntensityLabel(userMaxIntensity)} intensity exercises instead`
      });
      overallScore -= 20;
      riskLevel = 'high';
    }

    // Check for medical conditions
    if (userProfile.medicalConditions?.length > 0 && !goal.considersConditions) {
      warnings.push({
        type: 'medical',
        severity: 'medium',
        message: 'Goal may not account for your medical conditions',
        recommendation: 'Consult with healthcare provider and modify exercises as needed'
      });
      overallScore -= 15;
      if (riskLevel === 'low') riskLevel = 'medium';
    }

    // Check goal timeline realism
    const goalDuration = calculateGoalDuration(goal);
    const fitnessLevel = userEvaluation.level;
    
    if (isTimelineUnrealistic(goalDuration, fitnessLevel, goal.type)) {
      warnings.push({
        type: 'timeline',
        severity: 'medium',
        message: 'Goal timeline may be too ambitious for your current fitness level',
        recommendation: 'Consider extending the timeline or reducing the scope'
      });
      overallScore -= 10;
      if (riskLevel === 'low') riskLevel = 'medium';
    }

    // Generate positive recommendations
    if (warnings.length === 0) {
      recommendations.push('Goal appears well-suited to your fitness level');
      recommendations.push('Remember to listen to your body and rest when needed');
    } else {
      recommendations.push('Consider modifying the goal based on the warnings above');
      recommendations.push('Start conservatively and increase intensity gradually');
    }

    if (userEvaluation.level === 'Beginner') {
      recommendations.push('Focus on building consistency before increasing intensity');
      recommendations.push('Include adequate rest days between workouts');
    }

    return {
      overallScore: Math.max(0, overallScore),
      riskLevel,
      warnings,
      recommendations,
      isRealistic: overallScore >= 70,
      shouldProceed: riskLevel !== 'high'
    };
  };

  const getUserMaxIntensity = (fitnessLevel) => {
    const intensityMap = {
      'Beginner': 2,
      'Novice': 2,
      'Intermediate': 3,
      'Advanced': 4,
      'Expert': 4
    };
    return intensityMap[fitnessLevel] || 2;
  };

  const calculateGoalIntensity = (goal) => {
    // This would typically analyze the exercises in the goal
    // For demo purposes, we'll use a simple heuristic
    const workoutCount = goal.workouts?.length || 0;
    const avgDuration = goal.workouts?.reduce((acc, w) => acc + (w.estimatedDuration || 45), 0) / Math.max(1, workoutCount);
    
    if (workoutCount >= 6 || avgDuration >= 75) return 4; // High intensity
    if (workoutCount >= 4 || avgDuration >= 60) return 3; // Medium-high intensity
    if (workoutCount >= 3 || avgDuration >= 45) return 2; // Medium intensity
    return 1; // Low intensity
  };

  const getIntensityLabel = (intensity) => {
    const labels = {
      1: 'Low',
      2: 'Medium',
      3: 'Medium-High',
      4: 'High'
    };
    return labels[intensity] || 'Unknown';
  };

  const calculateGoalDuration = (goal) => {
    if (goal.endDate && goal.startDate) {
      const start = new Date(goal.startDate);
      const end = new Date(goal.endDate);
      return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }
    return 7; // Default to 1 week
  };

  const isTimelineUnrealistic = (duration, fitnessLevel, goalType) => {
    // Basic heuristics for timeline realism
    if (fitnessLevel === 'Beginner' && duration < 14) return true;
    if (goalType === 'weight_loss' && duration < 21) return true;
    if (goalType === 'muscle_gain' && duration < 28) return true;
    return false;
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'info';
    }
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'info';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Info sx={{ mr: 1 }} />
            <Typography variant="h6">Analyzing Goal Realism...</Typography>
          </Box>
          <LinearProgress />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Checking goal against your fitness level and health profile
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (!realismAnalysis) return null;

  return (
    <Box>
      {/* Overall Assessment */}
      <Alert 
        severity={getRiskLevelColor(realismAnalysis.riskLevel)} 
        sx={{ mb: 2 }}
        icon={realismAnalysis.isRealistic ? <CheckCircle /> : <Warning />}
      >
        <Typography variant="h6" gutterBottom>
          Goal Realism Assessment - SRS FE-04
        </Typography>
        <Box display="flex" alignItems="center" gap={2} mb={1}>
          <Typography variant="body1">
            Realism Score: {realismAnalysis.overallScore}/100
          </Typography>
          <Chip 
            label={`${realismAnalysis.riskLevel.toUpperCase()} RISK`}
            color={getRiskLevelColor(realismAnalysis.riskLevel)}
            size="small"
          />
        </Box>
        <Typography variant="body2">
          {realismAnalysis.isRealistic 
            ? "This goal appears realistic for your current fitness level."
            : "This goal may be too ambitious. Consider the recommendations below."
          }
        </Typography>
      </Alert>

      {/* Warnings */}
      {realismAnalysis.warnings.length > 0 && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center">
              <Warning sx={{ mr: 1, color: 'warning.main' }} />
              Warnings & Concerns
            </Typography>
            <List dense>
              {realismAnalysis.warnings.map((warning, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {warning.type === 'frequency' && <FitnessCenter color={getSeverityColor(warning.severity)} />}
                    {warning.type === 'duration' && <Timer color={getSeverityColor(warning.severity)} />}
                    {warning.type === 'intensity' && <Speed color={getSeverityColor(warning.severity)} />}
                    {warning.type === 'medical' && <Warning color={getSeverityColor(warning.severity)} />}
                    {warning.type === 'timeline' && <TrendingUp color={getSeverityColor(warning.severity)} />}
                  </ListItemIcon>
                  <ListItemText
                    primary={warning.message}
                    secondary={`Recommendation: ${warning.recommendation}`}
                    primaryTypographyProps={{ 
                      color: warning.severity === 'high' ? 'error' : 'textPrimary' 
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom display="flex" alignItems="center">
            <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
            Recommendations
          </Typography>
          <List dense>
            {realismAnalysis.recommendations.map((rec, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckCircle color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={rec} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Action Required Notice */}
      {!realismAnalysis.shouldProceed && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="body1" fontWeight={600}>
            Goal Modification Required
          </Typography>
          <Typography variant="body2">
            Based on your fitness evaluation, this goal has high risk factors. 
            Please address the warnings above before proceeding, or consult with a fitness professional.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default GoalRealismChecker;
