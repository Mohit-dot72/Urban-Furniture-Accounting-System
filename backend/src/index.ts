import './config/env'; // validate env first
import app from './app';
import { env } from './config/env';
import { prisma } from './lib/prisma';

const start = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL');

    app.listen(env.PORT, () => {
      console.log(`🚀 Backend running at http://localhost:${env.PORT}`);
      console.log(`📦 API base: http://localhost:${env.PORT}/api/v1`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
