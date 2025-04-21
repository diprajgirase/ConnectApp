# Dating App Backend Development Context

## Project Overview

This document outlines the backend requirements for a modern dating application. The frontend has already been developed with features for user authentication, comprehensive onboarding, matching, and chat functionality. This backend implementation will provide all necessary APIs and services to support these frontend features.

## Core Backend Components

### 1. User Authentication System

- **Registration Endpoint**: `/api/auth/register`
  - Collects email, password, and basic user information
  - Performs validation and secure password hashing
  - Returns JWT token upon successful registration
- **Login Endpoint**: `/api/auth/login`
  - Validates credentials and returns JWT token
  - Includes refresh token mechanism
- **Password Reset**: `/api/auth/reset-password`
- **Email Verification**: `/api/auth/verify-email`
- **Security Features**:
  - Password hashing using bcrypt
  - JWT token management with expiration
  - Rate limiting for login attempts
  - CSRF protection

### 2. User Profile Management

- **Profile Data Storage**:
  - Separate tables/collections for different profile sections
  - Efficient schema design for querying match criteria
- **Profile Endpoints**:
  - Create/update profile: `/api/profile/update`
  - Get profile: `/api/profile/:userId`
  - Update specific sections: `/api/profile/section/:sectionName`
- **Profile Completion Tracking**:
  - Endpoint to track onboarding progress: `/api/profile/completion`
  - Logic to calculate profile strength/completeness

### 3. Onboarding Data Management

The backend must handle data for all onboarding sections:

- **Basic Information**:
  - Demographics, location, name, age, gender
  - Profile photo management
- **Caste & Community**:
  - Religious preferences, community, cultural background
- **Salary & Occupation**:
  - Income range, job title, industry, education
- **Lifestyle & Habits**:
  - Diet, exercise, smoking, drinking, etc.
- **Personality & Interests**:
  - Hobbies, personality traits, interests
- **Relationship Preferences**:
  - Preferred match attributes, deal-breakers
- **Values & Future Plans**:
  - Life goals, family planning, values alignment

### 4. Matching Algorithm

- **Core Matching Engine**:
  - Weighted attribute matching algorithm
  - Preference-based filtering system
  - Mutual compatibility scoring
- **Matching Endpoints**:
  - Get potential matches: `/api/matches/potential`
  - Get matched users: `/api/matches/confirmed`
  - Express interest: `/api/matches/interest/:userId`
  - Accept/reject match: `/api/matches/decision/:userId`
- **Algorithm Parameters**:
  - Priority weighting for different attributes
  - Distance/location importance calculation
  - Compatibility threshold configuration

### 5. Real-time Chat System

- **WebSocket Implementation**:
  - Connection management
  - Real-time message delivery
  - Typing indicators
  - Online status tracking
- **Chat Endpoints**:
  - Get chat list: `/api/chats`
  - Get chat history: `/api/chats/:chatId`
  - Send message: `/api/chats/:chatId/messages`
  - Mark messages as read: `/api/chats/:chatId/read`
- **Message Storage**:
  - Efficient schema for message history
  - Support for message types (text, image, etc.)
  - Message status tracking (sent, delivered, read)

### 6. Data Storage Architecture

- **Database Selection**:
  - Mongodb for structured relationship data
  - Redis for caching and real-time features
  - MongoDB for flexible document storage (optional)
- **Data Models**:
  - User model
  - Profile models (segmented by onboarding sections)
  - Match model (tracking match status)
  - Chat and Message models
  - User preferences model

### 7. Media and File Storage

- **Image Processing**:
  - Profile picture upload and processing
  - Image optimization and resizing
  - Content moderation for uploaded images
- **Storage System**:
  - Cloud storage integration (AWS S3, Google Cloud Storage)
  - CDN configuration for fast image delivery
  - Secure URL generation for private media

### 8. API Security and Performance

- **Authentication Middleware**:
  - JWT validation for protected routes
  - Role-based access control
- **API Rate Limiting**:
  - Prevent abuse of endpoints
  - Tiered rate limiting based on user activity
- **Data Validation**:
  - Input sanitization
  - Request schema validation
- **Performance Optimization**:
  - Response caching strategies
  - Database query optimization
  - Connection pooling

## Detailed Technical Stack

### Core Technologies

