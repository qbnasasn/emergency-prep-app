import { Pool, neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Set the WebSocket proxy for Drizzle
// neonConfig.wsProxy = (host) => `${host}:5432/ws-proxy`;

let pool: Pool;

// Ensure the connection string has the required sslmode
const connectionString = `${process.env.POSTGRES_URL}?sslmode=require`;

if (process.env.NODE_ENV === 'production') {
  pool = new Pool({ connectionString });
} else {
  // In development, use a global variable to preserve the pool across hot-reloads
  if (!global.pool) {
    global.pool = new Pool({ connectionString });
  }
  pool = global.pool;
}

export default pool;

// Also export a Drizzle instance if needed elsewhere
// const db = drizzle(neon(connectionString));
// export { db };
