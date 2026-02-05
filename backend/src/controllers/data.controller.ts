import { FastifyRequest, FastifyReply } from 'fastify';
import { DataService } from '../services/data.service.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

export class DataController {
  private dataService: DataService;

  constructor() {
    this.dataService = new DataService();
  }

  /**
   * GET /api/data/:roomId/today
   */
  async getDataForToday(
    request: FastifyRequest<{ Params: { roomId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { roomId } = request.params;

      const data = await this.dataService.getDataForToday(roomId);

      return reply.send({
        message: 'Données du jour récupérées',
        error: false,
        data
      });
    } catch (error) {
      return this.handleError(error, request, reply);
    }
  }

  /**
   * GET /api/data/:roomId/range?startDate=...&endDate=...
   */
  async getDataByDateRange(
    request: FastifyRequest<{
      Params: { roomId: string };
      Querystring: { startDate: string; endDate: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { roomId } = request.params;
      const { startDate, endDate } = request.query;

      if (!startDate || !endDate) {
        throw new BadRequestError('Les paramètres startDate et endDate sont requis');
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new BadRequestError('Format de date invalide (attendu: YYYY-MM-DD)');
      }

      if (start > end) {
        throw new BadRequestError('startDate ne peut pas être après endDate');
      }

      const data = await this.dataService.getDataByDateRange(roomId, start, end);

      return reply.send({
        message: 'Données récupérées',
        error: false,
        data
      });
    } catch (error) {
      return this.handleError(error, request, reply);
    }
  }

  /**
   * GET /api/data/rooms?roomIds=id1,id2,id3&startDate=...&endDate=...
   */
  async getDataForMultipleRooms(
    request: FastifyRequest<{
      Querystring: { roomIds: string; startDate: string; endDate: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { roomIds, startDate, endDate } = request.query;

      if (!roomIds || !startDate || !endDate) {
        throw new BadRequestError('Les paramètres roomIds, startDate et endDate sont requis');
      }

      const roomIdsArray = roomIds.split(',').map(id => id.trim());

      if (roomIdsArray.length === 0) {
        throw new BadRequestError('Au moins un roomId est requis');
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new BadRequestError('Format de date invalide');
      }

      const dataByRoom = await this.dataService.getDataForMultipleRooms(
        roomIdsArray,
        start,
        end
      );

      // Convertir Map en objet pour JSON
      const result: Record<string, any[]> = {};
      dataByRoom.forEach((data, roomId) => {
        result[roomId] = data;
      });

      return reply.send({
        message: 'Données récupérées pour plusieurs salles',
        error: false,
        data: result
      });
    } catch (error) {
      return this.handleError(error, request, reply);
    }
  }

  private handleError(error: unknown, request: FastifyRequest, reply: FastifyReply) {
    if (error instanceof BadRequestError) {
      return reply.status(400).send({
        message: error.message,
        error: true,
        data: null
      });
    }
    if (error instanceof NotFoundError) {
      return reply.status(404).send({
        message: error.message,
        error: true,
        data: null
      });
    }
    request.log.error(error);
    return reply.status(500).send({
      message: 'Erreur serveur',
      error: true,
      data: null
    });
  }
}
