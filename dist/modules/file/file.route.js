"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const config_1 = require("../../config");
const auth_1 = require("../../middleware/auth");
const file_controller_1 = require("./file.controller");
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, config_1.config.uploadsDir);
    },
    filename: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        const baseName = req.params?.id || (0, uuid_1.v4)();
        const finalName = ext ? `${baseName}${ext}` : baseName;
        req.fileUuid = baseName;
        cb(null, finalName);
    },
});
const upload = (0, multer_1.default)({ storage });
router.use(auth_1.authMiddleware);
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
router.post("/upload", upload.single("file"), file_controller_1.uploadFileController);
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
router.get("/list", file_controller_1.listFilesController);
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
router.get("/download/:id", file_controller_1.downloadFileController);
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
router.delete("/delete/:id", file_controller_1.deleteFileController);
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
router.put("/update/:id", upload.single("file"), file_controller_1.updateFileController);
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
router.get("/:id", file_controller_1.getFileController);
exports.default = router;
