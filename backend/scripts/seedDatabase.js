const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Exercise = require('../models/Exercise');
const Workout = require('../models/Workout');
const Program = require('../models/Program');
const Goal = require('../models/Goal');

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mefit', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Clear existing data
const clearDatabase = async () => {
  try {
    await User.deleteMany({});
    await Profile.deleteMany({});
    await Exercise.deleteMany({});
    await Workout.deleteMany({});
    await Program.deleteMany({});
    await Goal.deleteMany({});
    console.log('Database cleared successfully');
  } catch (error) {
    console.error('Error clearing database:', error);
  }
};

// Seed Users
const seedUsers = async () => {
  const users = [
    {
      email: 'admin@mefit.com',
      password: 'Admin123!',
      firstName: 'System',
      lastName: 'Administrator',
      isAdmin: true,
      isContributor: true
    },
    {
      email: 'contributor1@mefit.com',
      password: 'Contrib123!',
      firstName: 'Mike',
      lastName: 'Trainer',
      isAdmin: false,
      isContributor: true
    },
    {
      email: 'contributor2@mefit.com',
      password: 'Contrib123!',
      firstName: 'Sarah',
      lastName: 'FitnessExpert',
      isAdmin: false,
      isContributor: true
    },
    {
      email: 'john.doe@example.com',
      password: 'User123!',
      firstName: 'John',
      lastName: 'Doe',
      isAdmin: false,
      isContributor: false
    },
    {
      email: 'jane.smith@example.com',
      password: 'User123!',
      firstName: 'Jane',
      lastName: 'Smith',
      isAdmin: false,
      isContributor: false
    },
    {
      email: 'alex.johnson@example.com',
      password: 'User123!',
      firstName: 'Alex',
      lastName: 'Johnson',
      isAdmin: false,
      isContributor: false
    },
    {
      email: 'emily.brown@example.com',
      password: 'User123!',
      firstName: 'Emily',
      lastName: 'Brown',
      isAdmin: false,
      isContributor: false
    },
    {
      email: 'david.wilson@example.com',
      password: 'User123!',
      firstName: 'David',
      lastName: 'Wilson',
      isAdmin: false,
      isContributor: false
    }
  ];

  const createdUsers = [];
  for (const userData of users) {
    const user = new User(userData);
    await user.save();
    createdUsers.push(user);
  }
  console.log(`${createdUsers.length} users created successfully`);
  return createdUsers;
};

// Seed Profiles
const seedProfiles = async (users) => {
  const profiles = [
    {
      user: users[3]._id, // John Doe
      weight: 80,
      height: 180,
      dateOfBirth: new Date('1990-05-15'),
      gender: 'male',
      fitnessLevel: 'intermediate',
      activityLevel: 'moderately_active',
      fitnessGoals: ['muscle_gain', 'strength'],
      address: {
        addressLine1: '123 Main Street',
        addressLine2: 'Apt 4B',
        postalCode: '12345',
        city: 'New York',
        country: 'USA'
      },
      preferences: {
        workoutTypes: ['strength', 'cardio'],
        workoutDuration: 60,
        workoutFrequency: 4
      }
    },
    {
      user: users[4]._id, // Jane Smith
      weight: 65,
      height: 165,
      dateOfBirth: new Date('1992-08-22'),
      gender: 'female',
      fitnessLevel: 'beginner',
      activityLevel: 'lightly_active',
      fitnessGoals: ['weight_loss', 'general_fitness'],
      medicalConditions: [{
        condition: 'Lower back pain',
        severity: 'mild',
        notes: 'Avoid heavy lifting'
      }],
      address: {
        addressLine1: '456 Oak Avenue',
        postalCode: '67890',
        city: 'Los Angeles',
        country: 'USA'
      },
      preferences: {
        workoutTypes: ['yoga', 'cardio', 'flexibility'],
        workoutDuration: 45,
        workoutFrequency: 3
      }
    },
    {
      user: users[5]._id, // Alex Johnson
      weight: 90,
      height: 185,
      dateOfBirth: new Date('1988-12-10'),
      gender: 'male',
      fitnessLevel: 'advanced',
      activityLevel: 'very_active',
      fitnessGoals: ['strength', 'endurance'],
      address: {
        addressLine1: '789 Pine Road',
        postalCode: '54321',
        city: 'Chicago',
        country: 'USA'
      },
      preferences: {
        workoutTypes: ['strength', 'crossfit', 'cardio'],
        workoutDuration: 75,
        workoutFrequency: 5
      }
    },
    {
      user: users[6]._id, // Emily Brown
      weight: 58,
      height: 160,
      dateOfBirth: new Date('1995-03-28'),
      gender: 'female',
      fitnessLevel: 'intermediate',
      activityLevel: 'moderately_active',
      fitnessGoals: ['flexibility', 'endurance'],
      address: {
        addressLine1: '321 Elm Street',
        postalCode: '98765',
        city: 'Seattle',
        country: 'USA'
      },
      preferences: {
        workoutTypes: ['yoga', 'pilates', 'flexibility'],
        workoutDuration: 50,
        workoutFrequency: 4
      }
    },
    {
      user: users[7]._id, // David Wilson
      weight: 75,
      height: 175,
      dateOfBirth: new Date('1993-07-14'),
      gender: 'male',
      fitnessLevel: 'beginner',
      activityLevel: 'sedentary',
      fitnessGoals: ['weight_loss', 'general_fitness'],
      medicalConditions: [{
        condition: 'Knee injury',
        severity: 'moderate',
        notes: 'Avoid high-impact exercises'
      }],
      address: {
        addressLine1: '987 Cedar Lane',
        postalCode: '13579',
        city: 'Miami',
        country: 'USA'
      },
      preferences: {
        workoutTypes: ['swimming', 'flexibility'],
        workoutDuration: 40,
        workoutFrequency: 3
      }
    }
  ];

  const createdProfiles = await Profile.insertMany(profiles);
  console.log(`${createdProfiles.length} profiles created successfully`);
  return createdProfiles;
};

