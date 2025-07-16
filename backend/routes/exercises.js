const express = require('express');
const { body, query } = require('express-validator');
const Exercise = require('../models/Exercise');
const { auth, contributor } = require('../middleware/auth');
const validate = require('../middleware/validation');

const router = express.Router();

// Exercise validation
const exerciseValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Exercise name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('targetMuscleGroup')
    .isIn([
      'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
      'abs', 'obliques', 'lower_back', 'quadriceps', 'hamstrings',
      'glutes', 'calves', 'full_body', 'cardio'
    ])
    .withMessage('Invalid target muscle group'),
  body('difficulty')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Difficulty must be beginner, intermediate, or advanced'),
  body('instructions')
    .isArray({ min: 1 })
    .withMessage('Instructions must be a non-empty array')
    .custom((instructions) => {
      return instructions.every(instruction => 
        instruction.step && 
        instruction.description && 
        typeof instruction.step === 'number' &&
        typeof instruction.description === 'string'
      );
    })
    .withMessage('Each instruction must have a step number and description')
];

// GET /api/exercises
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      targetMuscleGroup = '',
      difficulty = '',
      equipment = '',
      sortBy = 'targetMuscleGroup'
    } = req.query;

    const skip = (page - 1) * limit;

    // Build query
    let query = { isActive: true };

    if (search) {
      query.$text = { $search: search };
    }

    if (targetMuscleGroup) {
      query.targetMuscleGroup = targetMuscleGroup;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (equipment) {
      query.equipment = { $in: [equipment] };
    }

    // Build sort
    let sort = {};
    switch (sortBy) {
      case 'name':
        sort = { name: 1 };
        break;
      case 'difficulty':
        sort = { difficulty: 1, name: 1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      default:
        sort = { targetMuscleGroup: 1, name: 1 };
    }

    const exercises = await Exercise.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Exercise.countDocuments(query);

    // Group by target muscle group if default sort
    let groupedExercises = {};
    if (sortBy === 'targetMuscleGroup') {
      exercises.forEach(exercise => {
        const group = exercise.targetMuscleGroup;
        if (!groupedExercises[group]) {
          groupedExercises[group] = [];
        }
        groupedExercises[group].push(exercise);
      });
    }

    res.json({
      exercises: sortBy === 'targetMuscleGroup' ? groupedExercises : exercises,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({ message: 'Failed to retrieve exercises' });
  }
});

// GET /api/exercises/:exerciseId
router.get('/:exerciseId', auth, async (req, res) => {
  try {
    const exercise = await Exercise.findOne({
      _id: req.params.exerciseId,
      isActive: true
    }).populate('createdBy', 'firstName lastName');

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    res.json({ exercise });
  } catch (error) {
    console.error('Get exercise error:', error);
    res.status(500).json({ message: 'Failed to retrieve exercise' });
  }
});

// POST /api/exercises
router.post('/', auth, contributor, exerciseValidation, validate, async (req, res) => {
  try {
    const exerciseData = {
      ...req.body,
      createdBy: req.user._id
    };

    const exercise = new Exercise(exerciseData);
    await exercise.save();

    await exercise.populate('createdBy', 'firstName lastName');

    res.status(201).json({
      message: 'Exercise created successfully',
      exercise
    });
  } catch (error) {
    console.error('Create exercise error:', error);
    res.status(500).json({ message: 'Failed to create exercise' });
  }
});

// PATCH /api/exercises/:exerciseId
router.patch('/:exerciseId', auth, contributor, exerciseValidation, validate, async (req, res) => {
  try {
    const exercise = await Exercise.findOne({
      _id: req.params.exerciseId,
      isActive: true
    });

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    // Check if user created this exercise or is admin
    if (exercise.createdBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'You can only edit exercises you created' });
    }

    Object.keys(req.body).forEach(key => {
      if (key !== 'createdBy') {
        exercise[key] = req.body[key];
      }
    });

    await exercise.save();
    await exercise.populate('createdBy', 'firstName lastName');

    res.json({
      message: 'Exercise updated successfully',
      exercise
    });
  } catch (error) {
    console.error('Update exercise error:', error);
    res.status(500).json({ message: 'Failed to update exercise' });
  }
});

// DELETE /api/exercises/:exerciseId
router.delete('/:exerciseId', auth, contributor, async (req, res) => {
  try {
    const exercise = await Exercise.findOne({
      _id: req.params.exerciseId,
      isActive: true
    });

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    // Check if user created this exercise or is admin
    if (exercise.createdBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'You can only delete exercises you created' });
    }

    // Soft delete
    exercise.isActive = false;
    await exercise.save();

    res.json({ message: 'Exercise deleted successfully' });
  } catch (error) {
    console.error('Delete exercise error:', error);
    res.status(500).json({ message: 'Failed to delete exercise' });
  }
});

// GET /api/exercises/muscle-groups/list
router.get('/muscle-groups/list', auth, (req, res) => {
  const muscleGroups = [
    'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
    'abs', 'obliques', 'lower_back', 'quadriceps', 'hamstrings',
    'glutes', 'calves', 'full_body', 'cardio'
  ];

  res.json({ muscleGroups });
});

// GET /api/exercises/equipment/list
router.get('/equipment/list', auth, (req, res) => {
  const equipment = [
    'none', 'dumbbells', 'barbell', 'kettlebell', 'resistance_bands',
    'pull_up_bar', 'bench', 'cable_machine', 'smith_machine',
    'leg_press', 'treadmill', 'stationary_bike', 'rowing_machine'
  ];

  res.json({ equipment });
});

// GET /api/exercises/my/created
router.get('/my/created', auth, contributor, async (req, res) => {
  try {
    const exercises = await Exercise.find({
      createdBy: req.user._id,
      isActive: true
    }).sort({ createdAt: -1 });

    res.json({ exercises });
  } catch (error) {
    console.error('Get my exercises error:', error);
    res.status(500).json({ message: 'Failed to retrieve your exercises' });
  }
});

module.exports = router;
