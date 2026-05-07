import { createApp } from './app.js';
import { connectMongo } from './adapters/persistence/mongo/client.js';
import { pool } from './adapters/persistence/postgres/pool.js';
import { config } from './infrastructure/config/env.js';

async function main() {
  try {
    try {
      await connectMongo();
      console.log('MongoDB connected');
    } catch (mongoErr) {
      console.warn('MongoDB not available, continuing without audit trail:', mongoErr.message);
    }

    await pool.query('SELECT 1');
    console.log('PostgreSQL connected');

    const app = createApp();
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

main();

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});