// Seed Exercises
const seedExercises = async (users) => {
  const contributor1 = users.find(u => u.email === 'contributor1@mefit.com');
  const contributor2 = users.find(u => u.email === 'contributor2@mefit.com');
  
  const exercises = [
    // Chest exercises
    {
      name: 'Push-ups',
      description: 'Classic bodyweight exercise targeting the chest, shoulders, and triceps',
      targetMuscleGroup: 'chest',
      secondaryMuscles: ['shoulders', 'triceps', 'abs'],
      equipment: ['none'],
      difficulty: 'beginner',
      instructions: [
        { step: 1, description: 'Start in a plank position with hands slightly wider than shoulders' },
        { step: 2, description: 'Lower your body until chest nearly touches the floor' },
        { step: 3, description: 'Push back up to starting position' },
        { step: 4, description: 'Keep your core tight throughout the movement' }
      ],
      tips: ['Keep your body in a straight line', 'Don\'t let your hips sag'],
      warnings: ['Stop if you feel pain in your wrists or shoulders'],
      createdBy: contributor1._id,
      tags: ['bodyweight', 'beginner-friendly', 'no-equipment']
    },
    {
      name: 'Bench Press',
      description: 'Compound exercise for building chest strength and mass',
      targetMuscleGroup: 'chest',
      secondaryMuscles: ['shoulders', 'triceps'],
      equipment: ['barbell', 'bench'],
      difficulty: 'intermediate',
      instructions: [
        { step: 1, description: 'Lie on bench with feet flat on floor' },
        { step: 2, description: 'Grip barbell with hands wider than shoulder-width' },
        { step: 3, description: 'Lower bar to chest in controlled motion' },
        { step: 4, description: 'Press bar back up to starting position' }
      ],
      tips: ['Keep shoulder blades retracted', 'Maintain natural arch in back'],
      warnings: ['Always use a spotter when lifting heavy', 'Don\'t bounce the bar off your chest'],
      createdBy: contributor1._id,
      tags: ['compound', 'strength', 'mass-building']
    },
    
    // Back exercises
    {
      name: 'Pull-ups',
      description: 'Upper body pulling exercise targeting the back and biceps',
      targetMuscleGroup: 'back',
      secondaryMuscles: ['biceps', 'shoulders'],
      equipment: ['pull_up_bar'],
      difficulty: 'intermediate',
      instructions: [
        { step: 1, description: 'Hang from pull-up bar with overhand grip' },
        { step: 2, description: 'Pull your body up until chin is over the bar' },
        { step: 3, description: 'Lower yourself back down with control' },
        { step: 4, description: 'Repeat for desired repetitions' }
      ],
      tips: ['Engage your core', 'Pull with your back muscles, not just arms'],
      warnings: ['Build up gradually to avoid injury'],
      createdBy: contributor2._id,
      tags: ['bodyweight', 'upper-body', 'functional']
    },
    {
      name: 'Bent-over Row',
      description: 'Pulling exercise for back development using dumbbells',
      targetMuscleGroup: 'back',
      secondaryMuscles: ['biceps', 'shoulders'],
      equipment: ['dumbbells'],
      difficulty: 'intermediate',
      instructions: [
        { step: 1, description: 'Hold dumbbells with feet hip-width apart' },
        { step: 2, description: 'Hinge at hips, keeping back straight' },
        { step: 3, description: 'Pull dumbbells to your sides' },
        { step: 4, description: 'Lower with control and repeat' }
      ],
      tips: ['Keep core engaged', 'Squeeze shoulder blades together'],
      warnings: ['Don\'t round your back'],
      createdBy: contributor2._id,
      tags: ['dumbbells', 'strength', 'posture']
    },

    // Leg exercises
    {
      name: 'Squats',
      description: 'Fundamental lower body exercise targeting quads, glutes, and hamstrings',
      targetMuscleGroup: 'quadriceps',
      secondaryMuscles: ['glutes', 'hamstrings', 'abs'],
      equipment: ['none'],
      difficulty: 'beginner',
      instructions: [
        { step: 1, description: 'Stand with feet shoulder-width apart' },
        { step: 2, description: 'Lower your body as if sitting back into a chair' },
        { step: 3, description: 'Go down until thighs are parallel to floor' },
        { step: 4, description: 'Push through heels to return to standing' }
      ],
      tips: ['Keep chest up', 'Don\'t let knees cave inward'],
      warnings: ['Stop if you feel knee pain'],
      createdBy: contributor1._id,
      tags: ['bodyweight', 'functional', 'lower-body']
    },
    {
      name: 'Deadlifts',
      description: 'Hip hinge movement targeting posterior chain muscles',
      targetMuscleGroup: 'hamstrings',
      secondaryMuscles: ['glutes', 'back', 'abs'],
      equipment: ['barbell'],
      difficulty: 'advanced',
      instructions: [
        { step: 1, description: 'Stand with feet hip-width apart, bar over mid-foot' },
        { step: 2, description: 'Hinge at hips and knees to grip the bar' },
        { step: 3, description: 'Drive through heels to lift the bar' },
        { step: 4, description: 'Stand tall, then reverse the movement' }
      ],
      tips: ['Keep bar close to your body', 'Engage core throughout'],
      warnings: ['Learn proper form before adding weight', 'Don\'t round your back'],
      createdBy: contributor1._id,
      tags: ['compound', 'strength', 'posterior-chain']
    },

    // Cardio exercises
    {
      name: 'Jumping Jacks',
      description: 'Full-body cardio exercise to elevate heart rate',
      targetMuscleGroup: 'cardio',
      secondaryMuscles: ['full_body'],
      equipment: ['none'],
      difficulty: 'beginner',
      instructions: [
        { step: 1, description: 'Start standing with arms at sides' },
        { step: 2, description: 'Jump feet apart while raising arms overhead' },
        { step: 3, description: 'Jump back to starting position' },
        { step: 4, description: 'Repeat at a steady pace' }
      ],
      tips: ['Land softly on the balls of your feet', 'Maintain steady rhythm'],
      warnings: ['Modify if you have joint issues'],
      createdBy: contributor2._id,
      tags: ['cardio', 'warm-up', 'full-body']
    },

    // Core exercises
    {
      name: 'Plank',
      description: 'Isometric core strengthening exercise',
      targetMuscleGroup: 'abs',
      secondaryMuscles: ['shoulders', 'back'],
      equipment: ['none'],
      difficulty: 'beginner',
      instructions: [
        { step: 1, description: 'Start in push-up position' },
        { step: 2, description: 'Lower to forearms, keeping body straight' },
        { step: 3, description: 'Hold position, breathing normally' },
        { step: 4, description: 'Keep core engaged throughout' }
      ],
      tips: ['Don\'t let hips sag or pike up', 'Focus on quality over duration'],
      warnings: ['Stop if you feel lower back pain'],
      createdBy: contributor2._id,
      tags: ['core', 'isometric', 'stability']
    },

    // Shoulder exercises
    {
      name: 'Shoulder Press',
      description: 'Overhead pressing movement for shoulder development',
      targetMuscleGroup: 'shoulders',
      secondaryMuscles: ['triceps', 'abs'],
      equipment: ['dumbbells'],
      difficulty: 'intermediate',
      instructions: [
        { step: 1, description: 'Stand with dumbbells at shoulder height' },
        { step: 2, description: 'Press weights overhead until arms are straight' },
        { step: 3, description: 'Lower back to starting position with control' },
        { step: 4, description: 'Keep core engaged throughout' }
      ],
      tips: ['Don\'t arch your back excessively', 'Press in a straight line'],
      warnings: ['Warm up shoulders thoroughly first'],
      createdBy: contributor1._id,
      tags: ['shoulders', 'strength', 'overhead']
    },

    // Additional exercises for variety
    {
      name: 'Burpees',
      description: 'High-intensity full-body exercise combining squat, plank, and jump',
      targetMuscleGroup: 'full_body',
      secondaryMuscles: ['cardio'],
      equipment: ['none'],
      difficulty: 'intermediate',
      instructions: [
        { step: 1, description: 'Start standing, then squat down' },
        { step: 2, description: 'Jump back into plank position' },
        { step: 3, description: 'Do a push-up (optional)' },
        { step: 4, description: 'Jump feet back to squat, then jump up' }
      ],
      tips: ['Pace yourself', 'Focus on form over speed'],
      warnings: ['High impact - modify if needed'],
      createdBy: contributor2._id,
      tags: ['hiit', 'full-body', 'cardio']
    }
  ];

  const createdExercises = await Exercise.insertMany(exercises);
  console.log(`${createdExercises.length} exercises created successfully`);
  return createdExercises;
};

