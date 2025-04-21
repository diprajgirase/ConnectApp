import { backupDatabase, restoreDatabase, listBackups } from './backup';
import logger from '../config/logger';

const command = process.argv[2];

async function main() {
    try {
        switch (command) {
            case 'backup':
                const backupPath = await backupDatabase();
                console.log(`Backup created: ${backupPath}`);
                break;

            case 'restore':
                const backupFile = process.argv[3];
                if (!backupFile) {
                    console.error('Please specify a backup file to restore');
                    process.exit(1);
                }
                await restoreDatabase(backupFile);
                console.log('Database restored successfully');
                break;

            case 'list':
                const backups = listBackups();
                if (backups.length === 0) {
                    console.log('No backups found');
                } else {
                    console.log('Available backups:');
                    backups.forEach(backup => console.log(`- ${backup}`));
                }
                break;

            default:
                console.log('Usage:');
                console.log('  npm run backup    - Create a new backup');
                console.log('  npm run restore <file> - Restore from a backup file');
                console.log('  npm run backup list    - List available backups');
                process.exit(1);
        }
    } catch (error) {
        logger.error('Backup CLI error:', error);
        process.exit(1);
    }
}

main(); 