const express = require('express');
const { body } = require('express-validator');
const Program = require('../models/Program');
const Workout = require('../models/Workout');
const { auth, contributor } = require('../middleware/auth');
const validate = require('../middleware/validation');

const router = express.Router();

// Program validation
const programValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Program name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('category')
    .isIn([
      'weight_loss', 'muscle_building', 'strength_training', 'endurance',
      'flexibility', 'rehabilitation', 'sports_specific', 'general_fitness'
    ])
    .withMessage('Invalid program category'),
  body('difficulty')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Difficulty must be beginner, intermediate, or advanced'),
  body('duration')
    .isInt({ min: 1, max: 52 })
    .withMessage('Program duration must be between 1 and 52 weeks'),
  body('workoutsPerWeek')
    .isInt({ min: 1, max: 7 })
    .withMessage('Workouts per week must be between 1 and 7'),
  body('estimatedTimePerSession')
    .isInt({ min: 15, max: 180 })
    .withMessage('Estimated time per session must be between 15 and 180 minutes'),
  body('workouts')
    .isArray({ min: 1 })
    .withMessage('Program must have at least one workout')
];

// GET /program - SRS API-01 compliant (only search query parameter allowed)
router.get('/', auth, async (req, res) => {
  try {
    // SRS API-01: Only search query parameter allowed
    const { search } = req.query;
    
    // Get filtering parameters from headers or use defaults
    const page = parseInt(req.headers['x-page']) || 1;
    const limit = parseInt(req.headers['x-limit']) || 20;
    const category = req.headers['x-category'] || '';
    const difficulty = req.headers['x-difficulty'] || '';
    const duration = req.headers['x-duration'] || '';
    const sortBy = req.headers['x-sort-by'] || 'name';

    const skip = (page - 1) * limit;

    // Build query
    let query = { isActive: true };

    if (search) {
      query.$text = { $search: search };
    }

    if (category) {
      query.category = category;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (duration) {
      switch (duration) {
        case 'short':
          query.duration = { $lte: 4 };
          break;
        case 'medium':
          query.duration = { $gt: 4, $lte: 12 };
          break;
        case 'long':
          query.duration = { $gt: 12 };
          break;
      }
    }

    // Build sort
    let sort = {};
    switch (sortBy) {
      case 'duration':
        sort = { duration: 1 };
        break;
      case 'difficulty':
        sort = { difficulty: 1, name: 1 };
        break;
      case 'category':
        sort = { category: 1, name: 1 };
        break;
      case 'rating':
        sort = { 'rating.average': -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      default:
        sort = { name: 1 };
    }

    const programs = await Program.find(query)
      .populate('createdBy', 'firstName lastName')
      .populate('workouts.workout', 'name type estimatedDuration difficulty')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Program.countDocuments(query);

    res.json({
      programs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get programs error:', error);
    res.status(500).json({ message: 'Failed to retrieve programs' });
  }
});

// GET /api/programs/:programId
router.get('/:programId', auth, async (req, res) => {
  try {
    const program = await Program.findOne({
      _id: req.params.programId,
      isActive: true
    })
      .populate('createdBy', 'firstName lastName')
      .populate({
        path: 'workouts.workout',
        populate: {
          path: 'sets.exercise',
          select: 'name targetMuscleGroup'
        }
      });

    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    res.json({ program });
  } catch (error) {
    console.error('Get program error:', error);
    res.status(500).json({ message: 'Failed to retrieve program' });
  }
});

// POST /api/programs
router.post('/', auth, contributor, programValidation, validate, async (req, res) => {
  try {
    // Validate that all workouts exist
    const workoutIds = req.body.workouts.map(w => w.workout);
    const workouts = await Workout.find({
      _id: { $in: workoutIds },
      isActive: true
    });

    if (workouts.length !== workoutIds.length) {
      return res.status(400).json({ message: 'One or more workouts not found' });
    }

    // Calculate total equipment needed
    const allEquipment = workouts.flatMap(w => w.equipment);
    const equipment = [...new Set(allEquipment)];

    const programData = {
      ...req.body,
      createdBy: req.user._id,
      equipment
    };

    const program = new Program(programData);
    await program.save();

    await program.populate([
      { path: 'createdBy', select: 'firstName lastName' },
      { path: 'workouts.workout', select: 'name type estimatedDuration difficulty' }
    ]);

    res.status(201).json({
      message: 'Program created successfully',
      program
    });
  } catch (error) {
    console.error('Create program error:', error);
    res.status(500).json({ message: 'Failed to create program' });
  }
});

// PATCH /api/programs/:programId
router.patch('/:programId', auth, contributor, programValidation, validate, async (req, res) => {
  try {
    const program = await Program.findOne({
      _id: req.params.programId,
      isActive: true
    });

    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    // Check if user created this program or is admin
    if (program.createdBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'You can only edit programs you created' });
    }

    // Validate workouts if being updated
    if (req.body.workouts) {
      const workoutIds = req.body.workouts.map(w => w.workout);
      const workouts = await Workout.find({
        _id: { $in: workoutIds },
        isActive: true
      });

      if (workouts.length !== workoutIds.length) {
        return res.status(400).json({ message: 'One or more workouts not found' });
      }

      // Update equipment
      const allEquipment = workouts.flatMap(w => w.equipment);
      const equipment = [...new Set(allEquipment)];
      req.body.equipment = equipment;
    }

    Object.keys(req.body).forEach(key => {
      if (key !== 'createdBy' && key !== 'rating') {
        program[key] = req.body[key];
      }
    });

    await program.save();
    await program.populate([
      { path: 'createdBy', select: 'firstName lastName' },
      { path: 'workouts.workout', select: 'name type estimatedDuration difficulty' }
    ]);

    res.json({
      message: 'Program updated successfully',
      program
    });
  } catch (error) {
    console.error('Update program error:', error);
    res.status(500).json({ message: 'Failed to update program' });
  }
});

// DELETE /api/programs/:programId
router.delete('/:programId', auth, contributor, async (req, res) => {
  try {
    const program = await Program.findOne({
      _id: req.params.programId,
      isActive: true
    });

    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    // Check if user created this program or is admin
    if (program.createdBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'You can only delete programs you created' });
    }

    // Soft delete
    program.isActive = false;
    await program.save();

    res.json({ message: 'Program deleted successfully' });
  } catch (error) {
    console.error('Delete program error:', error);
    res.status(500).json({ message: 'Failed to delete program' });
  }
});

