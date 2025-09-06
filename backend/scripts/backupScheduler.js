const cron = require('node-cron');
const DatabaseBackup = require('./backup');

class BackupScheduler {
  constructor() {
    this.backup = new DatabaseBackup();
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) {
      console.log('Backup scheduler is already running');
      return;
    }

    // SRS DB-02: Complete backup at least once per day
    // Schedule daily backup at 2:00 AM
    this.dailyBackupJob = cron.schedule('0 2 * * *', async () => {
      console.log('Starting scheduled daily backup...');
      try {
        const metadata = await this.backup.createBackup();
        console.log('Scheduled backup completed:', metadata);
      } catch (error) {
        console.error('Scheduled backup failed:', error);
        // In production, you might want to send an alert here
      }
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    // Optional: Weekly cleanup of old backups (in addition to retention policy)
    this.cleanupJob = cron.schedule('0 3 * * 0', async () => {
      console.log('Running weekly backup cleanup...');
      try {
        const backups = await this.backup.listBackups();
        console.log(`Found ${backups.length} backups`);
      } catch (error) {
        console.error('Backup cleanup check failed:', error);
      }
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    this.dailyBackupJob.start();
    this.cleanupJob.start();
    this.isRunning = true;

    console.log('Backup scheduler started - Daily backups at 2:00 AM UTC');
  }

  stop() {
    if (!this.isRunning) {
      console.log('Backup scheduler is not running');
      return;
    }

    if (this.dailyBackupJob) {
      this.dailyBackupJob.stop();
    }
    if (this.cleanupJob) {
      this.cleanupJob.stop();
    }

    this.isRunning = false;
    console.log('Backup scheduler stopped');
  }

  async createManualBackup() {
    console.log('Creating manual backup...');
    try {
      const metadata = await this.backup.createBackup();
      console.log('Manual backup completed:', metadata);
      return metadata;
    } catch (error) {
      console.error('Manual backup failed:', error);
      throw error;
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      nextBackup: this.dailyBackupJob ? this.dailyBackupJob.nextDate() : null,
      nextCleanup: this.cleanupJob ? this.cleanupJob.nextDate() : null
    };
  }
}

module.exports = BackupScheduler;