// Seed Workouts
const seedWorkouts = async (users, exercises) => {
  const contributor1 = users.find(u => u.email === 'contributor1@mefit.com');
  const contributor2 = users.find(u => u.email === 'contributor2@mefit.com');

  const workouts = [
    {
      name: 'Beginner Full Body Workout',
      description: 'A comprehensive full-body workout perfect for beginners',
      type: 'strength',
      difficulty: 'beginner',
      estimatedDuration: 45,
      sets: [
        {
          exercise: exercises.find(e => e.name === 'Squats')._id,
          repetitions: 12,
          restTime: 60
        },
        {
          exercise: exercises.find(e => e.name === 'Push-ups')._id,
          repetitions: 8,
          restTime: 60
        },
        {
          exercise: exercises.find(e => e.name === 'Plank')._id,
          duration: 30,
          restTime: 60
        },
        {
          exercise: exercises.find(e => e.name === 'Jumping Jacks')._id,
          repetitions: 20,
          restTime: 60
        }
      ],
      targetMuscleGroups: ['full_body'],
      equipment: ['none'],
      instructions: {
        warmUp: ['5 minutes light cardio', 'Dynamic stretching'],
        coolDown: ['5 minutes walking', 'Static stretching'],
        general: ['Focus on form over speed', 'Rest between sets as needed']
      },
      caloriesBurned: 250,
      createdBy: contributor1._id,
      tags: ['beginner', 'full-body', 'no-equipment']
    },
    {
      name: 'Upper Body Strength',
      description: 'Focused upper body strength training session',
      type: 'strength',
      difficulty: 'intermediate',
      estimatedDuration: 60,
      sets: [
        {
          exercise: exercises.find(e => e.name === 'Bench Press')._id,
          repetitions: 10,
          weight: 60,
          restTime: 90
        },
        {
          exercise: exercises.find(e => e.name === 'Bent-over Row')._id,
          repetitions: 10,
          weight: 40,
          restTime: 90
        },
        {
          exercise: exercises.find(e => e.name === 'Shoulder Press')._id,
          repetitions: 8,
          weight: 30,
          restTime: 90
        },
        {
          exercise: exercises.find(e => e.name === 'Pull-ups')._id,
          repetitions: 6,
          restTime: 120
        }
      ],
      targetMuscleGroups: ['chest', 'back', 'shoulders'],
      equipment: ['barbell', 'dumbbells', 'bench', 'pull_up_bar'],
      instructions: {
        warmUp: ['10 minutes light cardio', 'Arm circles and shoulder rolls'],
        coolDown: ['Cool down walk', 'Upper body stretching'],
        general: ['Use proper form', 'Increase weight gradually']
      },
      caloriesBurned: 350,
      createdBy: contributor1._id,
      tags: ['strength', 'upper-body', 'intermediate']
    },
    {
      name: 'Lower Body Power',
      description: 'High-intensity lower body workout for strength and power',
      type: 'strength',
      difficulty: 'advanced',
      estimatedDuration: 55,
      sets: [
        {
          exercise: exercises.find(e => e.name === 'Deadlifts')._id,
          repetitions: 8,
          weight: 80,
          restTime: 120
        },
        {
          exercise: exercises.find(e => e.name === 'Squats')._id,
          repetitions: 12,
          weight: 60,
          restTime: 90
        },
        {
          exercise: exercises.find(e => e.name === 'Burpees')._id,
          repetitions: 10,
          restTime: 90
        }
      ],
      targetMuscleGroups: ['quadriceps', 'hamstrings', 'glutes'],
      equipment: ['barbell'],
      instructions: {
        warmUp: ['Dynamic leg swings', 'Bodyweight squats'],
        coolDown: ['Walking', 'Leg stretching'],
        general: ['Focus on explosive movements', 'Maintain proper form']
      },
      caloriesBurned: 400,
      createdBy: contributor2._id,
      tags: ['strength', 'lower-body', 'power']
    },
    {
      name: 'HIIT Cardio Blast',
      description: 'High-intensity interval training for cardiovascular fitness',
      type: 'cardio',
      difficulty: 'intermediate',
      estimatedDuration: 30,
      sets: [
        {
          exercise: exercises.find(e => e.name === 'Burpees')._id,
          duration: 30,
          restTime: 30
        },
        {
          exercise: exercises.find(e => e.name === 'Jumping Jacks')._id,
          duration: 30,
          restTime: 30
        },
        {
          exercise: exercises.find(e => e.name === 'Squats')._id,
          repetitions: 15,
          restTime: 30
        },
        {
          exercise: exercises.find(e => e.name === 'Push-ups')._id,
          repetitions: 10,
          restTime: 30
        }
      ],
      targetMuscleGroups: ['cardio', 'full_body'],
      equipment: ['none'],
      instructions: {
        warmUp: ['5 minutes light movement'],
        coolDown: ['5 minutes walking', 'Deep breathing'],
        general: ['Work at maximum effort during intervals', 'Listen to your body']
      },
      caloriesBurned: 300,
      createdBy: contributor2._id,
      tags: ['hiit', 'cardio', 'fat-burn']
    },
    {
      name: 'Core Stability',
      description: 'Focused core strengthening and stability workout',
      type: 'strength',
      difficulty: 'beginner',
      estimatedDuration: 25,
      sets: [
        {
          exercise: exercises.find(e => e.name === 'Plank')._id,
          duration: 45,
          restTime: 30
        },
        {
          exercise: exercises.find(e => e.name === 'Squats')._id,
          repetitions: 15,
          restTime: 45
        },
        {
          exercise: exercises.find(e => e.name === 'Push-ups')._id,
          repetitions: 8,
          restTime: 45
        }
      ],
      targetMuscleGroups: ['abs', 'obliques'],
      equipment: ['none'],
      instructions: {
        warmUp: ['Light movement', 'Torso twists'],
        coolDown: ['Gentle stretching'],
        general: ['Focus on core engagement', 'Quality over quantity']
      },
      caloriesBurned: 150,
      createdBy: contributor1._id,
      tags: ['core', 'stability', 'beginner']
    }
  ];

  const createdWorkouts = await Workout.insertMany(workouts);
  console.log(`${createdWorkouts.length} workouts created successfully`);
  return createdWorkouts;
};

