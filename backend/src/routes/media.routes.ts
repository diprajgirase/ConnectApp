import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import {
  uploadMedia,
  getMediaById,
  getUserMedia,
  deleteMedia,
  updateMedia,
} from '../controllers/media.controller';
import { uploadMiddleware } from '../middlewares/upload.middleware';

const router = Router();

/**
 * @swagger
 * /media/upload:
 *   post:
 *     summary: Upload media file
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload
 *               type:
 *                 type: string
 *                 enum: [PROFILE_PICTURE, CHAT_IMAGE, DOCUMENT, VIDEO]
 *                 default: PROFILE_PICTURE
 *                 description: Type of media
 *               caption:
 *                 type: string
 *                 description: Optional caption for the media
 *               isPublic:
 *                 type: boolean
 *                 default: false
 *                 description: Whether the media is publicly accessible
 *     responses:
 *       201:
 *         description: Media uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 url:
 *                   type: string
 *                 type:
 *                   type: string
 *                 uploadedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/upload', authenticate, uploadMiddleware.single('file'), uploadMedia);

/**
 * @swagger
 * /media/{mediaId}:
 *   get:
 *     summary: Get media by ID
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: mediaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the media to retrieve
 *     responses:
 *       200:
 *         description: Media found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 url:
 *                   type: string
 *                 type:
 *                   type: string
 *                 caption:
 *                   type: string
 *                 uploadedAt:
 *                   type: string
 *                   format: date-time
 *                 isPublic:
 *                   type: boolean
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:mediaId', getMediaById);

/**
 * @swagger
 * /media/user/{userId}:
 *   get:
 *     summary: Get all media for a user
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user whose media to retrieve
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [PROFILE_PICTURE, CHAT_IMAGE, DOCUMENT, VIDEO]
 *         description: Filter by media type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of media items to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: List of media items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 media:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       url:
 *                         type: string
 *                       type:
 *                         type: string
 *                       caption:
 *                         type: string
 *                       uploadedAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/user/:userId', getUserMedia);

/**
 * @swagger
 * /media/{mediaId}:
 *   delete:
 *     summary: Delete media
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mediaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the media to delete
 *     responses:
 *       200:
 *         description: Media deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:mediaId', authenticate, deleteMedia);

/**
 * @swagger
 * /media/{mediaId}:
 *   patch:
 *     summary: Update media metadata
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mediaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the media to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               caption:
 *                 type: string
 *                 description: Updated caption for the media
 *               isPublic:
 *                 type: boolean
 *                 description: Updated visibility status
 *     responses:
 *       200:
 *         description: Media updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 url:
 *                   type: string
 *                 type:
 *                   type: string
 *                 caption:
 *                   type: string
 *                 isPublic:
 *                   type: boolean
 *                 uploadedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/:mediaId', authenticate, updateMedia);

export default router;