// GET /api/programs/categories/list
router.get('/categories/list', auth, (req, res) => {
  const categories = [
    'weight_loss', 'muscle_building', 'strength_training', 'endurance',
    'flexibility', 'rehabilitation', 'sports_specific', 'general_fitness'
  ];
  res.json({ categories });
});

// GET /api/programs/my/created
router.get('/my/created', auth, contributor, async (req, res) => {
  try {
    const programs = await Program.find({
      createdBy: req.user._id,
      isActive: true
    })
      .populate('workouts.workout', 'name type estimatedDuration')
      .sort({ createdAt: -1 });

    res.json({ programs });
  } catch (error) {
    console.error('Get my programs error:', error);
    res.status(500).json({ message: 'Failed to retrieve your programs' });
  }
});

// GET /program/suggestions/:userId - SRS FE-04: Program suggestions based on fitness evaluation
router.get('/suggestions/:userId', auth, async (req, res) => {
  try {
    const Profile = require('../models/Profile');
    const userId = req.params.userId;
    
    // Get user profile for intelligent suggestions
    const profile = await Profile.findOne({ user: userId });
    
    let query = { isActive: true };
    let sortCriteria = { 'rating.average': -1, createdAt: -1 };
    
    if (profile) {
      // Smart suggestions based on user profile
      const fitnessLevel = profile.fitnessLevel || 'beginner';
      const fitnessGoals = profile.fitnessGoals || [];
      const preferences = profile.preferences || {};
      
      // Filter by appropriate difficulty
      query.difficulty = fitnessLevel;
      
      // If user has specific goals, prioritize matching categories
      if (fitnessGoals.length > 0) {
        const categoryMapping = {
          'weight_loss': ['weight_loss', 'cardio', 'general_fitness'],
          'muscle_gain': ['muscle_building', 'strength_training'],
          'endurance': ['endurance', 'cardio'],
          'strength': ['strength_training', 'muscle_building'],
          'flexibility': ['flexibility', 'yoga'],
          'general_fitness': ['general_fitness', 'weight_loss']
        };
        
        const matchingCategories = fitnessGoals.flatMap(goal => 
          categoryMapping[goal] || [goal]
        );
        
        if (matchingCategories.length > 0) {
          query.category = { $in: matchingCategories };
        }
      }
      
      // Consider workout duration preferences
      if (preferences.workoutDuration) {
        const maxDuration = preferences.workoutDuration;
        query.estimatedTimePerSession = { $lte: maxDuration + 15 }; // Allow 15min buffer
      }
      
      // Consider workout frequency preferences
      if (preferences.workoutFrequency) {
        query.workoutsPerWeek = { $lte: preferences.workoutFrequency };
      }
      
      // Consider medical conditions
      if (profile.medicalConditions && profile.medicalConditions.length > 0) {
        // Prioritize low-impact programs
        query.category = { $in: ['flexibility', 'rehabilitation', 'general_fitness'] };
        sortCriteria = { difficulty: 1, 'rating.average': -1 };
      }
    } else {
      // Fallback for users without profiles
      query.difficulty = 'beginner';
    }
    
    const suggestions = await Program.find(query)
      .populate('workouts.workout', 'name type estimatedDuration')
      .populate('createdBy', 'firstName lastName')
      .limit(5)
      .sort(sortCriteria);
    
    // Add personalized reasons for each suggestion
    const enhancedSuggestions = suggestions.map(program => ({
      ...program.toJSON(),
      recommendationReason: generateRecommendationReason(program, profile),
      matchScore: calculateMatchScore(program, profile)
    }));
    
    // Sort by match score if profile exists
    if (profile) {
      enhancedSuggestions.sort((a, b) => b.matchScore - a.matchScore);
    }

    res.json({ 
      suggestions: enhancedSuggestions,
      basedOnProfile: !!profile,
      userFitnessLevel: profile?.fitnessLevel || 'unknown'
    });
  } catch (error) {
    console.error('Get program suggestions error:', error);
    res.status(500).json({ message: 'Failed to get program suggestions' });
  }
});

