import dotenv from 'dotenv';
import path from 'path';
import type { SignOptions } from 'jsonwebtoken';

dotenv.config();

type ExpiresIn = SignOptions['expiresIn'];

export const config = {
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
    accessExpiresIn: (process.env.JWT_ACCESS_EXPIRES || '10m') as ExpiresIn,
    refreshExpiresIn: (process.env.JWT_REFRESH_EXPIRES || '30d') as ExpiresIn
  },
  uploadsDir: path.resolve(process.cwd(), process.env.UPLOADS_DIR || 'uploads')
} as const;
