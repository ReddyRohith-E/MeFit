/**
 * Database connection and management utilities
 * Extracted to reduce script complexity and improve reusability
 */

const mongoose = require('mongoose');
const { log } = require('./logger');

class DatabaseManager {
  constructor() {
    this.isConnected = false;
    this.connectionString = null;
  }

  async connect(customUri = null) {
    try {
      // Load environment variables
      require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
      
      this.connectionString = customUri || 
        process.env.MONGODB_URI || 
        'mongodb://localhost:27017/mefit';
      
      if (this.isConnected) {
        log.info('Already connected to MongoDB');
        return;
      }

      await mongoose.connect(this.connectionString);
      this.isConnected = true;
      
      log.success(`Connected to MongoDB`);
      log.info(`Database: ${mongoose.connection.name}`);
      
      // Handle connection events
      mongoose.connection.on('error', (error) => {
        log.error(`MongoDB connection error: ${error.message}`);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        log.warning('MongoDB disconnected');
        this.isConnected = false;
      });

    } catch (error) {
      log.error(`Failed to connect to MongoDB: ${error.message}`);
      throw error;
    }
  }

  async disconnect() {
    if (this.isConnected) {
      await mongoose.disconnect();
      this.isConnected = false;
      log.info('Disconnected from MongoDB');
    }
  }

  async getCollectionStats() {
    if (!this.isConnected) {
      throw new Error('Not connected to database');
    }

    const collections = ['users', 'profiles', 'exercises', 'workouts', 'programs', 'goals', 'notifications'];
    const stats = {};

    for (const collectionName of collections) {
      try {
        const count = await mongoose.connection.db.collection(collectionName).countDocuments();
        stats[collectionName] = count;
      } catch (error) {
        stats[collectionName] = 0;
      }
    }

    return stats;
  }

  async clearCollection(collectionName) {
    if (!this.isConnected) {
      throw new Error('Not connected to database');
    }

    try {
      const result = await mongoose.connection.db.collection(collectionName).deleteMany({});
      return result.deletedCount;
    } catch (error) {
      log.error(`Failed to clear collection ${collectionName}: ${error.message}`);
      return 0;
    }
  }

  async clearAllCollections() {
    const collections = ['users', 'profiles', 'exercises', 'workouts', 'programs', 'goals', 'notifications'];
    const results = {};

    for (const collection of collections) {
      results[collection] = await this.clearCollection(collection);
    }

    return results;
  }

  getConnectionInfo() {
    return {
      connected: this.isConnected,
      connectionString: this.connectionString ? this.connectionString.replace(/\/\/.*@/, '//***:***@') : null,
      database: mongoose.connection.name || null
    };
  }
}

module.exports = DatabaseManager;
