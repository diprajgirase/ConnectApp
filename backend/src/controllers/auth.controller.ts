import { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/database';
import { hashPassword, comparePasswords } from '../utils/password';
import { generateTokens } from '../utils/jwt';
import logger from '../config/logger';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        profile: {
          create: {
            displayName: firstName,
          },
        },
        basicInfo: {
          create: {
            firstName,
          },
        },
        casteInfo: {
          create: {},
        },
        occupationInfo: {
          create: {},
        },
        lifestyleInfo: {
          create: {},
        },
        personalityInfo: {
          create: {
            hobbies: [],
            interests: [],
            personalityTraits: [],
            musicTaste: [],
            movieTaste: [],
            sportsInterest: [],
          },
        },
        relationshipPrefs: {
          create: {
            lookingFor: [],
            preferredReligion: [],
            preferredCaste: [],
            educationPreference: [],
            occupationPreference: [],
          },
        },
        valuesPlan: {
          create: {
            futureGoals: [],
          },
        },
      },
    });

    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      message: 'User registered successfully',
      ...tokens,
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Verify password
    const isPasswordValid = await comparePasswords(password, user.hashedPassword);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      message: 'Login successful',
      ...tokens,
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        profile: true,
        basicInfo: true,
        casteInfo: true,
        lifestyleInfo: true,
        occupationInfo: true,
        personalityInfo: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.profile,
      demo: user,
    });
  } catch (error) {
    logger.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const admin = (req: Request, res: Response): void => {
  res.json({ message: 'Admin access granted' });
};
