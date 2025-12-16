"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFileController = uploadFileController;
exports.listFilesController = listFilesController;
exports.downloadFileController = downloadFileController;
exports.deleteFileController = deleteFileController;
exports.updateFileController = updateFileController;
exports.getFileController = getFileController;
const fileService = __importStar(require("./file.service"));
const file_validation_1 = require("./file.validation");
async function uploadFileController(req, res, next) {
    try {
        (0, file_validation_1.ensureFileProvided)(req.file);
        const payload = await fileService.uploadFile(req.file, req.fileUuid);
        const body = payload;
        return res.status(201).json(body);
    }
    catch (err) {
        return next(err);
    }
}
async function listFilesController(req, res, next) {
    try {
        const { listSize, page } = (0, file_validation_1.parsePagination)(req.query.list_size, req.query.page);
        const offset = (page - 1) * listSize;
        const { files, total } = await fileService.listFiles(listSize, offset);
        const body = {
            page,
            page_size: listSize,
            total,
            data: files
        };
        return res.json(body);
    }
    catch (err) {
        return next(err);
    }
}
async function downloadFileController(req, res, next) {
    try {
        const fileId = req.params.id;
        const fileRow = await fileService.findFile(fileId);
        if (!fileRow) {
            return res.status(404).json({ error: 'File not found' });
        }
        const storedName = fileRow.extension ? `${fileRow.id}.${fileRow.extension}` : fileRow.id;
        const filePath = fileService.buildDownloadPath(storedName);
        return res.download(filePath, fileRow.originalName, err => {
            if (err)
                return next(err);
        });
    }
    catch (err) {
        return next(err);
    }
}
async function deleteFileController(req, res, next) {
    try {
        const fileId = req.params.id;
        await fileService.deleteFile(fileId);
        const body = { message: 'File deleted' };
        return res.json(body);
    }
    catch (err) {
        return next(err);
    }
}
async function updateFileController(req, res, next) {
    try {
        (0, file_validation_1.ensureFileProvided)(req.file);
        const fileId = req.params.id;
        await fileService.updateFile(fileId, req.file);
        const body = { message: 'File updated' };
        return res.json(body);
    }
    catch (err) {
        return next(err);
    }
}
async function getFileController(req, res, next) {
    try {
        const fileId = req.params.id;
        const fileRow = await fileService.findFile(fileId);
        if (!fileRow) {
            return res.status(404).json({ error: 'File not found' });
        }
        const body = fileRow;
        return res.json(body);
    }
    catch (err) {
        return next(err);
    }
}
