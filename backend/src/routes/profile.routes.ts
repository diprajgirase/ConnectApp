import { Router, Request, Response } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import {
  getProfile,
  updateProfile,
  updateBasicInfo,
  updateCasteInfo,
  updateOccupationInfo,
  updateLifestyleInfo,
  updatePersonalityInfo,
  updateRelationshipPrefs,
  updateValuesPlan,
  getProfileCompletion,
} from '../controllers/profile.controller';

const router = Router();

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get current user's complete profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's complete profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile:
 *                   $ref: '#/components/schemas/Profile'
 *                 basicInfo:
 *                   type: object
 *                 casteInfo:
 *                   type: object
 *                 occupationInfo:
 *                   type: object
 *                 lifestyleInfo:
 *                   type: object
 *                 personalityInfo:
 *                   type: object
 *                 relationshipPrefs:
 *                   type: object
 *                 valuesPlan:
 *                   type: object
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/', authenticate, getProfile);

/**
 * @swagger
 * /profile:
 *   put:
 *     summary: Update user's main profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *               bio:
 *                 type: string
 *               isHidden:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put('/', authenticate, updateProfile);

/**
 * @swagger
 * /profile/basic:
 *   put:
 *     summary: Update user's basic information
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               gender:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 format: date
 *               location:
 *                 type: object
 *               height:
 *                 type: number
 *               maritalStatus:
 *                 type: string
 *               children:
 *                 type: string
 *     responses:
 *       200:
 *         description: Basic info updated successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put('/basic', authenticate, updateBasicInfo);

/**
 * @swagger
 * /profile/caste:
 *   put:
 *     summary: Update user's caste & community information
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               religion:
 *                 type: string
 *               caste:
 *                 type: string
 *               subCaste:
 *                 type: string
 *               motherTongue:
 *                 type: string
 *               community:
 *                 type: string
 *     responses:
 *       200:
 *         description: Caste info updated successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put('/caste', authenticate, updateCasteInfo);

/**
 * @swagger
 * /profile/occupation:
 *   put:
 *     summary: Update user's occupation & education information
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               education:
 *                 type: string
 *               highestDegree:
 *                 type: string
 *               occupation:
 *                 type: string
 *               employedIn:
 *                 type: string
 *               companyName:
 *                 type: string
 *               jobTitle:
 *                 type: string
 *               annualIncome:
 *                 type: string
 *     responses:
 *       200:
 *         description: Occupation info updated successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put('/occupation', authenticate, updateOccupationInfo);

/**
 * @swagger
 * /profile/lifestyle:
 *   put:
 *     summary: Update user's lifestyle information
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               diet:
 *                 type: string
 *               smoking:
 *                 type: string
 *               drinking:
 *                 type: string
 *               livingArrangement:
 *                 type: string
 *               hasDisability:
 *                 type: boolean
 *               disabilityDetails:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lifestyle info updated successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put('/lifestyle', authenticate, updateLifestyleInfo);

/**
 * @swagger
 * /profile/personality:
 *   put:
 *     summary: Update user's personality & interests information
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hobbies:
 *                 type: array
 *                 items:
 *                   type: string
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *               personalityTraits:
 *                 type: array
 *                 items:
 *                   type: string
 *               musicTaste:
 *                 type: array
 *                 items:
 *                   type: string
 *               movieTaste:
 *                 type: array
 *                 items:
 *                   type: string
 *               sportsInterest:
 *                 type: array
 *                 items:
 *                   type: string
 *               travelStyle:
 *                 type: string
 *     responses:
 *       200:
 *         description: Personality info updated successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put('/personality', authenticate, updatePersonalityInfo);

/**
 * @swagger
 * /profile/preferences:
 *   put:
 *     summary: Update user's relationship preferences
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lookingFor:
 *                 type: array
 *                 items:
 *                   type: string
 *               ageRangeMin:
 *                 type: integer
 *               ageRangeMax:
 *                 type: integer
 *               heightRangeMin:
 *                 type: number
 *               heightRangeMax:
 *                 type: number
 *               distanceRange:
 *                 type: integer
 *               preferredReligion:
 *                 type: array
 *                 items:
 *                   type: string
 *               preferredCaste:
 *                 type: array
 *                 items:
 *                   type: string
 *               educationPreference:
 *                 type: array
 *                 items:
 *                   type: string
 *               occupationPreference:
 *                 type: array
 *                 items:
 *                   type: string
 *               incomePreference:
 *                 type: string
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put('/preferences', authenticate, updateRelationshipPrefs);

/**
 * @swagger
 * /profile/values:
 *   put:
 *     summary: Update user's values & future plans
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               familyValues:
 *                 type: string
 *               religiousBeliefs:
 *                 type: string
 *               politicalViews:
 *                 type: string
 *               wantsChildren:
 *                 type: string
 *               futureGoals:
 *                 type: array
 *                 items:
 *                   type: string
 *               marriagePlans:
 *                 type: string
 *               relocateWilling:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Values info updated successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put('/values', authenticate, updateValuesPlan);

/**
 * @swagger
 * /profile/completion:
 *   get:
 *     summary: Get profile completion score and status
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile completion information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 completionScore:
 *                   type: number
 *                   format: float
 *                   description: Profile completion percentage
 *                 sections:
 *                   type: object
 *                   properties:
 *                     profile:
 *                       type: boolean
 *                     basicInfo:
 *                       type: boolean
 *                     casteInfo:
 *                       type: boolean
 *                     occupationInfo:
 *                       type: boolean
 *                     lifestyleInfo:
 *                       type: boolean
 *                     personalityInfo:
 *                       type: boolean
 *                     relationshipPrefs:
 *                       type: boolean
 *                     valuesPlan:
 *                       type: boolean
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/completion', authenticate, getProfileCompletion);

export default router;
