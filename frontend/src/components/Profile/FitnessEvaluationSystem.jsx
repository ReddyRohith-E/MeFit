import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  LinearProgress,
  Grid
} from '@mui/material';
import {
  Psychology,
  Speed,
  Assessment,
  Warning,
  CheckCircle,
  FitnessCenter
} from '@mui/icons-material';

const FitnessEvaluationSystem = ({ userProfile, onEvaluationComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [evaluation, setEvaluation] = useState({
    age: userProfile?.age || '',
    height: userProfile?.height || '',
    weight: userProfile?.weight || '',
    activityLevel: '',
    exerciseExperience: '',
    medicalConditions: userProfile?.medicalConditions || [],
    fitnessGoals: [],
    previousInjuries: [],
    timeAvailable: '',
    preferredIntensity: ''
  });
  const [fitnessScore, setFitnessScore] = useState(null);
  const [loading, setLoading] = useState(false);

  const steps = [
    'Basic Information',
    'Activity Assessment',
    'Experience & Goals',
    'Health & Safety',
    'Evaluation Results'
  ];

  const activityLevels = [
    { value: 'sedentary', label: 'Sedentary (little to no exercise)', multiplier: 1.2 },
    { value: 'light', label: 'Lightly active (light exercise 1-3 days/week)', multiplier: 1.375 },
    { value: 'moderate', label: 'Moderately active (moderate exercise 3-5 days/week)', multiplier: 1.55 },
    { value: 'active', label: 'Very active (hard exercise 6-7 days/week)', multiplier: 1.725 },
    { value: 'extra', label: 'Extremely active (very hard exercise, physical job)', multiplier: 1.9 }
  ];

  const experienceLevels = [
    { value: 'beginner', label: 'Beginner (0-6 months)', score: 1 },
    { value: 'novice', label: 'Novice (6-12 months)', score: 2 },
    { value: 'intermediate', label: 'Intermediate (1-3 years)', score: 3 },
    { value: 'advanced', label: 'Advanced (3+ years)', score: 4 },
    { value: 'expert', label: 'Expert/Professional', score: 5 }
  ];

  const intensityLevels = [
    { value: 'low', label: 'Low intensity (comfortable pace)', score: 1 },
    { value: 'moderate', label: 'Moderate intensity (slightly challenging)', score: 2 },
    { value: 'high', label: 'High intensity (challenging)', score: 3 },
    { value: 'extreme', label: 'Extreme intensity (very challenging)', score: 4 }
  ];

  const calculateFitnessScore = () => {
    setLoading(true);
    
    setTimeout(() => {
      let score = 0;
      let maxScore = 100;
      
      // Age factor (younger = higher score)
      const age = parseInt(evaluation.age);
      if (age < 25) score += 25;
      else if (age < 35) score += 20;
      else if (age < 45) score += 15;
      else if (age < 55) score += 10;
      else score += 5;

      // BMI calculation and scoring
      const height = parseInt(evaluation.height) / 100; // Convert cm to m
      const weight = parseInt(evaluation.weight);
      const bmi = weight / (height * height);
      
      if (bmi >= 18.5 && bmi <= 24.9) score += 20; // Normal BMI
      else if (bmi >= 25 && bmi <= 29.9) score += 15; // Overweight
      else if (bmi < 18.5) score += 10; // Underweight
      else score += 5; // Obese

      // Activity level scoring
      const activityMultiplier = activityLevels.find(a => a.value === evaluation.activityLevel)?.multiplier || 1.2;
      score += Math.min(25, (activityMultiplier - 1.2) * 50);

      // Experience level scoring
      const experienceScore = experienceLevels.find(e => e.value === evaluation.exerciseExperience)?.score || 1;
      score += experienceScore * 5;

      // Intensity preference scoring
      const intensityScore = intensityLevels.find(i => i.value === evaluation.preferredIntensity)?.score || 1;
      score += intensityScore * 3;

      // Medical conditions penalty
      if (evaluation.medicalConditions.length > 0) {
        score -= evaluation.medicalConditions.length * 5;
      }

      // Previous injuries penalty
      if (evaluation.previousInjuries.length > 0) {
        score -= evaluation.previousInjuries.length * 3;
      }

      // Ensure score is between 0 and 100
      score = Math.max(0, Math.min(100, score));

      const fitnessLevel = getFitnessLevel(score);
      const recommendations = getRecommendations(score, evaluation);
      
      setFitnessScore({
        score,
        level: fitnessLevel,
        recommendations,
        bmi: bmi.toFixed(1),
        maxWeeklyWorkouts: getMaxWeeklyWorkouts(score),
        maxWorkoutDuration: getMaxWorkoutDuration(score),
        recommendedIntensity: getRecommendedIntensity(score)
      });
      
      setLoading(false);
      setCurrentStep(4);
      
      // Save evaluation to backend
      saveEvaluation(score, fitnessLevel);
    }, 2000);
  };

  const getFitnessLevel = (score) => {
    if (score >= 80) return 'Expert';
    if (score >= 60) return 'Advanced';
    if (score >= 40) return 'Intermediate';
    if (score >= 20) return 'Novice';
    return 'Beginner';
  };

  const getMaxWeeklyWorkouts = (score) => {
    if (score >= 80) return 7;
    if (score >= 60) return 5;
    if (score >= 40) return 4;
    if (score >= 20) return 3;
    return 2;
  };

  const getMaxWorkoutDuration = (score) => {
    if (score >= 80) return 90;
    if (score >= 60) return 75;
    if (score >= 40) return 60;
    if (score >= 20) return 45;
    return 30;
  };

  const getRecommendedIntensity = (score) => {
    if (score >= 80) return 'High to Extreme';
    if (score >= 60) return 'Moderate to High';
    if (score >= 40) return 'Low to Moderate';
    return 'Low';
  };

  const getRecommendations = (score, evaluationData) => {
    const recommendations = [];
    
    if (score < 30) {
      recommendations.push("Start with low-intensity exercises and gradually increase");
      recommendations.push("Focus on building basic cardiovascular fitness");
      recommendations.push("Consider working with a fitness professional");
    } else if (score < 60) {
      recommendations.push("Mix cardiovascular and strength training exercises");
      recommendations.push("Gradually increase workout intensity");
      recommendations.push("Ensure proper rest between workout days");
    } else {
      recommendations.push("Challenge yourself with varied workout routines");
      recommendations.push("Consider high-intensity interval training");
      recommendations.push("Focus on specific fitness goals");
    }

    if (evaluationData.medicalConditions.length > 0) {
      recommendations.push("Consult with healthcare provider before starting new programs");
    }

    if (evaluationData.previousInjuries.length > 0) {
      recommendations.push("Pay attention to previous injury areas and modify exercises accordingly");
    }

    return recommendations;
  };

  const saveEvaluation = async (score, level) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/profile/fitness-evaluation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...evaluation,
          fitnessScore: score,
          fitnessLevel: level,
          evaluationDate: new Date().toISOString()
        })
      });

      if (onEvaluationComplete) {
        onEvaluationComplete({
          score,
          level,
          maxWeeklyWorkouts: getMaxWeeklyWorkouts(score),
          maxWorkoutDuration: getMaxWorkoutDuration(score)
        });
      }
    } catch (error) {
      console.error('Error saving fitness evaluation:', error);
    }
  };

  const handleNext = () => {
    if (currentStep === 3) {
      calculateFitnessScore();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return evaluation.age && evaluation.height && evaluation.weight;
      case 1:
        return evaluation.activityLevel && evaluation.timeAvailable;
      case 2:
        return evaluation.exerciseExperience && evaluation.preferredIntensity;
      case 3:
        return true; // Health section is optional
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Basic Physical Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Age"
                  type="number"
                  value={evaluation.age}
                  onChange={(e) => setEvaluation(prev => ({ ...prev, age: e.target.value }))}
                  inputProps={{ min: 13, max: 100 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Height (cm)"
                  type="number"
                  value={evaluation.height}
                  onChange={(e) => setEvaluation(prev => ({ ...prev, height: e.target.value }))}
                  inputProps={{ min: 100, max: 250 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Weight (kg)"
                  type="number"
                  value={evaluation.weight}
                  onChange={(e) => setEvaluation(prev => ({ ...prev, weight: e.target.value }))}
                  inputProps={{ min: 30, max: 300 }}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Activity Level Assessment
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Current Activity Level</InputLabel>
                  <Select
                    value={evaluation.activityLevel}
                    onChange={(e) => setEvaluation(prev => ({ ...prev, activityLevel: e.target.value }))}
                    label="Current Activity Level"
                  >
                    {activityLevels.map((level) => (
                      <MenuItem key={level.value} value={level.value}>
                        {level.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Time Available for Workouts</InputLabel>
                  <Select
                    value={evaluation.timeAvailable}
                    onChange={(e) => setEvaluation(prev => ({ ...prev, timeAvailable: e.target.value }))}
                    label="Time Available for Workouts"
                  >
                    <MenuItem value="15-30">15-30 minutes per day</MenuItem>
                    <MenuItem value="30-45">30-45 minutes per day</MenuItem>
                    <MenuItem value="45-60">45-60 minutes per day</MenuItem>
                    <MenuItem value="60+">60+ minutes per day</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Experience & Goals
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Exercise Experience</InputLabel>
                  <Select
                    value={evaluation.exerciseExperience}
                    onChange={(e) => setEvaluation(prev => ({ ...prev, exerciseExperience: e.target.value }))}
                    label="Exercise Experience"
                  >
                    {experienceLevels.map((level) => (
                      <MenuItem key={level.value} value={level.value}>
                        {level.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Preferred Workout Intensity</InputLabel>
                  <Select
                    value={evaluation.preferredIntensity}
                    onChange={(e) => setEvaluation(prev => ({ ...prev, preferredIntensity: e.target.value }))}
                    label="Preferred Workout Intensity"
                  >
                    {intensityLevels.map((level) => (
                      <MenuItem key={level.value} value={level.value}>
                        {level.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Health & Safety Information
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              This information helps us provide safer workout recommendations. All fields are optional.
            </Alert>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Medical Conditions (comma separated)"
                  value={evaluation.medicalConditions.join(', ')}
                  onChange={(e) => setEvaluation(prev => ({
                    ...prev,
                    medicalConditions: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  }))}
                  placeholder="e.g., diabetes, heart condition, asthma"
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Previous Injuries (comma separated)"
                  value={evaluation.previousInjuries.join(', ')}
                  onChange={(e) => setEvaluation(prev => ({
                    ...prev,
                    previousInjuries: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  }))}
                  placeholder="e.g., knee injury, back problems, shoulder injury"
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 4:
        return (
          <Box>
            {loading ? (
              <Box textAlign="center" py={4}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Calculating your fitness evaluation...
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Analyzing your responses to create personalized recommendations
                </Typography>
              </Box>
            ) : fitnessScore && (
              <Box>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                  <Assessment sx={{ mr: 1 }} />
                  Your Fitness Evaluation Results
                </Typography>

                <Card sx={{ mb: 3, bgcolor: 'primary.50' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" justify="space-between">
                      <Box>
                        <Typography variant="h4" color="primary">
                          {fitnessScore.score}/100
                        </Typography>
                        <Typography variant="h6">
                          Fitness Level: {fitnessScore.level}
                        </Typography>
                      </Box>
                      <FitnessCenter sx={{ fontSize: 60, color: 'primary.main' }} />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={fitnessScore.score}
                      sx={{ mt: 2, height: 8, borderRadius: 4 }}
                    />
                  </CardContent>
                </Card>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Workout Limits (SRS Compliance)
                        </Typography>
                        <Box mb={2}>
                          <Chip 
                            label={`Max ${fitnessScore.maxWeeklyWorkouts} workouts/week`} 
                            color="primary" 
                            sx={{ mr: 1, mb: 1 }}
                          />
                          <Chip 
                            label={`Max ${fitnessScore.maxWorkoutDuration} min/session`} 
                            color="secondary" 
                            sx={{ mr: 1, mb: 1 }}
                          />
                          <Chip 
                            label={`${fitnessScore.recommendedIntensity} intensity`} 
                            color="info" 
                            sx={{ mb: 1 }}
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary">
                          BMI: {fitnessScore.bmi}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Recommendations
                        </Typography>
                        <Box>
                          {fitnessScore.recommendations.map((rec, index) => (
                            <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                              • {rec}
                            </Typography>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Alert severity="success" sx={{ mt: 3 }}>
                  <Typography variant="body1" fontWeight={600}>
                    Evaluation Complete!
                  </Typography>
                  <Typography variant="body2">
                    Your fitness level will be used to limit goal setting and provide appropriate workout recommendations.
                    Goals exceeding your fitness level limits will show warnings as per SRS requirements.
                  </Typography>
                </Alert>
              </Box>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom display="flex" alignItems="center">
        <Psychology sx={{ mr: 2 }} />
        Fitness Evaluation - SRS FE-11
      </Typography>
      
      <Typography variant="body1" color="textSecondary" paragraph>
        Complete this evaluation to receive personalized workout recommendations and goal limitations based on your fitness level.
      </Typography>

      <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box minHeight={400}>
        {renderStepContent()}
      </Box>

      <Box display="flex" justify="space-between" mt={4}>
        <Button
          onClick={handleBack}
          disabled={currentStep === 0 || loading}
        >
          Back
        </Button>
        
        {currentStep < 4 && (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!isStepValid() || loading}
          >
            {currentStep === 3 ? 'Calculate Fitness Score' : 'Next'}
          </Button>
        )}
        
        {currentStep === 4 && fitnessScore && (
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
            onClick={() => window.location.href = '/app/dashboard'}
          >
            Complete Evaluation
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default FitnessEvaluationSystem;
