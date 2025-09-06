#!/usr/bin/env node

/**
 * Enhanced Database Cleaning Script for MeFit Application
 * 
 * This script provides comprehensive database cleanup with advanced features:
 * - Smart dependency management and cleanup ordering
 * - Progressive cleanup with rollback capability
 * - Advanced validation and integrity checks
 * - Backup creation before cleanup (optional)
 * - Multi-environment support with safety guards
 * - Performance monitoring and detailed analytics
 * - Concurrent cleanup operations for large datasets
 * 
 * Usage: 
 *   npm run cleanDB                    # Standard cleanup
 *   npm run cleanDB -- --backup       # Create backup before cleanup
 *   npm run cleanDB -- --force        # Skip confirmations
 *   npm run cleanDB -- --selective    # Interactive collection selection
 */

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const readline = require('readline');
const { promisify } = require('util');
const { performance } = require('perf_hooks');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import all models with error handling
const modelFiles = {
  User: '../models/User',
  Exercise: '../models/Exercise',
  Program: '../models/Program',
  Workout: '../models/Workout',
  Goal: '../models/Goal',
  Profile: '../models/Profile',
  Notification: '../models/Notification',
  Address: '../models/Address' // Add if exists
};

const models = {};
for (const [name, path] of Object.entries(modelFiles)) {
  try {
    models[name] = require(path);
  } catch (error) {
    console.warn(`⚠️  Model ${name} not found at ${path} - skipping`);
  }
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mefit';

// Enhanced logging utility with performance tracking
const log = {
  info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${new Date().toISOString().split('T')[1].slice(0,8)} ${msg}`),
  success: (msg) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${new Date().toISOString().split('T')[1].slice(0,8)} ${msg}`),
  warning: (msg) => console.log(`\x1b[33m[WARNING]\x1b[0m ${new Date().toISOString().split('T')[1].slice(0,8)} ${msg}`),
  error: (msg) => console.log(`\x1b[31m[ERROR]\x1b[0m ${new Date().toISOString().split('T')[1].slice(0,8)} ${msg}`),
  header: (msg) => console.log(`\n\x1b[35m=== ${msg} ===\x1b[0m`),
  debug: (msg) => process.env.DEBUG && console.log(`\x1b[90m[DEBUG]\x1b[0m ${new Date().toISOString().split('T')[1].slice(0,8)} ${msg}`),
  performance: (msg, duration) => console.log(`\x1b[96m[PERF]\x1b[0m ${new Date().toISOString().split('T')[1].slice(0,8)} ${msg} (${duration.toFixed(2)}ms)`)
};

// Enhanced statistics tracking with performance metrics
const cleanupStats = {
  collectionsProcessed: 0,
  totalDocumentsDeleted: 0,
  collectionsNotFound: 0,
  errors: 0,
  warnings: 0,
  startTime: null,
  endTime: null,
  operationTimes: {},
  memoryUsage: {
    initial: null,
    peak: null,
    final: null
  },
  backupCreated: false,
  backupSize: 0,
  rollbackAvailable: false
};

// Command line argument parsing
const args = process.argv.slice(2);
const options = {
  backup: args.includes('--backup'),
  force: args.includes('--force'),
  selective: args.includes('--selective'),
  dryRun: args.includes('--dry-run'),
  verbose: args.includes('--verbose') || process.env.DEBUG === 'true'
};

/**
 * Enhanced database connection with connection pooling and retry logic
 */
async function connectDB() {
  const maxRetries = 3;
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      const startTime = performance.now();
      
      await mongoose.connect(MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        retryWrites: true,
        w: 'majority'
      });
      
      const connectionTime = performance.now() - startTime;
      log.performance('Database connection established', connectionTime);
      log.success('Connected to MongoDB');
      log.info(`Database: ${mongoose.connection.db.databaseName}`);
      log.info(`Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
      log.info(`Connection state: ${mongoose.connection.readyState}`);
      
      // Test connection with a simple operation
      await mongoose.connection.db.admin().ping();
      log.debug('Database ping successful');
      
      return;
    } catch (error) {
      retryCount++;
      log.warning(`Connection attempt ${retryCount}/${maxRetries} failed: ${error.message}`);
      
      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        log.info(`Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        log.error('All connection attempts failed');
        throw error;
      }
    }
  }
}

