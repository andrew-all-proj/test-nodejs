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
exports.signupController = signupController;
exports.signinController = signinController;
exports.refreshTokenController = refreshTokenController;
exports.infoController = infoController;
exports.logoutController = logoutController;
const authService = __importStar(require("./auth.service"));
const auth_dto_1 = require("./dto/auth.dto");
const validation_1 = require("../../utils/validation");
async function signupController(req, res, next) {
    try {
        const dto = await (0, validation_1.validateDto)(auth_dto_1.AuthCredentialsDto, req.body);
        const tokens = await authService.signup(dto.id, dto.password);
        const body = {
            token: tokens.token,
            refresh_token: tokens.refreshToken,
        };
        return res.status(201).json(body);
    }
    catch (err) {
        return next(err);
    }
}
async function signinController(req, res, next) {
    try {
        const dto = await (0, validation_1.validateDto)(auth_dto_1.AuthCredentialsDto, req.body);
        const tokens = await authService.signin(dto.id, dto.password);
        const body = {
            token: tokens.token,
            refresh_token: tokens.refreshToken,
        };
        return res.json(body);
    }
    catch (err) {
        return next(err);
    }
}
async function refreshTokenController(req, res, next) {
    try {
        const dto = await (0, validation_1.validateDto)(auth_dto_1.RefreshTokenDto, req.body);
        const tokens = await authService.refreshToken(dto.refresh_token);
        const body = {
            token: tokens.token,
            refresh_token: tokens.refreshToken,
        };
        return res.json(body);
    }
    catch (err) {
        return next(err);
    }
}
function infoController(req, res) {
    return res.json({ id: req.user?.id });
}
async function logoutController(req, res, next) {
    try {
        const accessExpiresAtMs = req.user?.exp ? req.user.exp * 1000 : undefined;
        await authService.logout(req.user.id, req.user?.tokenJti, accessExpiresAtMs);
        const body = { message: "Logged out successfully" };
        return res.json(body);
    }
    catch (err) {
        return next(err);
    }
}
