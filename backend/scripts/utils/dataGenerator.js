/**
 * Data generation utilities for seeding
 * Extracted from seed.js to improve modularity
 */

const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');

// Seeding profiles configuration
const SEEDING_PROFILES = {
  minimal: { users: 3, exercises: 10, workouts: 5, programs: 2, goals: 5 },
  basic: { users: 5, exercises: 20, workouts: 10, programs: 5, goals: 10 },
  standard: { users: 10, exercises: 50, workouts: 20, programs: 10, goals: 20 },
  comprehensive: { users: 20, exercises: 100, workouts: 50, programs: 20, goals: 50 },
  extensive: { users: 50, exercises: 200, workouts: 100, programs: 50, goals: 100 }
};

// Exercise data templates
const EXERCISE_TEMPLATES = [
  {
    name: 'Push-ups',
    category: 'Strength',
    targetMuscleGroup: 'chest',
    muscleGroups: ['Chest', 'Arms'],
    secondaryMuscles: ['triceps', 'shoulders'],
    equipment: ['None'],
    difficulty: 'beginner',
    instructions: [
      { step: 1, description: 'Start in plank position' },
      { step: 2, description: 'Lower body to ground' },
      { step: 3, description: 'Push back up' }
    ],
    tips: ['Keep core tight', 'Maintain straight line from head to heels']
  },
  {
    name: 'Squats',
    category: 'Strength',
    targetMuscleGroup: 'quadriceps',
    muscleGroups: ['Legs', 'Glutes'],
    secondaryMuscles: ['glutes', 'hamstrings'],
    equipment: ['None'],
    difficulty: 'beginner',
    instructions: [
      { step: 1, description: 'Stand with feet shoulder-width apart' },
      { step: 2, description: 'Lower into squat position' },
      { step: 3, description: 'Return to standing' }
    ],
    tips: ['Keep knees behind toes', 'Chest up', 'Weight in heels']
  },
  {
    name: 'Deadlifts',
    category: 'Strength',
    targetMuscleGroup: 'hamstrings',
    muscleGroups: ['Legs', 'Back'],
    secondaryMuscles: ['glutes', 'lower_back'],
    equipment: ['barbell'],
    difficulty: 'intermediate',
    instructions: [
      { step: 1, description: 'Stand with feet hip-width apart' },
      { step: 2, description: 'Hinge at hips, lower bar to ground' },
      { step: 3, description: 'Return to standing' }
    ],
    tips: ['Keep back straight', 'Engage core', 'Drive through heels']
  },
  {
    name: 'Running',
    category: 'Cardio',
    targetMuscleGroup: 'cardio',
    muscleGroups: ['Legs', 'Core'],
    secondaryMuscles: ['calves', 'glutes'],
    equipment: ['None'],
    difficulty: 'beginner',
    instructions: [
      { step: 1, description: 'Maintain steady pace' },
      { step: 2, description: 'Land midfoot' },
      { step: 3, description: 'Pump arms naturally' }
    ],
    tips: ['Start slow', 'Breathe rhythmically', 'Maintain good posture']
  },
  {
    name: 'Plank',
    category: 'Core',
    targetMuscleGroup: 'abs',
    muscleGroups: ['Core', 'Shoulders'],
    secondaryMuscles: ['shoulders', 'back'],
    equipment: ['None'],
    difficulty: 'beginner',
    instructions: [
      { step: 1, description: 'Hold plank position' },
      { step: 2, description: 'Maintain straight line from head to heels' },
      { step: 3, description: 'Hold for specified time' }
    ],
    tips: ['Engage core', 'Avoid sagging hips', 'Breathe normally']
  }
];

const WORKOUT_TEMPLATES = [
  {
    name: 'Full Body Beginner',
    description: 'Complete full body workout for beginners',
    type: 'strength',
    difficulty: 'beginner',
    estimatedDuration: 45,
    targetMuscleGroups: ['chest', 'back', 'quadriceps']
  },
  {
    name: 'HIIT Cardio Blast',
    description: 'High intensity interval training for fat burning',
    type: 'cardio',
    difficulty: 'intermediate',
    estimatedDuration: 30,
    targetMuscleGroups: ['cardio']
  },
  {
    name: 'Core Strengthening',
    description: 'Focused core workout to build stability',
    type: 'strength',
    difficulty: 'beginner',
    estimatedDuration: 20,
    targetMuscleGroups: ['abs', 'obliques']
  }
];

