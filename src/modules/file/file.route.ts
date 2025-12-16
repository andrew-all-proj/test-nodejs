import express from 'express'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import { config } from '../../config'
import { authMiddleware } from '../../middleware/auth'
import type { AuthRequest } from '../../middleware/auth'
import {
  deleteFileController,
  downloadFileController,
  getFileController,
  listFilesController,
  updateFileController,
  uploadFileController,
} from './file.controller'

const router = express.Router()

type UploadRequest = AuthRequest

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.uploadsDir)
  },
  filename: (req: UploadRequest, file, cb) => {
    const ext = path.extname(file.originalname)
    const baseName = req.params?.id || uuidv4()
    const finalName = ext ? `${baseName}${ext}` : baseName
    req.fileUuid = baseName
    cb(null, finalName)
  },
})

const upload = multer({ storage })

router.use(authMiddleware)

/**
 * @swagger
 * /file/upload:
 *   post:
 *     summary: Upload file
 *     tags: [File]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/upload', upload.single('file'), uploadFileController)

/**
 * @swagger
 * /file/list:
 *   get:
 *     summary: List files
 *     tags: [File]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: list_size
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/list', listFilesController)

/**
 * @swagger
 * /file/download/{id}:
 *   get:
 *     summary: Download file
 *     tags: [File]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: File stream
 */
router.get('/download/:id', downloadFileController)

/**
 * @swagger
 * /file/delete/{id}:
 *   delete:
 *     summary: Delete file
 *     tags: [File]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete('/delete/:id', deleteFileController)

/**
 * @swagger
 * /file/update/{id}:
 *   put:
 *     summary: Update file
 *     tags: [File]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Updated
 */
router.put('/update/:id', upload.single('file'), updateFileController)

/**
 * @swagger
 * /file/{id}:
 *   get:
 *     summary: Get file metadata
 *     tags: [File]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/:id', getFileController)

export default router
