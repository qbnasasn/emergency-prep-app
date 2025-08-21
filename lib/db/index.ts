import { Pool } from 'pg';

let pool: Pool;

if (process.env.NODE_ENV === 'production') {
  pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  // In development, you might want to use a local database
  // or a different configuration.
  // For now, we'll use the same logic as production,
  // assuming the POSTGRES_URL is set in a .env file.
  if (!global.pool) {
    global.pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
    });
  }
  pool = global.pool;
}

export default pool;
