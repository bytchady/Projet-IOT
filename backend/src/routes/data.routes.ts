import { FastifyInstance } from 'fastify';
import { DataController } from '../controllers/data.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

export async function dataRoutes(fastify: FastifyInstance): Promise<void> {
  const dataController = new DataController();

  // GET /api/data/:roomId/today - Données d'aujourd'hui (pour room-dashboard)
  fastify.get<{ Params: { roomId: string } }>(
    '/data/:roomId/today',
    { preHandler: [authMiddleware()] },
    dataController.getDataForToday.bind(dataController)
  );

  // GET /api/data/:roomId/range - Données par plage de dates (pour rapport)
  fastify.get<{
    Params: { roomId: string };
    Querystring: { startDate: string; endDate: string };
  }>(
    '/data/:roomId/range',
    { preHandler: [authMiddleware()] },
    dataController.getDataByDateRange.bind(dataController)
  );

  // GET /api/data/rooms - Données pour plusieurs salles (pour rapport top 3)
  fastify.get<{
    Querystring: { roomIds: string; startDate: string; endDate: string };
  }>(
    '/data/rooms',
    { preHandler: [authMiddleware()] },
    dataController.getDataForMultipleRooms.bind(dataController)
  );
}
