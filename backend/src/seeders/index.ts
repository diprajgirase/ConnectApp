import { PrismaClient } from '@prisma/client';
import logger from '../config/logger';

const prisma = new PrismaClient();

const seedUsers = async () => {
    try {
        // Create test users
        const users = await Promise.all([
            prisma.user.create({
                data: {
                    email: 'test1@example.com',
                    hashedPassword: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu.Vm', // password: test123
                    phoneNumber: '+1234567890',
                    isVerified: true,
                    role: 'USER',
                    status: 'ACTIVE',
                    profile: {
                        create: {
                            displayName: 'Test User 1',
                            bio: 'This is a test user profile',
                            completionScore: 100,
                            profilePictureUrl: 'https://example.com/profile1.jpg',
                        },
                    },
                    basicInfo: {
                        create: {
                            firstName: 'Test',
                            lastName: 'User1',
                            gender: 'MALE',
                            birthDate: new Date('1990-01-01'),
                            location: {
                                country: 'USA',
                                state: 'California',
                                city: 'San Francisco',
                                coordinates: { lat: 37.7749, lng: -122.4194 },
                            },
                            height: 180,
                            maritalStatus: 'SINGLE',
                        },
                    },
                },
            }),
            prisma.user.create({
                data: {
                    email: 'test2@example.com',
                    hashedPassword: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu.Vm', // password: test123
                    phoneNumber: '+1987654321',
                    isVerified: true,
                    role: 'USER',
                    status: 'ACTIVE',
                    profile: {
                        create: {
                            displayName: 'Test User 2',
                            bio: 'This is another test user profile',
                            completionScore: 100,
                            profilePictureUrl: 'https://example.com/profile2.jpg',
                        },
                    },
                    basicInfo: {
                        create: {
                            firstName: 'Test',
                            lastName: 'User2',
                            gender: 'FEMALE',
                            birthDate: new Date('1992-01-01'),
                            location: {
                                country: 'USA',
                                state: 'New York',
                                city: 'New York',
                                coordinates: { lat: 40.7128, lng: -74.0060 },
                            },
                            height: 165,
                            maritalStatus: 'SINGLE',
                        },
                    },
                },
            }),
        ]);

        logger.info('Test users created successfully');
        return users;
    } catch (error) {
        logger.error('Error seeding users:', error);
        throw error;
    }
};

const seedDatabase = async () => {
    try {
        // Clear existing data
        await prisma.user.deleteMany();
        logger.info('Cleared existing data');

        // Seed new data
        await seedUsers();
        logger.info('Database seeding completed successfully');
    } catch (error) {
        logger.error('Error seeding database:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
};

// Run the seeder
if (require.main === module) {
    seedDatabase()
        .then(() => process.exit(0))
        .catch((error) => {
            logger.error('Seeding failed:', error);
            process.exit(1);
        });
}

export { seedDatabase }; 