import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dating App API Documentation',
      version,
      description: 'API documentation for the Dating App backend services',
      contact: {
        name: 'API Support',
        email: 'support@datingapp.com',
      },
    },
    servers: [
      {
        url: '/api',
        description: 'API Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Authentication endpoints',
      },
      {
        name: 'Profile',
        description: 'User profile management',
      },
      {
        name: 'Match',
        description: 'Match discovery and management',
      },
      {
        name: 'Chat',
        description: 'Chat functionality',
      },
      {
        name: 'Media',
        description: 'Media upload and management',
      },
    ],
  },
  apis: ['./src/routes/*.routes.ts', './src/models/*.ts', './src/docs/*.yaml'],
};

export const specs = swaggerJsdoc(options);
