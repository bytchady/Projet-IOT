import pg from 'pg';

const { Pool } = pg;

let pool: pg.Pool;

export async function initDatabase(): Promise<void> {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://thermocesi:thermocesi@localhost:5432/thermocesi'
  });

  const client = await pool.connect();
  console.log('Connected to PostgreSQL database');
  client.release();
}

export function getPool(): pg.Pool {
  if (!pool) throw new Error('Database not initialized. Call initDatabase() first.');
  return pool;
}

export async function query<T extends pg.QueryResultRow = any>(
  text: string,
  params?: unknown[]
): Promise<pg.QueryResult<T>> {
  const start = Date.now();
  const result = await getPool().query<T>(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: result.rowCount });
  return result;
}

export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    console.log('Database connection closed');
  }
}
