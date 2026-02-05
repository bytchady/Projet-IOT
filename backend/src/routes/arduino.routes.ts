import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ArduinoController } from '../controllers/arduino.controller.js';
import { ArduinoPublishRequest } from '../models/types.js';

export async function arduinoRoutes(fastify: FastifyInstance): Promise<void> {
  const arduinoController = new ArduinoController();

  // PUT /arduino/publish - Arduino sends measurement data
  fastify.put<{ Body: ArduinoPublishRequest }>(
    '/publish',
    {
      schema: {
        body: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              timestamp: { type: 'string' },
              valueCO2: { type: 'integer' },
              valueTemp: { type: 'number' },
              valueHum: { type: 'number' },
              climStatus: { type: 'boolean' }
            }
          }
        }
      }
    },
    async (request: FastifyRequest<{ Body: ArduinoPublishRequest }>, reply: FastifyReply) => {
      return arduinoController.publishData(request, reply);
    }
  );
}
