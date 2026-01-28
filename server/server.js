require('dotenv').config();

const app = require('./src/app');
const config = require('./src/config');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    app.listen(config.port, () => {
      console.log(`🚀 Server running on http://localhost:${config.port}`);
      console.log(`📍 API: http://localhost:${config.port}/api/${config.apiVersion}`);
    });
  } catch (error) {
    console.error('❌ Failed to start:', error);
    process.exit(1);
  }
}

startServer();