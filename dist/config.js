"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
exports.config = {
    port: Number(process.env.PORT) || 3000,
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'test_nodejs'
    },
    security: {
        accessSecret: process.env.JWT_SECRET || 'dev_access_secret',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
        accessExpiresIn: (process.env.JWT_ACCESS_EXPIRES || '10m'),
        refreshExpiresIn: (process.env.JWT_REFRESH_EXPIRES || '30d')
    },
    uploadsDir: path_1.default.resolve(process.cwd(), process.env.UPLOADS_DIR || 'uploads')
};
