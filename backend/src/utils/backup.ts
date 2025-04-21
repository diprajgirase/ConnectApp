import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import logger from '../config/logger';

const execAsync = promisify(exec);

const BACKUP_DIR = path.join(process.cwd(), 'backups');
const MAX_BACKUPS = 5;

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

export const backupDatabase = async () => {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}.gz`);

        // Create backup using mongodump
        await execAsync(
            `mongodump --uri="${process.env.DATABASE_URL}" --archive="${backupPath}" --gzip`
        );

        logger.info(`Database backup created: ${backupPath}`);

        // Clean up old backups
        const backups = fs.readdirSync(BACKUP_DIR)
            .filter(file => file.startsWith('backup-') && file.endsWith('.gz'))
            .sort()
            .reverse();

        if (backups.length > MAX_BACKUPS) {
            const oldBackups = backups.slice(MAX_BACKUPS);
            for (const backup of oldBackups) {
                fs.unlinkSync(path.join(BACKUP_DIR, backup));
                logger.info(`Deleted old backup: ${backup}`);
            }
        }

        return backupPath;
    } catch (error) {
        logger.error('Backup failed:', error);
        throw error;
    }
};

export const restoreDatabase = async (backupPath: string) => {
    try {
        if (!fs.existsSync(backupPath)) {
            throw new Error(`Backup file not found: ${backupPath}`);
        }

        // Restore backup using mongorestore
        await execAsync(
            `mongorestore --uri="${process.env.DATABASE_URL}" --archive="${backupPath}" --gzip --drop`
        );

        logger.info(`Database restored from: ${backupPath}`);
    } catch (error) {
        logger.error('Restore failed:', error);
        throw error;
    }
};

// List available backups
export const listBackups = () => {
    return fs.readdirSync(BACKUP_DIR)
        .filter(file => file.startsWith('backup-') && file.endsWith('.gz'))
        .sort()
        .reverse();
}; 