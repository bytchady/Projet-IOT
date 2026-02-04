import { FastifyRequest, FastifyReply } from 'fastify';
import { RoomsService } from '../services/rooms.service.js';
import {
  CreateRoomRequest,
  DaySchedule,
  Rooms,
  RoomWithSchedule,
  UpdateRoomRequest,
  WeekDay,
  WeeklySchedule
} from '../models/types.js';
import { AppError, NotFoundError, BadRequestError, ConflictError } from '../utils/errors.js';

export class RoomsController {
  private roomsService = new RoomsService();

  private dayTranslations: Record<string, string> = {
    monday: "lundi",
    tuesday: "mardi",
    wednesday: "mercredi",
    thursday: "jeudi",
    friday: "vendredi",
    saturday: "samedi",
    sunday: "dimanche"
  };

  private validateRoomFields(roomData: any) {
    const TIME_REGEX = /^([01]\d|2[0-3]):(00|30)$/;
    const toMinutes = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };

    if (roomData.volumeRoom == undefined || roomData.volumeRoom < 0) {
      throw new BadRequestError("Le volume de la salle doit être défini et ≥ 0");
    }

    if (roomData.glazedSurface == undefined || roomData.glazedSurface < 0) {
      throw new BadRequestError("La surface vitrée doit être définie et ≥ 0");
    }

    if (roomData.nbDoors == undefined || roomData.nbDoors < 0) {
      throw new BadRequestError("Le nombre de portes doit être défini et ≥ 0");
    }

    if (roomData.nbExteriorWalls == undefined || roomData.nbExteriorWalls < 0) {
      throw new BadRequestError("Le nombre de murs extérieurs doit être défini et ≥ 0");
    }

    if (roomData.minTemp !== undefined && roomData.maxTemp !== undefined && roomData.minTemp > roomData.maxTemp) {
      throw new BadRequestError("La température minimale ne peut pas être supérieure à la maximale");
    }

    if (roomData.schedule) {
      for (const [day, hours] of Object.entries(roomData.schedule)) {
        const { start, end, isClosed } = hours as DaySchedule;

        if (isClosed) {
          continue
        } else {
          if (!start || !end){
            throw new BadRequestError(
              `Horaires manquants pour ${this.dayTranslations[day] || day}`
            );
          }
        }

        if (!TIME_REGEX.test(start) || !TIME_REGEX.test(end)) {
          throw new BadRequestError(
            `Format horaire invalide pour ${this.dayTranslations[day] || day}`
          );
        }

        if (toMinutes(start) > toMinutes(end)) {
          throw new BadRequestError(
            `Horaire invalide pour ${this.dayTranslations[day] || day}`
          );
        }
      }
    }
  }

  async getAllRooms(request: FastifyRequest, reply: FastifyReply) {
    try {
      const rooms = await this.roomsService.getAllRooms();
      return reply.send({
        message: "Liste des salles récupérée avec succès",
        error: false,
        data: rooms // déjà normalisé dans le service
      });
    } catch (err) {
      return this.handleError(err, request, reply);
    }
  }

  async getRoomById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const room = await this.roomsService.getRoomById(request.params.id);
      if (!room) throw new NotFoundError("Salle introuvable");

      return reply.send({
        message: "Salle récupérée avec succès",
        error: false,
        data: room // déjà normalisé
      });
    } catch (err) {
      return this.handleError(err, request, reply);
    }
  }

  async createRoom(request: FastifyRequest<{ Body: CreateRoomRequest }>, reply: FastifyReply) {
    const roomData = request.body;
    this.validateRoomFields(roomData);

    try {
      const existingRooms = await this.roomsService.getAllRooms();
      const exists = existingRooms.some(
        r => r.nameRoom.toLowerCase() === roomData.nameRoom.toLowerCase()
      );

      if (exists) {
        throw new ConflictError("Salle déjà existante");
      }

      const room = await this.roomsService.createRoom({
        ...roomData,
        isExists: true
      });

      return reply.code(201).send({
        message: "Salle créée avec succès",
        error: false,
        data: room
      });
    } catch (err) {
      return this.handleError(err, request, reply);
    }
  }

  async updateRoom(
    request: FastifyRequest<{ Params: { id: string }, Body: UpdateRoomRequest }>,
    reply: FastifyReply
  ) {
    const roomId = request.params.id;
    const roomData = request.body;

    if (!roomId?.trim()) {
      throw new BadRequestError("L'identifiant de la salle est requis");
    }

    this.validateRoomFields(roomData);

    try {
      const room = await this.roomsService.updateRoom(roomId, roomData);

      if (!room) {
        throw new NotFoundError("Salle introuvable");
      }

      const tempUpdated =
        roomData.minTemp !== undefined ||
        roomData.maxTemp !== undefined;

      return reply.send({
        message: "Salle mise à jour avec succès",
        error: false,
        data: room,
        arduino_sync:
          tempUpdated && room.ipArduino
            ? {
              success: true,
              message: "Configuration de température envoyée au microcontrôleur"
            }
            : undefined
      });
    } catch (err) {
      return this.handleError(err, request, reply);
    }
  }

  async deleteRoom(request: FastifyRequest<{ Params: { id: string }}>, reply: FastifyReply) {
    const roomId = request.params.id;

    if (!roomId?.trim()) {
      throw new BadRequestError("L'identifiant de la salle est requis");
    }

    try {
      const deleted = await this.roomsService.deleteRoom(roomId);
      if (!deleted) {
        throw new NotFoundError("Salle introuvable");
      }

      return reply.code(204).send();
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
