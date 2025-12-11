import { Pool, QueryResult } from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/tasksphere';

const pool = new Pool({ connectionString });

export async function query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}

export default pool;

export async function close() {
  await pool.end();
}
