const express = require('express');
const { body } = require('express-validator');
const Goal = require('../models/Goal');
const Program = require('../models/Program');
const Workout = require('../models/Workout');
const Profile = require('../models/Profile');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validation');

const router = express.Router();

// Goal validation
const goalValidation = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Goal title must be between 2 and 100 characters'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((endDate, { req }) => {
      if (new Date(endDate) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('type')
    .optional()
    .isIn(['weekly', 'monthly', 'custom'])
    .withMessage('Goal type must be weekly, monthly, or custom'),
  body('workouts')
    .optional()
    .isArray()
    .withMessage('Workouts must be an array')
];

// Helper function to check if goal is realistic based on user profile
const checkGoalRealism = async (userId, goalData) => {
  try {
    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return { isRealistic: true, warnings: [] };
    }

    const warnings = [];
    const { workouts, startDate, endDate } = goalData;
    
    // Calculate goal intensity
    const goalDuration = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const workoutsCount = workouts ? workouts.length : 0;
    const workoutsPerWeek = (workoutsCount / goalDuration) * 7;

    // Check based on fitness level
    let maxRecommendedWorkouts = 7;
    switch (profile.fitnessLevel) {
      case 'beginner':
        maxRecommendedWorkouts = 4;
        break;
      case 'intermediate':
        maxRecommendedWorkouts = 5;
        break;
      case 'advanced':
        maxRecommendedWorkouts = 7;
        break;
    }

    if (workoutsPerWeek > maxRecommendedWorkouts) {
      warnings.push(`Based on your ${profile.fitnessLevel} fitness level, we recommend no more than ${maxRecommendedWorkouts} workouts per week`);
    }

    // Check for medical conditions
    if (profile.medicalConditions && profile.medicalConditions.length > 0) {
      warnings.push('Please consult with a healthcare provider before starting this goal due to your medical conditions');
    }

    // Check activity level
    if (profile.activityLevel === 'sedentary' && workoutsPerWeek > 3) {
      warnings.push('Consider starting with fewer workouts per week given your current activity level');
    }

    return {
      isRealistic: warnings.length === 0,
      warnings
    };
  } catch (error) {
    console.error('Goal realism check error:', error);
    return { isRealistic: true, warnings: [] };
  }
};

// GET /api/goals - Get user's goals
router.get('/', auth, async (req, res) => {
  try {
    const { status = 'all', page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = { user: req.user._id };
    
    if (status !== 'all') {
      query.status = status;
    }

    const goals = await Goal.find(query)
      .populate('program', 'name category')
      .populate('workouts.workout', 'name type estimatedDuration')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Goal.countDocuments(query);

    res.json({
      goals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ message: 'Failed to retrieve goals' });
  }
});

// GET /api/goals/current - Get current active goal
router.get('/current', auth, async (req, res) => {
  try {
    const now = new Date();
    const goal = await Goal.findOne({
      user: req.user._id,
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now }
    })
      .populate('program', 'name category')
      .populate('workouts.workout', 'name type estimatedDuration difficulty');

    if (!goal) {
      return res.status(404).json({ message: 'No active goal found' });
    }

    res.json({ goal });
  } catch (error) {
    console.error('Get current goal error:', error);
    res.status(500).json({ message: 'Failed to retrieve current goal' });
  }
});

// GET /api/goals/:goalId
router.get('/:goalId', auth, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.goalId)
      .populate('program', 'name category description')
      .populate('workouts.workout', 'name type estimatedDuration difficulty');

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Check if user owns this goal
    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ goal });
  } catch (error) {
    console.error('Get goal error:', error);
    res.status(500).json({ message: 'Failed to retrieve goal' });
  }
});

// POST /api/goals
router.post('/', auth, goalValidation, validate, async (req, res) => {
  try {
    const { program: programId, workouts: workoutData, ...goalData } = req.body;

    // Validate program if provided
    let program = null;
    if (programId) {
      program = await Program.findOne({ _id: programId, isActive: true });
      if (!program) {
        return res.status(400).json({ message: 'Program not found' });
      }
    }

    // Process workouts
    let workouts = [];
    if (workoutData && workoutData.length > 0) {
      // Validate individual workouts
      const workoutIds = workoutData.map(w => w.workout);
      const foundWorkouts = await Workout.find({
        _id: { $in: workoutIds },
        isActive: true
      });

      if (foundWorkouts.length !== workoutIds.length) {
        return res.status(400).json({ message: 'One or more workouts not found' });
      }

      workouts = workoutData.map(w => ({
        workout: w.workout,
        scheduledDate: w.scheduledDate,
        completed: false
      }));
    } else if (program) {
      // Generate workouts from program
      const startDate = new Date(goalData.startDate);
      const endDate = new Date(goalData.endDate);
      const programDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      const weeksCount = Math.ceil(programDays / 7);

      for (let week = 0; week < weeksCount; week++) {
        for (const programWorkout of program.workouts) {
          const workoutDate = new Date(startDate);
          workoutDate.setDate(startDate.getDate() + (week * 7) + (programWorkout.dayOfWeek || 0));
          
          if (workoutDate <= endDate) {
            workouts.push({
              workout: programWorkout.workout,
              scheduledDate: workoutDate,
              completed: false
            });
          }
        }
      }
    }

    // Check goal realism
    const realismCheck = await checkGoalRealism(req.user._id, {
      ...goalData,
      workouts
    });

    const goal = new Goal({
      ...goalData,
      user: req.user._id,
      program: programId || null,
      workouts,
      targets: {
        totalWorkouts: workouts.length,
        workoutsPerWeek: req.body.targets?.workoutsPerWeek || Math.ceil(workouts.length / ((new Date(goalData.endDate) - new Date(goalData.startDate)) / (1000 * 60 * 60 * 24 * 7))),
        totalCalories: req.body.targets?.totalCalories || 0,
        totalDuration: req.body.targets?.totalDuration || 0
      }
    });

    await goal.save();
    await goal.populate([
      { path: 'program', select: 'name category' },
      { path: 'workouts.workout', select: 'name type estimatedDuration' }
    ]);

    res.status(201).json({
      message: 'Goal created successfully',
      goal,
      realismCheck
    });
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ message: 'Failed to create goal' });
  }
});

