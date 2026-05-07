import pg from 'pg';
import { config } from '../../../infrastructure/config/env.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.postgresUrl,
});

pool.on('error', (err) => {
  console.error('Unexpected Postgres pool error', err);
});
