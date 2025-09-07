const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { sanitizeInput, preventNoSQLInjection, preventPrototypePollution } = require('./middleware/sanitization');
const BackupScheduler = require('./scripts/backupScheduler');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const profileRoutes = require('./routes/profiles');
const goalRoutes = require('./routes/goals');
const workoutRoutes = require('./routes/workouts'); // SRS-compliant workout routes
const exerciseRoutes = require('./routes/exercises'); // SRS-compliant exercise routes
const programRoutes = require('./routes/programs');
const twoFactorRoutes = require('./routes/twoFactor');

// Admin routes
const adminRoutes = require('./routes/admin');
const adminAuthRoutes = require('./routes/adminAuth');

const app = express();

// SRS SEC-04: HTTPS Enforcement for production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(`https://${req.header('host')}${req.url}`);
    }
    next();
  });
}

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5, // limit each IP to 5 auth attempts per windowMs
  skipSuccessfulRequests: true
});

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: process.env.MAX_FILE_SIZE ? `${process.env.MAX_FILE_SIZE}b` : '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Input sanitization middleware - SRS SEC-02: Input Sanitation (MongoDB focused)
app.use(sanitizeInput);
app.use(preventNoSQLInjection);
app.use(preventPrototypePollution);

// Routes - Using SRS specified singular paths
app.use('/auth', authLimiter, authRoutes);

// SRS API-02: POST /login endpoint
app.post('/login', authLimiter, (req, res, next) => {
  // Redirect to the auth login endpoint
  req.url = '/login';
  authRoutes(req, res, next);
});

app.use('/user', userRoutes);
app.use('/profile', profileRoutes);
app.use('/goal', goalRoutes);
app.use('/workout', workoutRoutes);
app.use('/exercises', exerciseRoutes); // SRS specifies /exercises for listing
app.use('/exercise', exerciseRoutes); // Individual exercise operations use /exercise
app.use('/program', programRoutes);
app.use('/2fa', twoFactorRoutes);

// Admin routes (with stricter rate limiting)
app.use('/admin/auth', authLimiter, adminAuthRoutes);
app.use('/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the MeFit API' });
});

