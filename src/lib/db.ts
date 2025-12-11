import { Pool, QueryResult } from 'pg';

// Global database configuration
export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'tasksphere',
  user: process.env.DB_USER || 'tasksphere',
  password: process.env.DB_PASSWORD || '1234',
};

// Build connection string from config
const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`;

const pool = new Pool({ connectionString });

export async function query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}

export default pool;

export async function close() {
  await pool.end();
}
