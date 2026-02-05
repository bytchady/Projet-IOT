import { FastifyRequest, FastifyReply } from 'fastify';
import { ArduinoService } from '../services/arduino.service.js';
import { ArduinoPublishRequest } from '../models/types.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

export class ArduinoController {
  private arduinoService: ArduinoService;

  constructor() {
    this.arduinoService = new ArduinoService();
  }

  async publishData(request: FastifyRequest<{ Body: ArduinoPublishRequest }>, reply: FastifyReply) {
    try {
      const measurements = request.body;

      if (!Array.isArray(measurements) || measurements.length === 0) {
        throw new BadRequestError('Request body must be a non-empty array');
      }

      const ip = request.ip;

      const saved = await this.arduinoService.saveMeasurements(ip, measurements);
      return reply.status(201).send(saved);
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
}
