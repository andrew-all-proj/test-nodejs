"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCredentials = validateCredentials;
exports.ensureRefreshToken = ensureRefreshToken;
function validateCredentials(id, password) {
    if (!id || !password) {
        const error = Object.assign(new Error('id and password are required'), { status: 400 });
        throw error;
    }
}
function ensureRefreshToken(refreshToken) {
    if (!refreshToken) {
        const error = Object.assign(new Error('refresh_token is required'), { status: 400 });
        throw error;
    }
}
