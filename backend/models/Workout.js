const mongoose = require('mongoose');

const setSchema = new mongoose.Schema({
  exercise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true
  },
  repetitions: {
    type: Number,
    min: 1
  },
  duration: {
    type: Number, // in seconds for time-based exercises
    min: 1
  },
  weight: {
    type: Number, // in kg
    min: 0
  },
  distance: {
    type: Number, // in meters for cardio exercises
    min: 0
  },
  restTime: {
    type: Number, // in seconds
    default: 60
  },
  notes: {
    type: String,
    trim: true
  }
});

const workoutSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['strength', 'cardio', 'flexibility', 'sports', 'yoga', 'pilates', 'crossfit', 'mixed']
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  estimatedDuration: {
    type: Number, // in minutes
    required: true,
    min: 5
  },
  sets: [setSchema],
  targetMuscleGroups: [{
    type: String,
    enum: [
      'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
      'abs', 'obliques', 'lower_back', 'quadriceps', 'hamstrings',
      'glutes', 'calves', 'full_body', 'cardio'
    ]
  }],
  equipment: [{
    type: String,
    enum: [
      'none', 'dumbbells', 'barbell', 'kettlebell', 'resistance_bands',
      'pull_up_bar', 'bench', 'cable_machine', 'smith_machine',
      'leg_press', 'treadmill', 'stationary_bike', 'rowing_machine'
    ]
  }],
  instructions: {
    warmUp: [{
      type: String,
      trim: true
    }],
    coolDown: [{
      type: String,
      trim: true
    }],
    general: [{
      type: String,
      trim: true
    }]
  },
  caloriesBurned: {
    type: Number, // estimated calories burned
    min: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for search functionality
workoutSchema.index({ name: 'text', description: 'text', tags: 'text' });
workoutSchema.index({ type: 1 });
workoutSchema.index({ difficulty: 1 });
workoutSchema.index({ estimatedDuration: 1 });

module.exports = mongoose.model('Workout', workoutSchema);
