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
  category: {
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
  muscleGroups: [{
    type: String,
    enum: [
      'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Glutes', 'Calves', 'Forearms', 'Full Body'
    ]
  }],
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
      'None', 'Dumbbells', 'Barbell', 'Resistance Bands', 'Cable Machine', 
      'Pull-up Bar', 'Bench', 'Kettlebell', 'Medicine Ball', 'Treadmill', 'Stationary Bike',
      'none', 'dumbbells', 'barbell', 'kettlebell', 'resistance_bands',
      'pull_up_bar', 'bench', 'cable_machine', 'smith_machine',
      'leg_press', 'treadmill', 'stationary_bike', 'rowing_machine'
    ]
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'Beginner', 'Intermediate', 'Advanced'],
    required: true
  },
  instructions: [{
    step: {
      type: Number,
      required: false
    },
    description: {
      type: String,
      required: false,
      trim: true
    }
  }],
  duration: {
    type: Number, // in minutes
    default: null
  },
  calories: {
    type: Number, // estimated calories burned
    default: null
  },
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
  imageUrl: {
    type: String, // URL to image (alternative field name)
    default: null
  },
  videoLink: {
    type: String, // URL to video demonstration
    default: null
  },
  videoUrl: {
    type: String, // URL to video (alternative field name)
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
