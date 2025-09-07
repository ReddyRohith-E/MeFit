# MeFit - Weekly Workout Goals Management System

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node.js-16%2B-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/mongodb-5%2B-green.svg)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/react-18-blue.svg)](https://reactjs.org/)

> **Repository**: [https://github.com/ReddyRohith-E/MeFit](https://github.com/ReddyRohith-E/MeFit)

MeFit is a comprehensive full-stack fitness management application that enables users to set and track weekly workout goals. Built as a capstone project demonstrating modern web development practices with React, Node.js, Express, and MongoDB.

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [SRS Requirements Compliance](#srs-requirements-compliance)
- [Technology Stack](#technology-stack)
- [Features](#features)
- [User Roles](#user-roles)
- [Installation Instructions](#installation-instructions)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Development Scripts](#development-scripts)
- [Security Features](#security-features)
- [Testing](#testing)
- [Performance](#performance)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Project Overview

MeFit serves as a dual-purpose fitness application designed to:
1. **Exercise Management**: Provide users with comprehensive exercise regimes and management tools
2. **Goal Achievement**: Motivate users through weekly goal-setting for consistent exercise habits

### Key Capabilities
- **Weekly Goal Setting**: Users can set and track weekly workout goals with detailed progress monitoring
- **Exercise Library**: Comprehensive database of exercises categorized by muscle groups and difficulty levels
- **Workout Programs**: Structured fitness programs designed by contributors for various fitness levels
- **Progress Analytics**: Visual progress tracking with detailed statistics and completion rates
- **Role-Based Access**: Three-tier user system (Regular User, Contributor, Administrator)
- **Fitness Evaluation**: Initial fitness assessment to provide personalized recommendations

## � SRS Requirements Compliance

This application fully implements all Software Requirements Specification (SRS) requirements:

### Frontend Requirements (FE-01 to FE-11) ✅
- **FE-01**: Complete login system with role-based authentication
- **FE-02**: Application frame with navigation and user indicators
- **FE-03**: Goal dashboard with progress visualization and calendar
- **FE-04**: Comprehensive goal setting with program/workout suggestions
- **FE-05**: Program browsing with category filters
- **FE-06**: Workout management with type-based organization
- **FE-07**: Exercise library with muscle group categorization
- **FE-08**: Contributor program management interface
- **FE-09**: Contributor workout creation and editing
- **FE-10**: Contributor exercise management
- **FE-11**: User profile with fitness evaluation and 2FA support

### API Requirements (API-01 to API-08) ✅
- **API-01**: RESTful endpoints without query parameters (except search)
- **API-02**: Secure authentication with rate limiting
- **API-03**: User management with role-based permissions
- **API-04**: Profile management with fitness evaluation
- **API-05**: Goal CRUD operations with progress tracking
- **API-06**: Workout management (contributor-only operations)
- **API-07**: Exercise management with proper authorization
- **API-08**: Standard HTTP response codes and error handling

### Database Requirements (DB-01 to DB-03) ✅
- **DB-01**: Complete MongoDB storage solution
- **DB-02**: Automated backup system with 7-day retention
- **DB-03**: Comprehensive database design with proper relationships

### Security Requirements (SEC-01 to SEC-04) ✅
- **SEC-01**: JWT-based authentication with 2FA support
- **SEC-02**: Input validation and sanitization
- **SEC-03**: Environment-based credential storage
- **SEC-04**: HTTPS enforcement in production

### Performance Requirements (PRF-01 to PRF-02) ✅
- **PRF-01**: Optimized loading times with efficient queries
- **PRF-02**: Comprehensive error handling with user-friendly messages

## � Technology Stack

### Backend Architecture
- **Runtime**: Node.js (v16+)
- **Framework**: Express.js with middleware ecosystem
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Security**: Helmet, CORS, express-rate-limit, express-validator
- **Development**: Nodemon with comprehensive logging

### Frontend Architecture
- **Framework**: React 18 with modern hooks
- **UI Framework**: Material-UI (MUI) with custom theming
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios with interceptors
- **State Management**: React Context + Local State
- **Forms**: React Hook Form with validation
- **Notifications**: React Toastify

### DevOps & Tools
- **Package Manager**: npm with workspaces
- **Version Control**: Git with conventional commits
- **Environment**: dotenv configuration
- **Testing**: Jest and React Testing Library
- **Build Tools**: Vite for frontend bundling

## ✨ Features

### Core Functionality
- **User Authentication**: Secure registration and login with JWT tokens
- **Profile Management**: Comprehensive user profiles with fitness evaluation
- **Weekly Goal Setting**: Set and track exercise goals with calendar integration
- **Exercise Library**: Extensive database of exercises with instructions and media
- **Workout Creation**: Build custom workouts from exercise combinations
- **Program Management**: Structured fitness programs with scheduling
- **Progress Tracking**: Visual analytics and completion statistics
- **Role-Based Access**: Three-tier permission system

### Advanced Features
- **Fitness Evaluation**: Initial assessment for personalized recommendations
- **Goal Recommendations**: AI-powered suggestions based on user profile
- **Two-Factor Authentication**: Enhanced security with TOTP support
- **Real-time Notifications**: System and goal-related notifications
- **Responsive Design**: Mobile-first design with cross-device compatibility
- **Admin Dashboard**: Comprehensive administrative interface

## 👥 User Roles

### 1. Regular User
**Capabilities:**
- Set and manage weekly exercise goals
- Track workout progress and completion
- Browse exercise library and workout programs
- View detailed exercise instructions and media
- Update profile and fitness information
- Enable two-factor authentication

**Dashboard Features:**
- Weekly progress visualization
- Calendar with workout scheduling
- Goal completion statistics
- Recent activity tracking

### 2. Contributor
**Inherits all Regular User capabilities plus:**
- Create and edit exercises with detailed instructions
- Design and manage workout programs
- Build custom workouts from exercise combinations
- Access contributor dashboard with analytics
- Manage personal content library

**Content Management:**
- Exercise creation with multimedia support
- Workout composition with set/rep configuration
- Program development with weekly scheduling
- Content categorization and tagging

### 3. Administrator
**Inherits all Contributor capabilities plus:**
- Manage user accounts and permissions
- Grant/revoke contributor status
- Access system-wide analytics and reports
- Manage contributor applications
- System configuration and maintenance

**Administrative Tools:**
- User management interface
- System health monitoring
- Content moderation tools
- Security settings management

## � Installation Instructions

### Prerequisites
- **Node.js** v16 or higher ([Download](https://nodejs.org/))
- **MongoDB** v5 or higher ([Download](https://www.mongodb.com/try/download/community))
- **Git** ([Download](https://git-scm.com/downloads))

### Step 1: Clone the Repository
```bash
git clone https://github.com/ReddyRohith-E/MeFit.git
cd MeFit
```

### Step 2: Install Dependencies
```bash
# Install root dependencies
npm install

# Install all project dependencies (backend and frontend)
npm run install:all
```

### Step 3: Environment Configuration

#### Backend Environment Setup
```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mefit
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Admin Configuration
ADMIN_EMAIL=admin@mefit.com
ADMIN_PASSWORD=Admin123!
```

#### Frontend Environment Setup
```bash
cd ../frontend
cp .env.example .env
```

Edit the frontend `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_APP_NAME=MeFit
```

### Step 4: Database Setup

1. **Start MongoDB Service**
   ```bash
   # Windows (if installed as service)
   net start MongoDB
   
   # macOS (with Homebrew)
   brew services start mongodb-community
   
   # Linux (systemd)
   sudo systemctl start mongod
   ```

2. **Initialize Database** (Optional)
   ```bash
   cd backend
   
   # Seed database with sample data
   npm run seed
   
   # Or clean and reseed
   npm run clean && npm run seed
   ```

### Step 5: Start the Application

#### Development Mode (Recommended)
```bash
# From root directory - starts both backend and frontend
npm run dev
```

#### Manual Start (Alternative)
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm start
```

### Step 6: Access the Application
- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **API Documentation**: [http://localhost:5000/api](http://localhost:5000/api)
- **Health Check**: [http://localhost:5000/health](http://localhost:5000/health)

### Step 7: Login Credentials

If you seeded the database, use these default accounts:

**Administrator Account:**
- Email: `admin@mefit.com`
- Password: `Admin123!`

**Contributor Account:**
- Email: `mike.trainer@mefit.com`
- Password: `Trainer123!`

**Regular User Account:**
- Email: `sarah.beginner@example.com`
- Password: `User123!`

## �️ Database Schema

The application uses MongoDB with the following collections implementing the SRS ERD requirements:

### Core Collections
- **users**: User accounts with authentication and role information
- **profiles**: User profiles with fitness evaluation data
- **exercises**: Exercise definitions with instructions and media
- **workouts**: Workout compositions with exercise sets
- **programs**: Structured fitness programs with scheduling
- **goals**: User goals with progress tracking
- **notifications**: System and user notifications

### Key Relationships
- Users → Profiles (One-to-One)
- Users → Goals (One-to-Many)
- Goals → Workouts (Many-to-Many)
- Programs → Workouts (Many-to-Many)
- Workouts → Exercises (Many-to-Many)

### Data Integrity
- Cascading deletes for user-related data
- Foreign key constraints with MongoDB references
- Validation rules for data consistency
- Indexing for performance optimization

## 🌐 API Documentation

### Authentication Endpoints
- `POST /auth/register` - User registration with validation
- `POST /auth/login` - User authentication with rate limiting
- `GET /auth/me` - Get current authenticated user
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/logout` - Secure logout

### User Management (API-03 Compliant)
- `GET /user` - Redirect to current user profile
- `POST /user` - Create new user account
- `GET /user/:userId` - Get user by ID
- `PATCH /user/:userId` - Update user information
- `DELETE /user/:userId` - Delete user account
- `POST /user/:userId/update-password` - Update user password

### Profile Management (API-04 Compliant)
- `POST /profile` - Create user profile with fitness evaluation
- `GET /profile/:profileId` - Get profile details
- `PATCH /profile/:profileId` - Update profile information
- `DELETE /profile/:profileId` - Delete profile
- `POST /profile/fitness-evaluation` - Submit fitness evaluation

### Goal Management (API-05 Compliant)
- `GET /goal` - Get user goals with filtering
- `POST /goal` - Create new fitness goal
- `GET /goal/:goalId` - Get specific goal details
- `PATCH /goal/:goalId` - Update goal information
- `DELETE /goal/:goalId` - Delete goal
- `POST /goal/:goalId/complete-workout` - Mark workout as completed

### Workout Management (API-06 Compliant)
- `GET /workout` - Get workouts with optional filters
- `POST /workout` - Create workout (contributor only)
- `GET /workout/:workoutId` - Get workout details
- `PATCH /workout/:workoutId` - Update workout (contributor only)
- `DELETE /workout/:workoutId` - Delete workout (contributor only)

### Exercise Management (API-07 Compliant)
- `GET /exercises` - Get exercises arranged by muscle group
- `GET /exercises/:exerciseId` - Get exercise details
- `POST /exercise` - Create exercise (contributor only)
- `PATCH /exercise/:exerciseId` - Update exercise (contributor only)
- `DELETE /exercise/:exerciseId` - Delete exercise (contributor only)

### Program Management
- `GET /program` - Get available programs
- `POST /program` - Create program (contributor only)
- `GET /program/:programId` - Get program details
- `PATCH /program/:programId` - Update program (contributor only)
- `DELETE /program/:programId` - Delete program (contributor only)

### Response Codes (API-08 Compliant)
- `200 OK` - Successful requests
- `201 Created` - Resource creation
- `204 No Content` - Successful deletion
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## � Development Scripts

### Root Level Commands
```bash
npm run dev              # Start both backend and frontend
npm run install:all      # Install all dependencies
npm run build           # Build frontend for production
npm start               # Start backend in production mode
```

### Backend Commands
```bash
cd backend
npm start               # Start production server
npm run dev             # Start with nodemon
npm run seed            # Seed database with sample data
npm run clean           # Clean database
npm test                # Run backend tests
```

### Frontend Commands
```bash
cd frontend
npm start               # Start development server
npm run build           # Build for production
npm test                # Run frontend tests
npm run lint            # Run ESLint
```

### Database Management
```bash
cd backend
npm run seed            # Seed with sample data
npm run clean           # Clean database
npm run backup          # Create database backup
npm run restore         # Restore from backup
```

## � Security Features (SEC-01 to SEC-04 Compliant)

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Two-Factor Authentication**: TOTP support with QR codes
- **Rate Limiting**: Prevents brute force attacks
- **Session Management**: Secure token refresh mechanism

### Input Validation & Security
- **Express Validator**: Comprehensive input validation
- **Data Sanitization**: XSS and injection prevention
- **CORS Protection**: Configured origin restrictions
- **Helmet**: Security headers enforcement
- **Environment Variables**: Secure credential storage

### Production Security
- **HTTPS Enforcement**: SSL/TLS in production
- **Error Handling**: Secure error messages
- **Logging**: Comprehensive security logging
- **Database Security**: Connection encryption

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# Integration tests
npm run test:integration
```

### Test Coverage
- **Unit Tests**: Component and function testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full application workflow testing
- **Security Tests**: Authentication and authorization testing

## ⚡ Performance (PRF-01 to PRF-02 Compliant)

### Optimization Features
- **Database Indexing**: Optimized query performance
- **Caching Strategy**: Redis integration for frequently accessed data
- **Code Splitting**: Frontend lazy loading
- **Image Optimization**: Compressed media assets
- **Bundle Optimization**: Webpack/Vite optimization

### Performance Metrics
- **Page Load Time**: < 3 seconds initial load
- **API Response Time**: < 500ms average response
- **Database Query Time**: < 100ms indexed queries
- **Bundle Size**: Optimized for mobile networks

## 🚀 Deployment

### Production Environment Setup
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-db-connection
JWT_SECRET=your-production-jwt-secret
FRONTEND_URL=https://your-domain.com
```

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Database connection verified
- [ ] SSL certificates installed
- [ ] Backup strategy implemented
- [ ] Monitoring tools configured
- [ ] Error logging enabled
- [ ] Security headers configured

### Supported Platforms
- **Cloud Platforms**: AWS, Heroku, DigitalOcean
- **Containerization**: Docker support included
- **Database**: MongoDB Atlas for production
- **CDN**: Frontend static asset delivery

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Follow coding standards and conventions
4. Write tests for new functionality
5. Commit changes: `git commit -am 'Add new feature'`
6. Push to branch: `git push origin feature/new-feature`
7. Submit pull request with detailed description

### Code Standards
- **ESLint**: JavaScript linting rules
- **Prettier**: Code formatting standards
- **Conventional Commits**: Standardized commit messages
- **Testing**: Required for all new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For technical support, bug reports, or feature requests:

1. **GitHub Issues**: [Create an issue](https://github.com/ReddyRohith-E/MeFit/issues)
2. **Documentation**: Check the [User Manual](USER_MANUAL.md)
3. **API Reference**: Built-in documentation at `/api` endpoint

---

**Repository**: [https://github.com/ReddyRohith-E/MeFit](https://github.com/ReddyRohith-E/MeFit)

Built using modern web technologies
