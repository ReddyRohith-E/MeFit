const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'weight_loss', 'muscle_building', 'strength_training', 'endurance',
      'flexibility', 'rehabilitation', 'sports_specific', 'general_fitness'
    ]
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  duration: {
    type: Number, // program duration in weeks
    required: true,
    min: 1
  },
  workoutsPerWeek: {
    type: Number,
    required: true,
    min: 1,
    max: 7
  },
  workouts: [{
    workout: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workout',
      required: true
    },
    dayOfWeek: {
      type: Number, // 0 = Sunday, 1 = Monday, etc.
      min: 0,
      max: 6
    },
    weekNumber: {
      type: Number, // Which week of the program
      min: 1
    },
    order: {
      type: Number, // Order within the day if multiple workouts
      default: 1
    }
  }],
  targetAudience: {
    fitnessLevel: [{
      type: String,
      enum: ['beginner', 'intermediate', 'advanced']
    }],
    goals: [{
      type: String,
      enum: ['weight_loss', 'muscle_gain', 'endurance', 'strength', 'flexibility', 'general_fitness']
    }],
    ageRange: {
      min: {
        type: Number,
        min: 13,
        max: 100
      },
      max: {
        type: Number,
        min: 13,
        max: 100
      }
    }
  },
  equipment: [{
    type: String,
    enum: [
      'none', 'dumbbells', 'barbell', 'kettlebell', 'resistance_bands',
      'pull_up_bar', 'bench', 'cable_machine', 'smith_machine',
      'leg_press', 'treadmill', 'stationary_bike', 'rowing_machine'
    ]
  }],
  estimatedTimePerSession: {
    type: Number, // in minutes
    required: true
  },
  totalEstimatedCalories: {
    type: Number, // for entire program
    min: 0
  },
  prerequisites: [{
    type: String,
    trim: true
  }],
  benefits: [{
    type: String,
    trim: true
  }],
  contributor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for search functionality
programSchema.index({ name: 'text', description: 'text', tags: 'text' });
programSchema.index({ category: 1 });
programSchema.index({ difficulty: 1 });
programSchema.index({ duration: 1 });

module.exports = mongoose.model('Program', programSchema);
