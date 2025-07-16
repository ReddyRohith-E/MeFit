const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  addressLine1: {
    type: String,
    required: true,
    trim: true
  },
  addressLine2: {
    type: String,
    trim: true
  },
  addressLine3: {
    type: String,
    trim: true
  },
  postalCode: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  }
});

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  weight: {
    type: Number,
    min: 0
  },
  height: {
    type: Number,
    min: 0
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say']
  },
  fitnessLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  medicalConditions: [{
    condition: {
      type: String,
      trim: true
    },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe']
    },
    notes: {
      type: String,
      trim: true
    }
  }],
  disabilities: [{
    type: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    accommodationsNeeded: {
      type: String,
      trim: true
    }
  }],
  fitnessGoals: [{
    type: String,
    enum: ['weight_loss', 'muscle_gain', 'endurance', 'strength', 'flexibility', 'general_fitness']
  }],
  activityLevel: {
    type: String,
    enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'],
    required: true
  },
  address: addressSchema,
  preferences: {
    workoutTypes: [{
      type: String,
      enum: ['cardio', 'strength', 'flexibility', 'sports', 'yoga', 'pilates', 'crossfit', 'swimming']
    }],
    workoutDuration: {
      type: Number, // in minutes
      min: 15,
      max: 180
    },
    workoutFrequency: {
      type: Number, // days per week
      min: 1,
      max: 7
    }
  }
}, {
  timestamps: true
});

// Calculate BMI
profileSchema.virtual('bmi').get(function() {
  if (this.weight && this.height) {
    const heightInMeters = this.height / 100;
    return (this.weight / (heightInMeters * heightInMeters)).toFixed(1);
  }
  return null;
});

// Calculate age
profileSchema.virtual('age').get(function() {
  if (this.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
  return null;
});

module.exports = mongoose.model('Profile', profileSchema);