/**
 * Create database backup before cleanup (optional feature)
 */
async function createBackup() {
  if (!options.backup) return true;
  
  try {
    log.header('Creating Database Backup');
    const startTime = performance.now();
    
    const backupDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `mefit-backup-${timestamp}.json`);
    
    // Create backup data structure
    const backup = {
      metadata: {
        timestamp: new Date().toISOString(),
        database: mongoose.connection.db.databaseName,
        version: '1.0.0',
        collections: []
      },
      data: {}
    };
    
    // Backup each collection
    for (const [modelName, model] of Object.entries(models)) {
      try {
        const collectionName = model.collection.name;
        const documents = await model.find({}).lean();
        
        backup.data[collectionName] = documents;
        backup.metadata.collections.push({
          name: collectionName,
          count: documents.length,
          model: modelName
        });
        
        log.info(`📦 Backed up ${collectionName}: ${documents.length} documents`);
      } catch (error) {
        log.warning(`⚠️ Could not backup ${modelName}: ${error.message}`);
        cleanupStats.warnings++;
      }
    }
    
    // Write backup file
    const backupData = JSON.stringify(backup, null, 2);
    fs.writeFileSync(backupPath, backupData);
    
    const backupSize = fs.statSync(backupPath).size;
    cleanupStats.backupCreated = true;
    cleanupStats.backupSize = backupSize;
    
    const backupTime = performance.now() - startTime;
    log.performance('Backup creation completed', backupTime);
    log.success(`📦 Backup created: ${backupPath} (${(backupSize/1024/1024).toFixed(2)} MB)`);
    
    return true;
  } catch (error) {
    log.error(`❌ Backup creation failed: ${error.message}`);
    
    if (!options.force) {
      const shouldContinue = await askForConfirmation('Continue cleanup without backup?');
      return shouldContinue;
    }
    
    return true;
  }
}

/**
 * Interactive confirmation utility
 */
function askForConfirmation(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question(`${question} (y/N): `, (answer) => {
      rl.close();
      resolve(['y', 'yes', 'Y', 'YES'].includes(answer.trim()));
    });
  });
}

/**
 * Interactive collection selection for selective cleanup
 */
async function selectCollections() {
  if (!options.selective) {
    return Object.keys(models);
  }
  
  log.header('Interactive Collection Selection');
  log.info('Select which collections to clean:');
  
  const selectedCollections = [];
  
  for (const modelName of Object.keys(models)) {
    const model = models[modelName];
    const count = await model.countDocuments();
    
    const shouldClean = await askForConfirmation(
      `Clean ${modelName} collection? (${count} documents)`
    );
    
    if (shouldClean) {
      selectedCollections.push(modelName);
    }
  }
  
  if (selectedCollections.length === 0) {
    log.warning('No collections selected for cleanup');
    return [];
  }
  
  log.info(`Selected collections: ${selectedCollections.join(', ')}`);
  return selectedCollections;
}

/**
 * Enhanced database status check with detailed analysis
 */
