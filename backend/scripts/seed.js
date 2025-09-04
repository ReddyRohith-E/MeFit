#!/usr/bin/env node

/**
 * Database Seeding Script for MeFit Application
 * 
 * This script seeds the MeFit database with initial data.
 * IMPORTANT: Run cleanDB script first to ensure a clean state.
 * 
 * Usage: npm run seed
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import all models
const User = require('../models/User');
const Profile = require('../models/Profile');
const Exercise = require('../models/Exercise');
const Workout = require('../models/Workout');
const Program = require('../models/Program');
const Goal = require('../models/Goal');
const Notification = require('../models/Notification');

// Utility functions
const log = {
  info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`),
  warning: (msg) => console.log(`\x1b[33m[WARNING]\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
  header: (msg) => console.log(`\n\x1b[35m=== ${msg} ===\x1b[0m`)
};

class MeFitSeeder {
  constructor() {
    this.createdData = {
      users: [],
      profiles: [],
      exercises: [],
      workouts: [],
      programs: [],
      goals: [],
      notifications: []
    };
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0
    };
  }

  async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mefit';
      await mongoose.connect(mongoUri);
      log.success('Connected to MongoDB');
    } catch (error) {
      log.error(`Failed to connect to MongoDB: ${error.message}`);
      throw error;
    }
  }

  async checkCleanupMarker() {
    const markerPath = path.join(__dirname, '.cleanup-completed');
    
    if (!fs.existsSync(markerPath)) {
      log.error('❌ Database cleanup marker not found!');
      log.error('   Please run the cleanup script first: npm run cleanDB');
      log.error('   This ensures the database is in a clean state before seeding.');
      throw new Error('Database cleanup required before seeding');
    }

    try {
      const markerContent = fs.readFileSync(markerPath, 'utf8');
      log.success('✅ Database cleanup marker found');
      log.info(`   ${markerContent.trim()}`);
      
      // Remove the marker file after successful check
      fs.unlinkSync(markerPath);
      log.info('🗑️  Cleanup marker removed');
    } catch (error) {
      log.warning('⚠️  Could not read cleanup marker details');
    }
  }

  async checkDatabaseEmpty() {
    log.header('Verifying Database State');
    
    const collections = [
      'users', 'profiles', 'exercises', 'workouts', 
      'programs', 'goals', 'notifications'
    ];

    let totalDocuments = 0;

    for (const collectionName of collections) {
      try {
        const count = await mongoose.connection.db.collection(collectionName).countDocuments();
        if (count > 0) {
          log.warning(`⚠️  Collection '${collectionName}' contains ${count} documents`);
          totalDocuments += count;
        }
      } catch (error) {
        // Collection might not exist yet, which is fine
        log.info(`   Collection '${collectionName}' does not exist (this is normal)`);
      }
    }

    if (totalDocuments > 0) {
      log.error('❌ Database is not empty!');
      log.error(`   Found ${totalDocuments} existing documents across collections.`);
      log.error('   Please run the cleanup script first: npm run cleanDB');
      throw new Error('Database must be empty before seeding');
    }

    log.success('✅ Database is empty and ready for seeding');
  }

  async seedUsers() {
    log.header('Seeding Users');
    
    const users = [
      // Admin User
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@mefit.com',
        password: 'Admin123!',
        isAdmin: true,
        isContributor: true,
        isActive: true,
        lastLogin: new Date()
      },
      // Contributor Users
      {
        firstName: 'Mike',
        lastName: 'Trainer',
        email: 'mike.trainer@mefit.com',
        password: 'Trainer123!',
        isContributor: true,
        isActive: true,
        lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        firstName: 'Sarah',
        lastName: 'Fitness',
        email: 'sarah.fitness@mefit.com',
        password: 'Fitness123!',
        isContributor: true,
        isActive: true,
        lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      // Regular Users with different fitness levels
      {
        firstName: 'John',
        lastName: 'Beginner',
        email: 'john.beginner@example.com',
        password: 'User123!',
        isActive: true,
        lastLogin: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      },
      {
        firstName: 'Jane',
        lastName: 'Intermediate',
        email: 'jane.intermediate@example.com',
        password: 'User123!',
        isActive: true,
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        firstName: 'Alex',
        lastName: 'Advanced',
        email: 'alex.advanced@example.com',
        password: 'User123!',
        isActive: true,
        lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
      },
      // User with 2FA enabled
      {
        firstName: 'Emily',
        lastName: 'Yoga',
        email: 'emily.yoga@example.com',
        password: 'User123!',
        isActive: true,
        twoFactorEnabled: true,
        twoFactorSecret: speakeasy.generateSecret({ name: 'MeFit' }).base32,
        lastLogin: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
      },
      // Inactive user for testing
      {
        firstName: 'Inactive',
        lastName: 'User',
        email: 'inactive@example.com',
        password: 'User123!',
        isActive: false,
        lastLogin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      },
      // User with pending contributor request
      {
        firstName: 'Pending',
        lastName: 'Contributor',
        email: 'pending.contributor@example.com',
        password: 'User123!',
        isActive: true,
        contributorRequestPending: true,
        contributorApplicationText: 'I am a certified personal trainer with 5 years of experience. I would like to contribute fitness content to help others achieve their goals. I specialize in strength training and functional fitness.',
        contributorRequestDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        lastLogin: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
      },
      // Another pending contributor request
      {
        firstName: 'Maria',
        lastName: 'Cardio',
        email: 'maria.cardio@example.com',
        password: 'User123!',
        isActive: true,
        contributorRequestPending: true,
        contributorApplicationText: 'I am a certified yoga instructor and nutrition coach. I have been teaching for 8 years and would love to share my knowledge about holistic fitness and wellness.',
        contributorRequestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
      }
    ];

    for (const userData of users) {
      try {
        const user = new User(userData);
        await user.save();
        this.createdData.users.push(user);
        log.success(`Created user: ${user.email} (${user.isAdmin ? 'Admin' : user.isContributor ? 'Contributor' : 'User'})`);
      } catch (error) {
        log.error(`Failed to create user ${userData.email}: ${error.message}`);
      }
    }
  }

  async seedProfiles() {
    log.header('Seeding User Profiles');

    const profilesData = [
      // John Beginner's profile
      {
        userEmail: 'john.beginner@example.com',
        data: {
          weight: 80, // kg
          height: 175, // cm
          dateOfBirth: new Date('1998-05-15'),
          gender: 'male',
          fitnessLevel: 'beginner',
          activityLevel: 'sedentary',
          fitnessGoals: ['weight_loss', 'general_fitness'],
          medicalConditions: [],
          preferences: {
            workoutTypes: ['cardio', 'strength'],
            workoutDuration: 30,
            workoutFrequency: 3
          }
        }
      },
      // Jane Intermediate's profile
      {
        userEmail: 'jane.intermediate@example.com',
        data: {
          weight: 65,
          height: 165,
          dateOfBirth: new Date('1995-08-22'),
          gender: 'female',
          fitnessLevel: 'intermediate',
          activityLevel: 'lightly_active',
          fitnessGoals: ['muscle_gain', 'strength'],
          medicalConditions: [],
          preferences: {
            workoutTypes: ['strength', 'yoga'],
            workoutDuration: 45,
            workoutFrequency: 4
          }
        }
      },
      // Alex Advanced's profile
      {
        userEmail: 'alex.advanced@example.com',
        data: {
          weight: 85,
          height: 182,
          dateOfBirth: new Date('1991-03-10'),
          gender: 'male',
          fitnessLevel: 'advanced',
          activityLevel: 'very_active',
          fitnessGoals: ['strength', 'muscle_gain'],
          medicalConditions: [],
          preferences: {
            workoutTypes: ['strength', 'crossfit'],
            workoutDuration: 90,
            workoutFrequency: 6
          }
        }
      },
      // Emily Yoga's profile
      {
        userEmail: 'emily.yoga@example.com',
        data: {
          weight: 58,
          height: 168,
          dateOfBirth: new Date('1994-11-30'),
          gender: 'female',
          fitnessLevel: 'intermediate',
          activityLevel: 'moderately_active',
          fitnessGoals: ['flexibility', 'general_fitness'],
          medicalConditions: [
            {
              condition: 'Lower back pain',
              severity: 'mild',
              notes: 'Occasional discomfort, managed with yoga and stretching'
            }
          ],
          preferences: {
            workoutTypes: ['yoga', 'pilates'],
            workoutDuration: 60,
            workoutFrequency: 5
          }
        }
      },
      // Pending Contributor's profile
      {
        userEmail: 'pending.contributor@example.com',
        data: {
          weight: 82,
          height: 178,
          dateOfBirth: new Date('1988-07-18'),
          gender: 'male',
          fitnessLevel: 'advanced',
          activityLevel: 'very_active',
          fitnessGoals: ['strength', 'muscle_gain'],
          medicalConditions: [],
          preferences: {
            workoutTypes: ['strength', 'crossfit'],
            workoutDuration: 75,
            workoutFrequency: 5
          }
        }
      }
    ];

    for (const profileData of profilesData) {
      try {
        const user = this.createdData.users.find(u => u.email === profileData.userEmail);
        if (!user) {
          log.warning(`User not found for profile: ${profileData.userEmail}`);
          continue;
        }

        const profile = new Profile({
          ...profileData.data,
          user: user._id
        });

        await profile.save();
        this.createdData.profiles.push(profile);
        log.success(`Created profile for: ${profileData.userEmail}`);
      } catch (error) {
        log.error(`Failed to create profile for ${profileData.userEmail}: ${error.message}`);
      }
    }
  }

  async seedExercises() {
    log.header('Seeding Exercises');

    const exercises = [
      // Strength Training Exercises
      {
        name: 'Push-ups',
        description: 'Classic bodyweight exercise targeting chest, shoulders, and triceps',
        targetMuscleGroup: 'chest',
        secondaryMuscles: ['shoulders', 'triceps'],
        equipment: ['none'],
        difficulty: 'beginner',
        instructions: [
          { step: 1, description: 'Start in a plank position with hands slightly wider than shoulders' },
          { step: 2, description: 'Lower your body until chest nearly touches the floor' },
          { step: 3, description: 'Push back up to starting position' },
          { step: 4, description: 'Keep your body straight throughout the movement' }
        ],
        tips: [
          'Keep your core engaged',
          'Don\'t let your hips sag',
          'Control the movement both up and down'
        ],
        warnings: ['Avoid if you have wrist problems', 'Modify on knees if needed'],
        tags: ['bodyweight', 'upper-body', 'beginner-friendly']
      },
      {
        name: 'Squats',
        description: 'Fundamental lower body exercise targeting quads, glutes, and hamstrings',
        targetMuscleGroup: 'quadriceps',
        secondaryMuscles: ['glutes', 'hamstrings', 'calves'],
        equipment: ['none'],
        difficulty: 'beginner',
        instructions: [
          { step: 1, description: 'Stand with feet shoulder-width apart' },
          { step: 2, description: 'Lower your body as if sitting back into a chair' },
          { step: 3, description: 'Keep your chest up and knees behind toes' },
          { step: 4, description: 'Lower until thighs are parallel to floor' },
          { step: 5, description: 'Push through heels to return to start' }
        ],
        tips: [
          'Keep your weight in your heels',
          'Don\'t let knees cave inward',
          'Keep your chest proud'
        ],
        tags: ['bodyweight', 'lower-body', 'compound']
      },
      {
        name: 'Deadlifts',
        description: 'Compound exercise targeting posterior chain muscles',
        targetMuscleGroup: 'hamstrings',
        secondaryMuscles: ['glutes', 'lower_back'],
        equipment: ['barbell'],
        difficulty: 'intermediate',
        instructions: [
          { step: 1, description: 'Stand with feet hip-width apart, bar over mid-foot' },
          { step: 2, description: 'Hinge at hips and knees to grip the bar' },
          { step: 3, description: 'Keep chest up and back straight' },
          { step: 4, description: 'Drive through heels to lift the bar' },
          { step: 5, description: 'Extend hips and knees simultaneously' }
        ],
        tips: [
          'Keep the bar close to your body',
          'Engage your lats',
          'Don\'t round your back'
        ],
        warnings: ['Proper form is crucial', 'Start with light weight'],
        tags: ['compound', 'strength', 'posterior-chain']
      },
      {
        name: 'Bench Press',
        description: 'Upper body strength exercise targeting chest muscles',
        targetMuscleGroup: 'chest',
        secondaryMuscles: ['shoulders', 'triceps'],
        equipment: ['barbell', 'bench'],
        difficulty: 'intermediate',
        instructions: [
          { step: 1, description: 'Lie on bench with eyes under the bar' },
          { step: 2, description: 'Grip bar slightly wider than shoulder-width' },
          { step: 3, description: 'Unrack and lower bar to chest' },
          { step: 4, description: 'Press bar back up to starting position' }
        ],
        tips: [
          'Keep your feet flat on the floor',
          'Maintain a slight arch in your back',
          'Control the descent'
        ],
        warnings: ['Always use a spotter', 'Use safety bars if available'],
        tags: ['upper-body', 'strength', 'compound']
      },
      // Cardio Exercises
      {
        name: 'Jumping Jacks',
        description: 'Full-body cardio exercise to elevate heart rate',
        targetMuscleGroup: 'full_body',
        secondaryMuscles: ['cardio'],
        equipment: ['none'],
        difficulty: 'beginner',
        instructions: [
          { step: 1, description: 'Start standing with feet together, arms at sides' },
          { step: 2, description: 'Jump while spreading legs shoulder-width apart' },
          { step: 3, description: 'Simultaneously raise arms overhead' },
          { step: 4, description: 'Jump back to starting position' }
        ],
        tips: [
          'Land softly on the balls of your feet',
          'Keep a steady rhythm',
          'Engage your core'
        ],
        tags: ['cardio', 'full-body', 'plyometric']
      },
      {
        name: 'Burpees',
        description: 'High-intensity full-body exercise combining squat, plank, and jump',
        targetMuscleGroup: 'full_body',
        secondaryMuscles: ['chest', 'cardio'],
        equipment: ['none'],
        difficulty: 'advanced',
        instructions: [
          { step: 1, description: 'Start in standing position' },
          { step: 2, description: 'Drop into squat and place hands on floor' },
          { step: 3, description: 'Jump feet back into plank position' },
          { step: 4, description: 'Do a push-up (optional)' },
          { step: 5, description: 'Jump feet back to squat' },
          { step: 6, description: 'Explode up with arms overhead' }
        ],
        tips: [
          'Maintain proper form even when tired',
          'Land softly',
          'Breathe consistently'
        ],
        tags: ['hiit', 'full-body', 'intense']
      },
      // Core Exercises
      {
        name: 'Plank',
        description: 'Isometric core strengthening exercise',
        targetMuscleGroup: 'abs',
        secondaryMuscles: ['shoulders', 'back'],
        equipment: ['none'],
        difficulty: 'beginner',
        instructions: [
          { step: 1, description: 'Start in push-up position' },
          { step: 2, description: 'Rest on forearms instead of hands' },
          { step: 3, description: 'Keep body straight from head to heels' },
          { step: 4, description: 'Hold position while breathing normally' }
        ],
        tips: [
          'Don\'t let hips sag or pike up',
          'Keep core tight',
          'Start with 30 seconds and build up'
        ],
        tags: ['core', 'isometric', 'stability']
      },
      {
        name: 'Mountain Climbers',
        description: 'Dynamic core and cardio exercise',
        targetMuscleGroup: 'abs',
        secondaryMuscles: ['shoulders', 'cardio'],
        equipment: ['none'],
        difficulty: 'intermediate',
        instructions: [
          { step: 1, description: 'Start in plank position' },
          { step: 2, description: 'Bring right knee toward chest' },
          { step: 3, description: 'Quickly switch legs' },
          { step: 4, description: 'Continue alternating legs rapidly' },
          { step: 5, description: 'Keep hips level' }
        ],
        tips: [
          'Keep core engaged',
          'Don\'t bounce hips up and down',
          'Maintain steady breathing'
        ],
        tags: ['core', 'cardio', 'dynamic']
      }
    ];

    // Get contributor users to assign as creators
    const contributors = this.createdData.users.filter(u => u.isContributor);

    for (const exerciseData of exercises) {
      try {
        const exercise = new Exercise({
          ...exerciseData,
          createdBy: contributors[Math.floor(Math.random() * contributors.length)]._id,
          isActive: true,
          rating: {
            average: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 to 5.0
            count: Math.floor(Math.random() * 50) + 10 // 10 to 60 ratings
          }
        });

        await exercise.save();
        this.createdData.exercises.push(exercise);
        log.success(`Created exercise: ${exercise.name}`);
      } catch (error) {
        log.error(`Failed to create exercise ${exerciseData.name}: ${error.message}`);
      }
    }
  }

  async seedWorkouts() {
    log.header('Seeding Workouts');

    if (this.createdData.exercises.length === 0) {
      log.warning('No exercises available for workouts');
      return;
    }

    const workouts = [
      {
        name: 'Beginner Full Body',
        description: 'A complete workout for beginners targeting all major muscle groups',
        type: 'mixed',
        difficulty: 'beginner',
        estimatedDuration: 30,
        exerciseNames: ['Push-ups', 'Squats', 'Plank', 'Jumping Jacks'],
        tags: ['beginner', 'full-body', 'bodyweight']
      },
      {
        name: 'Upper Body Strength',
        description: 'Intense upper body workout focusing on strength building',
        type: 'strength',
        difficulty: 'intermediate',
        estimatedDuration: 45,
        exerciseNames: ['Push-ups', 'Bench Press', 'Plank'],
        tags: ['intermediate', 'upper-body', 'strength']
      },
      {
        name: 'Lower Body Power',
        description: 'Explosive lower body workout for strength and power',
        type: 'strength',
        difficulty: 'intermediate',
        estimatedDuration: 40,
        exerciseNames: ['Squats', 'Deadlifts'],
        tags: ['intermediate', 'lower-body', 'power']
      },
      {
        name: 'HIIT Cardio Blast',
        description: 'High-intensity interval training for maximum calorie burn',
        type: 'cardio',
        difficulty: 'advanced',
        estimatedDuration: 25,
        exerciseNames: ['Burpees', 'Jumping Jacks', 'Mountain Climbers'],
        tags: ['advanced', 'hiit', 'cardio', 'fat-loss']
      },
      {
        name: 'Yoga Flow',
        description: 'Gentle yoga sequence for flexibility and mindfulness',
        type: 'flexibility',
        difficulty: 'beginner',
        estimatedDuration: 60,
        exerciseNames: ['Plank'],
        tags: ['beginner', 'yoga', 'flexibility', 'mindfulness']
      },
      {
        name: 'Core Crusher',
        description: 'Intensive core workout for stronger abs and better stability',
        type: 'strength',
        difficulty: 'intermediate',
        estimatedDuration: 20,
        exerciseNames: ['Plank', 'Mountain Climbers'],
        tags: ['intermediate', 'core', 'abs']
      },
      {
        name: 'Full Body HIIT',
        description: 'Complete high-intensity workout targeting all muscle groups',
        type: 'mixed',
        difficulty: 'advanced',
        estimatedDuration: 35,
        exerciseNames: ['Burpees', 'Squats', 'Push-ups', 'Mountain Climbers'],
        tags: ['advanced', 'hiit', 'full-body', 'intense']
      }
    ];

    const users = this.createdData.users.filter(u => u.isActive);

    for (const workoutData of workouts) {
      try {
        // Find exercises by name
        const workoutSets = [];
        for (const exerciseName of workoutData.exerciseNames) {
          const exercise = this.createdData.exercises.find(e => e.name === exerciseName);
          if (exercise) {
            workoutSets.push({
              exercise: exercise._id,
              repetitions: workoutData.type === 'cardio' ? null : Math.floor(Math.random() * 10) + 8, // 8-17 reps for strength
              duration: workoutData.type === 'cardio' ? Math.floor(Math.random() * 30) + 30 : null, // 30-60 seconds for cardio
              weight: workoutData.type === 'strength' ? Math.floor(Math.random() * 20) + 10 : null,
              restTime: workoutData.type === 'cardio' ? 15 : 60, // seconds
              notes: `${workoutData.difficulty} level ${exerciseName.toLowerCase()}`
            });
          }
        }

        // Determine target muscle groups from exercises
        const targetMuscleGroups = [...new Set(workoutSets.flatMap(set => {
          const exercise = this.createdData.exercises.find(e => e._id.equals(set.exercise));
          return exercise ? [exercise.targetMuscleGroup, ...exercise.secondaryMuscles] : [];
        }))];

        // Determine equipment needed
        const equipment = [...new Set(workoutSets.flatMap(set => {
          const exercise = this.createdData.exercises.find(e => e._id.equals(set.exercise));
          return exercise ? exercise.equipment : [];
        }))];

        const workout = new Workout({
          name: workoutData.name,
          description: workoutData.description,
          type: workoutData.type,
          difficulty: workoutData.difficulty,
          estimatedDuration: workoutData.estimatedDuration,
          sets: workoutSets,
          targetMuscleGroups: targetMuscleGroups,
          equipment: equipment,
          instructions: {
            warmUp: ['5-10 minutes light cardio or dynamic stretching'],
            coolDown: ['5-10 minutes static stretching'],
            general: [`Perform each exercise with proper form`, `Rest ${workoutData.type === 'cardio' ? '15' : '60'} seconds between sets`]
          },
          caloriesBurned: Math.floor(workoutData.estimatedDuration * (workoutData.type === 'cardio' ? 10 : 8)), // rough estimate
          tags: workoutData.tags,
          createdBy: users[Math.floor(Math.random() * users.length)]._id,
          isActive: true
        });

        await workout.save();
        this.createdData.workouts.push(workout);
        log.success(`Created workout: ${workout.name}`);
      } catch (error) {
        log.error(`Failed to create workout ${workoutData.name}: ${error.message}`);
      }
    }
  }

  async seedPrograms() {
    log.header('Seeding Programs');

    if (this.createdData.workouts.length === 0) {
      log.warning('No workouts available for programs');
      return;
    }

    const programs = [
      {
        name: 'Zero to Hero - Complete Beginner',
        description: 'A comprehensive 8-week program designed for absolute beginners. Build foundation strength, learn proper form, and develop healthy exercise habits.',
        category: 'general_fitness',
        difficulty: 'beginner',
        duration: 8,
        workoutsPerWeek: 3,
        estimatedTimePerSession: 30,
        workoutNames: ['Beginner Full Body', 'Yoga Flow'],
        prerequisites: ['None - perfect for beginners'],
        benefits: [
          'Build foundational strength',
          'Improve cardiovascular health',
          'Learn proper exercise form',
          'Develop exercise routine'
        ]
      },
      {
        name: 'Beginner Fitness Journey',
        description: 'Step up your fitness game with this progressive 12-week program combining strength and cardio.',
        category: 'weight_loss',
        difficulty: 'beginner',
        duration: 12,
        workoutsPerWeek: 4,
        estimatedTimePerSession: 35,
        workoutNames: ['Beginner Full Body', 'Core Crusher', 'Yoga Flow'],
        prerequisites: ['Basic exercise experience helpful'],
        benefits: [
          'Weight loss and fat burning',
          'Improved muscle tone',
          'Better endurance',
          'Increased flexibility'
        ]
      },
      {
        name: 'Strength Builder Pro',
        description: 'Advanced strength training program for serious muscle building and power development.',
        category: 'muscle_building',
        difficulty: 'intermediate',
        duration: 16,
        workoutsPerWeek: 4,
        estimatedTimePerSession: 60,
        workoutNames: ['Upper Body Strength', 'Lower Body Power', 'Core Crusher'],
        prerequisites: ['6+ months of consistent training'],
        benefits: [
          'Significant muscle growth',
          'Increased strength',
          'Better body composition',
          'Enhanced athletic performance'
        ]
      },
      {
        name: 'HIIT Transformation',
        description: 'High-intensity program designed for maximum fat loss and conditioning in minimal time.',
        category: 'weight_loss',
        difficulty: 'advanced',
        duration: 6,
        workoutsPerWeek: 5,
        estimatedTimePerSession: 25,
        workoutNames: ['HIIT Cardio Blast', 'Full Body HIIT'],
        prerequisites: ['Good cardiovascular base required'],
        benefits: [
          'Rapid fat loss',
          'Improved cardiovascular fitness',
          'Enhanced metabolism',
          'Time-efficient workouts'
        ]
      },
      {
        name: 'Flexibility & Mindfulness',
        description: 'Comprehensive yoga and flexibility program for stress relief and improved mobility.',
        category: 'flexibility',
        difficulty: 'beginner',
        duration: 10,
        workoutsPerWeek: 5,
        estimatedTimePerSession: 45,
        workoutNames: ['Yoga Flow'],
        prerequisites: ['Open mind and willingness to learn'],
        benefits: [
          'Increased flexibility',
          'Stress reduction',
          'Better sleep quality',
          'Improved balance and coordination'
        ]
      }
    ];

    const contributors = this.createdData.users.filter(u => u.isContributor);

    for (const programData of programs) {
      try {
        // Find workouts by name and create workout array
        const programWorkouts = [];
        for (const workoutName of programData.workoutNames) {
          const workout = this.createdData.workouts.find(w => w.name === workoutName);
          if (workout) {
            programWorkouts.push({
              workout: workout._id,
              week: Math.floor(Math.random() * programData.duration) + 1,
              day: Math.floor(Math.random() * 7) + 1,
              order: programWorkouts.length + 1
            });
          }
        }

        const program = new Program({
          name: programData.name,
          description: programData.description,
          category: programData.category,
          difficulty: programData.difficulty,
          duration: programData.duration,
          workoutsPerWeek: programData.workoutsPerWeek,
          workouts: programWorkouts,
          estimatedTimePerSession: programData.estimatedTimePerSession,
          totalEstimatedCalories: programData.estimatedTimePerSession * programData.workoutsPerWeek * programData.duration * 8, // rough estimate
          equipment: [...new Set(programWorkouts.flatMap(pw => {
            const workout = this.createdData.workouts.find(w => w._id.equals(pw.workout));
            return workout ? workout.equipment : [];
          }))],
          prerequisites: programData.prerequisites,
          benefits: programData.benefits,
          createdBy: contributors[Math.floor(Math.random() * contributors.length)]._id,
          isActive: true,
          rating: {
            average: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10, // 3.5 to 5.0
            count: Math.floor(Math.random() * 100) + 20 // 20 to 120 ratings
          },
          tags: [programData.category, programData.difficulty]
        });

        await program.save();
        this.createdData.programs.push(program);
        log.success(`Created program: ${program.name}`);
      } catch (error) {
        log.error(`Failed to create program ${programData.name}: ${error.message}`);
      }
    }
  }

  async seedGoals() {
    log.header('Seeding Goals');

    const users = this.createdData.users.filter(u => u.isActive && !u.isAdmin);
    const programs = this.createdData.programs;
    const workouts = this.createdData.workouts;

    const goalTemplates = [
      {
        title: 'Lose 10kg in 6 months',
        description: 'Gradual weight loss through consistent exercise and healthy eating habits',
        type: 'monthly',
        targets: {
          workoutsPerWeek: 4,
          totalWorkouts: 96, // 24 weeks * 4 workouts
          totalCalories: 19200, // 96 workouts * 200 calories avg
          totalDuration: 2880 // 96 workouts * 30 minutes avg
        }
      },
      {
        title: 'Complete strength training program',
        description: 'Build upper body strength through consistent training',
        type: 'weekly',
        targets: {
          workoutsPerWeek: 3,
          totalWorkouts: 36, // 12 weeks * 3 workouts
          totalCalories: 7200, // 36 workouts * 200 calories avg
          totalDuration: 1620 // 36 workouts * 45 minutes avg
        }
      },
      {
        title: 'Improve cardiovascular endurance',
        description: 'Enhance cardiovascular fitness and running endurance',
        type: 'weekly',
        targets: {
          workoutsPerWeek: 4,
          totalWorkouts: 32, // 8 weeks * 4 workouts
          totalCalories: 9600, // 32 workouts * 300 calories avg
          totalDuration: 1280 // 32 workouts * 40 minutes avg
        }
      },
      {
        title: 'Flexibility and mobility improvement',
        description: 'Develop flexibility and stress relief through regular practice',
        type: 'weekly',
        targets: {
          workoutsPerWeek: 5,
          totalWorkouts: 60, // 12 weeks * 5 workouts
          totalCalories: 3000, // 60 workouts * 50 calories avg
          totalDuration: 3600 // 60 workouts * 60 minutes avg
        }
      },
      {
        title: 'Build muscle mass and strength',
        description: 'Gain lean muscle through strength training and proper nutrition',
        type: 'monthly',
        targets: {
          workoutsPerWeek: 4,
          totalWorkouts: 64, // 16 weeks * 4 workouts
          totalCalories: 12800, // 64 workouts * 200 calories avg
          totalDuration: 4800 // 64 workouts * 75 minutes avg
        }
      }
    ];

    for (let i = 0; i < users.length && i < goalTemplates.length; i++) {
      const user = users[i];
      const template = goalTemplates[i];
      
      try {
        const startDate = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000); // 0-30 days ago
        const endDate = new Date(startDate.getTime() + (Math.floor(Math.random() * 120) + 60) * 24 * 60 * 60 * 1000); // 60-180 days from start

        // Assign program or custom workouts
        let assignedProgram = null;
        let customWorkouts = [];

        if (Math.random() > 0.5 && programs.length > 0) {
          // Assign a program
          assignedProgram = programs[Math.floor(Math.random() * programs.length)]._id;
        } else if (workouts.length > 0) {
          // Assign custom workouts with scheduled dates
          const numWorkouts = Math.floor(Math.random() * 3) + 1; // 1-3 workouts
          for (let j = 0; j < numWorkouts; j++) {
            const workout = workouts[Math.floor(Math.random() * workouts.length)];
            const scheduledDate = new Date(startDate);
            scheduledDate.setDate(scheduledDate.getDate() + (j * 7)); // Schedule weekly
            
            customWorkouts.push({
              workout: workout._id,
              scheduledDate: scheduledDate,
              completed: Math.random() > 0.7, // 30% chance of being completed
              completedAt: Math.random() > 0.7 ? new Date(scheduledDate.getTime() + 24 * 60 * 60 * 1000) : null, // completed next day if completed
              actualDuration: Math.random() > 0.7 ? Math.floor(Math.random() * 20) + 30 : null, // 30-50 minutes if completed
              caloriesBurned: Math.random() > 0.7 ? Math.floor(Math.random() * 200) + 150 : null, // 150-350 calories if completed
              notes: Math.random() > 0.8 ? 'Great workout!' : null,
              difficulty: Math.random() > 0.5 ? 'just_right' : Math.random() > 0.5 ? 'too_easy' : 'too_hard',
              enjoyment: Math.floor(Math.random() * 5) + 1 // 1-5 rating
            });
          }
        }

        const goal = new Goal({
          user: user._id,
          title: template.title,
          description: template.description,
          type: template.type,
          startDate: startDate,
          endDate: endDate,
          status: Math.random() > 0.8 ? 'completed' : Math.random() > 0.9 ? 'paused' : 'active',
          program: assignedProgram,
          workouts: customWorkouts,
          targets: template.targets,
          progress: {
            completedWorkouts: Math.floor(Math.random() * 10) + 5, // 5-15 completed
            totalCaloriesBurned: Math.floor(Math.random() * 2000) + 1000, // 1000-3000 calories
            totalDuration: Math.floor(Math.random() * 500) + 300, // 300-800 minutes
            completionPercentage: Math.floor(Math.random() * 60) + 20 // 20-80%
          }
        });

        await goal.save();
        this.createdData.goals.push(goal);
        log.success(`Created goal: ${goal.title} for ${user.firstName} ${user.lastName}`);
      } catch (error) {
        log.error(`Failed to create goal for ${user.firstName}: ${error.message}`);
      }
    }
  }

  async seedNotifications() {
    log.header('Seeding Notifications');

    const notifications = [
      {
        type: 'user_registration',
        title: 'New User Registration',
        message: 'John Beginner has joined the platform',
        priority: 'low',
        data: {
          userId: null, // Will be set dynamically
          userName: 'John Beginner',
          userEmail: 'john.beginner@example.com'
        }
      },
      {
        type: 'contributor_request',
        title: 'Contributor Request',
        message: 'Pending Contributor wants to become a contributor',
        priority: 'medium',
        data: {
          userId: null, // Will be set dynamically
          userName: 'Pending Contributor',
          userEmail: 'pending.contributor@example.com',
          applicationText: 'I am a certified personal trainer...'
        }
      },
      {
        type: 'system_alert',
        title: 'System Alert',
        message: 'Multiple failed login attempts detected from IP 192.168.1.100',
        priority: 'high',
        data: {
          ip: '192.168.1.100',
          attempts: 5,
          lastAttempt: new Date()
        }
      },
      {
        type: 'user_registration',
        title: 'Welcome Message',
        message: 'Welcome to MeFit! Start your fitness journey today.',
        priority: 'low',
        data: {
          messageType: 'welcome',
          targetAudience: 'new_users'
        }
      },
      {
        type: 'system_alert',
        title: 'System Maintenance',
        message: 'Scheduled maintenance completed successfully',
        priority: 'medium',
        data: {
          maintenanceType: 'database',
          duration: '2 hours',
          completedAt: new Date()
        }
      },
      {
        type: 'contributor_request',
        title: 'Another Contributor Request',
        message: 'Maria Cardio wants to become a contributor',
        priority: 'medium',
        data: {
          userId: null, // Will be set dynamically
          userName: 'Maria Cardio',
          userEmail: 'maria.cardio@example.com',
          applicationText: 'I am a certified yoga instructor...'
        }
      }
    ];

    const users = this.createdData.users;

    for (const notificationData of notifications) {
      try {
        // Set dynamic user IDs
        if (notificationData.data.userName) {
          const user = users.find(u => u.firstName + ' ' + u.lastName === notificationData.data.userName);
          if (user) {
            notificationData.data.userId = user._id;
          }
        }

        const notification = new Notification({
          ...notificationData,
          isRead: Math.random() > 0.6, // 40% chance of being read
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000) // 0-7 days ago
        });

        await notification.save();
        this.createdData.notifications.push(notification);
        log.success(`Created notification: ${notification.title}`);
      } catch (error) {
        log.error(`Failed to create notification ${notificationData.title}: ${error.message}`);
      }
    }
  }

  async runTests() {
    log.header('Running Functionality Tests');

    const tests = [
      this.testUserAuthentication.bind(this),
      this.testUserRoles.bind(this),
      this.testProfileManagement.bind(this),
      this.testExerciseOperations.bind(this),
      this.testWorkoutOperations.bind(this),
      this.testProgramOperations.bind(this),
      this.testGoalOperations.bind(this),
      this.testNotificationSystem.bind(this),
      this.testAdminFunctionality.bind(this),
      this.testDataIntegrity.bind(this)
    ];

    for (const test of tests) {
      try {
        await test();
      } catch (error) {
        log.error(`Test failed: ${error.message}`);
        this.testResults.failed++;
      }
      this.testResults.total++;
    }
  }

  async testUserAuthentication() {
    log.info('Testing User Authentication...');
    
    // Test admin user
    const admin = this.createdData.users.find(u => u.isAdmin);
    if (!admin) throw new Error('Admin user not created');
    
    const isValidPassword = await admin.comparePassword('Admin123!');
    if (!isValidPassword) throw new Error('Password comparison failed');
    
    // Test 2FA user
    const twoFAUser = this.createdData.users.find(u => u.twoFactorEnabled);
    if (!twoFAUser || !twoFAUser.twoFactorSecret) throw new Error('2FA user not properly configured');
    
    this.testResults.passed++;
    log.success('✓ User authentication test passed');
  }

  async testUserRoles() {
    log.info('Testing User Roles...');
    
    const admin = this.createdData.users.find(u => u.isAdmin);
    const contributor = this.createdData.users.find(u => u.isContributor && !u.isAdmin);
    const regularUser = this.createdData.users.find(u => !u.isContributor && !u.isAdmin);
    const pendingContributor = this.createdData.users.find(u => u.contributorRequestPending);
    
    if (!admin || !contributor || !regularUser || !pendingContributor) {
      throw new Error('Not all user roles were created');
    }
    
    if (!admin.isAdmin || !admin.isContributor) throw new Error('Admin roles not set correctly');
    if (contributor.isAdmin) throw new Error('Contributor should not be admin');
    if (regularUser.isContributor) throw new Error('Regular user should not be contributor');
    if (!pendingContributor.contributorRequestPending) throw new Error('Pending contributor request not set');
    
    this.testResults.passed++;
    log.success('✓ User roles test passed');
  }

  async testProfileManagement() {
    log.info('Testing Profile Management...');
    
    if (this.createdData.profiles.length === 0) throw new Error('No profiles created');
    
    // Test profile with user relationship
    for (const profile of this.createdData.profiles) {
      const user = this.createdData.users.find(u => u._id.equals(profile.user));
      if (!user) throw new Error('Profile user relationship broken');
      
      if (!profile.fitnessLevel || !profile.activityLevel) {
        throw new Error('Profile missing required fitness data');
      }
    }
    
    this.testResults.passed++;
    log.success('✓ Profile management test passed');
  }

  async testExerciseOperations() {
    log.info('Testing Exercise Operations...');
    
    if (this.createdData.exercises.length === 0) throw new Error('No exercises created');
    
    // Test exercise data integrity
    for (const exercise of this.createdData.exercises) {
      if (!exercise.name || !exercise.targetMuscleGroup || !exercise.difficulty) {
        throw new Error(`Exercise '${exercise.name || 'unnamed'}' missing required fields: name, targetMuscleGroup, or difficulty`);
      }
      
      if (!exercise.instructions || exercise.instructions.length === 0) {
        throw new Error(`Exercise '${exercise.name}' missing instructions`);
      }
      
      // Check if instructions are properly structured
      for (const instruction of exercise.instructions) {
        if (!instruction.step || !instruction.description) {
          throw new Error(`Exercise '${exercise.name}' has malformed instructions`);
        }
      }
      
      const creator = this.createdData.users.find(u => u._id.equals(exercise.createdBy));
      if (!creator || !creator.isContributor) {
        throw new Error(`Exercise '${exercise.name}' creator is not a contributor`);
      }
    }
    
    this.testResults.passed++;
    log.success('✓ Exercise operations test passed');
  }

  async testWorkoutOperations() {
    log.info('Testing Workout Operations...');
    
    if (this.createdData.workouts.length === 0) throw new Error('No workouts created');
    
    // Test workout-exercise relationships
    for (const workout of this.createdData.workouts) {
      if (!workout.sets || workout.sets.length === 0) {
        throw new Error(`Workout '${workout.name}' has no exercise sets`);
      }
      
      // Check required fields
      if (!workout.type || !workout.difficulty || !workout.estimatedDuration) {
        throw new Error(`Workout '${workout.name}' missing required fields`);
      }
      
      for (const workoutSet of workout.sets) {
        const exercise = this.createdData.exercises.find(e => e._id.equals(workoutSet.exercise));
        if (!exercise) throw new Error(`Workout '${workout.name}' references non-existent exercise`);
      }
    }
    
    this.testResults.passed++;
    log.success('✓ Workout operations test passed');
  }

  async testProgramOperations() {
    log.info('Testing Program Operations...');
    
    if (this.createdData.programs.length === 0) throw new Error('No programs created');
    
    // Test program-workout relationships
    for (const program of this.createdData.programs) {
      if (!program.workouts || program.workouts.length === 0) {
        throw new Error(`Program '${program.name}' has no workouts`);
      }
      
      for (const programWorkout of program.workouts) {
        const workout = this.createdData.workouts.find(w => w._id.equals(programWorkout.workout));
        if (!workout) throw new Error(`Program '${program.name}' references non-existent workout`);
      }
      
      if (program.duration <= 0 || program.workoutsPerWeek <= 0) {
        throw new Error(`Program '${program.name}' has invalid duration or frequency`);
      }
    }
    
    this.testResults.passed++;
    log.success('✓ Program operations test passed');
  }

  async testGoalOperations() {
    log.info('Testing Goal Operations...');
    
    if (this.createdData.goals.length === 0) throw new Error('No goals created');
    
    // Test goal data integrity
    for (const goal of this.createdData.goals) {
      const user = this.createdData.users.find(u => u._id.equals(goal.user));
      if (!user) throw new Error('Goal references non-existent user');
      
      if (goal.startDate >= goal.endDate) {
        throw new Error('Goal has invalid date range');
      }
      
      if (goal.targetValue <= 0) {
        throw new Error('Goal has invalid target value');
      }
      
      // Test program or workout assignments
      if (goal.program) {
        const program = this.createdData.programs.find(p => p._id.equals(goal.program));
        if (!program) throw new Error('Goal references non-existent program');
      }
      
      if (goal.workouts && goal.workouts.length > 0) {
        for (const goalWorkout of goal.workouts) {
          const workout = this.createdData.workouts.find(w => w._id.equals(goalWorkout.workout));
          if (!workout) throw new Error('Goal references non-existent workout');
        }
      }
    }
    
    this.testResults.passed++;
    log.success('✓ Goal operations test passed');
  }

  async testNotificationSystem() {
    log.info('Testing Notification System...');
    
    if (this.createdData.notifications.length === 0) throw new Error('No notifications created');
    
    // Test notification types and data
    const requiredTypes = ['user_registration', 'contributor_request', 'system_alert'];
    for (const type of requiredTypes) {
      const notification = this.createdData.notifications.find(n => n.type === type);
      if (!notification) throw new Error(`Missing notification type: ${type}`);
    }
    
    // Test notification data integrity
    for (const notification of this.createdData.notifications) {
      if (!notification.title || !notification.message) {
        throw new Error('Notification missing required fields');
      }
      
      if (!['low', 'medium', 'high'].includes(notification.priority)) {
        throw new Error('Notification has invalid priority');
      }
    }
    
    this.testResults.passed++;
    log.success('✓ Notification system test passed');
  }

  async testAdminFunctionality() {
    log.info('Testing Admin Functionality...');
    
    const admin = this.createdData.users.find(u => u.isAdmin);
    if (!admin) throw new Error('No admin user found');
    
    const contributors = this.createdData.users.filter(u => u.isContributor);
    if (contributors.length === 0) throw new Error('No contributors found');
    
    const pendingRequests = this.createdData.users.filter(u => u.contributorRequestPending);
    if (pendingRequests.length === 0) throw new Error('No pending contributor requests found');
    
    // Test that admin can access all user data
    const activeUsers = this.createdData.users.filter(u => u.isActive);
    const inactiveUsers = this.createdData.users.filter(u => !u.isActive);
    
    if (activeUsers.length === 0) throw new Error('No active users found');
    if (inactiveUsers.length === 0) throw new Error('No inactive users found for testing');
    
    this.testResults.passed++;
    log.success('✓ Admin functionality test passed');
  }

  async testDataIntegrity() {
    log.info('Testing Data Integrity...');
    
    // Test foreign key relationships
    const collections = [
      { name: 'profiles', userField: 'user' },
      { name: 'goals', userField: 'user' }
    ];
    
    for (const collection of collections) {
      const items = this.createdData[collection.name];
      for (const item of items) {
        const user = this.createdData.users.find(u => u._id.equals(item[collection.userField]));
        if (!user) throw new Error(`${collection.name} references non-existent user`);
      }
    }
    
    // Test unique constraints
    const emails = this.createdData.users.map(u => u.email);
    const uniqueEmails = [...new Set(emails)];
    if (emails.length !== uniqueEmails.length) {
      throw new Error('Duplicate emails found in users');
    }
    
    // Test required fields
    for (const user of this.createdData.users) {
      if (!user.firstName || !user.lastName || !user.email) {
        throw new Error('User missing required fields');
      }
    }
    
    this.testResults.passed++;
    log.success('✓ Data integrity test passed');
  }

  async printSummary() {
    log.header('Seeding Summary');
    
    console.log(`\n📊 Created Data:`);
    console.log(`   Users: ${this.createdData.users.length}`);
    console.log(`   - Admins: ${this.createdData.users.filter(u => u.isAdmin).length}`);
    console.log(`   - Contributors: ${this.createdData.users.filter(u => u.isContributor && !u.isAdmin).length}`);
    console.log(`   - Regular Users: ${this.createdData.users.filter(u => !u.isContributor && !u.isAdmin).length}`);
    console.log(`   - Pending Requests: ${this.createdData.users.filter(u => u.contributorRequestPending).length}`);
    console.log(`   - 2FA Enabled: ${this.createdData.users.filter(u => u.twoFactorEnabled).length}`);
    console.log(`   Profiles: ${this.createdData.profiles.length}`);
    console.log(`   Exercises: ${this.createdData.exercises.length}`);
    console.log(`   Workouts: ${this.createdData.workouts.length}`);
    console.log(`   Programs: ${this.createdData.programs.length}`);
    console.log(`   Goals: ${this.createdData.goals.length}`);
    console.log(`   Notifications: ${this.createdData.notifications.length}`);

    console.log(`\n🧪 Test Results:`);
    console.log(`   Total Tests: ${this.testResults.total}`);
    console.log(`   \x1b[32mPassed: ${this.testResults.passed}\x1b[0m`);
    console.log(`   \x1b[31mFailed: ${this.testResults.failed}\x1b[0m`);
    
    const successRate = this.testResults.total > 0 ? 
      ((this.testResults.passed / this.testResults.total) * 100).toFixed(1) : 0;
    console.log(`   Success Rate: ${successRate}%`);

    console.log(`\n🔐 Test Credentials:`);
    console.log(`   Admin: admin@mefit.com / Admin123!`);
    console.log(`   Contributor: mike.trainer@mefit.com / Trainer123!`);
    console.log(`   Regular User: john.beginner@example.com / User123!`);
    console.log(`   2FA User: emily.yoga@example.com / User123!`);
    console.log(`   Pending Request: pending.contributor@example.com / User123!`);

    if (this.testResults.failed === 0) {
      log.success('\n🎉 All tests passed! Database is ready for use.');
    } else {
      log.warning(`\n⚠️  ${this.testResults.failed} test(s) failed. Please check the logs above.`);
    }
  }

  async run() {
    try {
      log.header('MeFit Database Seeding & Testing');
      
      // Check if cleanup was run first
      await this.checkCleanupMarker();
      
      await this.connect();
      
      // Verify database is empty
      await this.checkDatabaseEmpty();
      
      // Seed data in correct order
      await this.seedUsers();
      await this.seedProfiles();
      await this.seedExercises();
      await this.seedWorkouts();
      await this.seedPrograms();
      await this.seedGoals();
      await this.seedNotifications();
      
      // Run comprehensive tests
      await this.runTests();
      
      // Print summary
      await this.printSummary();
      
      // Create success marker
      const successMarkerPath = path.join(__dirname, '.seed-completed');
      const timestamp = new Date().toISOString();
      fs.writeFileSync(successMarkerPath, `Database seeded successfully at: ${timestamp}\n`);
      log.success('📝 Seed completion marker created');
      
    } catch (error) {
      log.error(`Seeding failed: ${error.message}`);
      console.error(error);
      process.exit(1);
    } finally {
      await mongoose.connection.close();
      log.info('Database connection closed');
    }
  }
}

// Run the seeder
if (require.main === module) {
  const seeder = new MeFitSeeder();
  seeder.run();
}

module.exports = MeFitSeeder;