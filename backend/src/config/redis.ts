import { createClient } from 'redis';
import logger from './logger';

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                logger.error('Redis connection failed after 10 retries');
                return new Error('Redis connection failed');
            }
            return Math.min(retries * 100, 3000);
        },
    },
});

redisClient.on('error', (err) => logger.error('Redis Client Error', err));
redisClient.on('connect', () => logger.info('Redis Client Connected'));

// Connect to Redis
redisClient.connect().catch((err) => {
    logger.error('Redis connection error:', err);
    process.exit(1);
});

export default redisClient; 