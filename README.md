# MeFit - Weekly Workout Goals Management System

MeFit is a comprehensive fitness application that helps users set and manage weekly workout goals. The application serves both regular users who want to track their exercise routines and contributors who can add exercises, workouts, and programs to the platform.

## Project Overview

MeFit allows users to:
- Set and track weekly workout goals
- Browse and follow fitness programs
- Access a comprehensive exercise library
- Monitor progress with detailed analytics
- Create custom workouts (contributors)
- Manage user profiles with fitness evaluations

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express-validator
- **Development**: Nodemon

### Frontend
- **Framework**: React 18
- **UI Library**: Material-UI (MUI)
- **Routing**: React Router DOM
- **State Management**: React Query for server state
- **HTTP Client**: Axios
- **Notifications**: React Toastify
- **Forms**: React Hook Form

## Features

### User Roles
1. **Regular User**: Set and manage exercise goals
2. **Administrator**: Manage users and assign contributor status
3. **Contributor**: Add/edit exercises, programs, and workouts

### Core Functionality
- User authentication and authorization
- Profile creation with fitness evaluation
- Weekly goal setting and tracking
- Exercise, workout, and program management
- Progress monitoring with visual analytics
- Responsive design for all devices

## Installation Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn package manager

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd MeFit
```

### Step 2: Install Dependencies
```bash
# Install root dependencies
npm install

# Install all project dependencies (backend and frontend)
npm run install:all
```

### Step 3: Environment Setup

#### Backend Environment
1. Navigate to the backend directory:
```bash
cd backend
```

2. Copy the example environment file:
```bash
copy .env.example .env
```

3. Edit the `.env` file with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mefit
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

### Step 4: Database Setup
1. Ensure MongoDB is running on your system
2. The application will automatically create the database and collections on first run
3. You can optionally seed the database with sample data (see seeding section below)

### Step 5: Start the Application

#### Development Mode (Recommended)
From the root directory:
```bash
npm run dev
```

This will start both the backend server (port 5000) and frontend development server (port 3000) concurrently.

#### Production Mode
```bash
# Build the frontend
npm run build

# Start the backend server
npm start
```

### Step 6: Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

## Database Schema

The application uses MongoDB with the following main collections:

- **Users**: User accounts and authentication
- **Profiles**: User profiles with fitness information
- **Exercises**: Individual exercise definitions
- **Workouts**: Collections of exercises with sets/reps
- **Programs**: Structured workout programs
- **Goals**: User goals with tracking information

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token

### User Management
- `GET /api/users` - Get current user (redirects)
- `GET /api/users/:userId` - Get user by ID
- `PATCH /api/users/:userId` - Update user
- `DELETE /api/users/:userId` - Delete user
- `POST /api/users/:userId/update-password` - Update password

### Profiles
- `POST /api/profiles` - Create profile
- `GET /api/profiles/:profileId` - Get profile
- `PATCH /api/profiles/:profileId` - Update profile
- `DELETE /api/profiles/:profileId` - Delete profile

### Goals
- `GET /api/goals` - Get user goals
- `POST /api/goals` - Create goal
- `GET /api/goals/:goalId` - Get goal details
- `PATCH /api/goals/:goalId` - Update goal
- `DELETE /api/goals/:goalId` - Delete goal
- `POST /api/goals/:goalId/complete-workout` - Mark workout complete

### Programs
- `GET /api/programs` - Get programs
- `POST /api/programs` - Create program (contributor)
- `GET /api/programs/:programId` - Get program details
- `PATCH /api/programs/:programId` - Update program (contributor)
- `DELETE /api/programs/:programId` - Delete program (contributor)

### Workouts
- `GET /api/workouts` - Get workouts
- `POST /api/workouts` - Create workout (contributor)
- `GET /api/workouts/:workoutId` - Get workout details
- `PATCH /api/workouts/:workoutId` - Update workout (contributor)
- `DELETE /api/workouts/:workoutId` - Delete workout (contributor)

### Exercises
- `GET /api/exercises` - Get exercises
- `POST /api/exercises` - Create exercise (contributor)
- `GET /api/exercises/:exerciseId` - Get exercise details
- `PATCH /api/exercises/:exerciseId` - Update exercise (contributor)
- `DELETE /api/exercises/:exerciseId` - Delete exercise (contributor)

## Development Scripts

### Root Level
- `npm run dev` - Start both backend and frontend in development mode
- `npm run install:all` - Install dependencies for all packages
- `npm run build` - Build frontend for production
- `npm start` - Start backend in production mode

### Backend
- `npm start` - Start backend server
- `npm run dev` - Start backend with nodemon
- `npm test` - Run backend tests

### Frontend
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run frontend tests

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on authentication endpoints
- Input validation and sanitization
- CORS protection
- Helmet security headers
- Environment variable configuration

## Testing

### Running Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## Deployment

### Production Deployment Checklist
1. Set `NODE_ENV=production` in environment variables
2. Use a strong, unique `JWT_SECRET`
3. Configure MongoDB connection string
4. Enable HTTPS
5. Set up proper logging
6. Configure backup strategies
7. Set up monitoring and alerting

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-db-connection-string
JWT_SECRET=your-very-secure-production-jwt-secret
FRONTEND_URL=https://your-production-domain.com
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## Support

For technical support or questions about the project, please contact the development team through the SITER Academy Learning Management System (Moodle).

## License

This project is developed as part of the SITER Academy Accelerate Fullstack course curriculum. All rights reserved to SITER Academy and the development team.

---

**Last Updated**: July 2025  
**Version**: 1.0.0
