import { FastifyRequest, FastifyReply } from 'fastify';
import { DataService } from '../services/data.service.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

export class DataController {
  private dataService: DataService;

  constructor() {
    this.dataService = new DataService();
  }

  async getDataByHour(request: FastifyRequest<{ Params: { id: string; heure: string } }>, reply: FastifyReply) {
    try {
      const { id, heure } = request.params;

      // Parse hour parameter (expected format: number of hours to look back)
      const hours = parseInt(heure, 10);
      if (isNaN(hours) || hours < 1) {
        throw new BadRequestError('Invalid hour parameter. Must be a positive integer.');
      }

      const data = await this.dataService.getDataByHour(id, hours);
      return reply.send(data);
    } catch (error) {
      if (error instanceof BadRequestError) {
        return reply.status(400).send({ error: error.message });
      }
      if (error instanceof NotFoundError) {
        return reply.status(404).send({ error: error.message });
      }
      request.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getAllData(request: FastifyRequest<{ Params: { id: string }; Querystring: { limit?: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      const limit = request.query.limit ? parseInt(request.query.limit, 10) : 100;

      if (isNaN(limit) || limit < 1) {
        throw new BadRequestError('Invalid limit parameter');
      }

      const data = await this.dataService.getAllData(id, limit);
      return reply.send(data);
    } catch (error) {
      if (error instanceof BadRequestError) {
        return reply.status(400).send({ error: error.message });
      }
      request.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getLatestData(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params;

      const data = await this.dataService.getLatestData(id);

      if (!data) {
        throw new NotFoundError('No data found for this room');
      }

      return reply.send(data);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return reply.status(404).send({ error: error.message });
      }
      request.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }
}
