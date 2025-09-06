const express = require('express');
const { body } = require('express-validator');
const Workout = require('../models/Workout');
const Exercise = require('../models/Exercise');
const { auth, contributor } = require('../middleware/auth');
const validate = require('../middleware/validation');

const router = express.Router();

// Workout validation
const workoutValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Workout name must be between 2 and 100 characters'),
  body('type')
    .isIn(['strength', 'cardio', 'flexibility', 'sports', 'yoga', 'pilates', 'crossfit', 'mixed'])
    .withMessage('Invalid workout type'),
  body('difficulty')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Difficulty must be beginner, intermediate, or advanced'),
  body('estimatedDuration')
    .isInt({ min: 5, max: 300 })
    .withMessage('Estimated duration must be between 5 and 300 minutes'),
  body('sets')
    .isArray({ min: 1 })
    .withMessage('Sets must be a non-empty array'),
  body('sets.*.exercise')
    .isMongoId()
    .withMessage('Each set must have a valid exercise ID')
];

// GET /api/workouts
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      type = '',
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

    if (type) {
      query.type = type;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (duration) {
      switch (duration) {
        case 'short':
          query.estimatedDuration = { $lte: 30 };
          break;
        case 'medium':
          query.estimatedDuration = { $gt: 30, $lte: 60 };
          break;
        case 'long':
          query.estimatedDuration = { $gt: 60 };
          break;
      }
    }

    // Build sort
    let sort = {};
    switch (sortBy) {
      case 'duration':
        sort = { estimatedDuration: 1 };
        break;
      case 'difficulty':
        sort = { difficulty: 1, name: 1 };
        break;
      case 'type':
        sort = { type: 1, name: 1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      default:
        sort = { name: 1 };
    }

    const workouts = await Workout.find(query)
      .populate('createdBy', 'firstName lastName')
      .populate('sets.exercise', 'name targetMuscleGroup')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Workout.countDocuments(query);

    res.json({
      workouts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({ message: 'Failed to retrieve workouts' });
  }
});

// GET /api/workouts/:workoutId
router.get('/:workoutId', auth, async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.workoutId,
      isActive: true
    })
      .populate('createdBy', 'firstName lastName')
      .populate('sets.exercise');

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    res.json({ workout });
  } catch (error) {
    console.error('Get workout error:', error);
    res.status(500).json({ message: 'Failed to retrieve workout' });
  }
});

// POST /api/workouts
router.post('/', auth, contributor, workoutValidation, validate, async (req, res) => {
  try {
    // Validate that all exercises exist
    const exerciseIds = req.body.sets.map(set => set.exercise);
    const exercises = await Exercise.find({
      _id: { $in: exerciseIds },
      isActive: true
    });

    if (exercises.length !== exerciseIds.length) {
      return res.status(400).json({ message: 'One or more exercises not found' });
    }

    // Calculate target muscle groups and equipment needed
    const targetMuscleGroups = [...new Set(exercises.map(ex => ex.targetMuscleGroup))];
    const equipment = [...new Set(exercises.flatMap(ex => ex.equipment))];

    const workoutData = {
      ...req.body,
      createdBy: req.user._id,
      targetMuscleGroups,
      equipment
    };

    const workout = new Workout(workoutData);
    await workout.save();

    await workout.populate([
      { path: 'createdBy', select: 'firstName lastName' },
      { path: 'sets.exercise' }
    ]);

    res.status(201).json({
      message: 'Workout created successfully',
      workout
    });
  } catch (error) {
    console.error('Create workout error:', error);
    res.status(500).json({ message: 'Failed to create workout' });
  }
});

// PATCH /api/workouts/:workoutId
router.patch('/:workoutId', auth, contributor, workoutValidation, validate, async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.workoutId,
      isActive: true
    });

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    // Check if user created this workout or is admin
    if (workout.createdBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'You can only edit workouts you created' });
    }

    // Validate exercises if sets are being updated
    if (req.body.sets) {
      const exerciseIds = req.body.sets.map(set => set.exercise);
      const exercises = await Exercise.find({
        _id: { $in: exerciseIds },
        isActive: true
      });

      if (exercises.length !== exerciseIds.length) {
        return res.status(400).json({ message: 'One or more exercises not found' });
      }

      // Update target muscle groups and equipment
      const targetMuscleGroups = [...new Set(exercises.map(ex => ex.targetMuscleGroup))];
      const equipment = [...new Set(exercises.flatMap(ex => ex.equipment))];
      
      req.body.targetMuscleGroups = targetMuscleGroups;
      req.body.equipment = equipment;
    }

    Object.keys(req.body).forEach(key => {
      if (key !== 'createdBy') {
        workout[key] = req.body[key];
      }
    });

    await workout.save();
    await workout.populate([
      { path: 'createdBy', select: 'firstName lastName' },
      { path: 'sets.exercise' }
    ]);

    res.json({
      message: 'Workout updated successfully',
      workout
    });
  } catch (error) {
    console.error('Update workout error:', error);
    res.status(500).json({ message: 'Failed to update workout' });
  }
});

// DELETE /api/workouts/:workoutId
router.delete('/:workoutId', auth, contributor, async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.workoutId,
      isActive: true
    });

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    // Check if user created this workout or is admin
    if (workout.createdBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'You can only delete workouts you created' });
    }

    // Soft delete
    workout.isActive = false;
    await workout.save();

    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Delete workout error:', error);
    res.status(500).json({ message: 'Failed to delete workout' });
  }
});

// GET /api/workouts/types/list
router.get('/types/list', auth, (req, res) => {
  const types = ['strength', 'cardio', 'flexibility', 'sports', 'yoga', 'pilates', 'crossfit', 'mixed'];
  res.json({ types });
});

// GET /api/workouts/my/created
router.get('/my/created', auth, contributor, async (req, res) => {
  try {
    const workouts = await Workout.find({
      createdBy: req.user._id,
      isActive: true
    })
      .populate('sets.exercise', 'name targetMuscleGroup')
      .sort({ createdAt: -1 });

    res.json({ workouts });
  } catch (error) {
    console.error('Get my workouts error:', error);
    res.status(500).json({ message: 'Failed to retrieve your workouts' });
  }
});

// GET /api/workouts/suggestions/:userId
router.get('/suggestions/:userId', auth, async (req, res) => {
  try {
    // This would implement workout suggestions based on user profile
    // For now, return popular beginner workouts
    const suggestions = await Workout.find({
      difficulty: 'beginner',
      isActive: true
    })
      .populate('sets.exercise', 'name targetMuscleGroup')
      .limit(5)
      .sort({ createdAt: -1 });

    res.json({ suggestions });
  } catch (error) {
    console.error('Get workout suggestions error:', error);
    res.status(500).json({ message: 'Failed to get workout suggestions' });
  }
});

module.exports = router;
