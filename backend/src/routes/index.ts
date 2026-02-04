import { FastifyInstance } from 'fastify';
import { authRoutes } from './auth.routes.js';
import { roomsRoutes } from './rooms.routes.js';
import { dataRoutes } from './data.routes.js';
import { hoursRoutes } from './hours.routes.js';
import { arduinoRoutes } from './arduino.routes.js';

export async function registerRoutes(fastify: FastifyInstance): Promise<void> {
  // Health check
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // API routes
  await fastify.register(authRoutes, { prefix: '/api' });
  await fastify.register(roomsRoutes, { prefix: '/api' });
  await fastify.register(dataRoutes, { prefix: '/api' });
  await fastify.register(hoursRoutes, { prefix: '/api' });

  // Arduino routes
  await fastify.register(arduinoRoutes, { prefix: '/arduino' });
}