const PROGRAM_TEMPLATES = [
  {
    name: 'Beginner Fitness Journey',
    description: 'Complete 12-week program for fitness beginners',
    category: 'general_fitness',
    difficulty: 'beginner',
    duration: 12,
    workoutsPerWeek: 3,
    estimatedTimePerSession: 45
  },
  {
    name: 'Strength Building Program',
    description: '8-week strength focused training program',
    category: 'strength_training',
    difficulty: 'intermediate',
    duration: 8,
    workoutsPerWeek: 4,
    estimatedTimePerSession: 60
  }
];

class DataGenerator {
  constructor() {
    this.userCount = 0;
    this.exerciseCount = 0;
    this.workoutCount = 0;
    this.programCount = 0;
    this.goalCount = 0;
  }

  async generateUsers(count) {
    const users = [];
    const roles = ['admin', 'user', 'contributor'];
    
    for (let i = 0; i < count; i++) {
      const userIndex = this.userCount++;
      const isAdmin = userIndex === 0; // First user is admin
      const isContributor = userIndex === 1 || userIndex === 2; // Next two are contributors
      
      const email = isAdmin ? 'admin@mefit.com' : 
                   isContributor ? `contributor${userIndex}@mefit.com` : 
                   `user${userIndex}@mefit.com`;
      
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      users.push({
        username: isAdmin ? 'admin' : isContributor ? `contributor${userIndex}` : `user${userIndex}`,
        email,
        password: hashedPassword,
        firstName: isAdmin ? 'Admin' : isContributor ? `Contributor${userIndex}` : `User${userIndex}`,
        lastName: isAdmin ? 'User' : isContributor ? `Lastname${userIndex}` : `Lastname${userIndex}`,
        isAdmin,
        isContributor,
        role: isAdmin ? 'admin' : 'user',
        isVerified: true,
        twoFactorSecret: speakeasy.generateSecret({ name: email }).base32,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    return users;
  }

  generateExercises(count, users) {
    const exercises = [];
    
    for (let i = 0; i < count; i++) {
      const template = EXERCISE_TEMPLATES[i % EXERCISE_TEMPLATES.length];
      const exerciseIndex = this.exerciseCount++;
      const contributor = users.find(u => u.isAdmin || u.isContributor) || users[0];
      
      exercises.push({
        ...template,
        name: `${template.name} ${exerciseIndex > 4 ? `V${Math.floor(exerciseIndex/5)}` : ''}`.trim(),
        description: `${template.instructions[0]?.description || 'Exercise description'} - Exercise variation ${exerciseIndex}`,
        contributor: contributor._id,
        videoLink: `https://example.com/video/${exerciseIndex}`,
        image: `https://example.com/image/${exerciseIndex}`,
        tags: ['fitness', 'exercise', template.category.toLowerCase()],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    return exercises;
  }

  generateWorkouts(count, exercises, users) {
    const workouts = [];
    
    for (let i = 0; i < count; i++) {
      const template = WORKOUT_TEMPLATES[i % WORKOUT_TEMPLATES.length];
      const workoutIndex = this.workoutCount++;
      const contributor = users.find(u => u.isAdmin || u.isContributor) || users[0];
      
      // Select random exercises for this workout
      const workoutSets = [];
      const selectedExercises = exercises.sort(() => 0.5 - Math.random()).slice(0, 3 + Math.floor(Math.random() * 3));
      
      selectedExercises.forEach((exercise) => {
        workoutSets.push({
          exercise: exercise._id,
          repetitions: 8 + Math.floor(Math.random() * 8),
          duration: Math.floor(Math.random() * 60) + 30,
          weight: Math.floor(Math.random() * 50) + 10,
          restTime: 30 + Math.floor(Math.random() * 90)
        });
      });
      
      workouts.push({
        ...template,
        name: `${template.name} ${workoutIndex > 2 ? `V${Math.floor(workoutIndex/3)}` : ''}`.trim(),
        sets: workoutSets,
        contributor: contributor._id,
        equipment: ['none', 'dumbbells'],
        instructions: {
          warmUp: ['Light cardio for 5 minutes'],
          coolDown: ['Stretch for 5 minutes'],
          general: ['Perform exercises with proper form']
        },
        caloriesBurned: Math.floor(Math.random() * 300) + 100,
        isActive: true,
        tags: ['fitness', 'workout', template.type],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    return workouts;
  }

  generatePrograms(count, workouts, users) {
    const programs = [];
    
    for (let i = 0; i < count; i++) {
      const template = PROGRAM_TEMPLATES[i % PROGRAM_TEMPLATES.length];
      const programIndex = this.programCount++;
      const creator = users[Math.floor(Math.random() * users.length)];
      
      // Select random workouts for this program
      const programWorkouts = workouts
        .sort(() => 0.5 - Math.random())
        .slice(0, 2 + Math.floor(Math.random() * 4))
        .map((workout, index) => ({
          workout: workout._id,
          week: Math.floor(index / 3) + 1,
          day: (index % 7) + 1,
          order: index + 1
        }));
      
      programs.push({
        ...template,
        name: `${template.name} ${programIndex > 1 ? `V${Math.floor(programIndex/2)}` : ''}`.trim(),
        workouts: programWorkouts,
        creator: creator._id,
        isPublic: Math.random() > 0.4,
        tags: ['program', template.category.toLowerCase()],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    return programs;
  }

  generateGoals(count, users) {
    const goals = [];
    const goalTypes = ['Weight Loss', 'Muscle Gain', 'Endurance', 'Strength', 'Flexibility'];
    const timeframes = [30, 60, 90, 120, 180]; // days
    
    for (let i = 0; i < count; i++) {
      const goalIndex = this.goalCount++;
      const user = users[Math.floor(Math.random() * users.length)];
      const goalType = goalTypes[Math.floor(Math.random() * goalTypes.length)];
      const timeframe = timeframes[Math.floor(Math.random() * timeframes.length)];
      
      goals.push({
        title: `${goalType} Goal ${goalIndex}`,
        description: `Achieve ${goalType.toLowerCase()} in ${timeframe} days`,
        type: goalType,
        targetValue: 10 + Math.floor(Math.random() * 20),
        currentValue: Math.floor(Math.random() * 5),
        unit: goalType === 'Weight Loss' ? 'kg' : goalType === 'Endurance' ? 'minutes' : 'reps',
        targetDate: new Date(Date.now() + timeframe * 24 * 60 * 60 * 1000),
        user: user._id,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    return goals;
  }

  generateProfiles(users) {
    const profiles = [];
    const fitnessLevels = ['beginner', 'intermediate', 'advanced'];
    const activityLevels = ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'];
    const genders = ['male', 'female', 'other'];
    const fitnessGoals = ['weight_loss', 'muscle_gain', 'endurance', 'strength', 'flexibility', 'general_fitness'];
    
    users.forEach((user, index) => {
      profiles.push({
        user: user._id,
        weight: 50 + Math.floor(Math.random() * 50), // kg
        height: 150 + Math.floor(Math.random() * 50), // cm
        dateOfBirth: new Date(1980 + Math.floor(Math.random() * 30), 
                             Math.floor(Math.random() * 12), 
                             Math.floor(Math.random() * 28) + 1),
        gender: genders[Math.floor(Math.random() * genders.length)],
        fitnessLevel: fitnessLevels[Math.floor(Math.random() * fitnessLevels.length)],
        activityLevel: activityLevels[Math.floor(Math.random() * activityLevels.length)],
        fitnessGoals: [fitnessGoals[Math.floor(Math.random() * fitnessGoals.length)]],
        medicalConditions: [],
        disabilities: [],
        address: {
          addressLine1: `${100 + index} Main Street`,
          postalCode: `${10000 + index}`,
          city: 'Sample City',
          country: 'Sample Country'
        },
        preferences: {
          workoutTypes: ['cardio', 'strength'],
          difficultyLevel: fitnessLevels[Math.floor(Math.random() * fitnessLevels.length)],
          availableEquipment: ['dumbbells', 'bodyweight']
        },
        emergencyContact: {
          name: `Emergency Contact ${index}`,
          phone: `555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
          relationship: 'family'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
    
    return profiles;
  }

  generateNotifications(count, users) {
    const notifications = [];
    const types = ['reminder', 'achievement', 'update', 'warning'];
    const titles = [
      'Workout Reminder',
      'Goal Achievement',
      'Profile Update',
      'System Update'
    ];
    
    for (let i = 0; i < count; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const title = titles[types.indexOf(type)];
      
      notifications.push({
        user: user._id,
        type,
        title: `${title} ${i + 1}`,
        message: `This is a ${type} notification for user ${user.username}`,
        isRead: Math.random() > 0.7,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      });
    }
    
    return notifications;
  }
}

module.exports = {
  DataGenerator,
  SEEDING_PROFILES,
  EXERCISE_TEMPLATES,
  WORKOUT_TEMPLATES,
  PROGRAM_TEMPLATES
};
