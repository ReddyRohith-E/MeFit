const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
require('dotenv').config();

const execAsync = promisify(exec);

class DatabaseBackup {
  constructor() {
    this.backupDir = path.join(__dirname, '..', 'backups');
    this.retentionDays = 7; // SRS DB-02: Keep backups for at least 7 days
  }

  async ensureBackupDirectory() {
    try {
      await fs.access(this.backupDir);
    } catch (error) {
      await fs.mkdir(this.backupDir, { recursive: true });
    }
  }

  async createBackup() {
    try {
      await this.ensureBackupDirectory();

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `mefit-backup-${timestamp}`;
      const backupPath = path.join(this.backupDir, backupName);

      // Extract database name from MongoDB URI
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mefit';
      const dbName = mongoUri.split('/').pop().split('?')[0];

      console.log(`Starting backup for database: ${dbName}`);
      console.log(`Backup location: ${backupPath}`);

      // Use mongodump to create backup
      const mongodumpCommand = `mongodump --uri="${mongoUri}" --out="${backupPath}"`;
      
      const { stdout, stderr } = await execAsync(mongodumpCommand);
      
      if (stderr && !stderr.includes('done dumping')) {
        throw new Error(`Backup failed: ${stderr}`);
      }

      console.log('Backup completed successfully');
      console.log(stdout);

      // Create backup metadata
      const metadata = {
        timestamp: new Date().toISOString(),
        database: dbName,
        size: await this.getDirectorySize(backupPath),
        backupPath: backupPath
      };

      await fs.writeFile(
        path.join(backupPath, 'backup-metadata.json'),
        JSON.stringify(metadata, null, 2)
      );

      // Clean old backups
      await this.cleanOldBackups();

      return metadata;
    } catch (error) {
      console.error('Backup error:', error);
      throw error;
    }
  }

  async getDirectorySize(dirPath) {
    try {
      let totalSize = 0;
      const files = await fs.readdir(dirPath, { withFileTypes: true });

      for (const file of files) {
        const fullPath = path.join(dirPath, file.name);
        if (file.isDirectory()) {
          totalSize += await this.getDirectorySize(fullPath);
        } else {
          const stats = await fs.stat(fullPath);
          totalSize += stats.size;
        }
      }

      return totalSize;
    } catch (error) {
      console.error('Error calculating directory size:', error);
      return 0;
    }
  }

  async cleanOldBackups() {
    try {
      const files = await fs.readdir(this.backupDir);
      const backupDirs = files.filter(file => file.startsWith('mefit-backup-'));

      const now = Date.now();
      const retentionMs = this.retentionDays * 24 * 60 * 60 * 1000;

      for (const dir of backupDirs) {
        const fullPath = path.join(this.backupDir, dir);
        const stats = await fs.stat(fullPath);
        
        if (now - stats.mtimeMs > retentionMs) {
          console.log(`Removing old backup: ${dir}`);
          await fs.rm(fullPath, { recursive: true, force: true });
        }
      }
    } catch (error) {
      console.error('Error cleaning old backups:', error);
    }
  }

  async listBackups() {
    try {
      await this.ensureBackupDirectory();
      const files = await fs.readdir(this.backupDir);
      const backupDirs = files.filter(file => file.startsWith('mefit-backup-'));

      const backups = [];
      for (const dir of backupDirs) {
        const fullPath = path.join(this.backupDir, dir);
        const metadataPath = path.join(fullPath, 'backup-metadata.json');

        try {
          const metadata = await fs.readFile(metadataPath, 'utf8');
          backups.push(JSON.parse(metadata));
        } catch (error) {
          // If no metadata file, create basic info
          const stats = await fs.stat(fullPath);
          backups.push({
            timestamp: stats.mtime.toISOString(),
            backupPath: fullPath,
            size: await this.getDirectorySize(fullPath)
          });
        }
      }

      return backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error('Error listing backups:', error);
      return [];
    }
  }

  async restoreBackup(backupPath) {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mefit';
      const dbName = mongoUri.split('/').pop().split('?')[0];

      console.log(`Restoring backup from: ${backupPath}`);
      console.log(`Target database: ${dbName}`);

      // Use mongorestore to restore backup
      const mongorestoreCommand = `mongorestore --uri="${mongoUri}" --drop "${path.join(backupPath, dbName)}"`;
      
      const { stdout, stderr } = await execAsync(mongorestoreCommand);
      
      if (stderr && !stderr.includes('done')) {
        throw new Error(`Restore failed: ${stderr}`);
      }

      console.log('Restore completed successfully');
      console.log(stdout);

      return true;
    } catch (error) {
      console.error('Restore error:', error);
      throw error;
    }
  }
}

// CLI usage
if (require.main === module) {
  const backup = new DatabaseBackup();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'create':
      backup.createBackup()
        .then(metadata => {
          console.log('Backup created:', metadata);
          process.exit(0);
        })
        .catch(error => {
          console.error('Backup failed:', error);
          process.exit(1);
        });
      break;
      
    case 'list':
      backup.listBackups()
        .then(backups => {
          console.log('Available backups:');
          backups.forEach(backup => {
            console.log(`- ${backup.timestamp} (${(backup.size / 1024 / 1024).toFixed(2)} MB)`);
          });
          process.exit(0);
        })
        .catch(error => {
          console.error('Failed to list backups:', error);
          process.exit(1);
        });
      break;
      
    case 'restore':
      const backupPath = process.argv[3];
      if (!backupPath) {
        console.error('Please provide backup path');
        process.exit(1);
      }
      
      backup.restoreBackup(backupPath)
        .then(() => {
          console.log('Restore completed');
          process.exit(0);
        })
        .catch(error => {
          console.error('Restore failed:', error);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Usage: node backup.js [create|list|restore <path>]');
      process.exit(1);
  }
}

module.exports = DatabaseBackup;