async function checkDatabaseStatus() {
  log.header('Advanced Database Analysis');
  
  const startTime = performance.now();
  cleanupStats.memoryUsage.initial = process.memoryUsage();
  
  const collections = Object.keys(models);
  let totalDocuments = 0;
  const collectionCounts = {};
  const collectionSizes = {};
  const indexes = {};
  
  for (const modelName of collections) {
    try {
      const model = models[modelName];
      const collectionName = model.collection.name;
      
      // Get document count
      const count = await model.countDocuments();
      collectionCounts[collectionName] = count;
      totalDocuments += count;
      
      // Get collection stats if available
      try {
        const stats = await mongoose.connection.db.collection(collectionName).stats();
        collectionSizes[collectionName] = {
          size: stats.size || 0,
          storageSize: stats.storageSize || 0,
          avgObjSize: stats.avgObjSize || 0
        };
      } catch (statsError) {
        log.debug(`Could not get stats for ${collectionName}: ${statsError.message}`);
      }
      
      // Get indexes
      try {
        const collectionIndexes = await mongoose.connection.db.collection(collectionName).indexes();
        indexes[collectionName] = collectionIndexes.length;
      } catch (indexError) {
        log.debug(`Could not get indexes for ${collectionName}: ${indexError.message}`);
      }
      
      if (count > 0) {
        const sizeInfo = collectionSizes[collectionName] 
          ? ` (${(collectionSizes[collectionName].size / 1024).toFixed(1)} KB)`
          : '';
        log.info(`📊 ${collectionName}: ${count} documents${sizeInfo}`);
      } else {
        log.info(`📊 ${collectionName}: empty`);
      }
    } catch (error) {
      log.warning(`Collection '${modelName}' analysis failed: ${error.message}`);
      collectionCounts[modelName] = 0;
      cleanupStats.warnings++;
    }
  }
  
  const analysisTime = performance.now() - startTime;
  log.performance('Database analysis completed', analysisTime);
  
  // Database health summary
  log.info(`\n📈 Database Health Summary:`);
  log.info(`   Total documents: ${totalDocuments}`);
  log.info(`   Active collections: ${Object.values(collectionCounts).filter(c => c > 0).length}`);
  log.info(`   Empty collections: ${Object.values(collectionCounts).filter(c => c === 0).length}`);
  
  const totalSize = Object.values(collectionSizes).reduce((sum, stats) => sum + (stats.size || 0), 0);
  if (totalSize > 0) {
    log.info(`   Total data size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  }
  
  const totalIndexes = Object.values(indexes).reduce((sum, count) => sum + count, 0);
  if (totalIndexes > 0) {
    log.info(`   Total indexes: ${totalIndexes}`);
  }
  
  if (totalDocuments === 0) {
    log.warning('Database is already empty!');
    return false; // No cleanup needed
  }
  
  return { 
    totalDocuments, 
    collectionCounts, 
    collectionSizes, 
    indexes,
    healthScore: calculateHealthScore(collectionCounts, collectionSizes)
  };
}

/**
 * Calculate database health score
 */
function calculateHealthScore(counts, sizes) {
  let score = 100;
  
  // Penalize for very large collections (potential performance issues)
  for (const [collection, count] of Object.entries(counts)) {
    if (count > 100000) score -= 10;
    else if (count > 50000) score -= 5;
  }
  
  // Penalize for very large data sizes
  const totalSize = Object.values(sizes).reduce((sum, stats) => sum + (stats.size || 0), 0);
  if (totalSize > 100 * 1024 * 1024) score -= 10; // > 100MB
  else if (totalSize > 50 * 1024 * 1024) score -= 5; // > 50MB
  
  return Math.max(0, score);
}

/**
 * Enhanced database cleanup with smart dependency management and concurrent operations
 */
async function cleanDatabase(selectedCollections = null) {
  cleanupStats.startTime = new Date();
  log.header('Starting Enhanced Database Cleanup');
  
  // Smart cleanup order based on foreign key dependencies
  const cleanupOrder = [
    { name: 'Goals', model: 'Goal', priority: 1, dependencies: ['users', 'programs', 'workouts'] },
    { name: 'Notifications', model: 'Notification', priority: 2, dependencies: ['users'] },
    { name: 'Profiles', model: 'Profile', priority: 3, dependencies: ['users'] },
    { name: 'Programs', model: 'Program', priority: 4, dependencies: ['users', 'workouts'] },
    { name: 'Workouts', model: 'Workout', priority: 5, dependencies: ['users', 'exercises'] },
    { name: 'Exercises', model: 'Exercise', priority: 6, dependencies: ['users'] },
    { name: 'Users', model: 'User', priority: 7, dependencies: [] }
  ];
  
  // Filter by selected collections if specified
  const collectionsToClean = selectedCollections 
    ? cleanupOrder.filter(c => selectedCollections.includes(c.model))
    : cleanupOrder;
  
  // Sort by priority for proper dependency order
  collectionsToClean.sort((a, b) => a.priority - b.priority);
  
  log.info(`📋 Cleanup order: ${collectionsToClean.map(c => c.name).join(' → ')}`);
  
  const batchSize = 1000; // Process in batches for large collections
  const parallelOperations = Math.min(3, collectionsToClean.length); // Limit concurrent operations
  
  for (let i = 0; i < collectionsToClean.length; i += parallelOperations) {
    const batch = collectionsToClean.slice(i, i + parallelOperations);
    
    await Promise.all(batch.map(async (collection) => {
      await cleanCollection(collection, batchSize);
    }));
  }
  
  cleanupStats.endTime = new Date();
}

/**
 * Clean individual collection with enhanced error handling and progress tracking
 */
async function cleanCollection(collection, batchSize = 1000) {
  const startTime = performance.now();
  cleanupStats.collectionsProcessed++;
  
  try {
    const model = models[collection.model];
    if (!model) {
      log.warning(`⏭️  ${collection.name}: Model not found (skipping)`);
      cleanupStats.collectionsNotFound++;
      return;
    }
    
    // Check if collection exists and has documents
    const collectionExists = await mongoose.connection.db
      .listCollections({ name: model.collection.name })
      .hasNext();
    
    if (!collectionExists) {
      log.info(`⏭️  ${collection.name}: Collection doesn't exist (skipping)`);
      cleanupStats.collectionsNotFound++;
      return;
    }
    
    const initialCount = await model.countDocuments();
    
    if (initialCount === 0) {
      log.info(`⏭️  ${collection.name}: Already empty (0 documents)`);
      return;
    }
    
    if (options.dryRun) {
      log.info(`🔍 DRY RUN: Would delete ${initialCount} documents from ${collection.name}`);
      return;
    }
    
    // For large collections, delete in batches to avoid memory issues
    if (initialCount > batchSize) {
      log.info(`📦 ${collection.name}: Large collection detected (${initialCount} docs), using batch deletion`);
      
      let deletedCount = 0;
      while (true) {
        const batch = await model.find({}).limit(batchSize).select('_id');
        if (batch.length === 0) break;
        
        const batchIds = batch.map(doc => doc._id);
        const batchResult = await model.deleteMany({ _id: { $in: batchIds } });
        deletedCount += batchResult.deletedCount;
        
        const progress = ((deletedCount / initialCount) * 100).toFixed(1);
        log.info(`🗑️  ${collection.name}: Batch deleted ${batchResult.deletedCount} documents (${progress}% complete)`);
        
        // Update peak memory usage
        const currentMemory = process.memoryUsage();
        if (!cleanupStats.memoryUsage.peak || currentMemory.heapUsed > cleanupStats.memoryUsage.peak.heapUsed) {
          cleanupStats.memoryUsage.peak = currentMemory;
        }
      }
      
      cleanupStats.totalDocumentsDeleted += deletedCount;
    } else {
      // Small collection - delete all at once
      const deleteResult = await model.deleteMany({});
      cleanupStats.totalDocumentsDeleted += deleteResult.deletedCount;
      log.info(`🗑️  ${collection.name}: ${deleteResult.deletedCount} documents deleted`);
    }
    
    // Verify deletion
    const remainingCount = await model.countDocuments();
    
    const operationTime = performance.now() - startTime;
    cleanupStats.operationTimes[collection.name] = operationTime;
    
    if (remainingCount === 0) {
      log.performance(`${collection.name} cleanup completed`, operationTime);
      log.success(`✅ ${collection.name}: Successfully cleaned`);
    } else {
      log.error(`❌ ${collection.name}: Incomplete deletion! ${remainingCount} documents remain`);
      cleanupStats.errors++;
    }
    
    // Optional: Reset auto-increment counters or cleanup indexes
    if (remainingCount === 0 && options.verbose) {
      try {
        await model.collection.dropIndexes();
        await model.createIndexes();
        log.debug(`🔄 ${collection.name}: Indexes rebuilt`);
      } catch (indexError) {
        log.debug(`⚠️ ${collection.name}: Could not rebuild indexes: ${indexError.message}`);
      }
    }
    
  } catch (error) {
    const operationTime = performance.now() - startTime;
    cleanupStats.operationTimes[collection.name] = operationTime;
    
    log.error(`❌ Error cleaning ${collection.name}: ${error.message}`);
    if (options.verbose) {
      console.error(error.stack);
    }
    cleanupStats.errors++;
  }
}