// PATCH /api/goals/:goalId
router.patch('/:goalId', auth, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.goalId);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Check if user owns this goal
    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update allowed fields
    const allowedUpdates = ['title', 'description', 'status', 'targets'];
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        goal[key] = req.body[key];
      }
    });

    await goal.save();
    await goal.populate([
      { path: 'program', select: 'name category' },
      { path: 'workouts.workout', select: 'name type estimatedDuration' }
    ]);

    res.json({
      message: 'Goal updated successfully',
      goal
    });
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ message: 'Failed to update goal' });
  }
});

// POST /api/goals/:goalId/complete-workout
router.post('/:goalId/complete-workout', auth, async (req, res) => {
  try {
    const { workoutId, actualDuration, caloriesBurned, notes, difficulty, enjoyment } = req.body;

    const goal = await Goal.findById(req.params.goalId);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Check if user owns this goal
    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Find the workout in the goal
    const workoutIndex = goal.workouts.findIndex(w => w._id.toString() === workoutId);
    if (workoutIndex === -1) {
      return res.status(404).json({ message: 'Workout not found in goal' });
    }

    const workout = goal.workouts[workoutIndex];
    if (workout.completed) {
      return res.status(400).json({ message: 'Workout already completed' });
    }

    // Mark workout as completed
    workout.completed = true;
    workout.completedAt = new Date();
    if (actualDuration) workout.actualDuration = actualDuration;
    if (caloriesBurned) workout.caloriesBurned = caloriesBurned;
    if (notes) workout.notes = notes;
    if (difficulty) workout.difficulty = difficulty;
    if (enjoyment) workout.enjoyment = enjoyment;

    // Update progress
    goal.progress.completedWorkouts = goal.workouts.filter(w => w.completed).length;
    goal.progress.totalCaloriesBurned = goal.workouts.reduce((total, w) => total + (w.caloriesBurned || 0), 0);
    goal.progress.totalDuration = goal.workouts.reduce((total, w) => total + (w.actualDuration || 0), 0);
    goal.progress.completionPercentage = Math.round((goal.progress.completedWorkouts / goal.workouts.length) * 100);

    // Check for achievements
    const completedCount = goal.progress.completedWorkouts;
    if (completedCount === 1) {
      goal.achievements.push({
        type: 'milestone',
        description: 'First workout completed!',
        value: { count: 1 }
      });
    } else if (completedCount === 5) {
      goal.achievements.push({
        type: 'milestone',
        description: '5 workouts completed!',
        value: { count: 5 }
      });
    } else if (completedCount === 10) {
      goal.achievements.push({
        type: 'milestone',
        description: '10 workouts completed!',
        value: { count: 10 }
      });
    }

    // Check for goal completion
    if (goal.progress.completionPercentage === 100) {
      goal.status = 'completed';
      goal.achievements.push({
        type: 'milestone',
        description: 'Goal completed!',
        value: { goalId: goal._id }
      });
    }

    await goal.save();

    res.json({
      message: 'Workout marked as completed',
      goal: {
        _id: goal._id,
        progress: goal.progress,
        achievements: goal.achievements,
        status: goal.status
      }
    });
  } catch (error) {
    console.error('Complete workout error:', error);
    res.status(500).json({ message: 'Failed to complete workout' });
  }
});

// DELETE /api/goals/:goalId
router.delete('/:goalId', auth, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.goalId);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Check if user owns this goal
    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Goal.findByIdAndDelete(req.params.goalId);

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ message: 'Failed to delete goal' });
  }
});

// GET /api/goals/dashboard/stats
router.get('/dashboard/stats', auth, async (req, res) => {
  try {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    // Current active goal
    const currentGoal = await Goal.findOne({
      user: req.user._id,
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).populate('workouts.workout', 'name');

    // Week progress
    let weekProgress = { completed: 0, total: 0, percentage: 0 };
    if (currentGoal) {
      const weekWorkouts = currentGoal.workouts.filter(w => {
        const workoutDate = new Date(w.scheduledDate);
        return workoutDate >= startOfWeek && workoutDate <= endOfWeek;
      });
      const completedThisWeek = weekWorkouts.filter(w => w.completed).length;
      weekProgress = {
        completed: completedThisWeek,
        total: weekWorkouts.length,
        percentage: weekWorkouts.length > 0 ? Math.round((completedThisWeek / weekWorkouts.length) * 100) : 0
      };
    }

    // Total stats
    const totalGoals = await Goal.countDocuments({ user: req.user._id });
    const completedGoals = await Goal.countDocuments({ user: req.user._id, status: 'completed' });
    
    // Total workouts completed
    const goals = await Goal.find({ user: req.user._id });
    const totalWorkoutsCompleted = goals.reduce((total, goal) => {
      return total + goal.workouts.filter(w => w.completed).length;
    }, 0);

    res.json({
      currentGoal: currentGoal ? {
        _id: currentGoal._id,
        title: currentGoal.title,
        progress: currentGoal.progress,
        daysRemaining: currentGoal.daysRemaining,
        weekProgress
      } : null,
      stats: {
        totalGoals,
        completedGoals,
        totalWorkoutsCompleted,
        weekProgress
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to retrieve dashboard stats' });
  }
});

module.exports = router;
