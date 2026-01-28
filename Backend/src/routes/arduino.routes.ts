import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ArduinoController } from '../controllers/arduino.controller.js';
import { ArduinoPublishRequest } from '../models/types.js';

export async function arduinoRoutes(fastify: FastifyInstance): Promise<void> {
  const arduinoController = new ArduinoController();

  // PUT /arduino/publish - Arduino sends measurement dataset
  fastify.put<{ Body: ArduinoPublishRequest }>(
    '/publish',
    {
      schema: {
        body: {
          type: 'object',
          required: ['id_room'],
          properties: {
            id_room: { type: 'string' },
            value_co2: { type: 'integer' },
            value_temp: { type: 'number' },
            value_hum: { type: 'number' },
            clim_status: { type: 'boolean' }
          }
        }
      }
    },
    async (request: FastifyRequest<{ Body: ArduinoPublishRequest }>, reply: FastifyReply) => {
      return arduinoController.publishData(request, reply);
    }
  );
}
