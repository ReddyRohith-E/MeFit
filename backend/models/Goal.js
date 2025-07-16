const mongoose = require('mongoose');

const goalWorkoutSchema = new mongoose.Schema({
  workout: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workout',
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  actualDuration: {
    type: Number // in minutes
  },
  caloriesBurned: {
    type: Number
  },
  notes: {
    type: String,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['too_easy', 'just_right', 'too_hard']
  },
  enjoyment: {
    type: Number,
    min: 1,
    max: 5
  }
});

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },
  type: {
    type: String,
    enum: ['weekly', 'monthly', 'custom'],
    default: 'weekly'
  },
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program'
  },
  workouts: [goalWorkoutSchema],
  targets: {
    workoutsPerWeek: {
      type: Number,
      min: 1,
      max: 7
    },
    totalWorkouts: {
      type: Number,
      min: 1
    },
    totalCalories: {
      type: Number,
      min: 0
    },
    totalDuration: {
      type: Number, // in minutes
      min: 0
    }
  },
  progress: {
    completedWorkouts: {
      type: Number,
      default: 0
    },
    totalCaloriesBurned: {
      type: Number,
      default: 0
    },
    totalDuration: {
      type: Number, // in minutes
      default: 0
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  achievements: [{
    type: {
      type: String,
      enum: ['streak', 'milestone', 'personal_best', 'consistency']
    },
    description: {
      type: String,
      required: true
    },
    earnedAt: {
      type: Date,
      default: Date.now
    },
    value: mongoose.Schema.Types.Mixed // flexible for different achievement data
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calculate completion percentage before saving
goalWorkoutSchema.pre('save', function(next) {
  const parent = this.parent();
  if (parent && parent.workouts) {
    const completedCount = parent.workouts.filter(w => w.completed).length;
    const totalCount = parent.workouts.length;
    parent.progress.completedWorkouts = completedCount;
    parent.progress.completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  }
  next();
});

// Virtual for days remaining
goalSchema.virtual('daysRemaining').get(function() {
  const today = new Date();
  const endDate = new Date(this.endDate);
  const diffTime = endDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Virtual for current week progress
goalSchema.virtual('weekProgress').get(function() {
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  
  const weekWorkouts = this.workouts.filter(w => {
    const workoutDate = new Date(w.scheduledDate);
    return workoutDate >= startOfWeek && workoutDate <= endOfWeek;
  });
  
  const completedThisWeek = weekWorkouts.filter(w => w.completed).length;
  const totalThisWeek = weekWorkouts.length;
  
  return {
    completed: completedThisWeek,
    total: totalThisWeek,
    percentage: totalThisWeek > 0 ? Math.round((completedThisWeek / totalThisWeek) * 100) : 0
  };
});

goalSchema.index({ user: 1, startDate: -1 });
goalSchema.index({ status: 1 });
goalSchema.index({ endDate: 1 });

module.exports = mongoose.model('Goal', goalSchema);
