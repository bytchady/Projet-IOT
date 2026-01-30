import { FastifyRequest, FastifyReply } from 'fastify';
import { RoomsService } from '../services/rooms.service.js';
import { CreateRoomRequest, UpdateRoomRequest } from '../models/types.js';
import { AppError, NotFoundError, BadRequestError } from '../utils/errors.js';

export class RoomsController {
  private roomsService = new RoomsService();

  async getAllRooms(request: FastifyRequest, reply: FastifyReply) {
    try {
      const rooms = await this.roomsService.getAllRooms();
      return reply.send({ message: "Liste des salles récupérée avec succès", error: false, data: rooms });
    } catch (err) {
      return this.handleError(err, request, reply);
    }
  }

  async getRoomById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const room = await this.roomsService.getRoomById(request.params.id);
      if (!room) throw new NotFoundError('Salle introuvable');
      return reply.send({ message: "Salle récupérée avec succès", error: false, data: room });
    } catch (err) {
      return this.handleError(err, request, reply);
    }
  }

  async createRoom(request: FastifyRequest<{ Body: CreateRoomRequest }>, reply: FastifyReply) {
    try {
      const roomData = request.body;
      if (!roomData.nameRoom) throw new BadRequestError('Le nom de la salle est requis');

      // Vérifie si le nom existe déjà
      const existingRooms = await this.roomsService.getAllRooms();
      if (existingRooms.some(r => r.nameRoom.toLowerCase() === roomData.nameRoom.toLowerCase())) {
        return reply.code(409).send({ message: "Salle déjà existante", error: true });
      }

      const room = await this.roomsService.createRoom({
        ...roomData,
        schedule: roomData.schedule,
        isExists: true,
      });

      return reply.code(201).send({ message: "Salle créée avec succès", error: false, data: room });
    } catch (err) {
      return this.handleError(err, request, reply);
    }
  }

  async updateRoom(request: FastifyRequest<{ Body: UpdateRoomRequest }>, reply: FastifyReply) {
    try {
      const roomData = request.body;
      if (!roomData.idRoom) throw new BadRequestError("L'identifiant de la salle est requis");

      const room = await this.roomsService.updateRoom(roomData);
      if (!room) throw new NotFoundError('Salle introuvable');

      const tempUpdated = roomData.minTemp !== undefined || roomData.maxTemp !== undefined;

      return reply.send({
        message: "Salle mise à jour avec succès",
        error: false,
        data: room,
        arduino_sync: tempUpdated && room.ipArduino
          ? { success: true, message: 'Configuration de température envoyée à l’Arduino' }
          : undefined
      });
    } catch (err) {
      return this.handleError(err, request, reply);
    }
  }

  async deleteRoom(request: FastifyRequest<{ Body: { idRoom: string } }>, reply: FastifyReply) {
    try {
      const { idRoom } = request.body;
      if (!idRoom) throw new BadRequestError("L'identifiant de la salle est requis");

      const deleted = await this.roomsService.deleteRoom(idRoom);
      if (!deleted) throw new NotFoundError('Salle introuvable');

      return reply.send({ message: "Salle supprimée avec succès", error: false });
    } catch (err) {
      return this.handleError(err, request, reply);
    }
  }

  private handleError(err: unknown, request: FastifyRequest, reply: FastifyReply) {
    request.log.error(err);
    if (err instanceof AppError) return reply.code(err.statusCode).send(err.toJSON());
    return reply.code(500).send({ message: "Erreur serveur interne", error: true });
  }
}
