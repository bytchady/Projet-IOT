import { FastifyInstance } from 'fastify';
import { RoomsController } from '../controllers/rooms.controller.js';
import { CreateRoomRequest, UpdateRoomRequest } from '../models/types.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

export async function roomsRoutes(fastify: FastifyInstance): Promise<void> {
  const roomsController = new RoomsController();

  // GET /api/rooms
  fastify.get(
    '/rooms',
    { preHandler: [authMiddleware()] },
    roomsController.getAllRooms.bind(roomsController)
  );

  // GET /api/rooms/:id
  fastify.get<{ Params: { id: string } }>(
    '/rooms/:id',
    { preHandler: [authMiddleware()] },
    roomsController.getRoomById.bind(roomsController)
  );

  // POST /api/rooms
  fastify.post<{ Body: CreateRoomRequest }>(
    '/rooms',
    { preHandler: [authMiddleware()] },
    roomsController.createRoom.bind(roomsController)
  );

  // PUT /api/rooms
  fastify.put<{ Params: { id: string }, Body: UpdateRoomRequest }>(
    '/rooms/:id',
    { preHandler: [authMiddleware()] },
    roomsController.updateRoom.bind(roomsController)
  )

  // DELETE /api/rooms
  fastify.delete<{ Params: { id: string }, Body: UpdateRoomRequest }>(
    '/rooms/:id',
    { preHandler: [authMiddleware()] },
    roomsController.deleteRoom.bind(roomsController)
  )
}