app.get('/api', (req, res) => {
  res.status(200).json(
    {
      "name": "MeFit API",
      "version": "1.0.0",
      "description": "Comprehensive fitness tracking and management platform API",
      "baseUrl": "http://localhost:5000",
      "timestamp": "2025-09-07T12:30:16.081Z",
      "endpoints": {
        "authentication": {
          "description": "User authentication and authorization endpoints",
          "endpoints": [
            {
              "method": "POST",
              "path": "/auth/register",
              "description": "Register a new user account",
              "body": {
                "email": "string (required)",
                "password": "string (required, min 6 chars, must contain uppercase, lowercase, number)",
                "firstName": "string (required, 2-50 chars)",
                "lastName": "string (required, 2-50 chars)"
              },
              "response": "User object with JWT token"
            },
            {
              "method": "POST",
              "path": "/auth/login",
              "description": "Login with email and password",
              "body": {
                "email": "string (required)",
                "password": "string (required)",
                "twoFactorToken": "string (optional, required if 2FA enabled)"
              },
              "response": "User object with JWT token or 2FA requirement"
            },
            {
              "method": "GET",
              "path": "/auth/me",
              "description": "Get current authenticated user information",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "response": "Current user object with profile status"
            },
            {
              "method": "POST",
              "path": "/auth/refresh",
              "description": "Refresh JWT token",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "response": "New JWT token"
            },
            {
              "method": "POST",
              "path": "/auth/forgot-password",
              "description": "Reset password directly with email verification",
              "body": {
                "email": "string (required)",
                "newPassword": "string (required, same validation as registration)"
              },
              "response": "Success message"
            }
          ]
        },
        "users": {
          "description": "User profile and account management endpoints (SRS API-03 compliant)",
          "endpoints": [
            {
              "method": "GET",
              "path": "/user",
              "description": "Returns 303 redirect to own profile",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "response": "303 redirect to /user/:user_id"
            },
            {
              "method": "GET",
              "path": "/user/:user_id",
              "description": "Get user information by ID",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "response": "User object with profile information"
            },
            {
              "method": "PATCH",
              "path": "/user/:user_id",
              "description": "Update user information",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "body": {
                "firstName": "string (optional)",
                "lastName": "string (optional)",
                "email": "string (optional)",
                "profilePicture": "string (optional)"
              },
              "response": "Updated user object"
            },
            {
              "method": "POST",
              "path": "/user/:user_id/update_password",
              "description": "Update user password",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "body": {
                "currentPassword": "string (required)",
                "newPassword": "string (required)"
              },
              "response": "Success message"
            },
            {
              "method": "POST",
              "path": "/user/:user_id/request-contributor",
              "description": "Request contributor privileges",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "response": "Success message"
            },
            {
              "method": "DELETE",
              "path": "/user/:user_id",
              "description": "Delete user account",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "response": "Success message"
            }
          ]
        },
        "profiles": {
          "description": "User fitness profiles and physical information (SRS API-04 compliant)",
          "endpoints": [
            {
              "method": "POST",
              "path": "/profile",
              "description": "Create user fitness profile",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "body": {
                "height": "number (required, cm)",
                "weight": "number (required, kg)",
                "age": "number (required)",
                "gender": "string (required: male, female, other)",
                "activityLevel": "string (required: sedentary, light, moderate, active, very_active)",
                "fitnessGoals": "array of strings (optional)",
                "medicalConditions": "array of strings (optional)",
                "preferences": "object (optional)"
              },
              "response": "Created profile object"
            },
            {
              "method": "GET",
              "path": "/profile/:profile_id",
              "description": "Get profile by ID",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "response": "Profile object"
            },
            {
              "method": "PATCH",
              "path": "/profile/:profile_id",
              "description": "Update profile information",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "body": "Partial profile object with fields to update",
              "response": "Updated profile object"
            },
            {
              "method": "DELETE",
              "path": "/profile/:profile_id",
              "description": "Delete profile",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "response": "Success message"
            },
            {
              "method": "GET",
              "path": "/profile/user/:user_id",
              "description": "Get profile by user ID",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "response": "Profile object"
            },
            {
              "method": "GET",
              "path": "/profile/me/evaluation",
              "description": "Get fitness evaluation based on current profile",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "response": "Fitness evaluation object"
            }
          ]
        },
        "goals": {
          "description": "Fitness goal management and tracking (SRS API-05 compliant)",
          "endpoints": [
            {
              "method": "GET",
              "path": "/goal",
              "description": "Get user goals with optional filters",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "query": {
                "status": "string (optional: active, completed, paused)",
                "type": "string (optional: weight_loss, muscle_gain, endurance, etc.)",
                "page": "number (optional)",
                "limit": "number (optional)"
              },
              "response": "Array of goal objects"
            },
            {
              "method": "GET",
              "path": "/goal/current",
              "description": "Get current active goal",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "response": "Current goal object or null"
            },
            {
              "method": "GET",
              "path": "/goal/:goal_id",
              "description": "Get specific goal by ID",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "response": "Goal object with progress tracking"
            },
            {
              "method": "POST",
              "path": "/goal",
              "description": "Create new fitness goal",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "body": {
                "title": "string (required)",
                "description": "string (optional)",
                "type": "string (required)",
                "targetValue": "number (required)",
                "currentValue": "number (optional, default 0)",
                "unit": "string (required)",
                "deadline": "date (optional)",
                "difficulty": "string (optional: easy, medium, hard)"
              },
              "response": "Created goal object"
            },
            {
              "method": "PATCH",
              "path": "/goal/:goal_id",
              "description": "Update goal information",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "body": "Partial goal object with fields to update",
              "response": "Updated goal object"
            },
            {
              "method": "DELETE",
              "path": "/goal/:goal_id",
              "description": "Delete goal",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "response": "Success message"
            },
            {
              "method": "POST",
              "path": "/goal/:goal_id/complete-workout",
              "description": "Mark workout completion towards goal",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "body": {
                "workoutId": "string (required)",
                "progressValue": "number (required)",
                "notes": "string (optional)"
              },
              "response": "Updated goal progress"
            },
            {
              "method": "GET",
              "path": "/goal/dashboard/stats",
              "description": "Get dashboard statistics for goals",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "response": "Goal statistics object"
            }
          ]
        },
        "workouts": {
          "description": "Workout management and execution (SRS API-06 compliant)",
          "endpoints": [
            {
              "method": "GET",
              "path": "/workout",
              "description": "Get workouts with optional filters",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "query": {
                "type": "string (optional)",
                "difficulty": "string (optional)",
                "duration": "number (optional)",
                "muscleGroup": "string (optional)",
                "equipment": "string (optional)",
                "page": "number (optional)",
                "limit": "number (optional)"
              },
              "response": "Array of workout objects"
            },
            {
              "method": "GET",
              "path": "/workout/:workout_id",
              "description": "Get specific workout by ID",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "response": "Detailed workout object with exercises"
            },
            {
              "method": "POST",
              "path": "/workout",
              "description": "Create new workout",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "body": {
                "name": "string (required)",
                "description": "string (optional)",
                "type": "string (required)",
                "difficulty": "string (required: beginner, intermediate, advanced)",
                "estimatedDuration": "number (required, minutes)",
                "exercises": "array of exercise objects (required)",
                "equipment": "array of strings (optional)",
                "tags": "array of strings (optional)"
              },
              "response": "Created workout object"
            },
            {
              "method": "PATCH",
              "path": "/workout/:workout_id",
              "description": "Update workout information",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "body": "Partial workout object with fields to update",
              "response": "Updated workout object"
            },
            {
              "method": "DELETE",
              "path": "/workout/:workout_id",
              "description": "Delete workout",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "response": "Success message"
            },
            {
              "method": "GET",
              "path": "/workout/my/created",
              "description": "Get workouts created by current user",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "response": "Array of user-created workout objects"
            },
            {
              "method": "GET",
              "path": "/workout/suggestions/:user_id",
              "description": "Get personalized workout suggestions",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "response": "Array of suggested workout objects"
            },
            {
              "method": "GET",
              "path": "/workout/types/list",
              "description": "Get available workout types",
              "response": "Array of workout type strings"
            }
          ]
        },
        "exercises": {
          "description": "Exercise database and management (SRS API-07 compliant)",
          "endpoints": [
            {
              "method": "GET",
              "path": "/exercises",
              "description": "Get exercises with optional filters",
              "query": {
                "muscleGroup": "string (optional)",
                "equipment": "string (optional)",
                "difficulty": "string (optional)",
                "type": "string (optional)",
                "search": "string (optional)",
                "page": "number (optional)",
                "limit": "number (optional)"
              },
              "response": "Array of exercise objects"
            },
            {
              "method": "GET",
              "path": "/exercises/:exercise_id",
              "description": "Get specific exercise by ID",
              "response": "Detailed exercise object with instructions"
            },
            {
              "method": "POST",
              "path": "/exercise",
              "description": "Create new exercise (contributor/admin only)",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "body": {
                "name": "string (required)",
                "description": "string (required)",
                "muscleGroups": "array of strings (required)",
                "equipment": "array of strings (optional)",
                "difficulty": "string (required: beginner, intermediate, advanced)",
                "instructions": "array of strings (required)",
                "tips": "array of strings (optional)",
                "warnings": "array of strings (optional)",
                "images": "array of strings (optional)",
                "videoUrl": "string (optional)"
              },
              "response": "Created exercise object"
            },
            {
              "method": "PATCH",
              "path": "/exercise/:exercise_id",
              "description": "Update exercise information",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "body": "Partial exercise object with fields to update",
              "response": "Updated exercise object"
            },
            {
              "method": "DELETE",
              "path": "/exercise/:exercise_id",
              "description": "Delete exercise",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "response": "Success message"
            },
            {
              "method": "GET",
              "path": "/exercise/my/created",
              "description": "Get exercises created by current user",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "response": "Array of user-created exercise objects"
            },
            {
              "method": "GET",
              "path": "/exercise/muscle-groups/list",
              "description": "Get available muscle groups",
              "response": "Array of muscle group strings"
            },
            {
              "method": "GET",
              "path": "/exercise/equipment/list",
              "description": "Get available equipment types",
              "response": "Array of equipment strings"
            }
          ]
        },
        "programs": {
          "description": "Workout program management and scheduling",
          "endpoints": [
            {
              "method": "GET",
              "path": "/program",
              "description": "Get workout programs with optional filters",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "query": {
                "category": "string (optional)",
                "difficulty": "string (optional)",
                "duration": "number (optional)",
                "goal": "string (optional)",
                "page": "number (optional)",
                "limit": "number (optional)"
              },
              "response": "Array of program objects"
            },
            {
              "method": "GET",
              "path": "/program/:program_id",
              "description": "Get specific program by ID",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "response": "Detailed program object with workouts"
            },
            {
              "method": "POST",
              "path": "/program",
              "description": "Create new workout program",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "body": {
                "name": "string (required)",
                "description": "string (required)",
                "category": "string (required)",
                "difficulty": "string (required)",
                "duration": "number (required, weeks)",
                "workouts": "array of workout objects (required)",
                "schedule": "object (optional)",
                "goals": "array of strings (optional)"
              },
              "response": "Created program object"
            },
            {
              "method": "PATCH",
              "path": "/program/:program_id",
              "description": "Update program information",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "body": "Partial program object with fields to update",
              "response": "Updated program object"
            },
            {
              "method": "DELETE",
              "path": "/program/:program_id",
              "description": "Delete program",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "response": "Success message"
            },
            {
              "method": "GET",
              "path": "/program/my/created",
              "description": "Get programs created by current user",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "response": "Array of user-created program objects"
            },
            {
              "method": "GET",
              "path": "/program/suggestions/:user_id",
              "description": "Get personalized program suggestions",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "response": "Array of suggested program objects"
            },
            {
              "method": "POST",
              "path": "/program/:program_id/rate",
              "description": "Rate a program",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "body": {
                "rating": "number (required, 1-5)"
              },
              "response": "Updated program rating"
            },
            {
              "method": "GET",
              "path": "/program/categories/list",
              "description": "Get available program categories",
              "response": "Array of category strings"
            }
          ]
        },
        "twoFactor": {
          "description": "Two-factor authentication management (SRS SEC-01 compliant)",
          "endpoints": [
            {
              "method": "POST",
              "path": "/2fa/setup",
              "description": "Setup 2FA for user account",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "response": "QR code and secret for authenticator app"
            },
            {
              "method": "POST",
              "path": "/2fa/verify",
              "description": "Verify and enable 2FA",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "body": {
                "token": "string (required, 6-digit code)"
              },
              "response": "Success message"
            },
            {
              "method": "POST",
              "path": "/2fa/disable",
              "description": "Disable 2FA for user account",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "body": {
                "token": "string (required, 6-digit code)",
                "password": "string (required)"
              },
              "response": "Success message"
            },
            {
              "method": "GET",
              "path": "/2fa/status",
              "description": "Get 2FA status for current user",
              "headers": {
                "Authorization": "Bearer \u003Ctoken\u003E"
              },
              "response": "2FA status object"
            }
          ]
        },
        "admin": {
          "description": "Administrative functions and management",
          "endpoints": [
            {
              "method": "POST",
              "path": "/admin/auth/login",
              "description": "Admin login with elevated privileges",
              "body": {
                "email": "string (required)",
                "password": "string (required)"
              },
              "response": "Admin user object with JWT token"
            },
            {
              "method": "GET",
              "path": "/admin/auth/me",
              "description": "Get current admin user information",
              "headers": {
                "Authorization": "Bearer \u003CadminToken\u003E"
              },
              "response": "Admin user object"
            },
            {
              "method": "GET",
              "path": "/admin/dashboard/stats",
              "description": "Get admin dashboard statistics",
              "headers": {
                "Authorization": "Bearer \u003CadminToken\u003E"
              },
              "response": "Dashboard statistics object"
            },
            {
              "method": "GET",
              "path": "/admin/users",
              "description": "Get all users with admin privileges",
              "headers": {
                "Authorization": "Bearer \u003CadminToken\u003E"
              },
              "query": {
                "page": "number (optional)",
                "limit": "number (optional)",
                "search": "string (optional)",
                "status": "string (optional)"
              },
              "response": "Array of user objects with admin details"
            },
            {
              "method": "GET",
              "path": "/admin/contributor-requests",
              "description": "Get pending contributor requests",
              "headers": {
                "Authorization": "Bearer \u003CadminToken\u003E"
              },
              "response": "Array of contributor request objects"
            },
            {
              "method": "PATCH",
              "path": "/admin/contributor-requests/:user_id/:action",
              "description": "Process contributor request (approve/deny)",
              "headers": {
                "Authorization": "Bearer \u003CadminToken\u003E"
              },
              "params": {
                "action": "approve or deny"
              },
              "response": "Success message"
            },
            {
              "method": "GET",
              "path": "/admin/analytics",
              "description": "Get platform analytics",
              "headers": {
                "Authorization": "Bearer \u003CadminToken\u003E"
              },
              "query": {
                "period": "number (optional, days)"
              },
              "response": "Analytics data object"
            },
            {
              "method": "GET",
              "path": "/admin/content/stats",
              "description": "Get content management statistics",
              "headers": {
                "Authorization": "Bearer \u003CadminToken\u003E"
              },
              "response": "Content statistics object"
            }
          ]
        }
      },
      "authentication": {
        "description": "Authentication is required for most endpoints using JWT tokens",
        "tokenHeader": "Authorization: Bearer \u003Ctoken\u003E",
        "tokenExpiry": "7 days (configurable)",
        "refreshing": "Use /auth/refresh endpoint with valid token"
      },
      "errorResponses": {
        "400": "Bad Request - Invalid input data",
        "401": "Unauthorized - Invalid or missing token",
        "403": "Forbidden - Insufficient permissions",
        "404": "Not Found - Resource not found",
        "422": "Unprocessable Entity - Validation errors",
        "429": "Too Many Requests - Rate limit exceeded",
        "500": "Internal Server Error - Server error"
      },
      "rateLimiting": {
        "general": "100 requests per 15 minutes per IP",
        "authentication": "5 requests per 15 minutes per IP",
        "admin": "Stricter limits apply for admin endpoints"
      },
      "security": {
        "cors": "Configured for specified frontend origins",
        "helmet": "Security headers enabled",
        "inputSanitization": "NoSQL injection prevention",
        "prototypePollution": "Prototype pollution prevention",
        "https": "Enforced in production",
        "twoFactor": "Optional 2FA with authenticator apps"
      }
    }
  );
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (process.env.NODE_ENV === 'development') {
    res.status(500).json({ message: err.message, stack: err.stack });
  } else {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mefit')
  .then(() => {
    console.log('Connected to MongoDB');

    // SRS DB-02: Start automated backup scheduler
    if (process.env.NODE_ENV === 'production') {
      const backupScheduler = new BackupScheduler();
      backupScheduler.start();
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app;
