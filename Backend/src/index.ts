import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { registerRoutes } from './routes/index.js';
import { initDatabase } from './config/database.js';

const fastify = Fastify({
  logger: true
});

async function start() {
  try {
    // Register CORS
    await fastify.register(cors, {
      origin: true,
      credentials: true
    });

    // Register JWT
    await fastify.register(jwt, {
      secret: process.env.JWT_SECRET || 'thermocesi-secret-key'
    });

    // Initialize database connection
    await initDatabase();

    // Register routes
    await registerRoutes(fastify);

    // Start server
    const port = parseInt(process.env.PORT || '3000', 10);
    await fastify.listen({ port, host: '0.0.0.0' });

    console.log(`Server running on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
