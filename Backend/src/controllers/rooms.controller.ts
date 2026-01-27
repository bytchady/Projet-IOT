import { FastifyRequest, FastifyReply } from 'fastify';
import { RoomsService } from '../services/rooms.service.js';
import { CreateRoomRequest, UpdateRoomRequest } from '../models/types.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

export class RoomsController {
  private roomsService: RoomsService;

  constructor() {
    this.roomsService = new RoomsService();
  }

  async getAllRooms(request: FastifyRequest, reply: FastifyReply) {
    try {
      const rooms = await this.roomsService.getAllRooms();
      return reply.send(rooms);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getRoomById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      const room = await this.roomsService.getRoomById(id);

      if (!room) {
        throw new NotFoundError('Room not found');
      }

      return reply.send(room);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return reply.status(404).send({ error: error.message });
      }
      request.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async createRoom(request: FastifyRequest<{ Body: CreateRoomRequest }>, reply: FastifyReply) {
    try {
      const roomData = request.body;

      if (!roomData.name_room) {
        throw new BadRequestError('Room name is required');
      }

      const room = await this.roomsService.createRoom(roomData);
      return reply.status(201).send(room);
    } catch (error) {
      if (error instanceof BadRequestError) {
        return reply.status(400).send({ error: error.message });
      }
      request.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async updateRoom(request: FastifyRequest<{ Body: UpdateRoomRequest }>, reply: FastifyReply) {
    try {
      const roomData = request.body;

      if (!roomData.id_room) {
        throw new BadRequestError('Room ID is required');
      }

      const room = await this.roomsService.updateRoom(roomData);

      if (!room) {
        throw new NotFoundError('Room not found');
      }

      // Check if temp was updated and return sync status
      const tempUpdated = roomData.min_temp !== undefined || roomData.max_temp !== undefined;

      return reply.send({
        ...room,
        arduino_sync: tempUpdated && room.ip_arduino
          ? { success: true, message: 'Temperature config sent to Arduino' }
          : undefined
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return reply.status(404).send({ error: error.message });
      }
      if (error instanceof BadRequestError) {
        return reply.status(400).send({ error: error.message });
      }
      request.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async deleteRoom(request: FastifyRequest<{ Body: { id_room: string } }>, reply: FastifyReply) {
    try {
      const { id_room } = request.body;

      if (!id_room) {
        throw new BadRequestError('Room ID is required');
      }

      const deleted = await this.roomsService.deleteRoom(id_room);

      if (!deleted) {
        throw new NotFoundError('Room not found');
      }

      return reply.send({ message: 'Room deleted successfully' });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return reply.status(404).send({ error: error.message });
      }
      if (error instanceof BadRequestError) {
        return reply.status(400).send({ error: error.message });
      }
      request.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }
}
