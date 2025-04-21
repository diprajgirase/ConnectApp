import { Request, Response } from 'express';
import { prisma } from '../config/database';
import logger from '../config/logger';
import * as s3Service from '../services/s3.service';
import path from 'path';
import fs from 'fs';
import { MediaType } from '@prisma/client';

/**
 * Upload media file
 */
export const uploadMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const { type = 'PROFILE_PICTURE', caption = '' } = req.body;

    // Validate media type
    if (!Object.values(MediaType).includes(type as MediaType)) {
      res.status(400).json({ error: 'Invalid media type' });
      return;
    }

    const file = req.file;

    // Create a folder structure based on user ID and media type
    const key = `${req.user.id}/${type.toLowerCase()}/${Date.now()}_${path.basename(file.filename)}`;

    // Upload the file to S3
    const url = await s3Service.uploadFile(file.path, key);

    // Create media record in the database
    const media = await prisma.media.create({
      data: {
        userId: req.user.id,
        url,
        type: type as MediaType,
        caption,
        uploadedAt: new Date(),
        isPublic: type === 'PROFILE_PICTURE', // Profile pictures are public by default
      },
    });

    // If this is a profile picture, update the user's profile
    if (type === 'PROFILE_PICTURE') {
      const profile = await prisma.profile.findUnique({
        where: { userId: req.user.id },
      });

      if (profile) {
        await prisma.profile.update({
          where: { userId: req.user.id },
          data: { profilePictureUrl: url },
        });
      } else {
        // Create profile if doesn't exist
        await prisma.profile.create({
          data: {
            userId: req.user.id,
            displayName: req.user.email.split('@')[0], // Default display name
            profilePictureUrl: url,
          },
        });
      }
    }

    res.status(201).json({
      id: media.id,
      url: media.url,
      type: media.type,
      caption: media.caption,
      uploadedAt: media.uploadedAt,
    });
  } catch (error) {
    logger.error('Error uploading media:', error);
    res.status(500).json({ error: 'Failed to upload media' });
  }
};

/**
 * Get media by ID
 */
export const getMediaById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { mediaId } = req.params;

    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      include: {
        user: {
          select: {
            id: true,
            profile: {
              select: {
                displayName: true,
              },
            },
          },
        },
      },
    });

    if (!media) {
      res.status(404).json({ error: 'Media not found' });
      return;
    }

    // Check if the media is accessible
    if (!media.isPublic && req.user?.id !== media.userId) {
      res.status(403).json({ error: 'You are not authorized to access this media' });
      return;
    }

    // Generate a signed URL if the media is not public
    let url = media.url;
    if (!media.isPublic) {
      const key = s3Service.extractKeyFromUrl(media.url);
      url = await s3Service.getSignedDownloadUrl(key);
    }

    res.json({
      id: media.id,
      url,
      type: media.type,
      caption: media.caption,
      uploadedAt: media.uploadedAt,
      user: {
        id: media.user.id,
        displayName: media.user.profile?.displayName || 'User',
      },
    });
  } catch (error) {
    logger.error('Error getting media:', error);
    res.status(500).json({ error: 'Failed to get media' });
  }
};

/**
 * Get all media for a user
 */
export const getUserMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { type } = req.query;

    // Build the query
    const query: any = {
      where: {
        userId,
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    };

    // Add type filter if provided
    if (type) {
      query.where.type = type;
    }

    // For non-authenticated users or different users, only return public media
    if (!req.user || req.user.id !== userId) {
      query.where.isPublic = true;
    }

    const media = await prisma.media.findMany(query);

    res.json(media);
  } catch (error) {
    logger.error('Error getting user media:', error);
    res.status(500).json({ error: 'Failed to get user media' });
  }
};

/**
 * Delete media
 */
export const deleteMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { mediaId } = req.params;

    // Find the media
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
    });

    if (!media) {
      res.status(404).json({ error: 'Media not found' });
      return;
    }

    // Check if the user is authorized to delete this media
    if (media.userId !== req.user.id) {
      res.status(403).json({ error: 'You are not authorized to delete this media' });
      return;
    }

    // Delete from S3
    const key = s3Service.extractKeyFromUrl(media.url);
    await s3Service.deleteFile(key);

    // Delete from database
    await prisma.media.delete({
      where: { id: mediaId },
    });

    // If this was a profile picture, update the profile
    if (media.type === 'PROFILE_PICTURE') {
      await prisma.profile.update({
        where: { userId: req.user.id },
        data: { profilePictureUrl: null },
      });
    }

    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    logger.error('Error deleting media:', error);
    res.status(500).json({ error: 'Failed to delete media' });
  }
};

/**
 * Update media metadata
 */
export const updateMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { mediaId } = req.params;
    const { caption, isPublic } = req.body;

    // Find the media
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
    });

    if (!media) {
      res.status(404).json({ error: 'Media not found' });
      return;
    }

    // Check if the user is authorized to update this media
    if (media.userId !== req.user.id) {
      res.status(403).json({ error: 'You are not authorized to update this media' });
      return;
    }

    // Update the media
    const updatedMedia = await prisma.media.update({
      where: { id: mediaId },
      data: {
        caption: caption !== undefined ? caption : media.caption,
        isPublic: isPublic !== undefined ? isPublic : media.isPublic,
      },
    });

    res.json({
      id: updatedMedia.id,
      url: updatedMedia.url,
      type: updatedMedia.type,
      caption: updatedMedia.caption,
      isPublic: updatedMedia.isPublic,
      uploadedAt: updatedMedia.uploadedAt,
    });
  } catch (error) {
    logger.error('Error updating media:', error);
    res.status(500).json({ error: 'Failed to update media' });
  }
};
