#!/usr/bin/env node

/**
 * Auto-generated restore script for MeFit database backup
 * Created: 2025-09-06T12:05:17.772Z
 * Backup: seed-backup-2025-09-06T12-05-15-913Z.json
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
    
    const backupData = JSON.parse(fs.readFileSync('C:\Users\eredd\Desktop\Siter\MeFit\backend\scripts\backups\seed-backup-2025-09-06T12-05-15-913Z.json', 'utf8'));
    console.log(`📦 Loaded backup from: ${backupData.timestamp}`);
    
    // Clear existing data
    const collections = Object.keys(backupData.collections);
    for (const collectionName of collections) {
      try {
        await mongoose.connection.db.collection(collectionName).deleteMany({});
        console.log(`🗑️  Cleared collection: ${collectionName}`);
      } catch (error) {
        console.log(`⚠️  Could not clear ${collectionName}: ${error.message}`);
      }
    }
    
    // Restore data
    for (const [collectionName, docs] of Object.entries(backupData.collections)) {
      if (docs.length > 0) {
        await mongoose.connection.db.collection(collectionName).insertMany(docs);
        console.log(`✅ Restored ${docs.length} documents to ${collectionName}`);
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
