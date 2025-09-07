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

// GET /workout - SRS API-06: Get workouts with optional filters
router.get('/', auth, async (req, res) => {
  try {
    const { 
      type, 
      difficulty, 
      duration, 
      muscleGroup, 
      equipment, 
      page = 1, 
      limit = 20,
      search 
    } = req.query;
    
    // Build filter object
    const filter = { isActive: true };
    
    if (type) {
      filter.type = type;
    }
    
    if (difficulty) {
      filter.difficulty = difficulty;
    }
    
    if (duration) {
      filter.estimatedDuration = { $lte: parseInt(duration) };
    }
    
    if (muscleGroup) {
      filter.targetMuscleGroups = { $in: [muscleGroup] };
    }
    
    if (equipment) {
      filter.equipment = { $in: [equipment] };
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get workouts with pagination
    const [workouts, totalWorkouts] = await Promise.all([
      Workout.find(filter)
        .populate('contributor', 'firstName lastName')
        .populate('sets.exercise', 'name targetMuscleGroup')
        .select('name description type difficulty estimatedDuration targetMuscleGroups equipment rating')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Workout.countDocuments(filter)
    ]);

    res.json({
      workouts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalWorkouts / limit),
        totalWorkouts,
        hasNext: page * limit < totalWorkouts,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({ message: 'Failed to retrieve workouts' });
  }
});

// GET /workout/:workout_id - SRS API-06: Returns details of a workout
router.get('/:workout_id', auth, async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.workout_id)
      .populate('sets.exercise', 'name description targetMuscleGroup equipment')
      .populate('contributor', 'firstName lastName');

    if (!workout || !workout.isActive) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    res.json({ workout });
  } catch (error) {
    console.error('Get workout error:', error);
    res.status(500).json({ message: 'Failed to retrieve workout' });
  }
});

// POST /workout - SRS API-06: Creates a new workout. Contributor only.
router.post('/', auth, contributor, workoutValidation, validate, async (req, res) => {
  try {
    const { name, description, type, difficulty, estimatedDuration, sets, equipment, targetMuscleGroups } = req.body;

    // Validate that all exercises exist
    const exerciseIds = sets.map(set => set.exercise);
    const exercises = await Exercise.find({ _id: { $in: exerciseIds }, isActive: true });
    
    if (exercises.length !== exerciseIds.length) {
      return res.status(400).json({ message: 'One or more exercises not found' });
    }

    const workout = new Workout({
      name,
      description,
      type,
      difficulty,
      estimatedDuration,
      sets,
      equipment: equipment || [],
      targetMuscleGroups: targetMuscleGroups || [],
      contributor: req.user._id,
      isActive: true
    });

    await workout.save();
    await workout.populate('sets.exercise', 'name description targetMuscleGroup');

    res.status(201).json({
      message: 'Workout created successfully',
      workout
    });
  } catch (error) {
    console.error('Create workout error:', error);
    res.status(500).json({ message: 'Failed to create workout' });
  }
});

// PATCH /workout/:workout_id - SRS API-06: Executes a partial update of the workout corresponding to the provided workout_id. Contributor only.
router.patch('/:workout_id', auth, contributor, async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.workout_id);

    if (!workout || !workout.isActive) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    // Check if user is the contributor of this workout or an admin
    if (workout.contributor.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Validate exercises if sets are being updated
    if (req.body.sets) {
      const exerciseIds = req.body.sets.map(set => set.exercise);
      const exercises = await Exercise.find({ _id: { $in: exerciseIds }, isActive: true });
      
      if (exercises.length !== exerciseIds.length) {
        return res.status(400).json({ message: 'One or more exercises not found' });
      }
    }

    // Update allowed fields
    const allowedUpdates = ['name', 'description', 'type', 'difficulty', 'estimatedDuration', 'sets', 'equipment', 'targetMuscleGroups'];
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        workout[key] = req.body[key];
      }
    });

    await workout.save();
    await workout.populate('sets.exercise', 'name description targetMuscleGroup');

    res.json({
      message: 'Workout updated successfully',
      workout
    });
  } catch (error) {
    console.error('Update workout error:', error);
    res.status(500).json({ message: 'Failed to update workout' });
  }
});

// DELETE /workout/:workout_id - SRS API-06: Deletes a workout. Contributor only.
router.delete('/:workout_id', auth, contributor, async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.workout_id);

    if (!workout || !workout.isActive) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    // Check if user is the contributor of this workout (only they can delete per SRS)
    if (workout.contributor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Soft delete
    workout.isActive = false;
    await workout.save();

    res.status(204).end(); // 204 No Content per SRS
  } catch (error) {
    console.error('Delete workout error:', error);
    res.status(500).json({ message: 'Failed to delete workout' });
  }
});

module.exports = router;
