"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = signup;
exports.signin = signin;
exports.refreshToken = refreshToken;
exports.logout = logout;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const drizzle_orm_1 = require("drizzle-orm");
const index_1 = require("../../db/index");
const tokenService_1 = require("../../services/tokenService");
async function signup(id, password) {
    const existing = await index_1.db.query.users.findFirst({
        where: (0, drizzle_orm_1.eq)(index_1.schema.users.userId, id)
    });
    if (existing) {
        throw Object.assign(new Error('User already exists'), { status: 400 });
    }
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    await index_1.db.insert(index_1.schema.users).values({
        userId: id,
        passwordHash
    });
    return (0, tokenService_1.issueTokenPair)(id);
}
async function signin(id, password) {
    const user = await index_1.db.query.users.findFirst({
        where: (0, drizzle_orm_1.eq)(index_1.schema.users.userId, id)
    });
    if (!user) {
        throw Object.assign(new Error('Invalid credentials'), { status: 401 });
    }
    const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!valid) {
        throw Object.assign(new Error('Invalid credentials'), { status: 401 });
    }
    return (0, tokenService_1.issueTokenPair)(user.userId);
}
async function refreshToken(refreshToken) {
    let payload;
    try {
        payload = (0, tokenService_1.verifyRefreshToken)(refreshToken);
    }
    catch (err) {
        throw Object.assign(new Error('Invalid refresh token'), { status: 401 });
    }
    if (payload.type !== 'refresh') {
        throw Object.assign(new Error('Invalid token type'), { status: 401 });
    }
    const stored = await (0, tokenService_1.findRefreshTokenByJti)(payload.jti);
    const hashed = (0, tokenService_1.hashToken)(refreshToken);
    if (!stored || stored.tokenHash !== hashed) {
        throw Object.assign(new Error('Refresh token not found or revoked'), { status: 401 });
    }
    if (stored.revoked) {
        throw Object.assign(new Error('Refresh token revoked'), { status: 401 });
    }
    if (new Date(stored.expiresAt) < new Date()) {
        throw Object.assign(new Error('Refresh token expired'), { status: 401 });
    }
    const newTokens = await (0, tokenService_1.issueTokenPair)(payload.sub);
    await (0, tokenService_1.revokeRefreshToken)(payload.jti, newTokens.refreshJti);
    await (0, tokenService_1.blockToken)(payload.jti, payload.sub, payload.exp ? payload.exp * 1000 : null);
    return newTokens;
}
async function logout(userId, accessJti, accessExpiresAtMs) {
    if (accessJti) {
        // Shared JTI for access/refresh: revoke stored refresh record if present
        const stored = await (0, tokenService_1.findRefreshTokenByJti)(accessJti);
        if (stored && stored.userId === userId && !stored.revoked) {
            await (0, tokenService_1.revokeRefreshToken)(accessJti, null);
        }
        await (0, tokenService_1.blockToken)(accessJti, userId, accessExpiresAtMs ?? null);
    }
}
