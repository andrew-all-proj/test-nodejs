"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePagination = parsePagination;
exports.ensureFileProvided = ensureFileProvided;
function parsePagination(listSizeRaw, pageRaw) {
    const listSize = Math.max(1, parseInt(listSizeRaw || '', 10) || 10);
    const page = Math.max(1, parseInt(pageRaw || '', 10) || 1);
    return { listSize, page };
}
function ensureFileProvided(file) {
    if (!file) {
        const error = Object.assign(new Error('No file uploaded'), { status: 400 });
        throw error;
    }
}
