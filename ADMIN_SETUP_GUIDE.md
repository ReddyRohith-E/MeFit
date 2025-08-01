# 🚀 MeFit Admin Panel - Quick Setup Guide

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or cloud)
- Git

## 🛠️ Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Navigate to project directory
cd MeFit

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

#### Backend (.env)
Create `backend/.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/mefit
JWT_SECRET=your_super_secure_jwt_secret_here_min_32_chars
JWT_EXPIRE=24h
PORT=5000
NODE_ENV=development

# Security Settings
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=5
MAX_FILE_SIZE=10485760

# CORS
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env)
Create `frontend/.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Database Setup

```bash
# Make sure MongoDB is running
# For local MongoDB:
mongod

# For MongoDB Atlas, update MONGODB_URI in .env
```

### 4. Create Admin User

```bash
# Navigate to backend directory
cd backend

# Create admin user
npm run create-admin
```

This will create an admin user with:
- **Email**: `admin@mefit.com`
- **Password**: `admin123`

### 5. Start the Application

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

### 6. Access Admin Panel

1. **Open browser**: `http://localhost:5173/admin/login`
2. **Login with**:
   - Email: `admin@mefit.com`
   - Password: `admin123`
3. **Change password** after first login (recommended)

## 🎯 Admin Panel Features

### 📊 Dashboard
- **Real-time statistics** and metrics
- **User growth** trends
- **Goal completion** analytics
- **System health** overview

### 👥 User Management
- **Search and filter** users
- **Role management** (Admin/Contributor/User)
- **Account activation/deactivation**
- **User statistics** and activity

### 🔧 System Administration
- **Contributor request** approval
- **Content moderation** (coming soon)
- **System analytics** (coming soon)
- **Configuration settings** (coming soon)

## 🎨 UI/UX Highlights

### Professional Design
- **Material-UI v5** with custom admin theme
- **Responsive design** for all devices
- **Professional color palette**
- **Smooth animations** and transitions

### Enhanced User Experience
- **Real-time updates**
- **Advanced search** and filtering
- **Bulk operations** support
- **Comprehensive error handling**

## 🛡️ Security Features

### Authentication & Authorization
- **JWT-based** secure authentication
- **Role-based access control**
- **Session management**
- **Rate limiting** protection

### Data Protection
- **Password hashing** with bcrypt
- **Input validation** and sanitization
- **CORS protection**
- **Helmet security** headers

## 🔍 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
```bash
# Check MongoDB status
# For local MongoDB:
brew services start mongodb-community
# or
sudo systemctl start mongod
```

#### 2. Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000
# Kill process
kill -9 <PID>
```

#### 3. Admin User Creation Fails
```bash
# Check MongoDB connection
# Verify .env file exists
# Run script again:
npm run create-admin
```

#### 4. CORS Errors
- Verify `FRONTEND_URL` in backend `.env`
- Check if both servers are running
- Clear browser cache

### Getting Help
- Check browser console for errors
- Review server logs in terminal
- Verify environment variables
- Ensure all dependencies are installed

## 📱 Testing the Implementation

### 1. Test Admin Login
- Navigate to `/admin/login`
- Use admin credentials
- Verify successful login

### 2. Test Dashboard
- Check statistics loading
- Verify real-time data
- Test responsive design

### 3. Test User Management
- Search for users
- Update user roles
- Test pagination

### 4. Test Security
- Try accessing admin routes without login
- Test token expiration
- Verify role-based access

## 🚀 Production Deployment

### Environment Variables
Update production `.env` files with:
- Secure `JWT_SECRET`
- Production MongoDB URI
- Production frontend URL
- Appropriate rate limits

### Security Checklist
- [ ] Change default admin password
- [ ] Set strong JWT secret
- [ ] Configure production CORS
- [ ] Enable HTTPS
- [ ] Set up monitoring
- [ ] Configure backups

## 🎯 Next Steps

### Immediate Actions
1. **Change admin password**
2. **Create additional admin users** if needed
3. **Test all functionality**
4. **Configure production settings**

### Future Enhancements
1. **Advanced analytics** dashboard
2. **Content management** system
3. **Automated reporting**
4. **API documentation**

---

## 📞 Support

If you encounter any issues:

1. **Check this guide** first
2. **Review error messages** carefully
3. **Verify environment setup**
4. **Check GitHub issues** for known problems

Happy administrating! 🎉
