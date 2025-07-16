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

// GET /api/programs
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      category = '',
      difficulty = '',
      duration = '',
      sortBy = 'name'
    } = req.query;

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

// GET /api/programs/suggestions/:userId
router.get('/suggestions/:userId', auth, async (req, res) => {
  try {
    // This would implement program suggestions based on user profile
    // For now, return popular beginner programs
    const suggestions = await Program.find({
      difficulty: 'beginner',
      isActive: true
    })
      .populate('workouts.workout', 'name type')
      .limit(5)
      .sort({ 'rating.average': -1, createdAt: -1 });

    res.json({ suggestions });
  } catch (error) {
    console.error('Get program suggestions error:', error);
    res.status(500).json({ message: 'Failed to get program suggestions' });
  }
});

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
