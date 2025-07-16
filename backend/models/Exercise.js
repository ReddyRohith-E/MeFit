const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
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
  targetMuscleGroup: {
    type: String,
    required: true,
    enum: [
      'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
      'abs', 'obliques', 'lower_back', 'quadriceps', 'hamstrings',
      'glutes', 'calves', 'full_body', 'cardio'
    ]
  },
  secondaryMuscles: [{
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
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  instructions: [{
    step: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    }
  }],
  tips: [{
    type: String,
    trim: true
  }],
  warnings: [{
    type: String,
    trim: true
  }],
  image: {
    type: String, // URL to image
    default: null
  },
  videoLink: {
    type: String, // URL to video demonstration
    default: null
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
exerciseSchema.index({ name: 'text', description: 'text', tags: 'text' });
exerciseSchema.index({ targetMuscleGroup: 1 });
exerciseSchema.index({ difficulty: 1 });
exerciseSchema.index({ equipment: 1 });

module.exports = mongoose.model('Exercise', exerciseSchema);