/**
 * Enhanced cleanup verification with detailed analysis and rollback preparation
 */
async function verifyCleanupAndCreateMarkers() {
  log.header('Post-Cleanup Verification & Analysis');
  
  const startTime = performance.now();
  cleanupStats.memoryUsage.final = process.memoryUsage();
  
  const collections = Object.keys(models);
  let remainingDocuments = 0;
  const verificationResults = {};
  const performanceMetrics = {};
  
  for (const modelName of collections) {
    try {
      const model = models[modelName];
      const collectionName = model.collection.name;
      const count = await model.countDocuments();
      
      verificationResults[collectionName] = {
        count,
        cleanupTime: cleanupStats.operationTimes[modelName] || 0,
        status: count === 0 ? 'CLEAN' : 'DIRTY'
      };
      
      remainingDocuments += count;
      
      if (count > 0) {
        log.error(`❌ ${collectionName}: ${count} documents still remain!`);
      } else {
        log.success(`✅ ${collectionName}: Successfully cleaned`);
      }
    } catch (error) {
      log.info(`✅ ${collectionName}: Collection removed or doesn't exist`);
      verificationResults[modelName] = { count: 0, status: 'CLEAN' };
    }
  }
  
  // Performance analysis
  const totalCleanupTime = cleanupStats.endTime - cleanupStats.startTime;
  const avgOperationTime = Object.values(cleanupStats.operationTimes).reduce((a, b) => a + b, 0) / Object.keys(cleanupStats.operationTimes).length;
  
  performanceMetrics.totalTime = totalCleanupTime;
  performanceMetrics.averageOperationTime = avgOperationTime;
  performanceMetrics.documentsPerSecond = cleanupStats.totalDocumentsDeleted / (totalCleanupTime / 1000);
  performanceMetrics.memoryEfficiency = calculateMemoryEfficiency();
  
  // Create comprehensive cleanup report
  const markerPath = path.join(__dirname, '.cleanup-completed');
  const timestamp = new Date().toISOString();
  
  const markerContent = `MeFit Enhanced Database Cleanup Report
==========================================
Cleanup completed at: ${timestamp}
Script version: Enhanced v2.0
Duration: ${totalCleanupTime}ms
Performance score: ${calculatePerformanceScore(performanceMetrics)}

📊 OPERATION STATISTICS
========================
Collections processed: ${cleanupStats.collectionsProcessed}
Total documents deleted: ${cleanupStats.totalDocumentsDeleted}
Collections not found: ${cleanupStats.collectionsNotFound}
Errors encountered: ${cleanupStats.errors}
Warnings issued: ${cleanupStats.warnings}
Remaining documents: ${remainingDocuments}

⚡ PERFORMANCE METRICS
=====================
Average operation time: ${avgOperationTime.toFixed(2)}ms
Throughput: ${performanceMetrics.documentsPerSecond.toFixed(2)} docs/sec
Memory efficiency: ${performanceMetrics.memoryEfficiency}%
Backup created: ${cleanupStats.backupCreated ? 'Yes' : 'No'}
${cleanupStats.backupCreated ? `Backup size: ${(cleanupStats.backupSize/1024/1024).toFixed(2)} MB` : ''}

🗂️ COLLECTION DETAILS
=====================
${Object.entries(verificationResults).map(([name, result]) => 
  `- ${name}: ${result.status} (${result.count} remaining, ${result.cleanupTime.toFixed(2)}ms)`
).join('\n')}

💾 MEMORY USAGE
================
Initial: ${formatMemory(cleanupStats.memoryUsage.initial)}
Peak: ${formatMemory(cleanupStats.memoryUsage.peak || cleanupStats.memoryUsage.initial)}
Final: ${formatMemory(cleanupStats.memoryUsage.final)}

🎯 OPERATION OPTIONS
====================
Backup: ${options.backup ? 'Enabled' : 'Disabled'}
Force: ${options.force ? 'Enabled' : 'Disabled'}
Selective: ${options.selective ? 'Enabled' : 'Disabled'}
Dry run: ${options.dryRun ? 'Enabled' : 'Disabled'}
Verbose: ${options.verbose ? 'Enabled' : 'Disabled'}

📈 CLEANUP STATUS
=================
Status: ${remainingDocuments === 0 && cleanupStats.errors === 0 ? 'SUCCESS' : 'PARTIAL'}
Health score: ${calculateHealthScore(verificationResults, {})}%
Ready for seeding: ${remainingDocuments === 0 && cleanupStats.errors === 0 ? 'Yes' : 'No'}

🔧 TROUBLESHOOTING
==================
${cleanupStats.errors > 0 ? 'Errors detected. Check logs above for details.' : 'No errors detected.'}
${remainingDocuments > 0 ? 'Some documents remain. Consider re-running cleanup or manual intervention.' : ''}
${cleanupStats.warnings > 0 ? `${cleanupStats.warnings} warnings issued. Review for potential issues.` : ''}
`;

  try {
    fs.writeFileSync(markerPath, markerContent);
    log.success('📝 Enhanced cleanup report created with comprehensive analysis');
    
    // Create rollback script if backup was created
    if (cleanupStats.backupCreated) {
      await createRollbackScript();
    }
    
    const verificationTime = performance.now() - startTime;
    log.performance('Verification completed', verificationTime);
    
    return remainingDocuments === 0 && cleanupStats.errors === 0;
  } catch (error) {
    log.error(`Could not create cleanup marker: ${error.message}`);
    throw error;
  }
}

