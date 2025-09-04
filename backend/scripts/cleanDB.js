#!/usr/bin/env node

/**
 * Database Cleaning Script for MeFit Application
 * 
 * This script cleans all collections in the MeFit database.
 * Run this before seeding the database to ensure a clean state.
 * 
 * Features:
 * - Comprehensive collection cleanup
 * - Safety checks and production protection
 * - Detailed logging with color-coded output
 * - Cleanup verification and statistics
 * - Marker file creation for seed script dependency
 * 
 * Usage: npm run cleanDB
 */

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import all models
const User = require('../models/User');
const Exercise = require('../models/Exercise');
const Program = require('../models/Program');
const Workout = require('../models/Workout');
const Goal = require('../models/Goal');
const Profile = require('../models/Profile');
const Notification = require('../models/Notification');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mefit';

// Enhanced logging utility (matching seed script style)
const log = {
  info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`),
  warning: (msg) => console.log(`\x1b[33m[WARNING]\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
  header: (msg) => console.log(`\n\x1b[35m=== ${msg} ===\x1b[0m`)
};

// Statistics tracking
const cleanupStats = {
  collectionsProcessed: 0,
  totalDocumentsDeleted: 0,
  collectionsNotFound: 0,
  errors: 0,
  startTime: null,
  endTime: null
};

/**
 * Connect to MongoDB with enhanced error handling
 */
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    log.success('Connected to MongoDB');
    log.info(`Database: ${mongoose.connection.db.databaseName}`);
    log.info(`Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
  } catch (error) {
    log.error(`MongoDB connection failed: ${error.message}`);
    throw error;
  }
}

/**
 * Check database status before cleanup
 */
async function checkDatabaseStatus() {
  log.header('Pre-Cleanup Database Analysis');
  
  const collections = [
    'users', 'profiles', 'exercises', 'workouts', 
    'programs', 'goals', 'notifications'
  ];

  let totalDocuments = 0;
  const collectionCounts = {};

  for (const collectionName of collections) {
    try {
      const count = await mongoose.connection.db.collection(collectionName).countDocuments();
      collectionCounts[collectionName] = count;
      totalDocuments += count;
      
      if (count > 0) {
        log.info(`📊 ${collectionName}: ${count} documents`);
      } else {
        log.info(`📊 ${collectionName}: empty`);
      }
    } catch (error) {
      log.warning(`Collection '${collectionName}' does not exist`);
      collectionCounts[collectionName] = 0;
    }
  }

  log.info(`\n📈 Total documents in database: ${totalDocuments}`);
  
  if (totalDocuments === 0) {
    log.warning('Database is already empty!');
    return false; // No cleanup needed
  }

  return { totalDocuments, collectionCounts };
}

/**
 * Enhanced database cleanup with detailed tracking
 */
async function cleanDatabase() {
  cleanupStats.startTime = new Date();
  log.header('Starting Database Cleanup');
  
  const collections = [
    { name: 'Users', model: User, priority: 1 },
    { name: 'Profiles', model: Profile, priority: 2 },
    { name: 'Exercises', model: Exercise, priority: 3 },
    { name: 'Workouts', model: Workout, priority: 4 },
    { name: 'Programs', model: Program, priority: 5 },
    { name: 'Goals', model: Goal, priority: 6 },
    { name: 'Notifications', model: Notification, priority: 7 }
  ];

  // Sort by priority to handle dependencies
  collections.sort((a, b) => b.priority - a.priority);

  for (const collection of collections) {
    try {
      cleanupStats.collectionsProcessed++;
      
      // Check if collection exists and has documents
      const collectionExists = await mongoose.connection.db.listCollections({ name: collection.model.collection.name }).hasNext();
      
      if (!collectionExists) {
        log.info(`⏭️  ${collection.name}: Collection doesn't exist (skipping)`);
        cleanupStats.collectionsNotFound++;
        continue;
      }

      const initialCount = await collection.model.countDocuments();
      
      if (initialCount === 0) {
        log.info(`⏭️  ${collection.name}: Already empty (0 documents)`);
        continue;
      }

      // Perform deletion
      const deleteResult = await collection.model.deleteMany({});
      cleanupStats.totalDocumentsDeleted += deleteResult.deletedCount;
      
      // Verify deletion
      const remainingCount = await collection.model.countDocuments();
      
      if (remainingCount === 0) {
        log.success(`🗑️  ${collection.name}: ${deleteResult.deletedCount} documents deleted successfully`);
      } else {
        log.error(`❌ ${collection.name}: Incomplete deletion! ${remainingCount} documents remain`);
        cleanupStats.errors++;
      }
      
    } catch (error) {
      log.error(`❌ Error cleaning ${collection.name}: ${error.message}`);
      cleanupStats.errors++;
    }
  }

  cleanupStats.endTime = new Date();
}

/**
 * Verify cleanup completion and create markers
 */
