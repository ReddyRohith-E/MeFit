const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User model schema (simplified for this script)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  isAdmin: { type: Boolean, default: false },
  isContributor: { type: Boolean, default: false },
  contributorRequestPending: { type: Boolean, default: false },
  profilePicture: { type: String, default: null },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String, default: null },
  lastLogin: { type: Date, default: null },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.twoFactorSecret;
      return ret;
    }
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mefit');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@mefit.com' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@mefit.com');
      console.log('You can use this account to access the admin panel.');
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      email: 'admin@mefit.com',
      password: 'admin123', // Will be hashed automatically
      firstName: 'Admin',
      lastName: 'User',
      isAdmin: true,
      isActive: true
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('Admin Login Credentials:');
    console.log('Email: admin@mefit.com');
    console.log('Password: admin123');
    console.log('');
    console.log('Admin Panel URL: http://localhost:5173/admin/login');
    console.log('');
    console.log('⚠️  IMPORTANT: Change the default password after first login!');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

// Run the script
createAdminUser();
