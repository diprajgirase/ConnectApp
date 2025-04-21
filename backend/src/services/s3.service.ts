import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import logger from '../config/logger';

// S3 configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'dating-app-uploads';
const EXPIRES_IN = 3600; // URL expiry in seconds (1 hour)

/**
 * Upload a file to S3
 * @param filePath Local file path
 * @param key Object key (path within the bucket)
 * @returns URL of the uploaded file
 */
export const uploadFile = async (filePath: string, key: string): Promise<string> => {
  try {
    const fileContent = fs.readFileSync(filePath);

    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileContent,
      ContentType: getContentType(filePath),
    };

    await s3Client.send(new PutObjectCommand(params));

    // Delete local file after successful upload
    fs.unlinkSync(filePath);

    // Return the S3 URL
    return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
  } catch (error) {
    logger.error('Error uploading file to S3:', error);
    throw new Error('Failed to upload file to S3');
  }
};

/**
 * Generate a pre-signed URL for getting an object from S3
 * @param key Object key (path within the bucket)
 * @returns Pre-signed URL
 */
export const getSignedDownloadUrl = async (key: string): Promise<string> => {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    const command = new GetObjectCommand(params);
    return await getSignedUrl(s3Client, command, { expiresIn: EXPIRES_IN });
  } catch (error) {
    logger.error('Error generating pre-signed URL:', error);
    throw new Error('Failed to generate pre-signed URL');
  }
};

/**
 * Delete an object from S3
 * @param key Object key (path within the bucket)
 */
export const deleteFile = async (key: string): Promise<void> => {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    await s3Client.send(new DeleteObjectCommand(params));
  } catch (error) {
    logger.error('Error deleting file from S3:', error);
    throw new Error('Failed to delete file from S3');
  }
};

/**
 * Extract the key from a full S3 URL
 * @param url Full S3 URL
 * @returns Object key
 */
export const extractKeyFromUrl = (url: string): string => {
  if (!url) return '';

  // Handle URLs in different formats
  if (url.includes(`${BUCKET_NAME}.s3.amazonaws.com/`)) {
    return url.split(`${BUCKET_NAME}.s3.amazonaws.com/`)[1];
  } else if (url.includes('.s3.amazonaws.com/')) {
    return url.split('.s3.amazonaws.com/')[1];
  } else {
    // Fallback for other URL formats
    const urlObj = new URL(url);
    return urlObj.pathname.substring(1); // Remove leading slash
  }
};

/**
 * Get the content type based on file extension
 * @param filePath File path
 * @returns Content type
 */
const getContentType = (filePath: string): string => {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';

  const contentTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    mp4: 'video/mp4',
    mp3: 'audio/mpeg',
  };

  return contentTypes[ext] || 'application/octet-stream';
};
