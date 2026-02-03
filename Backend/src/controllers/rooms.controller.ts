import { FastifyRequest, FastifyReply } from 'fastify';
import { RoomsService } from '../services/rooms.service.js';
import { CreateRoomRequest, DaySchedule, Rooms, UpdateRoomRequest } from '../models/types.js';
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

  private formatTimeHHMM(time: string | undefined): string {
    if (!time) return '';
    const [h, m] = time.split(':');
    if (h === undefined || m === undefined) return '';
    return `${h.padStart(2,'0')}:${m.padStart(2,'0')}`;
  }

  private normalizeRoom(room: any): Rooms {
    const roundTemp = (temp: number) => temp !== undefined ? Math.round(temp) : 0;

    const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
    const schedule: Record<string, {start: string, end: string, isClosed: boolean}> = {};

    for (const day of days) {
      const isClosed = Boolean(room[`${day}_closed`]);

      schedule[day] = {
        isClosed,
        start: isClosed ? null : room[`${day}_start`]?.slice(0,5) || '08:00',
        end:   isClosed ? null : room[`${day}_end`]?.slice(0,5) || '18:00'
      };
    }

    return {
      ...room,
      minTemp: roundTemp(room.minTemp),
      maxTemp: roundTemp(room.maxTemp),
      schedule
    };
  }

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
      if (rooms.length === 0) {
        return reply.send({
          message: "Aucune salle disponible",
          error: false,
          data: []
        });
      }

      return reply.send({
        message: "Liste des salles récupérée avec succès",
        error: false,
        data: rooms.map(r => this.normalizeRoom(r))
      });
    } catch (err) {
      return this.handleError(err, request, reply);
    }
  }

  async getRoomById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const room = await this.roomsService.getRoomById(request.params.id);
      if (!room) {
        throw new NotFoundError("Salle introuvable");
      }

      return reply.send({
        message: "Salle récupérée avec succès",
        error: false,
        data: this.normalizeRoom(room)
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
        data: this.normalizeRoom(room)
      });
    } catch (err) {
      return this.handleError(err, request, reply);
    }
  }

  async updateRoom(request: FastifyRequest<{ Body: UpdateRoomRequest }>, reply: FastifyReply) {
    const roomData = request.body;

    if (!roomData.idRoom?.trim()) {
      throw new BadRequestError("L'identifiant de la salle est requis");
    }

    this.validateRoomFields(roomData);

    try {
      const room = await this.roomsService.updateRoom(roomData);
      if (!room) {
        throw new NotFoundError("Salle introuvable");
      }

      const normalizedRoom = this.normalizeRoom(room);
      const tempUpdated =
        roomData.minTemp !== undefined ||
        roomData.maxTemp !== undefined;

      return reply.send({
        message: "Salle mise à jour avec succès",
        error: false,
        data: normalizedRoom,
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

  async deleteRoom(request: FastifyRequest<{ Body: { idRoom: string } }>, reply: FastifyReply) {
    const { idRoom } = request.body;

    if (!idRoom?.trim()) {
      throw new BadRequestError("L'identifiant de la salle est requis");
    }

    try {
      const deleted = await this.roomsService.deleteRoom(idRoom);
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