// Seed Programs
const seedPrograms = async (users, workouts) => {
  const contributor1 = users.find(u => u.email === 'contributor1@mefit.com');
  const contributor2 = users.find(u => u.email === 'contributor2@mefit.com');

  const programs = [
    {
      name: 'Beginner Fitness Journey',
      description: 'A 4-week program designed for fitness beginners to build fundamental strength and endurance',
      category: 'general_fitness',
      difficulty: 'beginner',
      duration: 4,
      workoutsPerWeek: 3,
      workouts: [
        {
          workout: workouts.find(w => w.name === 'Beginner Full Body Workout')._id,
          dayOfWeek: 1, // Monday
          weekNumber: 1,
          order: 1
        },
        {
          workout: workouts.find(w => w.name === 'Core Stability')._id,
          dayOfWeek: 3, // Wednesday
          weekNumber: 1,
          order: 1
        },
        {
          workout: workouts.find(w => w.name === 'Beginner Full Body Workout')._id,
          dayOfWeek: 5, // Friday
          weekNumber: 1,
          order: 1
        }
      ],
      targetAudience: {
        fitnessLevel: ['beginner'],
        goals: ['general_fitness', 'strength'],
        ageRange: {
          min: 18,
          max: 65
        }
      },
      equipment: ['none'],
      estimatedTimePerSession: 45,
      totalEstimatedCalories: 3000,
      prerequisites: ['Medical clearance if over 40 or with health conditions'],
      benefits: [
        'Build basic strength',
        'Improve cardiovascular health',
        'Establish exercise routine',
        'Learn proper form'
      ],
      createdBy: contributor1._id,
      tags: ['beginner', 'full-body', 'foundation']
    },
    {
      name: 'Strength Building Program',
      description: 'An 8-week intermediate program focused on building muscle strength and mass',
      category: 'strength_training',
      difficulty: 'intermediate',
      duration: 8,
      workoutsPerWeek: 4,
      workouts: [
        {
          workout: workouts.find(w => w.name === 'Upper Body Strength')._id,
          dayOfWeek: 1, // Monday
          weekNumber: 1,
          order: 1
        },
        {
          workout: workouts.find(w => w.name === 'Lower Body Power')._id,
          dayOfWeek: 2, // Tuesday
          weekNumber: 1,
          order: 1
        },
        {
          workout: workouts.find(w => w.name === 'Upper Body Strength')._id,
          dayOfWeek: 4, // Thursday
          weekNumber: 1,
          order: 1
        },
        {
          workout: workouts.find(w => w.name === 'Lower Body Power')._id,
          dayOfWeek: 5, // Friday
          weekNumber: 1,
          order: 1
        }
      ],
      targetAudience: {
        fitnessLevel: ['intermediate', 'advanced'],
        goals: ['muscle_gain', 'strength'],
        ageRange: {
          min: 18,
          max: 50
        }
      },
      equipment: ['barbell', 'dumbbells', 'bench', 'pull_up_bar'],
      estimatedTimePerSession: 60,
      totalEstimatedCalories: 11200,
      prerequisites: ['Basic knowledge of weight training', 'Access to gym equipment'],
      benefits: [
        'Increase muscle mass',
        'Build functional strength',
        'Improve bone density',
        'Boost metabolism'
      ],
      createdBy: contributor1._id,
      tags: ['strength', 'muscle-building', 'intermediate']
    },
    {
      name: 'Fat Loss HIIT Program',
      description: 'A 6-week high-intensity program designed for effective fat loss and cardiovascular improvement',
      category: 'weight_loss',
      difficulty: 'intermediate',
      duration: 6,
      workoutsPerWeek: 4,
      workouts: [
        {
          workout: workouts.find(w => w.name === 'HIIT Cardio Blast')._id,
          dayOfWeek: 1, // Monday
          weekNumber: 1,
          order: 1
        },
        {
          workout: workouts.find(w => w.name === 'Beginner Full Body Workout')._id,
          dayOfWeek: 2, // Tuesday
          weekNumber: 1,
          order: 1
        },
        {
          workout: workouts.find(w => w.name === 'HIIT Cardio Blast')._id,
          dayOfWeek: 4, // Thursday
          weekNumber: 1,
          order: 1
        },
        {
          workout: workouts.find(w => w.name === 'Core Stability')._id,
          dayOfWeek: 6, // Saturday
          weekNumber: 1,
          order: 1
        }
      ],
      targetAudience: {
        fitnessLevel: ['beginner', 'intermediate'],
        goals: ['weight_loss', 'endurance'],
        ageRange: {
          min: 18,
          max: 55
        }
      },
      equipment: ['none'],
      estimatedTimePerSession: 35,
      totalEstimatedCalories: 5600,
      prerequisites: ['Basic fitness level', 'No heart conditions'],
      benefits: [
        'Burn calories efficiently',
        'Improve cardiovascular health',
        'Increase metabolic rate',
        'Build lean muscle'
      ],
      createdBy: contributor2._id,
      tags: ['hiit', 'fat-loss', 'cardio']
    },
    {
      name: 'Core Strength Foundation',
      description: 'A 3-week program focused on building core strength and stability',
      category: 'general_fitness',
      difficulty: 'beginner',
      duration: 3,
      workoutsPerWeek: 3,
      workouts: [
        {
          workout: workouts.find(w => w.name === 'Core Stability')._id,
          dayOfWeek: 1, // Monday
          weekNumber: 1,
          order: 1
        },
        {
          workout: workouts.find(w => w.name === 'Core Stability')._id,
          dayOfWeek: 3, // Wednesday
          weekNumber: 1,
          order: 1
        },
        {
          workout: workouts.find(w => w.name === 'Core Stability')._id,
          dayOfWeek: 5, // Friday
          weekNumber: 1,
          order: 1
        }
      ],
      targetAudience: {
        fitnessLevel: ['beginner', 'intermediate'],
        goals: ['general_fitness', 'strength'],
        ageRange: {
          min: 16,
          max: 70
        }
      },
      equipment: ['none'],
      estimatedTimePerSession: 25,
      totalEstimatedCalories: 1350,
      prerequisites: ['None'],
      benefits: [
        'Improve posture',
        'Reduce back pain risk',
        'Build core stability',
        'Enhance functional movement'
      ],
      createdBy: contributor2._id,
      tags: ['core', 'stability', 'posture']
    }
  ];

  const createdPrograms = await Program.insertMany(programs);
  console.log(`${createdPrograms.length} programs created successfully`);
  return createdPrograms;
};

