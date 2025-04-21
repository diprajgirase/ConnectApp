import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import {
  getPotentialMatches,
  getConfirmedMatches,
  expressInterest,
  makeMatchDecision,
  getMatchDetails,
  getMatchesSummary,
} from '../controllers/match.controller';

const router = Router();

/**
 * @swagger
 * /matches/potential:
 *   get:
 *     summary: Get potential matches for the user
 *     tags: [Match]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of matches to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: List of potential matches
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 matches:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Match'
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
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/potential', authenticate, getPotentialMatches);

/**
 * @swagger
 * /matches/confirmed:
 *   get:
 *     summary: Get confirmed matches for the user
 *     tags: [Match]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of matches to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: List of confirmed matches
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 matches:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Match'
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
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/confirmed', authenticate, getConfirmedMatches);

/**
 * @swagger
 * /matches/summary:
 *   get:
 *     summary: Get match statistics and summary
 *     tags: [Match]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Match summary statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalMatches:
 *                   type: integer
 *                 pendingMatches:
 *                   type: integer
 *                 acceptedMatches:
 *                   type: integer
 *                 rejectedMatches:
 *                   type: integer
 *                 newMatches:
 *                   type: integer
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/summary', authenticate, getMatchesSummary);

/**
 * @swagger
 * /matches/{matchId}:
 *   get:
 *     summary: Get details of a specific match
 *     tags: [Match]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the match to retrieve
 *     responses:
 *       200:
 *         description: Match details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Match'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:matchId', authenticate, getMatchDetails);

/**
 * @swagger
 * /matches/interest/{userId}:
 *   post:
 *     summary: Express interest in another user
 *     tags: [Match]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to express interest in
 *     responses:
 *       200:
 *         description: Interest expressed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 match:
 *                   $ref: '#/components/schemas/Match'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/interest/:userId', authenticate, expressInterest);

/**
 * @swagger
 * /matches/decision/{matchId}:
 *   post:
 *     summary: Accept or reject a match
 *     tags: [Match]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the match to decide on
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - decision
 *             properties:
 *               decision:
 *                 type: string
 *                 enum: [ACCEPTED, REJECTED]
 *                 description: Decision on the match
 *     responses:
 *       200:
 *         description: Match decision processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 match:
 *                   $ref: '#/components/schemas/Match'
 *                 chatRoomId:
 *                   type: string
 *                   description: ID of the created chat room (if match was accepted)
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/decision/:matchId', authenticate, makeMatchDecision);

export default router;
