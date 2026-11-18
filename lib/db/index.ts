import { Pool, PoolConfig } from 'pg';

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  'postgres://postgres:postgres@localhost:5432/emergency_prep';

const useSsl =
  process.env.POSTGRES_SSL === 'true' ||
  connectionString.includes('sslmode=require');

const poolConfig: PoolConfig = {
  connectionString,
  ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
};

declare global {
  // eslint-disable-next-line no-var
  var pool: Pool | undefined;
}

let pool: Pool;

if (process.env.NODE_ENV === 'production') {
  pool = new Pool(poolConfig);
} else {
  // In development, preserve the pool across hot-reloads
  if (!global.pool) {
    global.pool = new Pool(poolConfig);
  }
  pool = global.pool;
}

export default pool;