// Helper function to generate recommendation reasons
const generateRecommendationReason = (program, profile) => {
  if (!profile) {
    return 'Great starting program for beginners';
  }
  
  const reasons = [];
  
  if (program.difficulty === profile.fitnessLevel) {
    reasons.push(`Matches your ${profile.fitnessLevel} fitness level`);
  }
  
  if (profile.fitnessGoals && profile.fitnessGoals.some(goal => 
    program.category.includes(goal) || goal.includes(program.category)
  )) {
    reasons.push('Aligns with your fitness goals');
  }
  
  if (profile.preferences?.workoutDuration && 
      program.estimatedTimePerSession <= profile.preferences.workoutDuration + 15) {
    reasons.push('Fits your preferred workout duration');
  }
  
  if (program.rating?.average >= 4) {
    reasons.push('Highly rated by other users');
  }
  
  return reasons.length > 0 ? reasons.join(', ') : 'Recommended for you';
};

// Helper function to calculate match score
const calculateMatchScore = (program, profile) => {
  if (!profile) return 50; // Default score
  
  let score = 0;
  
  // Fitness level match (30 points)
  if (program.difficulty === profile.fitnessLevel) score += 30;
  else if (Math.abs(['beginner', 'intermediate', 'advanced'].indexOf(program.difficulty) - 
                    ['beginner', 'intermediate', 'advanced'].indexOf(profile.fitnessLevel)) === 1) score += 15;
  
  // Goals alignment (25 points)
  if (profile.fitnessGoals) {
    const goalMatch = profile.fitnessGoals.some(goal => 
      program.category.includes(goal) || goal.includes(program.category)
    );
    if (goalMatch) score += 25;
  }
  
  // Duration preference (20 points)
  if (profile.preferences?.workoutDuration) {
    const durationDiff = Math.abs(program.estimatedTimePerSession - profile.preferences.workoutDuration);
    if (durationDiff <= 15) score += 20;
    else if (durationDiff <= 30) score += 10;
  }
  
  // Frequency preference (15 points)
  if (profile.preferences?.workoutFrequency && 
      program.workoutsPerWeek <= profile.preferences.workoutFrequency) {
    score += 15;
  }
  
  // Rating bonus (10 points)
  if (program.rating?.average >= 4) score += 10;
  else if (program.rating?.average >= 3) score += 5;
  
  return score;
};

// POST /api/programs/:programId/rate
router.post('/:programId/rate', auth, async (req, res) => {
  try {
    const { rating } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const program = await Program.findOne({
      _id: req.params.programId,
      isActive: true
    });

    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    // Simple rating implementation (in production, you'd want to track individual user ratings)
    const currentTotal = program.rating.average * program.rating.count;
    const newCount = program.rating.count + 1;
    const newAverage = (currentTotal + rating) / newCount;

    program.rating.average = Math.round(newAverage * 10) / 10;
    program.rating.count = newCount;
    
    await program.save();

    res.json({
      message: 'Rating submitted successfully',
      rating: program.rating
    });
  } catch (error) {
    console.error('Rate program error:', error);
    res.status(500).json({ message: 'Failed to rate program' });
  }
});

module.exports = router;