async function verifyCleanupAndCreateMarkers() {
  log.header('Post-Cleanup Verification');
  
  const collections = [
    'users', 'profiles', 'exercises', 'workouts', 
    'programs', 'goals', 'notifications'
  ];

  let remainingDocuments = 0;
  const verificationResults = {};

  for (const collectionName of collections) {
    try {
      const count = await mongoose.connection.db.collection(collectionName).countDocuments();
      verificationResults[collectionName] = count;
      remainingDocuments += count;
      
      if (count > 0) {
        log.error(`❌ ${collectionName}: ${count} documents still remain!`);
      } else {
        log.success(`✅ ${collectionName}: Successfully cleaned`);
      }
    } catch (error) {
      log.info(`✅ ${collectionName}: Collection removed or doesn't exist`);
      verificationResults[collectionName] = 0;
    }
  }

  // Create cleanup marker file with detailed information
  const markerPath = path.join(__dirname, '.cleanup-completed');
  const timestamp = new Date().toISOString();
  const duration = cleanupStats.endTime - cleanupStats.startTime;
  
  const markerContent = `MeFit Database Cleanup Report
========================================
Cleanup completed at: ${timestamp}
Duration: ${duration}ms
Collections processed: ${cleanupStats.collectionsProcessed}
Total documents deleted: ${cleanupStats.totalDocumentsDeleted}
Collections not found: ${cleanupStats.collectionsNotFound}
Errors encountered: ${cleanupStats.errors}
Remaining documents: ${remainingDocuments}

Verification Results:
${Object.entries(verificationResults).map(([name, count]) => `- ${name}: ${count} documents`).join('\n')}

Status: ${remainingDocuments === 0 && cleanupStats.errors === 0 ? 'SUCCESS' : 'PARTIAL'}
`;

  try {
    fs.writeFileSync(markerPath, markerContent);
    log.success('📝 Cleanup marker created with detailed report');
    
    if (remainingDocuments === 0 && cleanupStats.errors === 0) {
      log.success('💡 Database is now ready for seeding. Run: npm run seed');
    } else {
      log.warning('⚠️  Cleanup completed with issues. Check the report above.');
    }
  } catch (error) {
    log.error(`Could not create cleanup marker: ${error.message}`);
    throw error;
  }

  return remainingDocuments === 0 && cleanupStats.errors === 0;
}

/**
 * Print comprehensive cleanup summary
 */
function printCleanupSummary() {
  log.header('Cleanup Summary');
  
  const duration = cleanupStats.endTime - cleanupStats.startTime;
  
  console.log(`\n📊 Cleanup Statistics:`);
  console.log(`   Duration: ${duration}ms`);
  console.log(`   Collections processed: ${cleanupStats.collectionsProcessed}`);
  console.log(`   \x1b[32mDocuments deleted: ${cleanupStats.totalDocumentsDeleted}\x1b[0m`);
  console.log(`   Collections not found: ${cleanupStats.collectionsNotFound}`);
  console.log(`   \x1b[31mErrors encountered: ${cleanupStats.errors}\x1b[0m`);
  
  const successRate = cleanupStats.collectionsProcessed > 0 ? 
    (((cleanupStats.collectionsProcessed - cleanupStats.errors) / cleanupStats.collectionsProcessed) * 100).toFixed(1) : 0;
  console.log(`   Success rate: ${successRate}%`);

  if (cleanupStats.errors === 0) {
    log.success('\n🎉 Database cleanup completed successfully!');
    log.success('📝 All collections are now empty and ready for fresh data');
  } else {
    log.warning(`\n⚠️  Cleanup completed with ${cleanupStats.errors} error(s)`);
    log.warning('📝 Some collections may not be completely clean');
  }
}
/**
 * Main execution function with enhanced workflow
 */
async function main() {
  console.log('🚀 MeFit Database Cleanup Script\n');
  console.log('⚠️  WARNING: This will delete ALL data in the database!');
  console.log('🔒 This operation cannot be undone.');
  
  // Enhanced production safety check
  if (process.env.NODE_ENV === 'production') {
    log.error('❌ Cannot run cleanup in production environment');
    log.error('   Set NODE_ENV to development or remove it to proceed');
    process.exit(1);
  }

  // Additional safety check for important environments
  const dbName = MONGODB_URI.includes('/') ? MONGODB_URI.split('/').pop() : 'unknown';
  if (dbName.toLowerCase().includes('prod') || dbName.toLowerCase().includes('live')) {
    log.error(`❌ Database name '${dbName}' appears to be a production database`);
    log.error('   Cleanup is blocked for safety. Use a development database instead.');
    process.exit(1);
  }

  try {
    await connectDB();
    
    // Check current database status
    const preCleanupStatus = await checkDatabaseStatus();
    
    if (preCleanupStatus === false) {
      log.info('🎉 Database is already clean! No cleanup needed.');
      log.info('💡 You can proceed directly to seeding: npm run seed');
      
      // Still create marker for consistency
      const markerPath = path.join(__dirname, '.cleanup-completed');
      const timestamp = new Date().toISOString();
      fs.writeFileSync(markerPath, `Database was already clean at: ${timestamp}\nNo cleanup was necessary.\n`);
      
      return;
    }

    // Perform the cleanup
    await cleanDatabase();
    
    // Verify and create markers
    const cleanupSuccess = await verifyCleanupAndCreateMarkers();
    
    // Print comprehensive summary
    printCleanupSummary();
    
    // Final status
    if (cleanupSuccess) {
      log.success('\n🎉 Database cleanup successful!');
      log.success('💡 Next step: Run the seed script with: npm run seed');
      log.info('⚠️  Important: The seed script will only work after cleanup has been completed.');
    } else {
      log.error('\n❌ Cleanup completed with issues');
      log.error('💡 Review the errors above and consider running the script again');
      process.exit(1);
    }
    
  } catch (error) {
    log.error(`Cleanup failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      log.info('🔌 Database connection closed');
    }
  }
}

// Enhanced error handling
process.on('SIGINT', async () => {
  log.warning('\n⏹️  Cleanup interrupted by user');
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
    log.info('🔌 Database connection closed');
  }
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  log.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  log.error('❌ Uncaught Exception:', error.message);
  console.error(error);
  process.exit(1);
});

// Run the script with enhanced error handling
if (require.main === module) {
  main().catch((error) => {
    log.error(`Critical error: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
}

module.exports = { 
  cleanDatabase, 
  connectDB, 
  checkDatabaseStatus, 
  verifyCleanupAndCreateMarkers,
  log,
  cleanupStats
};
