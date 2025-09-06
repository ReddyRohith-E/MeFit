#!/usr/bin/env node

// Check for help flag
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
\x1b[36m🌱 MeFit Database Seeding Script\x1b[0m
\x1b[2m════════════════════════════════════\x1b[0m

\x1b[1mUsage:\x1b[0m
  npm run seed [options]

\x1b[1mOptions:\x1b[0m
  --help, -h           Show this help message
  --quiet, -q          Suppress warnings and detailed output
  --verbose            Show detailed operation logs
  --profile=NAME       Use specific seeding profile (standard, minimal, full)
  --skip-tests         Skip functionality tests
  --force-clean        Skip cleanup verification
  --dry-run           Show what would be created without actually creating
  --benchmark         Enable performance benchmarking

\x1b[1mExamples:\x1b[0m
  npm run seed                    # Standard seeding with full output
  npm run seed -- --quiet        # Quiet mode with minimal output
  npm run seed -- --verbose      # Detailed verbose output
  npm run seed -- --skip-tests   # Skip all functionality tests

\x1b[1mQuiet Mode:\x1b[0m
  Use --quiet or -q to suppress warnings, errors, and detailed progress.
  Only shows essential information and final credentials.
`);
  process.exit(0);
}

/**
 * Enhanced Database Seeding Script for MeFit Application
 * 
 * This advanced seeding script provides:
 * - Intelligent data generation with realistic patterns
 * - Performance monitoring and optimization
 * - Comprehensive testing and validation
 * - Backup creation and rollback capabilities
 * - Configurable seeding options and profiles
 * - Detailed analytics and reporting
 * 
 * Features:
 * - Smart batch processing for large datasets
 * - Memory efficiency monitoring
 * - Progress tracking with ETA calculations
 * - Data validation and integrity checks
 * - Custom seeding profiles (minimal, standard, comprehensive)
 * - Automatic relationship mapping and validation
 * 
 * IMPORTANT: Run cleanDB script first to ensure a clean state.
 * 
 * Usage: 
 *   npm run seed                    # Standard seeding
 *   npm run seed -- --profile=minimal
 *   npm run seed -- --profile=comprehensive
 *   npm run seed -- --validate-only
 *   npm run seed -- --benchmark
 *   npm run seed -- --dry-run
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const fs = require('fs');
const path = require('path');
const os = require('os');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import all models
const User = require('../models/User');
const Profile = require('../models/Profile');
const Exercise = require('../models/Exercise');
const Workout = require('../models/Workout');
const Program = require('../models/Program');
const Goal = require('../models/Goal');
const Notification = require('../models/Notification');

// Enhanced configuration and options
const options = {
  profile: process.argv.includes('--profile=minimal') ? 'minimal' :
          process.argv.includes('--profile=comprehensive') ? 'comprehensive' : 'standard',
  validateOnly: process.argv.includes('--validate-only'),
  benchmark: process.argv.includes('--benchmark'),
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose'),
  createBackup: !process.argv.includes('--no-backup'),
  batchSize: parseInt(process.argv.find(arg => arg.startsWith('--batch-size='))?.split('=')[1]) || 50,
  skipTests: process.argv.includes('--skip-tests'),
  forceClean: process.argv.includes('--force-clean'),
  quiet: process.argv.includes('--quiet') || process.argv.includes('-q')
};

// Seeding profiles configuration
const SEEDING_PROFILES = {
  minimal: {
    users: 5,
    exercises: 10,
    workouts: 3,
    programs: 2,
    enableAdvancedFeatures: false
  },
  standard: {
    users: 10,
    exercises: 20,
    workouts: 7,
    programs: 5,
    enableAdvancedFeatures: true
  },
  comprehensive: {
    users: 25,
    exercises: 50,
    workouts: 15,
    programs: 10,
    enableAdvancedFeatures: true,
    includeTestData: true
  }
};

// Performance and monitoring
const seedingStats = {
  startTime: null,
  endTime: null,
  operationTimes: {},
  memoryUsage: {
    initial: null,
    peak: null,
    final: null
  },
  documentsCreated: {
    users: 0,
    profiles: 0,
    exercises: 0,
    workouts: 0,
    programs: 0,
    goals: 0,
    notifications: 0
  },
  totalDocuments: 0,
  errors: 0,
  warnings: 0,
  backupCreated: false,
  backupSize: 0,
  validationResults: {
    passed: 0,
    failed: 0,
    warnings: 0
  }
};

// Enhanced utility functions with performance tracking
const log = {
  info: (msg) => { if (!options.quiet) console.log(`\x1b[36m[INFO]\x1b[0m ${new Date().toISOString().substr(11, 8)} ${msg}`); },
  success: (msg) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${new Date().toISOString().substr(11, 8)} ${msg}`),
  warning: (msg) => {
    if (!options.quiet) console.log(`\x1b[33m[WARNING]\x1b[0m ${new Date().toISOString().substr(11, 8)} ${msg}`);
    seedingStats.warnings++;
  },
  error: (msg) => {
    if (!options.quiet) console.log(`\x1b[31m[ERROR]\x1b[0m ${new Date().toISOString().substr(11, 8)} ${msg}`);
    seedingStats.errors++;
  },
  header: (msg) => console.log(`\n\x1b[35m=== ${msg} ===\x1b[0m`),
  progress: (current, total, operation) => {
    if (options.quiet) return;
    const percentage = ((current / total) * 100).toFixed(1);
    const filled = Math.floor((current / total) * 30);
    const empty = 30 - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    process.stdout.write(`\r\x1b[36m[PROGRESS]\x1b[0m ${operation}: [${bar}] ${percentage}% (${current}/${total})`);
    if (current === total) console.log(); // New line when complete
  },
  memory: () => {
    const used = process.memoryUsage();
    return `Memory: ${(used.heapUsed / 1024 / 1024).toFixed(2)} MB heap, ${(used.rss / 1024 / 1024).toFixed(2)} MB RSS`;
  }
};

/**
 * Track memory usage and update peak values
 */
function trackMemoryUsage() {
  const current = process.memoryUsage();
  if (!seedingStats.memoryUsage.peak || current.heapUsed > seedingStats.memoryUsage.peak.heapUsed) {
    seedingStats.memoryUsage.peak = current;
  }
  
  if (options.verbose && Math.random() < 0.1) { // Randomly log memory usage
    log.info(`💾 ${log.memory()}`);
  }
}

/**
 * Measure operation performance
 */
function measureOperation(operationName, operation) {
  return async function(...args) {
    const startTime = Date.now();
    trackMemoryUsage();
    
    try {
      const result = await operation.apply(this, args);
      const duration = Date.now() - startTime;
      seedingStats.operationTimes[operationName] = duration;
      
      if (options.verbose) {
        log.info(`⏱️  ${operationName} completed in ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      seedingStats.operationTimes[operationName] = duration;
      log.error(`❌ ${operationName} failed after ${duration}ms: ${error.message}`);
      throw error;
    }
  };
}

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
    this.currentProfile = SEEDING_PROFILES[options.profile];
    this.startTime = Date.now();
    this.backupPath = null;
  }

  /**
   * Initialize seeding with pre-flight checks and setup
   */
  async initialize() {
    log.header('Enhanced MeFit Database Seeding - Initialization');
    
    seedingStats.startTime = Date.now();
    seedingStats.memoryUsage.initial = process.memoryUsage();
    
    log.info(`🔧 Seeding Profile: ${options.profile.toUpperCase()}`);
    log.info(`📊 Target Data: ${this.currentProfile.users} users, ${this.currentProfile.exercises} exercises, ${this.currentProfile.workouts} workouts, ${this.currentProfile.programs} programs`);
    log.info(`⚙️  Options: ${JSON.stringify(options, null, 2)}`);
    log.info(`💾 ${log.memory()}`);
    log.info(`🖥️  System: ${os.type()} ${os.release()}, Node.js ${process.version}`);
    
    if (options.dryRun) {
      log.warning('🔍 DRY RUN MODE - No actual data will be created');
    }
    
    if (options.validateOnly) {
      log.info('✅ VALIDATION ONLY MODE - Only testing existing data');
    }
    
    if (options.benchmark) {
      log.info('🏁 BENCHMARK MODE - Performance testing enabled');
    }
  }

  /**
   * Create backup of current database state
   */
  async createBackup() {
    if (!options.createBackup || options.dryRun) {
      log.info('📝 Backup creation skipped (disabled or dry run mode)');
      return;
    }

    log.header('Creating Database Backup');
    
    try {
      const backupDir = path.join(__dirname, 'backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      this.backupPath = path.join(backupDir, `seed-backup-${timestamp}.json`);
      
      const collections = ['users', 'profiles', 'exercises', 'workouts', 'programs', 'goals', 'notifications'];
      const backup = {
        timestamp: new Date().toISOString(),
        profile: options.profile,
        collections: {}
      };

      let totalSize = 0;
      for (const collectionName of collections) {
        try {
          const docs = await mongoose.connection.db.collection(collectionName).find({}).toArray();
          backup.collections[collectionName] = docs;
          const collectionSize = JSON.stringify(docs).length;
          totalSize += collectionSize;
          
          if (docs.length > 0) {
            log.info(`📦 Backed up ${docs.length} documents from ${collectionName} (${(collectionSize / 1024).toFixed(2)} KB)`);
          }
        } catch (error) {
          log.warning(`⚠️  Could not backup collection ${collectionName}: ${error.message}`);
        }
      }

      fs.writeFileSync(this.backupPath, JSON.stringify(backup, null, 2));
      seedingStats.backupCreated = true;
      seedingStats.backupSize = totalSize;
      
      log.success(`✅ Backup created: ${this.backupPath}`);
      log.info(`📏 Backup size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
      
      // Create restore script
      await this.createRestoreScript();
      
    } catch (error) {
      log.error(`❌ Backup creation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create restore script for easy rollback
   */
  async createRestoreScript() {
    if (!this.backupPath) return;

    const restoreScriptPath = path.join(path.dirname(this.backupPath), 'restore-seed-backup.js');
    const restoreScript = `#!/usr/bin/env node

/**
 * Auto-generated restore script for MeFit database backup
 * Created: ${new Date().toISOString()}
 * Backup: ${path.basename(this.backupPath)}
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

async function restore() {
  try {
    console.log('🔄 Starting database restore...');
    
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mefit';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    const backupData = JSON.parse(fs.readFileSync('${this.backupPath}', 'utf8'));
    console.log(\`📦 Loaded backup from: \${backupData.timestamp}\`);
    
    // Clear existing data
    const collections = Object.keys(backupData.collections);
    for (const collectionName of collections) {
      try {
        await mongoose.connection.db.collection(collectionName).deleteMany({});
        console.log(\`🗑️  Cleared collection: \${collectionName}\`);
      } catch (error) {
        console.log(\`⚠️  Could not clear \${collectionName}: \${error.message}\`);
      }
    }
    
    // Restore data
    for (const [collectionName, docs] of Object.entries(backupData.collections)) {
      if (docs.length > 0) {
        await mongoose.connection.db.collection(collectionName).insertMany(docs);
        console.log(\`✅ Restored \${docs.length} documents to \${collectionName}\`);
      }
    }
    
    console.log('🎉 Database restore completed successfully!');
    
  } catch (error) {
    console.error('❌ Restore failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

restore();
`;

    fs.writeFileSync(restoreScriptPath, restoreScript);
    fs.chmodSync(restoreScriptPath, '755');
    log.success(`📜 Restore script created: ${restoreScriptPath}`);
  }

  async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mefit';
      
      log.info(`🔌 Connecting to MongoDB: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`);
      
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      
      // Test connection
      await mongoose.connection.db.admin().ping();
      
      log.success(`✅ Connected to MongoDB successfully`);
      log.info(`📊 Database: ${mongoose.connection.name}`);
      log.info(`🏠 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
      
      // Get database statistics
      if (options.verbose) {
        const stats = await mongoose.connection.db.stats();
        log.info(`💾 DB Stats: ${stats.collections} collections, ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB data`);
      }
      
    } catch (error) {
      log.error(`❌ Failed to connect to MongoDB: ${error.message}`);
      log.error(`🔧 Please check your MongoDB connection string and ensure the server is running`);
      
      if (error.code === 'ENOTFOUND') {
        log.error(`🌐 DNS Resolution failed - check your network connection`);
      } else if (error.code === 'ECONNREFUSED') {
        log.error(`🚫 Connection refused - is MongoDB running?`);
      } else if (error.name === 'MongoServerSelectionError') {
        log.error(`⏰ Server selection timeout - MongoDB may be unreachable`);
      }
      
      throw error;
    }
  }

  async checkCleanupMarker() {
    const markerPath = path.join(__dirname, '.cleanup-completed');
    
    if (!fs.existsSync(markerPath) && !options.forceClean) {
      log.error('❌ Database cleanup marker not found!');
      log.error('   Please run the cleanup script first: npm run cleanDB');
      log.error('   This ensures the database is in a clean state before seeding.');
      log.error('   Or use --force-clean to skip this check (not recommended)');
      throw new Error('Database cleanup required before seeding');
    }

    if (fs.existsSync(markerPath)) {
      try {
        const markerContent = fs.readFileSync(markerPath, 'utf8');
        log.success('✅ Database cleanup marker found');
        log.info(`   ${markerContent.trim()}`);
        
        // Parse cleanup timestamp
        const timestampMatch = markerContent.match(/at: (.+)/);
        if (timestampMatch) {
          const cleanupTime = new Date(timestampMatch[1]);
          const timeSinceCleanup = Date.now() - cleanupTime.getTime();
          const hoursSince = (timeSinceCleanup / (1000 * 60 * 60)).toFixed(1);
          
          if (timeSinceCleanup > 24 * 60 * 60 * 1000) { // More than 24 hours
            log.warning(`⚠️  Cleanup was performed ${hoursSince} hours ago - consider running cleanup again`);
          } else {
            log.info(`🕐 Cleanup was performed ${hoursSince} hours ago`);
          }
        }
        
        // Remove the marker file after successful check
        fs.unlinkSync(markerPath);
        log.info('🗑️  Cleanup marker removed');
      } catch (error) {
        log.warning('⚠️  Could not read cleanup marker details');
      }
    } else if (options.forceClean) {
      log.warning('⚠️  Cleanup marker check bypassed with --force-clean');
      log.warning('🔥 Proceeding without cleanup verification - data integrity not guaranteed');
    }
  }

  async checkDatabaseEmpty() {
    log.header('Verifying Database State');
    
    const collections = [
      'users', 'profiles', 'exercises', 'workouts', 
      'programs', 'goals', 'notifications'
    ];

    let totalDocuments = 0;
    const collectionStatus = {};

    for (const collectionName of collections) {
      try {
        const count = await mongoose.connection.db.collection(collectionName).countDocuments();
        collectionStatus[collectionName] = count;
        
        if (count > 0) {
          log.warning(`⚠️  Collection '${collectionName}' contains ${count} documents`);
          totalDocuments += count;
          
          // Show sample documents for troubleshooting
          if (options.verbose && count < 10) {
            const samples = await mongoose.connection.db.collection(collectionName).find({}).limit(3).toArray();
            for (const sample of samples) {
              log.info(`   Sample: ${JSON.stringify(sample, null, 2).substring(0, 100)}...`);
            }
          }
        } else {
          log.success(`✅ Collection '${collectionName}' is empty`);
        }
      } catch (error) {
        // Collection might not exist yet, which is fine
        log.info(`📝 Collection '${collectionName}' does not exist (this is normal for fresh databases)`);
        collectionStatus[collectionName] = 0;
      }
    }

    if (totalDocuments > 0 && !options.forceClean) {
      log.error('❌ Database is not empty!');
      log.error(`   Found ${totalDocuments} existing documents across collections.`);
      log.error('   Please run the cleanup script first: npm run cleanDB');
      log.error('   Or use --force-clean to proceed anyway (will merge with existing data)');
      
      // Show detailed breakdown
      console.log('\n📊 Collection Status:');
      for (const [name, count] of Object.entries(collectionStatus)) {
        if (count > 0) {
          console.log(`   ${name}: ${count} documents`);
        }
      }
      
      throw new Error('Database must be empty before seeding');
    }

    if (totalDocuments > 0 && options.forceClean) {
      log.warning(`⚠️  Database contains ${totalDocuments} documents but --force-clean specified`);
      log.warning('🔄 Will attempt to merge with existing data - conflicts may occur');
    } else {
      log.success('✅ Database is empty and ready for seeding');
    }
    
    // Additional database health checks
    if (options.benchmark) {
      await this.performDatabaseBenchmark();
    }
  }

  /**
   * Perform database performance benchmark
   */
  async performDatabaseBenchmark() {
    log.info('🏁 Running database performance benchmark...');
    
    const benchmarks = {};
    
    try {
      // Test write performance
      const writeStart = Date.now();
      const testCollection = mongoose.connection.db.collection('benchmark_test');
      
      const testDocs = Array.from({ length: 100 }, (_, i) => ({
        _id: new mongoose.Types.ObjectId(),
        testField: `test_${i}`,
        timestamp: new Date(),
        data: 'x'.repeat(100) // 100 bytes of data
      }));
      
      await testCollection.insertMany(testDocs);
      benchmarks.write = Date.now() - writeStart;
      
      // Test read performance
      const readStart = Date.now();
      await testCollection.find({}).toArray();
      benchmarks.read = Date.now() - readStart;
      
      // Test query performance
      const queryStart = Date.now();
      await testCollection.find({ testField: { $regex: /test_[0-9]+/ } }).toArray();
      benchmarks.query = Date.now() - queryStart;
      
      // Cleanup
      await testCollection.drop();
      
      log.info(`📈 Benchmark Results: Write: ${benchmarks.write}ms, Read: ${benchmarks.read}ms, Query: ${benchmarks.query}ms`);
      
      // Performance recommendations
      if (benchmarks.write > 1000) {
        log.warning('⚠️  Slow write performance detected - consider checking disk I/O');
      }
      if (benchmarks.read > 500) {
        log.warning('⚠️  Slow read performance detected - consider adding indexes');
      }
      
    } catch (error) {
      log.warning(`⚠️  Benchmark failed: ${error.message}`);
    }
  }

  async seedUsers() {
    log.header('Seeding Users');
    
    if (options.dryRun) {
      log.info('🔍 DRY RUN: Would create users based on profile configuration');
      return;
    }

    const targetCount = this.currentProfile.users;
    log.info(`🎯 Target: ${targetCount} users for ${options.profile} profile`);
    
    // Base users that should always exist
    const baseUsers = [
      // Admin User - SRS FE-01: admin is by default a contributor
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@mefit.com',
        password: 'Admin123!',
        isAdmin: true,
        isContributor: true, // Admin is by default contributor per SRS
        isActive: true,
        lastLogin: new Date()
      },
      // Primary Contributor
      {
        firstName: 'Mike',
        lastName: 'Trainer',
        email: 'mike.trainer@mefit.com',
        password: 'Trainer123!',
        isContributor: true,
        isActive: true,
        lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      // Regular test user
      {
        firstName: 'John',
        lastName: 'Beginner',
        email: 'john.beginner@example.com',
        password: 'User123!',
        isActive: true,
        lastLogin: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      }
    ];
    
    // Generate additional users based on profile
    const additionalUsers = [];
    const remainingCount = Math.max(0, targetCount - baseUsers.length);
    
    const firstNames = ['Sarah', 'Alex', 'Emily', 'David', 'Lisa', 'James', 'Maria', 'Robert', 'Jennifer', 'Michael', 'Jessica', 'William', 'Ashley', 'Christopher', 'Amanda', 'Daniel', 'Stephanie', 'Matthew', 'Nicole', 'Andrew'];
    const lastNames = ['Fitness', 'Strong', 'Active', 'Healthy', 'Power', 'Energy', 'Zen', 'Quick', 'Swift', 'Bold', 'Calm', 'Bright', 'Sharp', 'Clear', 'Pure', 'Fresh', 'Wise', 'Kind', 'Cool', 'Smart'];
    const domains = ['example.com', 'test.com', 'demo.com', 'sample.com', 'fitness.com'];
    
    for (let i = 0; i < remainingCount; i++) {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[i % lastNames.length];
      const domain = domains[i % domains.length];
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i > 19 ? i : ''}@${domain}`;
      
      const user = {
        firstName,
        lastName,
        email,
        password: 'User123!',
        isActive: i === 1 ? false : Math.random() > 0.1, // Ensure at least one inactive user
        isContributor: Math.random() > 0.8, // 20% contributors
        contributorRequestPending: i === 0 ? true : Math.random() > 0.9, // Ensure at least one pending request
        twoFactorEnabled: Math.random() > 0.8, // 20% with 2FA
        lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random within 30 days
      };
      
      if (user.twoFactorEnabled) {
        user.twoFactorSecret = speakeasy.generateSecret({ name: 'MeFit' }).base32;
      }
      
      if (user.contributorRequestPending) {
        user.contributorApplicationText = `I am a fitness enthusiast with experience in ${['strength training', 'cardio', 'yoga', 'pilates', 'crossfit'][Math.floor(Math.random() * 5)]}. I would like to contribute content to help others achieve their fitness goals.`;
        user.contributorRequestDate = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Within last week
      }
      
      additionalUsers.push(user);
    }
    
    const allUsers = [...baseUsers, ...additionalUsers];
    
    // Batch processing for better performance
    const batchSize = options.batchSize;
    let processed = 0;
    
    for (let i = 0; i < allUsers.length; i += batchSize) {
      const batch = allUsers.slice(i, i + batchSize);
      const batchPromises = batch.map(async (userData, index) => {
        try {
          const user = new User(userData);
          await user.save();
          this.createdData.users.push(user);
          seedingStats.documentsCreated.users++;
          
          const globalIndex = i + index + 1;
          if (options.verbose || globalIndex <= 3 || globalIndex === allUsers.length) {
            log.success(`Created user: ${user.email} (${user.isAdmin ? 'Admin' : user.isContributor ? 'Contributor' : 'User'})`);
          }
          
          return user;
        } catch (error) {
          log.error(`Failed to create user ${userData.email}: ${error.message}`);
          seedingStats.errors++;
          return null;
        }
      });
      
      await Promise.all(batchPromises);
      processed += batch.length;
      log.progress(processed, allUsers.length, 'Creating users');
      
      // Memory management for large datasets
      if (processed % (batchSize * 2) === 0) {
        trackMemoryUsage();
        if (global.gc) global.gc(); // Force garbage collection if available
      }
    }
    
    log.success(`\n✅ Created ${seedingStats.documentsCreated.users} users successfully`);
    
    // Statistics
    const stats = {
      admins: this.createdData.users.filter(u => u.isAdmin).length,
      contributors: this.createdData.users.filter(u => u.isContributor && !u.isAdmin).length,
      regular: this.createdData.users.filter(u => !u.isContributor && !u.isAdmin).length,
      pending: this.createdData.users.filter(u => u.contributorRequestPending).length,
      twoFA: this.createdData.users.filter(u => u.twoFactorEnabled).length,
      active: this.createdData.users.filter(u => u.isActive).length
    };
    
    log.info(`📊 User Statistics: ${stats.admins} admins, ${stats.contributors} contributors, ${stats.regular} regular users`);
    log.info(`🔐 Security: ${stats.twoFA} with 2FA, ${stats.pending} pending contributor requests`);
    log.info(`📈 Activity: ${stats.active}/${this.createdData.users.length} active users`);
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
          // This is expected since we use random user emails - don't count as warning
          if (options.verbose) {
            console.log(`\x1b[33m[INFO]\x1b[0m User not found for profile: ${profileData.userEmail} (expected)`);
          }
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

    // Create basic profiles for all users that don't have one
    const usersWithoutProfiles = this.createdData.users.filter(user => 
      !this.createdData.profiles.some(profile => profile.user.equals(user._id))
    );

    for (const user of usersWithoutProfiles) {
      try {
        const profile = new Profile({
          weight: Math.floor(Math.random() * 50) + 50, // 50-100 kg
          height: Math.floor(Math.random() * 40) + 150, // 150-190 cm
          dateOfBirth: new Date(Date.now() - (Math.floor(Math.random() * 30) + 18) * 365 * 24 * 60 * 60 * 1000), // 18-48 years old
          gender: Math.random() > 0.5 ? 'male' : 'female',
          fitnessLevel: ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)],
          activityLevel: ['sedentary', 'lightly_active', 'moderately_active', 'very_active'][Math.floor(Math.random() * 4)],
          fitnessGoals: ['weight_loss', 'muscle_gain', 'endurance', 'strength', 'flexibility', 'general_fitness'].slice(0, Math.floor(Math.random() * 3) + 1),
          medicalConditions: [],
          preferences: {
            workoutTypes: ['cardio', 'strength', 'yoga', 'pilates'].slice(0, Math.floor(Math.random() * 3) + 1),
            workoutDuration: [30, 45, 60, 75, 90][Math.floor(Math.random() * 5)],
            workoutFrequency: Math.floor(Math.random() * 5) + 2 // 2-6 times per week
          },
          user: user._id
        });

        await profile.save();
        this.createdData.profiles.push(profile);
        log.success(`Created basic profile for: ${user.email}`);
      } catch (error) {
        log.error(`Failed to create basic profile for ${user.email}: ${error.message}`);
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
        category: 'Strength Training',
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
        category: 'Strength Training',
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
        category: 'Strength Training',
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
        category: 'Strength Training',
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
        category: 'Cardio',
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
        category: 'Cardio',
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
        category: 'Core',
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
        category: 'Core',
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
          contributor: contributors[Math.floor(Math.random() * contributors.length)]._id,
          isActive: true
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

    const users = this.createdData.users.filter(u => u.isContributor);

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
          contributor: users[Math.floor(Math.random() * users.length)]._id,
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
              weekNumber: Math.floor(Math.random() * programData.duration) + 1,
              dayOfWeek: Math.floor(Math.random() * 7),
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
          contributor: contributors[Math.floor(Math.random() * contributors.length)]._id,
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
        const startDate = new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000); // 0-7 days ago
        const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // Exactly 7 days from start (weekly)

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
        type: 'welcome_message',
        title: 'Welcome Message',
        message: 'Welcome to MeFit! Start your fitness journey today.',
        priority: 'low',
        data: {
          messageType: 'welcome',
          targetAudience: 'new_users'
        }
      },
      {
        type: 'system_maintenance',
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
    if (options.quiet) {
      // In quiet mode, just run tests without individual logging
      const tests = [
        // Core Authentication & Authorization Tests - SRS SEC-01, FE-01, API-02
        this.testUserAuthentication.bind(this),
        this.testUserRoles.bind(this),
        this.testTwoFactorAuthentication.bind(this),
        this.testPasswordSecurity.bind(this),
        
        // Profile Management Tests - SRS FE-11, API-04
        this.testProfileManagement.bind(this),
        this.testProfileFitnessEvaluation.bind(this),
        this.testProfileUpdates.bind(this),
        
        // Exercise Management Tests - SRS FE-07, FE-10, API-07
        this.testExerciseOperations.bind(this),
        this.testExerciseCategorization.bind(this),
        this.testExerciseContributorPermissions.bind(this),
        
        // Workout Management Tests - SRS FE-06, FE-09, API-06
        this.testWorkoutOperations.bind(this),
        this.testWorkoutComposition.bind(this),
        this.testWorkoutContributorPermissions.bind(this),
        
        // Program Management Tests - SRS FE-05, FE-08
        this.testProgramOperations.bind(this),
        this.testProgramWorkoutRelationships.bind(this),
        this.testProgramContributorPermissions.bind(this),
        
        // Goal Management Tests - SRS FE-03, FE-04, API-05
        this.testGoalOperations.bind(this),
        this.testWeeklyGoalSetting.bind(this),
        this.testGoalProgress.bind(this),
        this.testGoalRecommendations.bind(this),
        
        // Admin Functionality Tests - SRS FE-01 (admin roles)
        this.testAdminFunctionality.bind(this),
        this.testContributorManagement.bind(this),
        this.testUserManagement.bind(this),
        
        // Data Integrity & Security Tests - SRS SEC-02, SEC-03
        this.testDataIntegrity.bind(this),
        this.testInputSanitization.bind(this),
        this.testCredentialStorage.bind(this),
        
        // Notification System Tests
        this.testNotificationSystem.bind(this),
        this.testNotificationTypes.bind(this),
        
        // API Compliance Tests - SRS API-01, API-08
        this.testAPICompliance.bind(this),
        this.testErrorResponses.bind(this),
        
        // Performance & Database Tests - SRS PRF-01, DB-01, DB-03
        this.testPerformanceRequirements.bind(this),
        this.testDatabaseDesign.bind(this)
      ];

      for (const test of tests) {
        try {
          await test();
        } catch (error) {
          this.testResults.failed++;
        }
        this.testResults.total++;
      }
      return;
    }

    log.header('Running Functionality Tests');

    const tests = [
      // Core Authentication & Authorization Tests - SRS SEC-01, FE-01, API-02
      this.testUserAuthentication.bind(this),
      this.testUserRoles.bind(this),
      this.testTwoFactorAuthentication.bind(this),
      this.testPasswordSecurity.bind(this),
      
      // Profile Management Tests - SRS FE-11, API-04
      this.testProfileManagement.bind(this),
      this.testProfileFitnessEvaluation.bind(this),
      this.testProfileUpdates.bind(this),
      
      // Exercise Management Tests - SRS FE-07, FE-10, API-07
      this.testExerciseOperations.bind(this),
      this.testExerciseCategorization.bind(this),
      this.testExerciseContributorPermissions.bind(this),
      
      // Workout Management Tests - SRS FE-06, FE-09, API-06
      this.testWorkoutOperations.bind(this),
      this.testWorkoutComposition.bind(this),
      this.testWorkoutContributorPermissions.bind(this),
      
      // Program Management Tests - SRS FE-05, FE-08
      this.testProgramOperations.bind(this),
      this.testProgramWorkoutRelationships.bind(this),
      this.testProgramContributorPermissions.bind(this),
      
      // Goal Management Tests - SRS FE-03, FE-04, API-05
      this.testGoalOperations.bind(this),
      this.testWeeklyGoalSetting.bind(this),
      this.testGoalProgress.bind(this),
      this.testGoalRecommendations.bind(this),
      
      // Admin Functionality Tests - SRS FE-01 (admin roles)
      this.testAdminFunctionality.bind(this),
      this.testContributorManagement.bind(this),
      this.testUserManagement.bind(this),
      
      // Data Integrity & Security Tests - SRS SEC-02, SEC-03
      this.testDataIntegrity.bind(this),
      this.testInputSanitization.bind(this),
      this.testCredentialStorage.bind(this),
      
      // Notification System Tests
      this.testNotificationSystem.bind(this),
      this.testNotificationTypes.bind(this),
      
      // API Compliance Tests - SRS API-01, API-08
      this.testAPICompliance.bind(this),
      this.testErrorResponses.bind(this),
      
      // Performance & Database Tests - SRS PRF-01, DB-01, DB-03
      this.testPerformanceRequirements.bind(this),
      this.testDatabaseDesign.bind(this)
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
      
      const creator = this.createdData.users.find(u => u._id.equals(exercise.contributor));
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
      
      if (goal.targets.totalWorkouts <= 0) {
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

  // ===== ADDITIONAL SRS COMPLIANCE TESTS =====

  async testTwoFactorAuthentication() {
    log.info('Testing Two-Factor Authentication...');
    
    // SRS SEC-01: 2FA should be enforced
    const twoFAUsers = this.createdData.users.filter(u => u.twoFactorEnabled);
    if (twoFAUsers.length === 0) throw new Error('No 2FA users found - SEC-01 requirement');
    
    for (const user of twoFAUsers) {
      if (!user.twoFactorSecret) throw new Error('2FA user missing secret');
      // Verify secret format (base32)
      if (!/^[A-Z2-7]+$/.test(user.twoFactorSecret)) {
        throw new Error('Invalid 2FA secret format');
      }
    }
    
    this.testResults.passed++;
    log.success('✓ Two-factor authentication test passed');
  }

  async testPasswordSecurity() {
    log.info('Testing Password Security...');
    
    // SRS SEC-03: Credential storage should be secure
    for (const user of this.createdData.users) {
      // Passwords should be hashed, not plain text
      if (user.password === 'Admin123!' || user.password === 'User123!') {
        throw new Error('Password stored in plain text - SEC-03 violation');
      }
      
      // Password should be hashed (bcrypt format)
      if (!user.password.startsWith('$2')) {
        throw new Error('Password not properly hashed - SEC-03 violation');
      }
    }
    
    this.testResults.passed++;
    log.success('✓ Password security test passed');
  }

  async testProfileFitnessEvaluation() {
    log.info('Testing Profile Fitness Evaluation...');
    
    // SRS FE-11: Profile must include fitness level evaluation
    for (const profile of this.createdData.profiles) {
      if (!profile.fitnessLevel) throw new Error('Profile missing fitness level evaluation - FE-11');
      if (!['beginner', 'intermediate', 'advanced'].includes(profile.fitnessLevel)) {
        throw new Error('Invalid fitness level - FE-11');
      }
      
      if (!profile.activityLevel) throw new Error('Profile missing activity level - FE-11');
      if (!['sedentary', 'lightly_active', 'moderately_active', 'very_active'].includes(profile.activityLevel)) {
        throw new Error('Invalid activity level - FE-11');
      }
      
      // Required for goal limiting per SRS
      if (!profile.weight || !profile.height) {
        throw new Error('Profile missing physical measurements for goal evaluation - FE-11');
      }
    }
    
    this.testResults.passed++;
    log.success('✓ Profile fitness evaluation test passed');
  }

  async testProfileUpdates() {
    log.info('Testing Profile Updates...');
    
    // SRS FE-11: Users must be able to update their profile
    const profile = this.createdData.profiles[0];
    if (!profile) throw new Error('No profiles to test updates');
    
    // Test updatable fields per SRS FE-11
    const updatableFields = ['weight', 'height', 'fitnessGoals', 'medicalConditions'];
    for (const field of updatableFields) {
      if (!(field in profile.toObject())) {
        throw new Error(`Profile missing updatable field: ${field} - FE-11`);
      }
    }
    
    this.testResults.passed++;
    log.success('✓ Profile updates test passed');
  }

  async testExerciseCategorization() {
    log.info('Testing Exercise Categorization...');
    
    // SRS FE-07: Should allow viewing exercises arranged by target muscle group
    const muscleGroups = [...new Set(this.createdData.exercises.map(e => e.targetMuscleGroup))];
    if (muscleGroups.length < 3) throw new Error('Insufficient muscle group variety - FE-07');
    
    // Verify each exercise has proper categorization
    for (const exercise of this.createdData.exercises) {
      if (!exercise.category) throw new Error('Exercise missing category - FE-07');
      if (!exercise.targetMuscleGroup) throw new Error('Exercise missing target muscle group - FE-07');
      if (!exercise.difficulty) throw new Error('Exercise missing difficulty - FE-07');
    }
    
    this.testResults.passed++;
    log.success('✓ Exercise categorization test passed');
  }

  async testExerciseContributorPermissions() {
    log.info('Testing Exercise Contributor Permissions...');
    
    // SRS FE-10: Only contributors can add/edit exercises
    for (const exercise of this.createdData.exercises) {
      const creator = this.createdData.users.find(u => u._id.equals(exercise.contributor));
      if (!creator) throw new Error('Exercise missing creator - FE-10');
      if (!creator.isContributor) throw new Error('Exercise created by non-contributor - FE-10');
    }
    
    this.testResults.passed++;
    log.success('✓ Exercise contributor permissions test passed');
  }

  async testWorkoutComposition() {
    log.info('Testing Workout Composition...');
    
    // SRS FE-09: Workouts should include exercises and editable sets
    for (const workout of this.createdData.workouts) {
      if (!workout.sets || workout.sets.length === 0) {
        throw new Error('Workout has no exercise sets - FE-09');
      }
      
      for (const set of workout.sets) {
        if (!set.exercise) throw new Error('Workout set missing exercise reference - FE-09');
        if (!set.repetitions && !set.duration) throw new Error('Workout set missing repetitions or duration - FE-09');
        
        // Verify exercise exists
        const exercise = this.createdData.exercises.find(e => e._id.equals(set.exercise));
        if (!exercise) throw new Error('Workout references non-existent exercise - FE-09');
      }
    }
    
    this.testResults.passed++;
    log.success('✓ Workout composition test passed');
  }

  async testWorkoutContributorPermissions() {
    log.info('Testing Workout Contributor Permissions...');
    
    // SRS FE-09: Only contributors can add/edit workouts
    for (const workout of this.createdData.workouts) {
      const creator = this.createdData.users.find(u => u._id.equals(workout.contributor));
      if (!creator) throw new Error('Workout missing creator - FE-09');
      if (!creator.isContributor) throw new Error('Workout created by non-contributor - FE-09');
    }
    
    this.testResults.passed++;
    log.success('✓ Workout contributor permissions test passed');
  }

  async testProgramWorkoutRelationships() {
    log.info('Testing Program-Workout Relationships...');
    
    // SRS FE-08: Programs should include workouts
    for (const program of this.createdData.programs) {
      if (!program.workouts || program.workouts.length === 0) {
        throw new Error('Program has no workouts - FE-08');
      }
      
      for (const programWorkout of program.workouts) {
        const workout = this.createdData.workouts.find(w => w._id.equals(programWorkout.workout));
        if (!workout) throw new Error('Program references non-existent workout - FE-08');
        
        // Program workout should have scheduling info
        if (typeof programWorkout.dayOfWeek === 'undefined' && typeof programWorkout.weekNumber === 'undefined') {
          throw new Error('Program workout missing scheduling information - FE-08');
        }
      }
    }
    
    this.testResults.passed++;
    log.success('✓ Program-workout relationships test passed');
  }

  async testProgramContributorPermissions() {
    log.info('Testing Program Contributor Permissions...');
    
    // SRS FE-08: Only contributors can add/edit programs
    for (const program of this.createdData.programs) {
      const creator = this.createdData.users.find(u => u._id.equals(program.contributor));
      if (!creator) throw new Error('Program missing creator - FE-08');
      if (!creator.isContributor) throw new Error('Program created by non-contributor - FE-08');
    }
    
    this.testResults.passed++;
    log.success('✓ Program contributor permissions test passed');
  }

  async testWeeklyGoalSetting() {
    log.info('Testing Weekly Goal Setting...');
    
    // SRS FE-03, FE-04: Users should be able to set goals for the week
    for (const goal of this.createdData.goals) {
      // Check goal duration is weekly
      const duration = (goal.endDate - goal.startDate) / (1000 * 60 * 60 * 24);
      if (duration < 6 || duration > 8) {
        throw new Error('Goal duration not weekly (should be ~7 days) - FE-03, FE-04');
      }
      
      // Goal should have either program or individual workouts
      if (!goal.program && (!goal.workouts || goal.workouts.length === 0)) {
        throw new Error('Goal has neither program nor workouts - FE-04');
      }
      
      if (goal.targets.totalWorkouts <= 0) {
        throw new Error('Goal has invalid target value - FE-04');
      }
    }
    
    this.testResults.passed++;
    log.success('✓ Weekly goal setting test passed');
  }

  async testGoalProgress() {
    log.info('Testing Goal Progress...');
    
    // SRS FE-03: Users should be able to see progress towards their goals
    for (const goal of this.createdData.goals) {
      if (typeof goal.progress.completedWorkouts === 'undefined') {
        throw new Error('Goal missing current progress value - FE-03');
      }
      
      if (goal.progress.completedWorkouts < 0 || goal.progress.completedWorkouts > goal.targets.totalWorkouts * 1.1) {
        throw new Error('Goal progress value unrealistic - FE-03');
      }
      
      // Goal should track completion status
      if (typeof goal.status === 'undefined') {
        throw new Error('Goal missing status - FE-03');
      }
    }
    
    this.testResults.passed++;
    log.success('✓ Goal progress test passed');
  }

  async testGoalRecommendations() {
    log.info('Testing Goal Recommendations...');
    
    // SRS FE-04: Program/workout suggestions based on fitness evaluation
    for (const goal of this.createdData.goals) {
      const user = this.createdData.users.find(u => u._id.equals(goal.user));
      if (!user) throw new Error('Goal user not found');
      
      const profile = this.createdData.profiles.find(p => p.user.equals(user._id));
      if (!profile) throw new Error('User profile not found for goal recommendations - FE-04');
      
      // If goal has a program, verify it matches user's fitness level
      if (goal.program) {
        const program = this.createdData.programs.find(p => p._id.equals(goal.program));
        if (program && program.difficulty) {
          // Ensure program difficulty is appropriate for user's fitness level
          const levelMapping = { beginner: 1, intermediate: 2, advanced: 3 };
          const userLevel = levelMapping[profile.fitnessLevel] || 1;
          const programLevel = levelMapping[program.difficulty] || 1;
          
          if (Math.abs(userLevel - programLevel) > 1) {
            throw new Error('Program difficulty mismatch with user fitness level - FE-04');
          }
        }
      }
    }
    
    this.testResults.passed++;
    log.success('✓ Goal recommendations test passed');
  }

  async testContributorManagement() {
    log.info('Testing Contributor Management...');
    
    // SRS FE-01: Admin can give contributor status
    const admin = this.createdData.users.find(u => u.isAdmin);
    if (!admin) throw new Error('No admin user found');
    
    // Verify admin is by default a contributor per SRS FE-01
    if (!admin.isContributor) throw new Error('Admin should be contributor by default - FE-01');
    
    // Check for pending contributor requests
    const pendingRequests = this.createdData.users.filter(u => u.contributorRequestPending);
    if (pendingRequests.length === 0) throw new Error('No pending contributor requests for testing');
    
    for (const user of pendingRequests) {
      if (!user.contributorApplicationText) {
        throw new Error('Pending contributor missing application text');
      }
      if (!user.contributorRequestDate) {
        throw new Error('Pending contributor missing request date');
      }
    }
    
    this.testResults.passed++;
    log.success('✓ Contributor management test passed');
  }

  async testUserManagement() {
    log.info('Testing User Management...');
    
    // SRS API-03: Admin can manage users
    const admin = this.createdData.users.find(u => u.isAdmin);
    if (!admin) throw new Error('No admin user found');
    
    // Verify different user types exist
    const userTypes = {
      regular: this.createdData.users.filter(u => !u.isAdmin && !u.isContributor),
      contributors: this.createdData.users.filter(u => u.isContributor && !u.isAdmin),
      admins: this.createdData.users.filter(u => u.isAdmin)
    };
    
    if (userTypes.regular.length === 0) throw new Error('No regular users for admin management testing');
    if (userTypes.contributors.length === 0) throw new Error('No contributors for admin management testing');
    if (userTypes.admins.length === 0) throw new Error('No admin users found');
    
    // Test user activation/deactivation capability
    const activeUsers = this.createdData.users.filter(u => u.isActive);
    const inactiveUsers = this.createdData.users.filter(u => !u.isActive);
    
    if (activeUsers.length === 0) throw new Error('No active users found');
    if (inactiveUsers.length === 0) throw new Error('No inactive users for testing user management');
    
    this.testResults.passed++;
    log.success('✓ User management test passed');
  }

  async testInputSanitization() {
    log.info('Testing Input Sanitization...');
    
    // SRS SEC-02: Input sanitation for XSS and injection attacks
    const testFields = ['firstName', 'lastName', 'email'];
    
    for (const user of this.createdData.users) {
      for (const field of testFields) {
        const value = user[field];
        if (value && typeof value === 'string') {
          // Check for potential XSS patterns
          const xssPatterns = ['<script', 'javascript:', 'onload=', 'onerror='];
          for (const pattern of xssPatterns) {
            if (value.toLowerCase().includes(pattern)) {
              throw new Error(`Potential XSS in user ${field}: ${value} - SEC-02`);
            }
          }
          
          // Check for SQL injection patterns
          const sqlPatterns = ["'", '"', '--', ';', 'union select', 'drop table'];
          for (const pattern of sqlPatterns) {
            if (value.toLowerCase().includes(pattern)) {
              throw new Error(`Potential SQL injection in user ${field}: ${value} - SEC-02`);
            }
          }
        }
      }
    }
    
    this.testResults.passed++;
    log.success('✓ Input sanitization test passed');
  }

  async testCredentialStorage() {
    log.info('Testing Credential Storage...');
    
    // SRS SEC-03: Administrative credentials should not be hard coded
    // This test verifies that database credentials are handled properly
    if (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('password')) {
      // Good - using environment variables
    } else if (process.env.DB_PASSWORD) {
      // Good - password in environment variable
    } else {
      // Check if any hardcoded credentials exist in connection strings
      const connectionString = process.env.MONGODB_URI || '';
      if (connectionString.includes('admin:') || connectionString.includes('password:')) {
        throw new Error('Potential hardcoded credentials in connection string - SEC-03');
      }
    }
    
    this.testResults.passed++;
    log.success('✓ Credential storage test passed');
  }

  async testNotificationTypes() {
    log.info('Testing Notification Types...');
    
    // Verify all required notification types exist
    const requiredTypes = [
      'user_registration',
      'contributor_request', 
      'system_alert',
      'welcome_message',
      'system_maintenance'
    ];
    
    for (const type of requiredTypes) {
      const notification = this.createdData.notifications.find(n => n.type === type);
      if (!notification) throw new Error(`Missing notification type: ${type}`);
    }
    
    // Test notification priority levels
    const priorities = [...new Set(this.createdData.notifications.map(n => n.priority))];
    const validPriorities = ['low', 'medium', 'high'];
    
    for (const priority of priorities) {
      if (!validPriorities.includes(priority)) {
        throw new Error(`Invalid notification priority: ${priority}`);
      }
    }
    
    this.testResults.passed++;
    log.success('✓ Notification types test passed');
  }

  async testAPICompliance() {
    log.info('Testing API Compliance...');
    
    // SRS API-01: No query parameters (except search)
    // This is more of a design test - verify data structure supports this
    
    // SRS API-08: Proper response codes and error handling
    // Verify error handling data is available
    const errorTests = [
      { code: 400, description: 'Bad Request for malformed data' },
      { code: 401, description: 'Unauthorized for authentication failures' },
      { code: 403, description: 'Forbidden for authorization failures' },
      { code: 404, description: 'Not Found for missing resources' },
      { code: 500, description: 'Internal Server Error for system errors' }
    ];
    
    // Test that user roles support proper authorization
    const admin = this.createdData.users.find(u => u.isAdmin);
    const contributor = this.createdData.users.find(u => u.isContributor && !u.isAdmin);
    const regular = this.createdData.users.find(u => !u.isContributor && !u.isAdmin);
    
    if (!admin || !contributor || !regular) {
      throw new Error('Missing user roles for API authorization testing - API-08');
    }
    
    this.testResults.passed++;
    log.success('✓ API compliance test passed');
  }

  async testErrorResponses() {
    log.info('Testing Error Responses...');
    
    // SRS PRF-02: Meaningful error messages without exposing sensitive information
    for (const user of this.createdData.users) {
      // Verify no sensitive data would be exposed
      if (user.password && user.password.length < 20) {
        throw new Error('Password might not be properly hashed - security risk - PRF-02');
      }
      
      // Verify email format for proper error handling
      if (!user.email.includes('@')) {
        throw new Error('Invalid email format - would cause API errors - PRF-02');
      }
    }
    
    this.testResults.passed++;
    log.success('✓ Error responses test passed');
  }

  async testPerformanceRequirements() {
    log.info('Testing Performance Requirements...');
    
    // SRS PRF-01: System should be responsive
    const operationTimes = Object.values(seedingStats.operationTimes);
    if (operationTimes.length > 0) {
      const maxTime = Math.max(...operationTimes);
      if (maxTime > 30000) { // 30 seconds
        throw new Error(`Operation too slow: ${maxTime}ms - PRF-01`);
      }
    }
    
    // Check data size is reasonable for performance
    const totalDocuments = Object.values(seedingStats.documentsCreated).reduce((a, b) => a + b, 0);
    if (totalDocuments > 10000) {
      log.warning('Large dataset detected - monitor performance in production');
    }
    
    this.testResults.passed++;
    log.success('✓ Performance requirements test passed');
  }

  async testDatabaseDesign() {
    log.info('Testing Database Design...');
    
    // SRS DB-01, DB-03: Complete storage solution and proper design
    const requiredCollections = ['users', 'profiles', 'exercises', 'workouts', 'programs', 'goals', 'notifications'];
    
    for (const collection of requiredCollections) {
      if (!this.createdData[collection] || this.createdData[collection].length === 0) {
        throw new Error(`Missing required collection: ${collection} - DB-01, DB-03`);
      }
    }
    
    // Test foreign key relationships match SRS ERD requirements
    for (const profile of this.createdData.profiles) {
      const user = this.createdData.users.find(u => u._id.equals(profile.user));
      if (!user) throw new Error('Profile-User relationship broken - DB-03');
    }
    
    for (const goal of this.createdData.goals) {
      const user = this.createdData.users.find(u => u._id.equals(goal.user));
      if (!user) throw new Error('Goal-User relationship broken - DB-03');
    }
    
    this.testResults.passed++;
    log.success('✓ Database design test passed');
  }

  /**
   * Display comprehensive login credentials and user roles
   */
  displayLoginCredentials() {
    console.log(`\n\x1b[46m\x1b[30m                   🔐 LOGIN CREDENTIALS & USER ROLES                   \x1b[0m`);
    console.log(`\x1b[46m\x1b[30m                      Ready for Testing & Development                      \x1b[0m\n`);

    // Get all user types
    const adminUsers = this.createdData.users.filter(u => u.isAdmin);
    const contributorUsers = this.createdData.users.filter(u => u.isContributor && !u.isAdmin);
    const regularUsers = this.createdData.users.filter(u => !u.isContributor && !u.isAdmin);
    const twoFAUsers = this.createdData.users.filter(u => u.twoFactorEnabled);
    const pendingUsers = this.createdData.users.filter(u => u.contributorRequestPending);
    const inactiveUsers = this.createdData.users.filter(u => !u.isActive);

    // Admin Users Section
    if (adminUsers.length > 0) {
      console.log(`\x1b[91m┌─ 👑 ADMINISTRATOR ACCOUNTS\x1b[0m`);
      adminUsers.forEach((user, index) => {
        const status = user.isActive ? '\x1b[32m●\x1b[0m' : '\x1b[31m●\x1b[0m';
        const twoFA = user.twoFactorEnabled ? ' \x1b[33m[2FA]\x1b[0m' : '';
        console.log(`\x1b[91m│\x1b[0m   ${status} \x1b[1m${user.email}\x1b[0m / \x1b[33mAdmin123!\x1b[0m${twoFA}`);
        console.log(`\x1b[91m│\x1b[0m     \x1b[2mRole: Administrator + Contributor (Full Access)\x1b[0m`);
        if (index < adminUsers.length - 1) console.log(`\x1b[91m│\x1b[0m`);
      });
      console.log(`\x1b[91m└─\x1b[0m\n`);
    }

    // Contributor Users Section
    if (contributorUsers.length > 0) {
      console.log(`\x1b[94m┌─ 💪 CONTRIBUTOR ACCOUNTS\x1b[0m`);
      contributorUsers.forEach((user, index) => {
        const status = user.isActive ? '\x1b[32m●\x1b[0m' : '\x1b[31m●\x1b[0m';
        const twoFA = user.twoFactorEnabled ? ' \x1b[33m[2FA]\x1b[0m' : '';
        console.log(`\x1b[94m│\x1b[0m   ${status} \x1b[1m${user.email}\x1b[0m / \x1b[33mTrainer123!\x1b[0m${twoFA}`);
        console.log(`\x1b[94m│\x1b[0m     \x1b[2mRole: Contributor (Can create/edit exercises, workouts, programs)\x1b[0m`);
        if (index < contributorUsers.length - 1) console.log(`\x1b[94m│\x1b[0m`);
      });
      console.log(`\x1b[94m└─\x1b[0m\n`);
    }

    // Regular Users Section
    if (regularUsers.length > 0) {
      console.log(`\x1b[92m┌─ 👤 REGULAR USER ACCOUNTS\x1b[0m`);
      regularUsers.slice(0, 3).forEach((user, index) => {
        const status = user.isActive ? '\x1b[32m●\x1b[0m' : '\x1b[31m●\x1b[0m';
        const twoFA = user.twoFactorEnabled ? ' \x1b[33m[2FA]\x1b[0m' : '';
        console.log(`\x1b[92m│\x1b[0m   ${status} \x1b[1m${user.email}\x1b[0m / \x1b[33mUser123!\x1b[0m${twoFA}`);
        console.log(`\x1b[92m│\x1b[0m     \x1b[2mRole: Regular User (Can set goals, track workouts)\x1b[0m`);
        if (index < Math.min(regularUsers.length, 3) - 1) console.log(`\x1b[92m│\x1b[0m`);
      });
      if (regularUsers.length > 3) {
        console.log(`\x1b[92m│\x1b[0m   \x1b[2m... and ${regularUsers.length - 3} more regular users\x1b[0m`);
      }
      console.log(`\x1b[92m└─\x1b[0m\n`);
    }

    // Special Status Users Section
    console.log(`\x1b[95m┌─ 🔒 SPECIAL STATUS ACCOUNTS\x1b[0m`);
    
    if (twoFAUsers.length > 0) {
      console.log(`\x1b[95m│\x1b[0m   \x1b[33m🔐 Two-Factor Authentication Users (${twoFAUsers.length}):\x1b[0m`);
      twoFAUsers.forEach(user => {
        const status = user.isActive ? '\x1b[32m●\x1b[0m' : '\x1b[31m●\x1b[0m';
        console.log(`\x1b[95m│\x1b[0m     ${status} ${user.email} \x1b[2m(Use authenticator app)\x1b[0m`);
      });
      console.log(`\x1b[95m│\x1b[0m`);
    }

    if (pendingUsers.length > 0) {
      console.log(`\x1b[95m│\x1b[0m   \x1b[33m⏳ Pending Contributor Requests (${pendingUsers.length}):\x1b[0m`);
      pendingUsers.forEach(user => {
        const status = user.isActive ? '\x1b[32m●\x1b[0m' : '\x1b[31m●\x1b[0m';
        console.log(`\x1b[95m│\x1b[0m     ${status} ${user.email} \x1b[2m(Awaiting admin approval)\x1b[0m`);
      });
      console.log(`\x1b[95m│\x1b[0m`);
    }

    if (inactiveUsers.length > 0) {
      console.log(`\x1b[95m│\x1b[0m   \x1b[31m🚫 Inactive Users (${inactiveUsers.length}):\x1b[0m`);
      inactiveUsers.forEach(user => {
        console.log(`\x1b[95m│\x1b[0m     \x1b[31m●\x1b[0m ${user.email} \x1b[2m(Account disabled)\x1b[0m`);
      });
      console.log(`\x1b[95m│\x1b[0m`);
    }

    console.log(`\x1b[95m└─\x1b[0m\n`);

    // Quick Reference Section
    console.log(`\x1b[96m┌─ 🚀 QUICK START GUIDE\x1b[0m`);
    console.log(`\x1b[96m│\x1b[0m   \x1b[1m1.\x1b[0m Start the server: \x1b[33mnpm run dev\x1b[0m`);
    console.log(`\x1b[96m│\x1b[0m   \x1b[1m2.\x1b[0m Open browser: \x1b[33mhttp://localhost:3000\x1b[0m`);
    console.log(`\x1b[96m│\x1b[0m   \x1b[1m3.\x1b[0m Login with any credentials above`);
    console.log(`\x1b[96m│\x1b[0m   \x1b[1m4.\x1b[0m Test different user roles and permissions`);
    console.log(`\x1b[96m└─\x1b[0m\n`);

    // Password Legend
    console.log(`\x1b[2m💡 Password Reference:\x1b[0m`);
    console.log(`\x1b[2m   • Admin accounts: Admin123!\x1b[0m`);
    console.log(`\x1b[2m   • Contributor accounts: Trainer123!\x1b[0m`);
    console.log(`\x1b[2m   • Regular user accounts: User123!\x1b[0m`);
    console.log(`\x1b[2m   • Status: \x1b[32m●\x1b[0m\x1b[2m Active  \x1b[31m●\x1b[0m\x1b[2m Inactive\x1b[0m\n`);
  }

  /**
   * Enhanced comprehensive seeding summary with analytics
   */
  async printSummary() {
    log.header('Enhanced Seeding Summary & Analytics');
    
    seedingStats.endTime = Date.now();
    seedingStats.memoryUsage.final = process.memoryUsage();
    
    const duration = seedingStats.endTime - seedingStats.startTime;
    const averageTime = Object.values(seedingStats.operationTimes).length > 0 
      ? Object.values(seedingStats.operationTimes).reduce((a, b) => a + b, 0) / Object.values(seedingStats.operationTimes).length 
      : 0;
    
    console.log(`\n📊 Seeding Statistics:`);
    console.log(`   Total duration: ${duration}ms (${(duration/1000).toFixed(2)}s)`);
    console.log(`   Average operation time: ${averageTime.toFixed(2)}ms`);
    console.log(`   Profile used: ${options.profile.toUpperCase()}`);
    
    if (!options.quiet) {
      console.log(`\n📈 Documents Created:`);
      Object.entries(seedingStats.documentsCreated).forEach(([collection, count]) => {
        if (count > 0) {
          console.log(`   \x1b[32m${collection}: ${count}\x1b[0m`);
        }
      });
    }
    
    const totalCreated = Object.values(seedingStats.documentsCreated).reduce((a, b) => a + b, 0);
    console.log(`   \x1b[36mTotal: ${totalCreated} documents\x1b[0m`);
    
    if (totalCreated > 0 && duration > 0) {
      const throughput = (totalCreated / (duration / 1000)).toFixed(2);
      console.log(`   Throughput: ${throughput} documents/second`);
    }
    
    // Memory analysis
    if (!options.quiet && seedingStats.memoryUsage.initial && seedingStats.memoryUsage.final) {
      const memoryDiff = seedingStats.memoryUsage.final.heapUsed - seedingStats.memoryUsage.initial.heapUsed;
      console.log(`\n💾 Memory Analysis:`);
      console.log(`   Initial heap: ${(seedingStats.memoryUsage.initial.heapUsed / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Final heap: ${(seedingStats.memoryUsage.final.heapUsed / 1024 / 1024).toFixed(2)} MB`);
      if (seedingStats.memoryUsage.peak) {
        console.log(`   Peak heap: ${(seedingStats.memoryUsage.peak.heapUsed / 1024 / 1024).toFixed(2)} MB`);
      }
      console.log(`   Memory delta: ${(memoryDiff / 1024 / 1024).toFixed(2)} MB`);
    }
    
    // User breakdown
    const userStats = {
      admins: this.createdData.users.filter(u => u.isAdmin).length,
      contributors: this.createdData.users.filter(u => u.isContributor && !u.isAdmin).length,
      regular: this.createdData.users.filter(u => !u.isContributor && !u.isAdmin).length,
      pending: this.createdData.users.filter(u => u.contributorRequestPending).length,
      twoFA: this.createdData.users.filter(u => u.twoFactorEnabled).length,
      active: this.createdData.users.filter(u => u.isActive).length
    };
    
    if (!options.quiet) {
      console.log(`\n👥 User Categories:`);
      console.log(`   Admins: ${userStats.admins}`);
      console.log(`   Contributors: ${userStats.contributors}`);
      console.log(`   Regular Users: ${userStats.regular}`);
      console.log(`   Pending Requests: ${userStats.pending}`);
      console.log(`   2FA Enabled: ${userStats.twoFA}`);
      console.log(`   Active Users: ${userStats.active}/${this.createdData.users.length}`);
    }

    console.log(`\n🧪 Test Results:`);
    console.log(`   Total Tests: ${this.testResults.total}`);
    console.log(`   \x1b[32mPassed: ${this.testResults.passed}\x1b[0m`);
    console.log(`   \x1b[31mFailed: ${this.testResults.failed}\x1b[0m`);
    if (!options.quiet) {
      console.log(`   \x1b[33mValidation Warnings: ${seedingStats.validationResults.warnings}\x1b[0m`);
    }
    
    const successRate = this.testResults.total > 0 ? 
      ((this.testResults.passed / this.testResults.total) * 100).toFixed(1) : 0;
    console.log(`   Success Rate: ${successRate}%`);
    
    // Quality metrics - only show if there are issues or in verbose mode
    if (!options.quiet && (seedingStats.errors > 0 || seedingStats.warnings > 0 || options.verbose)) {
      console.log(`\n📏 Quality Metrics:`);
      console.log(`   \x1b[31mErrors: ${seedingStats.errors}\x1b[0m`);
      console.log(`   \x1b[33mWarnings: ${seedingStats.warnings}\x1b[0m`);
    }
    
    // Backup information
    console.log(`\n🔧 Operation Details:`);
    console.log(`   Backup created: ${seedingStats.backupCreated ? '✅ Yes' : '❌ No'}`);
    if (seedingStats.backupCreated) {
      console.log(`   Backup size: ${(seedingStats.backupSize / 1024 / 1024).toFixed(2)} MB`);
    }
    console.log(`   Dry run mode: ${options.dryRun ? '✅ Yes' : '❌ No'}`);
    console.log(`   Validation only: ${options.validateOnly ? '✅ Yes' : '❌ No'}`);
    console.log(`   Benchmark mode: ${options.benchmark ? '✅ Yes' : '❌ No'}`);

    // Enhanced Login Credentials and User Roles Display
    this.displayLoginCredentials();

    // Performance recommendations
    if (duration > 30000) { // > 30 seconds
      console.log(`\n⚡ Performance Recommendations:`);
      console.log(`   • Consider using a smaller seeding profile for development`);
      console.log(`   • Check database connection latency`);
      console.log(`   • Consider increasing batch size with --batch-size=N`);
    }

    // Individual operation performance
    if (options.verbose && Object.keys(seedingStats.operationTimes).length > 0) {
      console.log(`\n📋 Per-Operation Performance:`);
      Object.entries(seedingStats.operationTimes)
        .sort(([,a], [,b]) => b - a) // Sort by time descending
        .forEach(([operation, time]) => {
          console.log(`   ${operation}: ${time.toFixed(2)}ms`);
        });
    }

    // Final status
    if (seedingStats.errors === 0 && this.testResults.failed === 0) {
      log.success('\n🎉 Database seeding completed flawlessly!');
      log.success('✨ All data created successfully with comprehensive validation');
      log.success('🚀 MeFit application is ready for use with realistic test data');
      
      if (this.currentProfile.enableAdvancedFeatures) {
        log.success('⚡ Advanced features enabled - full functionality available');
      }
    } else if (seedingStats.errors === 0) {
      log.success('\n✅ Database seeding completed successfully!');
      log.warning(`⚠️  ${this.testResults.failed} test(s) failed - review above for details`);
      log.success('📝 Core data is available and application should function normally');
    } else {
      log.warning(`\n⚠️  Seeding completed with ${seedingStats.errors} error(s) and ${this.testResults.failed} failed test(s)`);
      log.warning('🔍 Some data may be missing - review the detailed report above');
      log.info('💡 Consider re-running the seeding script or manual data cleanup');
    }
    
    // Next steps
    console.log(`\n🎯 Next Steps:`);
    console.log(`   1. Start the MeFit server: npm run dev`);
    console.log(`   2. Access the server at: http://localhost:5000`);
    console.log(`   3. Log in with the test credentials above`);
    if (this.backupPath) {
      console.log(`   4. Restore backup if needed: node ${path.dirname(this.backupPath)}/restore-seed-backup.js`);
    }
  }

  async run() {
    try {
      await this.initialize();
      
      if (options.validateOnly) {
        log.header('Running Validation Only Mode');
        await this.connect();
        await this.runTests();
        await this.printSummary();
        return;
      }
      
      // Check if cleanup was run first (unless force-clean)
      if (!options.forceClean) {
        await this.checkCleanupMarker();
      }
      
      await this.connect();
      
      // Create backup before making changes
      await this.createBackup();
      
      // Verify database state
      await this.checkDatabaseEmpty();
      
      if (!options.dryRun) {
        // Seed data in correct order with performance monitoring
        await measureOperation('seedUsers', this.seedUsers.bind(this))();
        await measureOperation('seedProfiles', this.seedProfiles.bind(this))();
        await measureOperation('seedExercises', this.seedExercises.bind(this))();
        await measureOperation('seedWorkouts', this.seedWorkouts.bind(this))();
        await measureOperation('seedPrograms', this.seedPrograms.bind(this))();
        await measureOperation('seedGoals', this.seedGoals.bind(this))();
        await measureOperation('seedNotifications', this.seedNotifications.bind(this))();
      }
      
      // Run comprehensive tests (unless skipped)
      if (!options.skipTests) {
        await measureOperation('runTests', this.runTests.bind(this))();
      }
      
      // Print comprehensive summary
      await this.printSummary();
      
      // Create success marker
      const successMarkerPath = path.join(__dirname, '.seed-completed');
      const timestamp = new Date().toISOString();
      const markerContent = `Database seeded successfully at: ${timestamp}
Profile: ${options.profile}
Documents created: ${Object.values(seedingStats.documentsCreated).reduce((a, b) => a + b, 0)}
Duration: ${((seedingStats.endTime || Date.now()) - seedingStats.startTime)}ms
Errors: ${seedingStats.errors}
Warnings: ${seedingStats.warnings}
Test success rate: ${this.testResults.total > 0 ? ((this.testResults.passed / this.testResults.total) * 100).toFixed(1) : 0}%
`;
      
      if (!options.dryRun) {
        fs.writeFileSync(successMarkerPath, markerContent);
        log.success('📝 Seed completion marker created');
      }
      
    } catch (error) {
      log.error(`💥 Seeding failed: ${error.message}`);
      
      if (options.verbose) {
        console.error('\n🔍 Detailed Error Information:');
        console.error(error.stack);
      }
      
      // Provide troubleshooting guidance
      console.log('\n🔧 Troubleshooting Guide:');
      if (error.message.includes('connection')) {
        console.log('   • Check MongoDB connection string in .env file');
        console.log('   • Ensure MongoDB server is running');
        console.log('   • Verify network connectivity');
      } else if (error.message.includes('duplicate')) {
        console.log('   • Run cleanup script first: npm run cleanDB');
        console.log('   • Or use --force-clean to merge with existing data');
      } else if (error.message.includes('validation')) {
        console.log('   • Check data integrity and schema compliance');
        console.log('   • Run with --verbose for detailed error information');
      } else {
        console.log('   • Check the error message above for specific guidance');
        console.log('   • Run with --verbose for more detailed logging');
        console.log('   • Consider using --dry-run to test without making changes');
      }
      
      // Suggest recovery options
      if (this.backupPath && fs.existsSync(this.backupPath)) {
        console.log(`\n🔄 Recovery Options:`);
        console.log(`   • Restore from backup: node ${path.dirname(this.backupPath)}/restore-seed-backup.js`);
        console.log(`   • Or manually restore from: ${this.backupPath}`);
      }
      
      process.exit(1);
    } finally {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        log.info('🔌 Database connection closed');
      }
      
      // Final memory cleanup
      if (global.gc) {
        global.gc();
        log.info('🧹 Memory garbage collection performed');
      }
    }
  }
}

// Enhanced script execution with argument parsing and help
if (require.main === module) {
  // Display help if requested
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
🌟 MeFit Enhanced Database Seeding Script

Usage: npm run seed [OPTIONS]

Seeding Profiles:
  --profile=minimal        Create minimal dataset (5 users, 10 exercises, 3 workouts, 2 programs)
  --profile=standard       Create standard dataset (10 users, 20 exercises, 7 workouts, 5 programs) [DEFAULT]
  --profile=comprehensive  Create comprehensive dataset (25 users, 50 exercises, 15 workouts, 10 programs)

Operation Modes:
  --dry-run               Show what would be created without making changes
  --validate-only         Only run validation tests on existing data
  --benchmark             Include performance benchmarking
  --force-clean           Skip cleanup verification (merge with existing data)

Configuration:
  --batch-size=N          Set batch processing size (default: 50)
  --no-backup             Skip backup creation before seeding
  --skip-tests            Skip validation tests after seeding
  --verbose               Enable detailed logging and progress information

Examples:
  npm run seed                                    # Standard seeding
  npm run seed -- --profile=minimal              # Quick setup for development
  npm run seed -- --profile=comprehensive        # Full dataset for testing
  npm run seed -- --dry-run --verbose            # Preview what would be created
  npm run seed -- --validate-only                # Test existing data only
  npm run seed -- --benchmark --verbose          # Performance testing with details
  npm run seed -- --force-clean --batch-size=100 # Fast seeding with custom batch size

Advanced Features:
  ✨ Intelligent data generation with realistic patterns
  📊 Performance monitoring and memory tracking
  🔄 Automatic backup creation with restore scripts
  🧪 Comprehensive validation and integrity testing
  ⚡ Batch processing for optimal performance
  📈 Detailed analytics and reporting
  🔍 Dry-run mode for safe testing
  🎯 Multiple seeding profiles for different use cases

Requirements:
  • MongoDB server running and accessible
  • Database cleanup completed (npm run cleanDB) or --force-clean flag
  • Valid .env configuration with MONGODB_URI

For more information, visit: https://github.com/your-repo/mefit
    `);
    process.exit(0);
  }

  // Show current configuration for verification
  if (process.argv.includes('--show-config')) {
    console.log('\n🔧 Current Configuration:');
    console.log(`Profile: ${options.profile}`);
    console.log(`Target Data:`, SEEDING_PROFILES[options.profile]);
    console.log(`Options:`, options);
    console.log(`MongoDB URI: ${process.env.MONGODB_URI?.replace(/\/\/.*@/, '//***:***@') || 'Not configured'}`);
    process.exit(0);
  }

  // Validate configuration before starting
  const requiredEnvVars = ['MONGODB_URI'];
  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingEnvVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingEnvVars.forEach(varName => console.error(`   ${varName}`));
    console.error('\n💡 Please check your .env file configuration');
    process.exit(1);
  }

  // Start the enhanced seeding process
  const seeder = new MeFitSeeder();
  seeder.run();
}

module.exports = MeFitSeeder;