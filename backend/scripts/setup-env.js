#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load environment variables from the backend directory
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

/**
 * Environment Setup Script for MeFit Application
 * 
 * This script helps set up the environment configuration
 * ensuring proper JWT secret generation and security compliance
 * 
 * SRS Compliance:
 * - SEC-03: Credential Storage (environment variables)
 * - SEC-01: User Authentication (JWT configuration)
 */

const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

function generateSecureJWTSecret() {
  // Generate a cryptographically secure random string
  return crypto.randomBytes(64).toString('hex');
}

function setupEnvironment() {
  console.log('🔧 MeFit Environment Setup\n');
  
  // Check if .env file exists
  if (fs.existsSync(envPath)) {
    console.log('✅ .env file already exists');
    
    // Check if JWT_SECRET is configured
    const envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('JWT_SECRET=') && !envContent.includes('JWT_SECRET=your_super_secret_jwt_key_here')) {
      console.log('✅ JWT_SECRET appears to be configured');
      console.log('📋 Current environment configuration looks good!');
      return;
    } else {
      console.log('⚠️  JWT_SECRET needs to be updated');
    }
  } else {
    console.log('📝 Creating .env file from template...');
    
    // Copy from .env.example if it exists
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ .env file created from .env.example');
    } else {
      console.log('❌ .env.example not found, creating minimal .env file');
      const minimalEnv = `# MeFit Backend Environment Variables
MONGODB_URI=mongodb://localhost:27017/mefit
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
`;
      fs.writeFileSync(envPath, minimalEnv);
      console.log('✅ Minimal .env file created');
    }
  }
  
  // Generate and update JWT_SECRET
  const newJWTSecret = generateSecureJWTSecret();
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Replace the JWT_SECRET line
  if (envContent.includes('JWT_SECRET=')) {
    envContent = envContent.replace(
      /JWT_SECRET=.*/,
      `JWT_SECRET=${newJWTSecret}`
    );
  } else {
    envContent += `\nJWT_SECRET=${newJWTSecret}\n`;
  }
  
  fs.writeFileSync(envPath, envContent);
  
  console.log('🔐 New secure JWT_SECRET generated and saved');
  console.log('✅ Environment setup complete!');
  
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Review your .env file and adjust settings as needed');
  console.log('2. Ensure your MongoDB is running');
  console.log('3. Run the seeding script: npm run seed');
  console.log('4. Generate admin tokens: node scripts/generate-admin-token.js');
  
  console.log('\n🔒 SECURITY NOTES:');
  console.log('- Never commit your .env file to version control');
  console.log('- Use different JWT secrets for different environments');
  console.log('- Keep your JWT secret confidential and secure');
}

function validateEnvironment() {
  console.log('🔍 Validating Environment Configuration\n');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found');
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  const config = {};
  
  lines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      config[key.trim()] = value.trim();
    }
  });
  
  const checks = [
    { key: 'JWT_SECRET', required: true, test: val => val && val.length >= 32 && val !== 'your_super_secret_jwt_key_here' },
    { key: 'MONGODB_URI', required: true, test: val => val && val.includes('mongodb') },
    { key: 'NODE_ENV', required: false, test: val => true },
    { key: 'PORT', required: false, test: val => !val || !isNaN(parseInt(val)) }
  ];
  
  let allValid = true;
  
  checks.forEach(check => {
    const value = config[check.key];
    const isValid = check.test(value);
    const status = isValid ? '✅' : '❌';
    const required = check.required ? '(required)' : '(optional)';
    
    console.log(`${status} ${check.key}: ${value || 'not set'} ${required}`);
    
    if (check.required && !isValid) {
      allValid = false;
    }
  });
  
  if (allValid) {
    console.log('\n✅ Environment configuration is valid!');
  } else {
    console.log('\n❌ Environment configuration has issues');
    console.log('💡 Run: node scripts/setup-env.js to fix configuration');
  }
  
  return allValid;
}

// Command line interface
const args = process.argv.slice(2);
const command = args[0];

if (require.main === module) {
  if (command === '--help' || command === '-h') {
    console.log(`
🔧 MeFit Environment Setup Tool

Usage:
  node setup-env.js [command]

Commands:
  (no command)    Set up environment configuration
  --validate      Validate current environment
  --help, -h      Show this help

Examples:
  node setup-env.js           # Set up .env file
  node setup-env.js --validate # Check current config
`);
    process.exit(0);
  }
  
  if (command === '--validate') {
    const isValid = validateEnvironment();
    process.exit(isValid ? 0 : 1);
  } else {
    setupEnvironment();
  }
}

module.exports = { setupEnvironment, validateEnvironment, generateSecureJWTSecret };
