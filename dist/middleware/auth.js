"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const tokenService_1 = require("../services/tokenService");
async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
        return res.status(401).json({ error: 'Authorization header is missing' });
    }
    try {
        const payload = (0, tokenService_1.verifyAccessToken)(token);
        if (payload.type !== 'access') {
            return res.status(401).json({ error: 'Invalid token type' });
        }
        const isBlocked = await (0, tokenService_1.isTokenBlocked)(payload.jti);
        if (isBlocked) {
            return res.status(401).json({ error: 'Token was revoked' });
        }
        req.user = {
            id: String(payload.sub),
            tokenJti: payload.jti,
            exp: payload.exp
        };
        return next();
    }
    catch (err) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
}
