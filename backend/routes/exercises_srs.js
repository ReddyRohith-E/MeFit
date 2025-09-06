const express = require('express');
const { body } = require('express-validator');
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
    .optional()
    .isArray()
    .withMessage('Instructions must be an array'),
  body('equipment')
    .optional()
    .isArray()
    .withMessage('Equipment must be an array')
];

// GET /exercises - SRS API-07: Returns a list of currently available exercises arranged alphabetically by Target muscle group
router.get('/', auth, async (req, res) => {
  try {
    // Search functionality per SRS (query parameters allowed for search only)
    const { search } = req.query;
    
    let query = { isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { targetMuscleGroup: { $regex: search, $options: 'i' } }
      ];
    }

    // Arranged alphabetically by Target muscle group per SRS
    const exercises = await Exercise.find(query)
      .populate('contributor', 'firstName lastName')
      .sort({ targetMuscleGroup: 1, name: 1 });

    res.json({ exercises });
  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({ message: 'Failed to retrieve exercises' });
  }
});

// GET /exercises/:exercise_id - SRS API-07: Returns a single exercise corresponding to the provided exercise_id
router.get('/:exercise_id', auth, async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.exercise_id)
      .populate('contributor', 'firstName lastName');

    if (!exercise || !exercise.isActive) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    res.json({ exercise });
  } catch (error) {
    console.error('Get exercise error:', error);
    res.status(500).json({ message: 'Failed to retrieve exercise' });
  }
});

// POST /exercise - SRS API-07: Creates a new exercise. Contributor only.
router.post('/', auth, contributor, exerciseValidation, validate, async (req, res) => {
  try {
    const { name, description, targetMuscleGroup, difficulty, instructions, equipment, image, videoLink } = req.body;

    // Check if exercise already exists
    const existingExercise = await Exercise.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      isActive: true 
    });

    if (existingExercise) {
      return res.status(400).json({ message: 'Exercise with this name already exists' });
    }

    const exercise = new Exercise({
      name,
      description,
      targetMuscleGroup,
      difficulty,
      instructions: instructions || [],
      equipment: equipment || [],
      image: image || null,
      videoLink: videoLink || null,
      contributor: req.user._id,
      isActive: true
    });

    await exercise.save();
    await exercise.populate('contributor', 'firstName lastName');

    res.status(201).json({
      message: 'Exercise created successfully',
      exercise
    });
  } catch (error) {
    console.error('Create exercise error:', error);
    res.status(500).json({ message: 'Failed to create exercise' });
  }
});

// PATCH /exercise/:exercise_id - SRS API-07: Executes a partial update of the exercise corresponding to the provided exercise_id. Contributor only.
router.patch('/:exercise_id', auth, contributor, async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.exercise_id);

    if (!exercise || !exercise.isActive) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    // Check if user is the contributor of this exercise or an admin
    if (exercise.contributor.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Check if name is being changed and if it conflicts
    if (req.body.name && req.body.name !== exercise.name) {
      const existingExercise = await Exercise.findOne({ 
        name: { $regex: new RegExp(`^${req.body.name}$`, 'i') },
        isActive: true,
        _id: { $ne: exercise._id }
      });

      if (existingExercise) {
        return res.status(400).json({ message: 'Exercise with this name already exists' });
      }
    }

    // Update allowed fields
    const allowedUpdates = ['name', 'description', 'targetMuscleGroup', 'difficulty', 'instructions', 'equipment', 'image', 'videoLink'];
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        exercise[key] = req.body[key];
      }
    });

    await exercise.save();
    await exercise.populate('contributor', 'firstName lastName');

    res.json({
      message: 'Exercise updated successfully',
      exercise
    });
  } catch (error) {
    console.error('Update exercise error:', error);
    res.status(500).json({ message: 'Failed to update exercise' });
  }
});

// DELETE /exercise/:exercise_id - SRS API-07: Deletes an exercise. Contributor only.
router.delete('/:exercise_id', auth, contributor, async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.exercise_id);

    if (!exercise || !exercise.isActive) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    // Check if user is the contributor of this exercise (only they can delete per SRS)
    if (exercise.contributor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Soft delete
    exercise.isActive = false;
    await exercise.save();

    res.status(204).end(); // 204 No Content per SRS
  } catch (error) {
    console.error('Delete exercise error:', error);
    res.status(500).json({ message: 'Failed to delete exercise' });
  }
});

module.exports = router;