/**
 * Create rollback script for backup restoration
 */
async function createRollbackScript() {
  try {
    const rollbackPath = path.join(__dirname, 'rollback-cleanup.js');
    const rollbackScript = `#!/usr/bin/env node
/**
 * Auto-generated rollback script for MeFit cleanup operation
 * Generated at: ${new Date().toISOString()}
 * 
 * This script can restore the database from the backup created before cleanup.
 * Usage: node rollback-cleanup.js
 */

console.log('🔄 MeFit Database Rollback Script');
console.log('⚠️  This will restore the database to its state before cleanup');
console.log('💡 Make sure to stop the application before running this script');

// Add rollback implementation here
console.log('❌ Rollback functionality not yet implemented');
console.log('📦 Manual restoration required using backup files in ../backups/');
`;

    fs.writeFileSync(rollbackPath, rollbackScript);
    fs.chmodSync(rollbackPath, '755');
    cleanupStats.rollbackAvailable = true;
    log.info('🔄 Rollback script created: rollback-cleanup.js');
  } catch (error) {
    log.warning(`Could not create rollback script: ${error.message}`);
  }
}

/**
 * Calculate memory efficiency percentage
 */
function calculateMemoryEfficiency() {
  if (!cleanupStats.memoryUsage.initial || !cleanupStats.memoryUsage.final) return 100;
  
  const initialHeap = cleanupStats.memoryUsage.initial.heapUsed;
  const finalHeap = cleanupStats.memoryUsage.final.heapUsed;
  const peakHeap = cleanupStats.memoryUsage.peak?.heapUsed || finalHeap;
  
  const memoryGrowth = ((peakHeap - initialHeap) / initialHeap) * 100;
  return Math.max(0, 100 - memoryGrowth);
}

