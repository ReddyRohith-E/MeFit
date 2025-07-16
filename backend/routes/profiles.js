const express = require('express');
const { body } = require('express-validator');
const Profile = require('../models/Profile');
const { auth, selfOrAdmin } = require('../middleware/auth');
const validate = require('../middleware/validation');

const router = express.Router();

// Profile validation
const profileValidation = [
  body('weight')
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage('Weight must be a positive number less than 1000kg'),
  body('height')
    .optional()
    .isFloat({ min: 0, max: 300 })
    .withMessage('Height must be a positive number less than 300cm'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13 || age > 120) {
        throw new Error('Age must be between 13 and 120 years');
      }
      return true;
    }),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Gender must be one of: male, female, other, prefer_not_to_say'),
  body('fitnessLevel')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Fitness level must be one of: beginner, intermediate, advanced'),
  body('activityLevel')
    .isIn(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'])
    .withMessage('Activity level must be one of: sedentary, lightly_active, moderately_active, very_active, extremely_active'),
  body('fitnessGoals')
    .optional()
    .isArray()
    .withMessage('Fitness goals must be an array')
    .custom((value) => {
      const validGoals = ['weight_loss', 'muscle_gain', 'endurance', 'strength', 'flexibility', 'general_fitness'];
      if (value.some(goal => !validGoals.includes(goal))) {
        throw new Error('Invalid fitness goal provided');
      }
      return true;
    }),
  body('preferences.workoutTypes')
    .optional()
    .isArray()
    .withMessage('Workout types must be an array')
    .custom((value) => {
      const validTypes = ['cardio', 'strength', 'flexibility', 'sports', 'yoga', 'pilates', 'crossfit', 'swimming'];
      if (value.some(type => !validTypes.includes(type))) {
        throw new Error('Invalid workout type provided');
      }
      return true;
    }),
  body('preferences.workoutDuration')
    .optional()
    .isInt({ min: 15, max: 180 })
    .withMessage('Workout duration must be between 15 and 180 minutes'),
  body('preferences.workoutFrequency')
    .optional()
    .isInt({ min: 1, max: 7 })
    .withMessage('Workout frequency must be between 1 and 7 days per week')
];

// Calculate fitness evaluation
const calculateFitnessEvaluation = (profile) => {
  let score = 0;
  let recommendations = [];

  // Base score from fitness level
  switch (profile.fitnessLevel) {
    case 'beginner': score += 2; break;
    case 'intermediate': score += 4; break;
    case 'advanced': score += 6; break;
  }

  // Activity level adjustment
  switch (profile.activityLevel) {
    case 'sedentary': score += 1; break;
    case 'lightly_active': score += 2; break;
    case 'moderately_active': score += 3; break;
    case 'very_active': score += 4; break;
    case 'extremely_active': score += 5; break;
  }

  // Age factor
  if (profile.age) {
    if (profile.age < 30) score += 2;
    else if (profile.age < 50) score += 1;
    else if (profile.age >= 65) score -= 1;
  }

  // BMI factor
  if (profile.bmi) {
    const bmi = parseFloat(profile.bmi);
    if (bmi >= 18.5 && bmi <= 24.9) score += 1;
    else if (bmi >= 30) score -= 1;
  }

  // Medical conditions impact
  if (profile.medicalConditions && profile.medicalConditions.length > 0) {
    score -= profile.medicalConditions.length * 0.5;
    recommendations.push('Consider consulting with a healthcare provider before starting intensive workouts');
  }

  // Disabilities impact
  if (profile.disabilities && profile.disabilities.length > 0) {
    score -= profile.disabilities.length * 0.5;
    recommendations.push('Look for adaptive exercises that accommodate your specific needs');
  }

  // Generate recommendations based on score
  if (score <= 3) {
    recommendations.push('Start with light exercises and gradually increase intensity');
    recommendations.push('Focus on building consistency with 2-3 workouts per week');
  } else if (score <= 6) {
    recommendations.push('You can handle moderate intensity workouts');
    recommendations.push('Aim for 3-4 workouts per week with variety');
  } else {
    recommendations.push('You can handle high intensity workouts');
    recommendations.push('Consider 4-6 workouts per week with challenging programs');
  }

  return {
    score: Math.max(1, Math.min(10, Math.round(score))),
    level: score <= 3 ? 'beginner' : score <= 6 ? 'intermediate' : 'advanced',
    recommendations
  };
};

// POST /api/profiles
router.post('/', auth, profileValidation, validate, async (req, res) => {
  try {
    // Check if profile already exists
    const existingProfile = await Profile.findOne({ user: req.user._id });
    if (existingProfile) {
      return res.status(400).json({ message: 'Profile already exists for this user' });
    }

    const profileData = {
      ...req.body,
      user: req.user._id
    };

    const profile = new Profile(profileData);
    await profile.save();

    // Populate user data
    await profile.populate('user', 'firstName lastName email');

    // Calculate fitness evaluation
    const evaluation = calculateFitnessEvaluation(profile);

    res.status(201).json({
      message: 'Profile created successfully',
      profile,
      evaluation
    });
  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({ message: 'Failed to create profile' });
  }
});

// GET /api/profiles/:profileId
router.get('/:profileId', auth, async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.profileId)
      .populate('user', 'firstName lastName email profilePicture');

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Check if user can access this profile
    if (profile.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Calculate fitness evaluation
    const evaluation = calculateFitnessEvaluation(profile);

    res.json({
      profile,
      evaluation
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to retrieve profile' });
  }
});

// GET /api/profiles/user/:userId
router.get('/user/:userId', auth, selfOrAdmin, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.userId })
      .populate('user', 'firstName lastName email profilePicture');

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Calculate fitness evaluation
    const evaluation = calculateFitnessEvaluation(profile);

    res.json({
      profile,
      evaluation
    });
  } catch (error) {
    console.error('Get profile by user error:', error);
    res.status(500).json({ message: 'Failed to retrieve profile' });
  }
});

// PATCH /api/profiles/:profileId
router.patch('/:profileId', auth, profileValidation, validate, async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.profileId);

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Check if user can update this profile
    if (profile.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update profile
    Object.keys(req.body).forEach(key => {
      if (key !== 'user') { // Prevent changing the user association
        profile[key] = req.body[key];
      }
    });

    await profile.save();
    await profile.populate('user', 'firstName lastName email profilePicture');

    // Calculate fitness evaluation
    const evaluation = calculateFitnessEvaluation(profile);

    res.json({
      message: 'Profile updated successfully',
      profile,
      evaluation
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// DELETE /api/profiles/:profileId
router.delete('/:profileId', auth, async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.profileId);

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Check if user can delete this profile
    if (profile.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Profile.findByIdAndDelete(req.params.profileId);

    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({ message: 'Failed to delete profile' });
  }
});

// GET /api/profiles/me/evaluation
router.get('/me/evaluation', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const evaluation = calculateFitnessEvaluation(profile);

    res.json({ evaluation });
  } catch (error) {
    console.error('Get fitness evaluation error:', error);
    res.status(500).json({ message: 'Failed to get fitness evaluation' });
  }
});

module.exports = router;
