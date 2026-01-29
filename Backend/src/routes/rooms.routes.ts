import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { RoomsController } from '../controllers/rooms.controller.js';
import { CreateRoomRequest, UpdateRoomRequest } from '../models/types.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

export async function roomsRoutes(fastify: FastifyInstance): Promise<void> {
  const roomsController = new RoomsController();

  // GET /api/rooms - List all rooms
  fastify.get(
    '/rooms',
    { preHandler: [authMiddleware(fastify)] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return roomsController.getAllRooms(request, reply);
    }
  );

  // GET /api/rooms/:id - Get room by ID
  fastify.get<{ Params: { id: string } }>(
    '/rooms/:id',
    { preHandler: [authMiddleware(fastify)] },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      return roomsController.getRoomById(request, reply);
    }
  );

  // PUT /api/rooms - Create a room
  fastify.put<{ Body: CreateRoomRequest }>(
    '/rooms',
    {
      preHandler: [authMiddleware(fastify)],
      schema: {
        body: {
          type: 'object',
          required: ['name_room'],
          properties: {
            name_room: { type: 'string' },
            ip_arduino: { type: 'string' },
            volume_room: { type: 'number' },
            glazed_surface: { type: 'number' },
            nb_doors: { type: 'integer' },
            nb_exterior_walls: { type: 'integer' },
            co2_threshold: { type: 'integer' },
            min_temp: { type: 'number' },
            max_temp: { type: 'number' },
            min_hum: { type: 'number' },
            max_hum: { type: 'number' }
          }
        }
      }
    },
    async (request: FastifyRequest<{ Body: CreateRoomRequest }>, reply: FastifyReply) => {
      return roomsController.createRoom(request, reply);
    }
  );

  // PATCH /api/rooms - Update a room
  fastify.patch<{ Body: UpdateRoomRequest }>(
    '/rooms',
    {
      preHandler: [authMiddleware(fastify)],
      schema: {
        body: {
          type: 'object',
          required: ['id_room'],
          properties: {
            id_room: { type: 'string' },
            name_room: { type: 'string' },
            ip_arduino: { type: 'string' },
            volume_room: { type: 'number' },
            glazed_surface: { type: 'number' },
            nb_doors: { type: 'integer' },
            nb_exterior_walls: { type: 'integer' },
            co2_threshold: { type: 'integer' },
            min_temp: { type: 'number' },
            max_temp: { type: 'number' },
            min_hum: { type: 'number' },
            max_hum: { type: 'number' }
          }
        }
      }
    },
    async (request: FastifyRequest<{ Body: UpdateRoomRequest }>, reply: FastifyReply) => {
      return roomsController.updateRoom(request, reply);
    }
  );

  // DELETE /api/rooms - Delete a room (soft delete)
  fastify.delete<{ Body: { id_room: string } }>(
    '/rooms',
    {
      preHandler: [authMiddleware(fastify)],
      schema: {
        body: {
          type: 'object',
          required: ['id_room'],
          properties: {
            id_room: { type: 'string' }
          }
        }
      }
    },
    async (request: FastifyRequest<{ Body: { id_room: string } }>, reply: FastifyReply) => {
      return roomsController.deleteRoom(request, reply);
    }
  );
}