1. **Runtime Environment**:

   - Node.js (v18+ LTS) for server-side JavaScript execution

2. **Backend Framework**:

   - Express.js for API routing and middleware
   - NestJS (optional, for more structured architecture)

3. **Database Systems**:

   - Mongodb (v14+) for relational data storage
   - Redis (v6+) for caching, session management, and pub/sub
   - Prisma or TypeORM as ORM for database interactions

4. **Authentication & Security**:

   - JWT (jsonwebtoken) for token-based authentication
   - bcrypt for password hashing
   - Passport.js for authentication strategies
   - helmet for HTTP security headers
   - cors for Cross-Origin Resource Sharing
   - express-rate-limit for API rate limiting

5. **Real-time Communication**:

   - Socket.IO for WebSocket connections and real-time features
   - Redis adapter for Socket.IO to enable horizontal scaling

6. **File Storage**:

   - AWS SDK for S3 integration
   - Multer for file upload handling
   - sharp for image processing and optimization
   - Cloudinary or Imgix (optional) for image transformations

7. **Validation & Sanitization**:

   - Joi or Zod for schema validation
   - express-validator for request validation
   - sanitize-html for preventing XSS attacks

8. **Background Processing**:
   - Bull queue (with Redis) for handling background jobs
   - node-cron for scheduling periodic tasks

### Development Tools

1. **Language**:

   - TypeScript for type safety and better developer experience

2. **Project Setup**:

   - npm or yarn for package management
   - ESLint for code linting
   - Prettier for code formatting
   - nodemon for development server
   - ts-node for TypeScript execution

3. **Testing**:

   - Jest for unit and integration testing
   - Supertest for API endpoint testing
   - Testcontainers for integration tests with real databases

4. **Documentation**:

   - Swagger/OpenAPI for API documentation
   - JSDoc for code documentation

5. **Development Environment**:
   - Docker and Docker Compose for containerized development
   - dotenv for environment variable management

### DevOps & Deployment

1. **CI/CD**:

   - GitHub Actions or GitLab CI for continuous integration
   - Jest coverage reports for code quality

2. **Deployment**:

   - Docker for containerization
   - Docker Compose or Kubernetes for orchestration
   - AWS ECS/EKS, Azure AKS, or GCP GKE for container hosting

3. **Monitoring & Logging**:

   - Winston or Pino for logging
   - Prometheus for metrics collection
   - Grafana for visualization
   - Sentry for error tracking

4. **Security Scanning**:
   - npm audit for dependency vulnerabilities
   - OWASP ZAP or Snyk for security scanning

## API Structure

The backend should follow RESTful principles with the following base structure:

- `/api/auth/*` - Authentication endpoints
- `/api/profile/*` - Profile management
- `/api/onboarding/*` - Onboarding process data
- `/api/matches/*` - Match discovery and management
- `/api/chats/*` - Chat functionality
- `/api/media/*` - Media upload and management

## Service Integration Requirements

- **Email Service**: SendGrid or AWS SES for transactional emails
- **Push Notifications**: Firebase Cloud Messaging for mobile notifications
- **Content Moderation**: AWS Rekognition or Google Cloud Vision for image moderation
- **Geolocation Services**: Google Maps Geocoding API for location processing

## Data Privacy and Compliance

- User data protection in compliance with GDPR/CCPA
- Data encryption for sensitive information
- Privacy policy enforcement in backend logic
- Data retention and deletion policies

## Deployment Considerations

- Containerization with Docker
- Horizontal scaling for chat and matching services
- Database sharding strategy for large user bases
- CDN integration for static assets and media

## Monitoring and Analytics

- User behavior analytics tracking
- Performance metrics collection
- Error logging and alerting
- Matching algorithm effectiveness tracking

## Implementation Todo List

### Project Setup Tasks

1. [ ] Initialize Node.js project with TypeScript
2. [ ] Set up ESLint and Prettier configuration
3. [ ] Configure Git repository with appropriate .gitignore
4. [ ] Create folder structure for MVC architecture
5. [ ] Set up environment configuration with dotenv
6. [ ] Create Docker and Docker Compose files
7. [ ] Initialize database migrations structure
8. [ ] Set up CI/CD pipeline configurations
9. [ ] Configure logging system with Winston
10. [ ] Create base Express application with middleware

### Database Setup Tasks

