import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { config } from '../config';
import * as schema from './schema/index';

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const db = drizzle(pool, { schema, mode: 'default' });
export { schema, pool };
