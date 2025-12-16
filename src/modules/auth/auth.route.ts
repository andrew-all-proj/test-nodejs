import express from 'express'
import { authMiddleware } from '../../middleware/auth'
import {
  infoController,
  logoutController,
  refreshTokenController,
  signinController,
  signupController,
} from './auth.controller'

const router = express.Router()

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               password:
 *                 type: string
 *             required: [id, password]
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/signup', signupController)

/**
 * @swagger
 * /signin:
 *   post:
 *     summary: Sign in
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               password:
 *                 type: string
 *             required: [id, password]
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/signin', signinController)

/**
 * @swagger
 * /signin/new_token:
 *   post:
 *     summary: Refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refresh_token:
 *                 type: string
 *             required: [refresh_token]
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/signin/new_token', refreshTokenController)

/**
 * @swagger
 * /info:
 *   get:
 *     summary: Current user info
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/info', authMiddleware, infoController)

/**
 * @swagger
 * /logout:
 *   get:
 *     summary: Logout
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/logout', authMiddleware, logoutController)

export default router