7. [ ] Set up Redis for caching and session management
8. [ ] Configure ORM (Prisma/TypeORM) with database
9. [ ] Create database seeders for development
10. [ ] Implement data backup and recovery strategy

### Authentication & Security Tasks

1. [ ] Implement user registration endpoint
2. [ ] Implement login endpoint with JWT generation
3. [ ] Create JWT validation middleware
4. [ ] Set up password hashing with bcrypt
5. [ ] Implement refresh token mechanism
6. [ ] Create password reset functionality
7. [ ] Set up email verification system
8. [ ] Implement CSRF protection
9. [ ] Configure rate limiting for sensitive endpoints
10. [ ] Set up security headers with helmet
11. [ ] Implement role-based authorization

### User Profile Tasks

1. [ ] Create API endpoints for basic user information
2. [ ] Implement profile photo upload and management
3. [ ] Create endpoints for Caste & Community section
4. [ ] Create endpoints for Salary & Occupation section
5. [ ] Create endpoints for Lifestyle & Habits section
6. [ ] Create endpoints for Personality & Interests section
7. [ ] Create endpoints for Relationship Preferences section
8. [ ] Create endpoints for Values & Future Plans section
9. [ ] Implement profile completion tracking
10. [ ] Create validation schemas for all profile sections
11. [ ] Implement profile visibility settings

### Matching System Tasks

1. [ ] Design matching algorithm logic
2. [ ] Implement weighted attribute comparison
3. [ ] Create location-based filtering
4. [ ] Implement preference-based filtering
5. [ ] Create mutual interest detection
6. [ ] Build endpoints for potential matches
7. [ ] Implement match acceptance/rejection endpoints
8. [ ] Create match notification system
9. [ ] Implement match history tracking
10. [ ] Create algorithm performance metrics

### Chat System Tasks

1. [ ] Set up Socket.IO server
2. [ ] Implement chat room creation logic
3. [ ] Create message sending and receiving functionality
4. [ ] Implement typing indicator feature
5. [ ] Create online status tracking
6. [ ] Build chat history endpoint
7. [ ] Implement message read receipts
8. [ ] Create chat list endpoint with unread counts
9. [ ] Set up message notifications
10. [ ] Implement message search functionality
11. [ ] Add support for different message types (text, image)

### Media Management Tasks

1. [ ] Set up AWS S3 or similar cloud storage
2. [ ] Implement secure file upload functionality
3. [ ] Create image processing and optimization pipeline
4. [ ] Implement content moderation for uploads
5. [ ] Create secure URL generation for private media
6. [ ] Set up CDN configuration
7. [ ] Implement file type and size validation
8. [ ] Create media deletion functionality
9. [ ] Implement temporary URL generation for media

### External Integrations Tasks

1. [ ] Set up email service integration
2. [ ] Implement transactional email templates
3. [ ] Configure push notification service
4. [ ] Set up geolocation service integration
5. [ ] Implement content moderation API integration
6. [ ] Create SMS verification service (optional)
7. [ ] Set up error reporting integration (Sentry)

### Testing Tasks

1. [ ] Create unit tests for authentication logic
2. [ ] Implement integration tests for profile endpoints
3. [ ] Write tests for matching algorithm
4. [ ] Create WebSocket testing setup for chat
5. [ ] Implement database model tests
6. [ ] Create API endpoint tests
7. [ ] Set up end-to-end testing
8. [ ] Implement performance testing for matching algorithm
9. [ ] Create load testing scenarios

### Documentation & Monitoring Tasks

1. [ ] Set up Swagger/OpenAPI documentation
2. [ ] Create API documentation for all endpoints
3. [ ] Write JSDoc comments for core functions
4. [ ] Set up Prometheus metrics collection
5. [ ] Configure Grafana dashboards
6. [ ] Implement health check endpoints
7. [ ] Create developer onboarding documentation
8. [ ] Document database schema

### Deployment Tasks

1. [ ] Configure production Docker setup
2. [ ] Set up database deployment strategy
3. [ ] Configure production environment variables
4. [ ] Set up SSL/TLS certificates
5. [ ] Implement database backup routine
6. [ ] Configure monitoring and alerting
7. [ ] Set up auto-scaling rules
8. [ ] Create deployment documentation
9. [ ] Implement zero-downtime deployment strategy
10. [ ] Create disaster recovery plan
