import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { DataController } from '../controllers/data.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

export async function dataRoutes(fastify: FastifyInstance): Promise<void> {
  const dataController = new DataController();

  // GET /api/room/:id/dataset/:heure - Get measurements for a room by hour
  fastify.get<{ Params: { id: string; heure: string } }>(
    '/room/:id/data/:heure',
    { preHandler: [authMiddleware(fastify)] },
    async (request: FastifyRequest<{ Params: { id: string; heure: string } }>, reply: FastifyReply) => {
      return dataController.getDataByHour(request, reply);
    }
  );

  // GET /api/room/:id/dataset - Get all recent measurements for a room
  fastify.get<{ Params: { id: string }; Querystring: { limit?: string } }>(
    '/room/:id/data',
    { preHandler: [authMiddleware(fastify)] },
    async (request: FastifyRequest<{ Params: { id: string }; Querystring: { limit?: string } }>, reply: FastifyReply) => {
      return dataController.getAllData(request, reply);
    }
  );

  // GET /api/room/:id/latest - Get latest measurement for a room
  fastify.get<{ Params: { id: string } }>(
    '/room/:id/latest',
    { preHandler: [authMiddleware(fastify)] },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      return dataController.getLatestData(request, reply);
    }
  );
}
