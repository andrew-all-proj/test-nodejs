"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashToken = hashToken;
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.storeRefreshToken = storeRefreshToken;
exports.findRefreshTokenByJti = findRefreshTokenByJti;
exports.revokeRefreshToken = revokeRefreshToken;
exports.blockToken = blockToken;
exports.isTokenBlocked = isTokenBlocked;
exports.verifyRefreshToken = verifyRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
exports.issueTokenPair = issueTokenPair;
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const config_1 = require("../config");
const index_1 = require("../db/index");
const drizzle_orm_1 = require("drizzle-orm");
function sha256(value) {
    return crypto_1.default.createHash('sha256').update(value).digest('hex');
}
function hashToken(token) {
    return sha256(token);
}
function decodeExpiryMs(token) {
    const payload = jsonwebtoken_1.default.decode(token);
    if (!payload || !payload.exp)
        return null;
    return payload.exp * 1000;
}
function generateAccessToken(userId, jti = (0, uuid_1.v4)()) {
    const token = jsonwebtoken_1.default.sign({ sub: userId, jti, type: 'access' }, config_1.config.security.accessSecret, {
        expiresIn: config_1.config.security.accessExpiresIn
    });
    return { token, jti, expiresAt: decodeExpiryMs(token) };
}
function generateRefreshToken(userId, jti = (0, uuid_1.v4)()) {
    const token = jsonwebtoken_1.default.sign({ sub: userId, jti, type: 'refresh' }, config_1.config.security.refreshSecret, {
        expiresIn: config_1.config.security.refreshExpiresIn
    });
    return { token, jti, expiresAt: decodeExpiryMs(token) };
}
async function storeRefreshToken({ userId, token, jti, expiresAt }) {
    const tokenHash = hashToken(token);
    await index_1.db.insert(index_1.schema.refreshTokens).values({
        userId,
        tokenHash,
        tokenJti: jti,
        expiresAt: expiresAt ? new Date(expiresAt) : new Date(),
        revoked: false
    });
}
async function findRefreshTokenByJti(jti) {
    const row = await index_1.db.query.refreshTokens.findFirst({
        where: (0, drizzle_orm_1.eq)(index_1.schema.refreshTokens.tokenJti, jti)
    });
    return row || null;
}
async function revokeRefreshToken(jti, replacedBy = null) {
    await index_1.db
        .update(index_1.schema.refreshTokens)
        .set({ revoked: true, replacedBy, revokedAt: new Date() })
        .where((0, drizzle_orm_1.eq)(index_1.schema.refreshTokens.tokenJti, jti));
}
async function blockToken(jti, userId, expiresAtMs) {
    if (!jti)
        return;
    const expiresAt = expiresAtMs ? new Date(expiresAtMs) : null;
    await index_1.db
        .insert(index_1.schema.blockedTokens)
        .values({ tokenJti: jti, userId, expiresAt })
        .onDuplicateKeyUpdate({ set: { expiresAt } });
}
async function isTokenBlocked(jti) {
    if (!jti)
        return false;
    const row = await index_1.db.query.blockedTokens.findFirst({
        where: (0, drizzle_orm_1.eq)(index_1.schema.blockedTokens.tokenJti, jti)
    });
    return !!row;
}
function verifyRefreshToken(token) {
    return jsonwebtoken_1.default.verify(token, config_1.config.security.refreshSecret);
}
function verifyAccessToken(token) {
    return jsonwebtoken_1.default.verify(token, config_1.config.security.accessSecret);
}
async function issueTokenPair(userId) {
    const sharedJti = (0, uuid_1.v4)();
    const access = generateAccessToken(userId, sharedJti);
    const refresh = generateRefreshToken(userId, sharedJti);
    await storeRefreshToken({
        userId,
        token: refresh.token,
        jti: refresh.jti,
        expiresAt: refresh.expiresAt
    });
    return {
        token: access.token,
        refreshToken: refresh.token,
        accessJti: access.jti,
        refreshJti: refresh.jti,
        accessExpiresAt: access.expiresAt,
        refreshExpiresAt: refresh.expiresAt
    };
}