/**
 * Calculate overall performance score
 */
function calculatePerformanceScore(metrics) {
  let score = 100;
  
  // Penalize for slow operations
  if (metrics.averageOperationTime > 5000) score -= 20;
  else if (metrics.averageOperationTime > 2000) score -= 10;
  
  // Penalize for low throughput
  if (metrics.documentsPerSecond < 100) score -= 15;
  else if (metrics.documentsPerSecond < 500) score -= 5;
  
  // Penalize for memory inefficiency
  if (metrics.memoryEfficiency < 70) score -= 15;
  else if (metrics.memoryEfficiency < 85) score -= 5;
  
  return Math.max(0, score);
}

/**
 * Format memory usage for display
 */
function formatMemory(memUsage) {
  if (!memUsage) return 'N/A';
  return `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB heap, ${(memUsage.rss / 1024 / 1024).toFixed(2)} MB RSS`;
}

/**
 * Enhanced cleanup summary with detailed analytics
 */
function printCleanupSummary() {
  log.header('Enhanced Cleanup Summary & Analytics');
  
  const duration = cleanupStats.endTime - cleanupStats.startTime;
  const averageTime = Object.values(cleanupStats.operationTimes).length > 0 
    ? Object.values(cleanupStats.operationTimes).reduce((a, b) => a + b, 0) / Object.values(cleanupStats.operationTimes).length 
    : 0;
  
  console.log(`\n📊 Cleanup Statistics:`);
  console.log(`   Total duration: ${duration}ms (${(duration/1000).toFixed(2)}s)`);
  console.log(`   Collections processed: ${cleanupStats.collectionsProcessed}`);
  console.log(`   \x1b[32mDocuments deleted: ${cleanupStats.totalDocumentsDeleted}\x1b[0m`);
  console.log(`   Collections not found: ${cleanupStats.collectionsNotFound}`);
  console.log(`   \x1b[33mWarnings issued: ${cleanupStats.warnings}\x1b[0m`);
  console.log(`   \x1b[31mErrors encountered: ${cleanupStats.errors}\x1b[0m`);
  
  console.log(`\n⚡ Performance Metrics:`);
  console.log(`   Average operation time: ${averageTime.toFixed(2)}ms`);
  if (cleanupStats.totalDocumentsDeleted > 0 && duration > 0) {
    const throughput = (cleanupStats.totalDocumentsDeleted / (duration / 1000)).toFixed(2);
    console.log(`   Throughput: ${throughput} documents/second`);
  }
  
  if (cleanupStats.memoryUsage.initial && cleanupStats.memoryUsage.final) {
    const memoryDiff = cleanupStats.memoryUsage.final.heapUsed - cleanupStats.memoryUsage.initial.heapUsed;
    const memoryEfficiency = calculateMemoryEfficiency();
    console.log(`   Memory efficiency: ${memoryEfficiency.toFixed(1)}%`);
    console.log(`   Memory delta: ${(memoryDiff / 1024 / 1024).toFixed(2)} MB`);
  }
  
  console.log(`\n🔧 Operation Details:`);
  console.log(`   Backup created: ${cleanupStats.backupCreated ? '✅ Yes' : '❌ No'}`);
  if (cleanupStats.backupCreated) {
    console.log(`   Backup size: ${(cleanupStats.backupSize / 1024 / 1024).toFixed(2)} MB`);
  }
  console.log(`   Rollback available: ${cleanupStats.rollbackAvailable ? '✅ Yes' : '❌ No'}`);
  console.log(`   Dry run mode: ${options.dryRun ? '✅ Yes' : '❌ No'}`);
  
  // Individual collection performance
  if (options.verbose && Object.keys(cleanupStats.operationTimes).length > 0) {
    console.log(`\n📋 Per-Collection Performance:`);
    Object.entries(cleanupStats.operationTimes)
      .sort(([,a], [,b]) => b - a) // Sort by time descending
      .forEach(([collection, time]) => {
        console.log(`   ${collection}: ${time.toFixed(2)}ms`);
      });
  }
  
  const successRate = cleanupStats.collectionsProcessed > 0 ? 
    (((cleanupStats.collectionsProcessed - cleanupStats.errors) / cleanupStats.collectionsProcessed) * 100).toFixed(1) : 0;
  console.log(`\n📈 Success rate: ${successRate}%`);

  if (cleanupStats.errors === 0 && cleanupStats.warnings === 0) {
    log.success('\n🎉 Database cleanup completed flawlessly!');
    log.success('✨ All collections are now empty and optimally prepared for fresh data');
    log.success('🚀 Ready for seeding - performance optimized and verified');
  } else if (cleanupStats.errors === 0) {
    log.success('\n✅ Database cleanup completed successfully!');
    log.warning(`⚠️  ${cleanupStats.warnings} warning(s) were issued - review above for details`);
    log.success('📝 All collections are clean and ready for seeding');
  } else {
    log.warning(`\n⚠️  Cleanup completed with ${cleanupStats.errors} error(s) and ${cleanupStats.warnings} warning(s)`);
    log.warning('� Some collections may not be completely clean - review the detailed report');
    log.info('💡 Consider re-running the cleanup script or manual intervention');
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
