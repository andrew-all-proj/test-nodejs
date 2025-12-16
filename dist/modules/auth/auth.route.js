"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middleware/auth");
const auth_controller_1 = require("./auth.controller");
const router = express_1.default.Router();
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
router.post('/signup', auth_controller_1.signupController);
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
router.post('/signin', auth_controller_1.signinController);
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
router.post('/signin/new_token', auth_controller_1.refreshTokenController);
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
router.get('/info', auth_1.authMiddleware, auth_controller_1.infoController);
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
router.get('/logout', auth_1.authMiddleware, auth_controller_1.logoutController);
exports.default = router;