// Seed Goals
const seedGoals = async (users, programs, workouts) => {
  const regularUsers = users.filter(u => !u.isAdmin && !u.isContributor);
  
  const goals = [
    {
      user: regularUsers[0]._id, // John Doe
      title: 'Build Strength This Week',
      description: 'Focus on building foundational strength with consistent workouts',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      status: 'active',
      type: 'weekly',
      program: programs.find(p => p.name === 'Strength Building Program')._id,
      workouts: [
        {
          workout: workouts.find(w => w.name === 'Upper Body Strength')._id,
          scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
          completed: false
        },
        {
          workout: workouts.find(w => w.name === 'Lower Body Power')._id,
          scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          completed: false
        },
        {
          workout: workouts.find(w => w.name === 'Core Stability')._id,
          scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          completed: false
        }
      ],
      targets: {
        workoutsPerWeek: 3,
        totalWorkouts: 3,
        totalCalories: 900,
        totalDuration: 140
      }
    },
    {
      user: regularUsers[1]._id, // Jane Smith
      title: 'Beginner Fitness Journey',
      description: 'Starting my fitness journey with beginner-friendly workouts',
      startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
      status: 'active',
      type: 'weekly',
      program: programs.find(p => p.name === 'Beginner Fitness Journey')._id,
      workouts: [
        {
          workout: workouts.find(w => w.name === 'Beginner Full Body Workout')._id,
          scheduledDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          completed: true,
          completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          actualDuration: 50,
          caloriesBurned: 270,
          difficulty: 'just_right',
          enjoyment: 4
        },
        {
          workout: workouts.find(w => w.name === 'Core Stability')._id,
          scheduledDate: new Date(),
          completed: false
        },
        {
          workout: workouts.find(w => w.name === 'Beginner Full Body Workout')._id,
          scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          completed: false
        }
      ],
      targets: {
        workoutsPerWeek: 3,
        totalWorkouts: 3,
        totalCalories: 650,
        totalDuration: 115
      },
      progress: {
        completedWorkouts: 1,
        totalCaloriesBurned: 270,
        totalDuration: 50,
        completionPercentage: 33
      }
    },
    {
      user: regularUsers[2]._id, // Alex Johnson
      title: 'Advanced Training Week',
      description: 'High-intensity training for strength and endurance',
      startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
      endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
      status: 'active',
      type: 'weekly',
      workouts: [
        {
          workout: workouts.find(w => w.name === 'Lower Body Power')._id,
          scheduledDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
          completed: true,
          completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          actualDuration: 60,
          caloriesBurned: 420,
          difficulty: 'just_right',
          enjoyment: 5
        },
        {
          workout: workouts.find(w => w.name === 'HIIT Cardio Blast')._id,
          scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
          completed: false
        },
        {
          workout: workouts.find(w => w.name === 'Upper Body Strength')._id,
          scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          completed: false
        },
        {
          workout: workouts.find(w => w.name === 'Lower Body Power')._id,
          scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          completed: false
        }
      ],
      targets: {
        workoutsPerWeek: 4,
        totalWorkouts: 4,
        totalCalories: 1400,
        totalDuration: 235
      },
      progress: {
        completedWorkouts: 1,
        totalCaloriesBurned: 420,
        totalDuration: 60,
        completionPercentage: 25
      },
      achievements: [
        {
          type: 'personal_best',
          description: 'Completed first advanced workout!',
          value: { workoutType: 'Lower Body Power', duration: 60 }
        }
      ]
    }
  ];

  const createdGoals = await Goal.insertMany(goals);
  console.log(`${createdGoals.length} goals created successfully`);
  return createdGoals;
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    await connectDB();
    await clearDatabase();
    
    console.log('Creating sample data...');
    const users = await seedUsers();
    const profiles = await seedProfiles(users);
    const exercises = await seedExercises(users);
    const workouts = await seedWorkouts(users, exercises);
    const programs = await seedPrograms(users, workouts);
    const goals = await seedGoals(users, programs, workouts);
    
    console.log('\n=== DATABASE SEEDING COMPLETED ===');
    console.log(`Created:
    - ${users.length} users (including 1 admin and 2 contributors)
    - ${profiles.length} user profiles
    - ${exercises.length} exercises
    - ${workouts.length} workouts
    - ${programs.length} programs
    - ${goals.length} goals`);
    
    console.log('\n' + '='.repeat(60));
    console.log('🔑 SAMPLE LOGIN CREDENTIALS');
    console.log('='.repeat(60));
    console.log('');
    console.log('🔧 ADMIN ACCOUNT:');
    console.log('   Email:    admin@mefit.com');
    console.log('   Password: Admin123!');
    console.log('   Role:     Administrator (Full Access)');
    console.log('');
    console.log('👨‍💼 CONTRIBUTOR ACCOUNTS:');
    console.log('   Email:    contributor1@mefit.com');
    console.log('   Password: Contrib123!');
    console.log('   Role:     Contributor (Can create content)');
    console.log('');
    console.log('   Email:    contributor2@mefit.com');
    console.log('   Password: Contrib123!');
    console.log('   Role:     Contributor (Can create content)');
    console.log('');
    console.log('👤 REGULAR USER ACCOUNTS:');
    console.log('   Email:    john.doe@example.com');
    console.log('   Password: User123!');
    console.log('   Role:     Regular User');
    console.log('');
    console.log('   Email:    jane.smith@example.com');
    console.log('   Password: User123!');
    console.log('   Role:     Regular User (Has profile & goals)');
    console.log('');
    console.log('   Email:    alex.johnson@example.com');
    console.log('   Password: User123!');
    console.log('   Role:     Regular User (Has profile & active goals)');
    console.log('');
    console.log('   Email:    emily.brown@example.com');
    console.log('   Password: User123!');
    console.log('   Role:     Regular User (Has profile)');
    console.log('');
    console.log('   Email:    david.wilson@example.com');
    console.log('   Password: User123!');
    console.log('   Role:     Regular User (Has profile)');
    console.log('');
    console.log('='.repeat(60));
    console.log('💡 TIP: Use any of these credentials to login to the application');
    console.log('🌐 Frontend URL: http://localhost:5173 (if using Vite dev server)');
    console.log('🔧 Backend API: http://localhost:3001/api');
    console.log('='.repeat(60));
    
    process.exit(0);
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  require('dotenv').config();
  seedDatabase();
}

module.exports = {
  seedDatabase,
  clearDatabase,
  seedUsers,
  seedProfiles,
  seedExercises,
  seedWorkouts,
  seedPrograms,
  seedGoals
};
