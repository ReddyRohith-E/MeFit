const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');

// Load environment variables from the backend directory
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Enhanced admin token generation with multiple options
async function generateAdminToken(options = {}) {
  try {
    // Validate JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET not found in environment variables!');
      console.log('💡 Please ensure you have a .env file with JWT_SECRET configured.');
      console.log('   Example: JWT_SECRET=your_super_secret_jwt_key_here');
      process.exit(1);
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mefit');
    console.log('📡 Connected to MongoDB');
    
    // Find admin user (with fallback options)
    let admin = await User.findOne({ 
      email: options.email || 'admin@mefit.com',
      isAdmin: true,
      isActive: true 
    });

    // If specific admin not found, try to find any admin
    if (!admin && !options.email) {
      admin = await User.findOne({ 
        isAdmin: true,
        isActive: true 
      });
    }
    
    if (!admin) {
      console.error('❌ Admin user not found. Please run seeding first:');
      console.log('   cd backend && npm run seed');
      console.log('   or');
      console.log('   node scripts/seed.js');
      process.exit(1);
    }
    
    console.log('👑 Admin user found:', admin.email);
    console.log('🆔 User ID:', admin._id.toString());
    console.log('🔐 Admin privileges:', admin.isAdmin ? '✅' : '❌');
    console.log('📝 Contributor privileges:', admin.isContributor ? '✅' : '❌');
    
    // Set token expiration (default 24h, customizable)
    const expiresIn = options.expiresIn || '24h';
    
    // Generate token with comprehensive payload
    const tokenPayload = { 
      userId: admin._id.toString(),
      isAdmin: admin.isAdmin,
      isContributor: admin.isContributor,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      type: 'admin',
      iat: Math.floor(Date.now() / 1000),
      // SRS SEC-01: Include security context
      securityLevel: 'admin'
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn }
    );
    
    // Verify token can be decoded (sanity check)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verification successful');
    
    console.log('\n🔑 ADMIN TOKEN GENERATED\n');
    console.log('=====================================');
    console.log('Token:', token);
    console.log('=====================================');
    console.log('Expires in:', expiresIn);
    console.log('Generated at:', new Date().toISOString());
    
    console.log('\n📋 USAGE INSTRUCTIONS:');
    console.log('1. Copy the token above');
    console.log('2. Open browser console on admin login page (localhost:5173/admin/login)');
    console.log('3. Run: localStorage.setItem("adminToken", "YOUR_TOKEN_HERE")');
    console.log('4. Navigate to: localhost:5173/admin/dashboard');
    console.log('5. You should be automatically logged in');
    
    console.log('\n🧪 TESTING COMMANDS:');
    console.log('// Set token in browser console:');
    console.log(`localStorage.setItem("adminToken", "${token}");`);
    console.log('');
    console.log('// Test API call:');
    console.log('fetch("/api/admin/dashboard/stats", {');
    console.log('  headers: { "Authorization": "Bearer " + localStorage.getItem("adminToken") }');
    console.log('}).then(r => r.json()).then(console.log);');
    
    console.log('\n🔧 CURL TESTING:');
    console.log(`curl -H "Authorization: Bearer ${token}" \\`);
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     http://localhost:5000/api/admin/dashboard/stats');
    
    await mongoose.connection.close();
    console.log('\n✅ Admin token generated successfully!');
    
    return token;
    
  } catch (error) {
    console.error('❌ Error generating admin token:', error);
    if (error.name === 'JsonWebTokenError') {
      console.log('💡 Check your JWT_SECRET configuration');
    }
    process.exit(1);
  }
}

// Enhanced user token generation for testing different user types
async function generateUserToken(options = {}) {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mefit');
    
    const userEmail = options.email || 'user@mefit.com';
    const user = await User.findOne({ 
      email: userEmail,
      isActive: true 
    });
    
    if (user) {
      const tokenPayload = { 
        userId: user._id.toString(),
        isAdmin: user.isAdmin || false,
        isContributor: user.isContributor || false,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        type: user.isAdmin ? 'admin' : (user.isContributor ? 'contributor' : 'user'),
        iat: Math.floor(Date.now() / 1000)
      };

      const userToken = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET,
        { expiresIn: options.expiresIn || '24h' }
      );
      
      const userType = user.isAdmin ? '👑 ADMIN' : (user.isContributor ? '🤝 CONTRIBUTOR' : '👤 USER');
      
      console.log(`\n${userType} TOKEN FOR TESTING:`);
      console.log('=====================================');
      console.log('Email:', user.email);
      console.log('User ID:', user._id.toString());
      console.log('Token:', userToken);
      console.log('=====================================');
      console.log('// Set token in browser:');
      console.log(`localStorage.setItem("token", "${userToken}");`);
      
      return userToken;
    } else {
      console.log(`⚠️ User with email '${userEmail}' not found.`);
      return null;
    }
    
  } catch (error) {
    console.log('⚠️ Could not generate user token:', error.message);
    return null;
  }
}

// Generate tokens for all user types for comprehensive testing
async function generateAllTokens() {
  try {
    console.log('🎯 GENERATING TOKENS FOR ALL USER TYPES\n');
    
    // Admin token
    const adminToken = await generateAdminToken();
    
    // Regular user token
    const userToken = await generateUserToken({ email: 'user@mefit.com' });
    
    // Try to find and generate contributor token
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mefit');
    const contributor = await User.findOne({ 
      isContributor: true, 
      isAdmin: false,
      isActive: true 
    });
    
    if (contributor) {
      const contributorToken = await generateUserToken({ email: contributor.email });
    } else {
      console.log('\n📝 No dedicated contributor user found (admin has contributor rights)');
    }
    
    await mongoose.connection.close();
    
    console.log('\n🎉 ALL TOKENS GENERATED SUCCESSFULLY!');
    console.log('\n📚 QUICK REFERENCE:');
    console.log('- Admin: Full access to all resources');
    console.log('- Contributor: Can create/edit exercises, workouts, programs');
    console.log('- User: Can set goals, track progress, view content');
    
  } catch (error) {
    console.error('❌ Error generating tokens:', error);
    process.exit(1);
  }
}

// Command line interface
const args = process.argv.slice(2);
const command = args[0];

if (require.main === module) {
  if (command === '--help' || command === '-h') {
    console.log(`
🔑 MeFit Token Generator

Usage:
  node generate-admin-token.js [command] [options]

Commands:
  (no command)     Generate admin token only
  --all           Generate tokens for all user types
  --user [email]  Generate token for specific user
  --help, -h      Show this help

Examples:
  node generate-admin-token.js
  node generate-admin-token.js --all
  node generate-admin-token.js --user contributor@mefit.com
`);
    process.exit(0);
  }
  
  if (command === '--all') {
    generateAllTokens();
  } else if (command === '--user') {
    const email = args[1];
    if (!email) {
      console.error('❌ Please provide an email address');
      console.log('Example: node generate-admin-token.js --user user@mefit.com');
      process.exit(1);
    }
    generateUserToken({ email }).then(() => process.exit(0));
  } else {
    generateAdminToken().then(() => {
      return generateUserToken();
    }).then(() => process.exit(0));
  }
}

module.exports = { 
  generateAdminToken, 
  generateUserToken, 
  generateAllTokens 
};
