"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = uploadFile;
exports.listFiles = listFiles;
exports.findFile = findFile;
exports.deleteFile = deleteFile;
exports.updateFile = updateFile;
exports.buildDownloadPath = buildDownloadPath;
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const drizzle_orm_1 = require("drizzle-orm");
const index_1 = require("../../db/index");
const config_1 = require("../../config");
async function uploadFile(file, fileUuid) {
    const extension = path_1.default.extname(file.originalname).replace(".", "");
    const newId = fileUuid;
    if (!newId) {
        throw Object.assign(new Error("File id missing"), { status: 500 });
    }
    await index_1.db
        .insert(index_1.schema.files)
        .values({
        id: newId,
        originalName: file.originalname,
        extension,
        mimeType: file.mimetype,
        size: file.size,
    })
        .execute();
    return {
        id: newId,
        name: file.originalname,
        extension,
        mime_type: file.mimetype,
        size: file.size,
        uploaded_at: new Date(),
    };
}
async function listFiles(listSize, offset) {
    const files = await index_1.db
        .select({
        id: index_1.schema.files.id,
        original_name: index_1.schema.files.originalName,
        extension: index_1.schema.files.extension,
        mime_type: index_1.schema.files.mimeType,
        size: index_1.schema.files.size,
        uploaded_at: index_1.schema.files.uploadedAt,
        updated_at: index_1.schema.files.updatedAt,
    })
        .from(index_1.schema.files)
        .orderBy((0, drizzle_orm_1.desc)(index_1.schema.files.uploadedAt))
        .limit(listSize)
        .offset(offset);
    const [{ total }] = (await index_1.db
        .select({ total: (0, drizzle_orm_1.sql) `COUNT(*)`.as("total") })
        .from(index_1.schema.files)) || [];
    const totalNumber = Number(total) || 0;
    return { files, total: totalNumber };
}
async function findFile(fileId) {
    const file = await index_1.db.query.files.findFirst({
        columns: {
            id: true,
            originalName: true,
            extension: true,
            mimeType: true,
            size: true,
            uploadedAt: true,
            updatedAt: true,
        },
        where: (0, drizzle_orm_1.eq)(index_1.schema.files.id, fileId),
    });
    return file ?? null;
}
async function deleteFile(fileId) {
    const fileRow = await index_1.db.query.files.findFirst({
        columns: { id: true, extension: true },
        where: (0, drizzle_orm_1.eq)(index_1.schema.files.id, fileId),
    });
    if (!fileRow) {
        const error = Object.assign(new Error("File not found"), { status: 404 });
        throw error;
    }
    const filePath = path_1.default.join(config_1.config.uploadsDir, fileRow.extension ? `${fileRow.id}.${fileRow.extension}` : fileRow.id);
    await index_1.db.delete(index_1.schema.files).where((0, drizzle_orm_1.eq)(index_1.schema.files.id, fileId));
    await promises_1.default.unlink(filePath).catch(() => { });
}
async function updateFile(fileId, file) {
    const newUploadPath = path_1.default.isAbsolute(file.path)
        ? file.path
        : path_1.default.join(config_1.config.uploadsDir, file.filename);
    const existing = await index_1.db.query.files.findFirst({
        columns: { id: true, extension: true },
        where: (0, drizzle_orm_1.eq)(index_1.schema.files.id, fileId),
    });
    if (!existing) {
        await promises_1.default.unlink(newUploadPath).catch(() => { });
        const error = Object.assign(new Error("File not found"), { status: 404 });
        throw error;
    }
    const extension = path_1.default.extname(file.originalname).replace(".", "");
    const newPath = path_1.default.join(config_1.config.uploadsDir, extension ? `${fileId}.${extension}` : fileId);
    const oldPath = path_1.default.join(config_1.config.uploadsDir, existing.extension ? `${existing.id}.${existing.extension}` : existing.id);
    await index_1.db
        .update(index_1.schema.files)
        .set({
        originalName: file.originalname,
        extension,
        mimeType: file.mimetype,
        size: file.size,
    })
        .where((0, drizzle_orm_1.eq)(index_1.schema.files.id, fileId));
    if (oldPath !== newPath) {
        await promises_1.default.unlink(oldPath).catch(() => { });
    }
}
function buildDownloadPath(storedName) {
    return path_1.default.join(config_1.config.uploadsDir, storedName);
}
