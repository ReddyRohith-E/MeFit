# MeFit User Manual

> **Repository**: [https://github.com/ReddyRohith-E/MeFit](https://github.com/ReddyRohith-E/MeFit)

This comprehensive user manual provides step-by-step instructions for using the MeFit Weekly Workout Goals Management System. The manual covers all user roles and features implemented according to the Software Requirements Specification (SRS).

## 📋 Table of Contents
- [Getting Started](#getting-started)
- [User Roles Overview](#user-roles-overview)
- [Login and Registration](#login-and-registration)
- [Application Navigation](#application-navigation)
- [Regular User Functions](#regular-user-functions)
- [Contributor Functions](#contributor-functions)
- [Administrator Functions](#administrator-functions)
- [Profile Management](#profile-management)
- [Security Features](#security-features)
- [Troubleshooting](#troubleshooting)

## 🚀 Getting Started

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- JavaScript enabled

### Accessing MeFit
1. Open your web browser
2. Navigate to the MeFit application URL
3. You will be redirected to the login screen if not authenticated

## 👥 User Roles Overview

MeFit implements three distinct user roles as specified in SRS FE-01:

### Regular User
- Set and manage weekly exercise goals
- Track workout progress
- Browse exercise library and programs
- Update profile information

### Contributor
- All Regular User capabilities
- Create and edit exercises
- Design workout programs
- Manage personal content

### Administrator
- All Contributor capabilities
- Manage user accounts
- Grant/revoke contributor status
- Access system administration tools

## � Login and Registration

### New User Registration (SRS FE-01)

1. **Access Registration Form**
   - Click "Sign Up" or "Register" on the login screen
   - The registration form will appear

2. **Complete Registration Form**
   - **First Name**: Enter your first name
   - **Last Name**: Enter your last name
   - **Email**: Provide a valid email address
   - **Password**: Create a strong password (minimum 8 characters)
   - **Confirm Password**: Re-enter your password

3. **Submit Registration**
   - Click "Register" button
   - Check for validation errors and correct if needed
   - Upon success, you'll be redirected to profile creation

### User Login

1. **Access Login Form**
   - Enter your registered email address
   - Enter your password

2. **Two-Factor Authentication (if enabled)**
   - Enter the 6-digit code from your authenticator app
   - Click "Verify"

3. **Successful Login**
   - You'll be redirected to the main dashboard
   - Navigation menu becomes available

### Password Reset
1. Click "Forgot Password" on login screen
2. Enter your email address
3. Check your email for reset instructions
4. Follow the link to set a new password

## 🧭 Application Navigation (SRS FE-02)

### Application Frame Components

#### Top Navigation Bar
- **User Indicator**: Shows currently logged-in user name and avatar
- **Logout Button**: Securely logout from the application
- **Notifications**: System and goal-related notifications

#### Main Navigation Menu
- **Dashboard**: Main overview and goal tracking
- **Goals**: Set and manage weekly goals
- **Programs**: Browse available fitness programs
- **Workouts**: View workout library
- **Exercises**: Browse exercise database
- **Profile**: Manage personal information
- **Contributor Area**: (Contributors only) Content management

#### Mobile Navigation
- Hamburger menu for mobile devices
- Collapsible navigation drawer
- Touch-friendly interface elements

## 👤 Regular User Functions

### Goal Dashboard (SRS FE-03)

#### Accessing the Dashboard
1. Login to your account
2. Click "Dashboard" in the navigation menu
3. The main dashboard displays your weekly progress

#### Dashboard Components

**Weekly Progress Display**
- Large circular progress indicator
- Percentage completion of weekly goals
- Workouts completed vs. total planned

**Calendar View**
- Current week highlighted
- Completed workouts marked in green
- Pending workouts shown in gray
- Today's date prominently displayed

**Goal Summary**
- Days remaining in current week
- Total workouts this week
- Calories burned tracking
- Exercise duration totals

**Quick Actions**
- "Complete Workout" button
- "View Goal Details" link
- "Set New Goal" option

### Setting Weekly Goals (SRS FE-04)

#### Creating a New Goal

1. **Access Goal Setting**
   - Navigate to "Goals" section
   - Click "Set New Goal" button

2. **Goal Configuration**
   - **Goal Title**: Enter descriptive title
   - **Start Date**: Select goal start date (default: today)
   - **End Date**: Automatically set to 7 days from start
   - **Goal Type**: Choose weekly, monthly, or custom

3. **Program Selection** (Option 1)
   - Browse available programs
   - Filter by category (Weight Loss, Muscle Building, etc.)
   - Select program for the week
   - Review program details and schedule

4. **Custom Workout Selection** (Option 2)
   - Browse workout library
   - Add workouts to your goal
   - Schedule specific days for each workout
   - Set target repetitions

5. **Individual Exercise Selection** (Option 3)
   - Browse exercise database
   - Create custom workout from exercises
   - Define sets, repetitions, and duration
   - Save as new workout (optional)

#### Goal Recommendations

**Fitness-Based Suggestions**
- System analyzes your fitness profile
- Recommends appropriate difficulty level
- Suggests programs matching your goals

**Warning System**
- Alerts for unrealistic goals
- Recommendations based on fitness evaluation
- Suggestions for goal modification

#### Goal Management

**Viewing Current Goal**
- Complete goal details
- Progress tracking
- Workout schedule
- Completion status

**Updating Goals**
- Modify workout schedule
- Add/remove workouts
- Update target metrics
- Change goal parameters

**Completing Workouts**
1. Navigate to current goal
2. Find today's scheduled workout
3. Click "Start Workout" or "Mark Complete"
4. Rate difficulty and enjoyment
5. Add optional notes

### Browsing Programs (SRS FE-05)

#### Program Library Access
1. Click "Programs" in navigation menu
2. Browse available fitness programs

#### Program Categories
- **Weight Loss**: Fat burning and cardio-focused
- **Muscle Building**: Strength and hypertrophy training
- **Endurance**: Cardiovascular fitness improvement
- **Flexibility**: Mobility and yoga programs
- **General Fitness**: Balanced fitness approaches

#### Program Details View
- Program description and objectives
- Duration and frequency information
- Workout schedule breakdown
- Equipment requirements
- Difficulty level indicators
- User ratings and reviews

#### Using Programs in Goals
1. Select desired program
2. Click "Add to Goal"
3. Configure start date
4. Confirm goal creation

### Browsing Workouts (SRS FE-06)

#### Workout Library
1. Navigate to "Workouts" section
2. Browse available workouts

#### Workout Types
- **Strength**: Weight training and resistance
- **Cardio**: Cardiovascular exercises
- **Flexibility**: Stretching and mobility
- **HIIT**: High-intensity interval training
- **Yoga**: Mindfulness and flexibility
- **Sports**: Sport-specific training

#### Workout Details
- Exercise list with sets and repetitions
- Estimated duration and calories
- Equipment requirements
- Difficulty level
- Instructions and tips

#### Adding Workouts to Goals
1. Select workout from library
2. Click "Add to Goal"
3. Choose scheduled date
4. Confirm addition

### Browsing Exercises (SRS FE-07)

#### Exercise Database Access
1. Click "Exercises" in navigation menu
2. Browse comprehensive exercise library

#### Muscle Group Categories
- **Chest**: Pectoral muscle exercises
- **Back**: Latissimus dorsi and rhomboids
- **Shoulders**: Deltoid muscle training
- **Arms**: Biceps and triceps exercises
- **Legs**: Quadriceps, hamstrings, glutes
- **Core**: Abdominal and oblique training
- **Full Body**: Compound movements

#### Exercise Details
- Step-by-step instructions
- Target muscle groups
- Equipment requirements
- Difficulty level
- Safety tips and modifications
- Video demonstrations (when available)

#### Exercise Search and Filtering
- Search by exercise name
- Filter by muscle group
- Filter by equipment needed
- Sort by difficulty level

## 💪 Contributor Functions

### Accessing Contributor Area (SRS FE-08, FE-09, FE-10)

#### Gaining Contributor Status
1. **Submit Contributor Request**
   - Go to Profile settings
   - Click "Request Contributor Status"
   - Fill out application form
   - Submit for admin review

2. **Admin Approval**
   - Admin reviews application
   - Grants contributor permissions
   - Notification sent upon approval

#### Contributor Dashboard
- Content creation tools
- Personal content library
- Usage statistics
- User feedback on created content

### Managing Programs (SRS FE-08)

#### Creating New Programs

1. **Access Program Creator**
   - Navigate to Contributor Area
   - Click "Create New Program"

2. **Program Information**
   - **Program Name**: Descriptive title
   - **Description**: Detailed program overview
   - **Category**: Select appropriate category
   - **Difficulty**: Beginner, Intermediate, Advanced
   - **Duration**: Program length in weeks
   - **Frequency**: Workouts per week

3. **Workout Selection**
   - Browse your created workouts
   - Add workouts to program
   - Define weekly schedule
   - Set workout order and timing

4. **Program Configuration**
   - Set prerequisites
   - Define target audience
   - Add equipment requirements
   - Specify expected outcomes

5. **Save and Publish**
   - Review program details
   - Save as draft or publish
   - Share with community

#### Editing Existing Programs

1. **Access Your Programs**
   - Go to Contributor Area
   - View "My Programs" section

2. **Select Program to Edit**
   - Click on program name
   - Choose "Edit" option

3. **Make Modifications**
   - Update program information
   - Modify workout schedule
   - Adjust difficulty or requirements

4. **Save Changes**
   - Review modifications
   - Save updated program
   - Republish if needed

### Managing Workouts (SRS FE-09)

#### Creating New Workouts

1. **Access Workout Creator**
   - Navigate to Contributor Area
   - Click "Create New Workout"

2. **Workout Information**
   - **Workout Name**: Clear, descriptive title
   - **Description**: Workout purpose and benefits
   - **Type**: Strength, Cardio, Flexibility, etc.
   - **Difficulty**: Appropriate challenge level
   - **Duration**: Estimated completion time

3. **Exercise Selection**
   - Browse exercise database
   - Add exercises to workout
   - Define sets and repetitions
   - Set rest periods between exercises

4. **Workout Structure**
   - Arrange exercise order
   - Configure set parameters
   - Add warmup and cooldown
   - Include modification options

5. **Additional Details**
   - Equipment requirements
   - Safety considerations
   - Target muscle groups
   - Expected calorie burn

#### Exercise Set Configuration

**For Strength Exercises:**
- Number of sets
- Repetitions per set
- Weight recommendations
- Rest periods

**For Cardio Exercises:**
- Duration of activity
- Intensity level
- Recovery periods
- Heart rate zones

**For Flexibility Exercises:**
- Hold duration
- Number of repetitions
- Breathing instructions
- Progression options

### Managing Exercises (SRS FE-10)

#### Creating New Exercises

1. **Access Exercise Creator**
   - Go to Contributor Area
   - Click "Create New Exercise"

2. **Exercise Information**
   - **Exercise Name**: Clear, unique name
   - **Description**: Purpose and benefits
   - **Target Muscle Group**: Primary muscles worked
   - **Secondary Muscles**: Additional muscles involved
   - **Difficulty**: Skill level required

3. **Exercise Instructions**
   - Step-by-step performance guide
   - Starting position description
   - Movement execution details
   - Ending position/completion

4. **Safety and Tips**
   - Common mistakes to avoid
   - Safety precautions
   - Modification options
   - Progression techniques

5. **Media and Equipment**
   - Equipment requirements
   - Image upload (optional)
   - Video demonstration link
   - Alternative equipment options

#### Exercise Categories

**Equipment-Based Categories:**
- Bodyweight exercises
- Dumbbell exercises
- Barbell exercises
- Resistance band exercises
- Machine-based exercises

**Movement Pattern Categories:**
- Push movements
- Pull movements
- Squat patterns
- Hinge movements
- Carry exercises

## 👨‍💼 Administrator Functions

### User Management (SRS FE-01)

#### Accessing Admin Panel
1. Login with administrator credentials
2. Navigate to "Admin" section
3. Access user management tools

#### Managing User Accounts

**User Overview Dashboard**
- Total user count
- Active/inactive users
- Recent registrations
- User role distribution

**Individual User Management**
1. **Search and Select User**
   - Use search functionality
   - Browse user list
   - Filter by role or status

2. **User Actions**
   - View user profile
   - Edit user information
   - Activate/deactivate account
   - Reset user password
   - Delete user account

3. **Role Management**
   - Grant contributor status
   - Revoke contributor privileges
   - Assign administrator rights
   - View role history

#### Contributor Request Management

**Pending Requests**
1. **Review Applications**
   - View contributor applications
   - Read application essays
   - Check user activity history

2. **Application Decisions**
   - Approve contributor status
   - Reject application with reason
   - Request additional information
   - Set provisional approval

**Contributor Monitoring**
- Monitor content creation activity
- Review user-generated content
- Handle content reports
- Manage contributor privileges

### System Administration

#### Content Management
- Monitor exercise submissions
- Review workout programs
- Moderate user-generated content
- Handle inappropriate content reports

#### Analytics and Reporting
- User engagement statistics
- Content usage metrics
- System performance monitoring
- Error log review

#### System Configuration
- Application settings management
- Security parameter configuration
- Feature flag management
- Maintenance mode control

## 👤 Profile Management (SRS FE-11)

### Creating Your Profile

#### Initial Profile Creation
1. **Access Profile Creation**
   - Automatic redirect after registration
   - Or navigate to Profile section

2. **Personal Information**
   - **Weight**: Current body weight
   - **Height**: Your height measurement
   - **Date of Birth**: For age-based recommendations
   - **Gender**: For fitness calculations

3. **Fitness Assessment**
   - **Activity Level**: Sedentary to Very Active
   - **Exercise Experience**: Beginner to Expert
   - **Fitness Goals**: Weight loss, muscle gain, etc.
   - **Medical Conditions**: Any relevant health information

4. **Preferences**
   - **Workout Duration**: Preferred session length
   - **Workout Frequency**: Days per week
   - **Exercise Types**: Preferred activity types
   - **Equipment Access**: Available equipment

#### Fitness Evaluation Process

**Assessment Questions**
- Current fitness routine
- Exercise experience level
- Physical limitations
- Health conditions
- Fitness objectives

**Evaluation Results**
- Fitness level score (Beginner/Intermediate/Advanced)
- Personalized recommendations
- Goal-setting suggestions
- Safety considerations

### Updating Your Profile

#### Personal Information Updates
1. **Access Profile Settings**
   - Navigate to Profile section
   - Click "Edit Profile"

2. **Modifiable Fields**
   - Contact information
   - Physical measurements
   - Fitness preferences
   - Goal modifications

3. **Profile Picture**
   - Upload new profile image
   - Crop and resize
   - Save changes

#### Fitness Re-evaluation
- Retake fitness assessment
- Update fitness goals
- Modify preferences
- Adjust activity level

### Account Security Settings

#### Password Management
1. **Change Password**
   - Navigate to Security settings
   - Enter current password
   - Set new secure password
   - Confirm password change

2. **Password Requirements**
   - Minimum 8 characters
   - Mix of letters, numbers, symbols
   - Cannot reuse recent passwords

#### Two-Factor Authentication (2FA)

**Enabling 2FA**
1. **Access Security Settings**
   - Go to Profile > Security
   - Click "Enable 2FA"

2. **Setup Process**
   - Scan QR code with authenticator app
   - Enter verification code
   - Save backup codes
   - Confirm activation

**Using 2FA**
- Enter 6-digit code during login
- Use backup codes if needed
- Regenerate codes if compromised

**Disabling 2FA**
- Access security settings
- Enter current password
- Confirm 2FA removal

#### Contributor Applications
1. **Submit Application**
   - Fill out contributor form
   - Explain fitness background
   - Describe contribution plans
   - Submit for review

2. **Application Status**
   - Track application progress
   - Receive status notifications
   - Respond to admin requests

## 🔒 Security Features

### Account Security Best Practices

#### Password Security
- Use unique, strong passwords
- Enable two-factor authentication
- Regularly update passwords
- Don't share login credentials

#### Session Security
- Automatic timeout after inactivity
- Secure logout from all devices
- Monitor login activity
- Report suspicious access

### Data Privacy

#### Personal Information
- Control profile visibility
- Manage data sharing preferences
- Request data export
- Account deletion options

#### Activity Tracking
- Review activity logs
- Monitor login history
- Check device access
- Manage session tokens

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Login Problems

**Cannot Login**
1. **Check Credentials**
   - Verify email address
   - Confirm password accuracy
   - Check caps lock status

2. **Account Issues**
   - Ensure account is activated
   - Check for account suspension
   - Verify email confirmation

3. **Technical Issues**
   - Clear browser cache
   - Disable browser extensions
   - Try different browser

**Forgot Password**
1. Use "Forgot Password" link
2. Check email (including spam folder)
3. Follow reset instructions
4. Contact support if needed

#### Profile Issues

**Cannot Create Profile**
- Check required field completion
- Verify data format requirements
- Ensure stable internet connection
- Refresh page and retry

**Fitness Evaluation Problems**
- Answer all required questions
- Provide accurate information
- Complete assessment in one session
- Contact support for technical issues

#### Goal Setting Problems

**Cannot Set Goals**
- Ensure profile is complete
- Check fitness evaluation completion
- Verify program/workout availability
- Review goal parameters

**Goal Recommendations Not Appearing**
- Complete fitness evaluation
- Update profile information
- Check available content
- Refresh recommendations

### Getting Help

#### Support Resources
1. **In-App Help**
   - Help tooltips and guides
   - FAQ section
   - Video tutorials

2. **Documentation**
   - User manual (this document)
   - Technical documentation (README.md)

3. **Community Support**
   - User forums
   - Community guidelines
   - Peer assistance

#### Contact Information
- **GitHub Issues**: [Report bugs or request features](https://github.com/ReddyRohith-E/MeFit/issues)
- **Repository**: [https://github.com/ReddyRohith-E/MeFit](https://github.com/ReddyRohith-E/MeFit)

### Error Messages

#### Common Error Codes
- **400 Bad Request**: Check input data format
- **401 Unauthorized**: Login required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **500 Server Error**: Try again later

#### Resolving Errors
1. Read error message carefully
2. Check network connection
3. Verify permissions
4. Retry operation
5. Contact support if persistent

---

**Repository**: [https://github.com/ReddyRohith-E/MeFit](https://github.com/ReddyRohith-E/MeFit)

This user manual covers all implemented features according to the SRS requirements. For technical documentation, see the [README.md](README.md) file.
