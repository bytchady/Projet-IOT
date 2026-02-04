import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { HoursController } from '../controllers/hours.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const scheduleSchema = {
  type: 'object',
  required: ['day_of_week', 'start_time', 'end_time'],
  properties: {
    day_of_week: { type: 'string', enum: DAYS_OF_WEEK },
    start_time: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$' },
    end_time: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$' }
  }
};

export async function hoursRoutes(fastify: FastifyInstance): Promise<void> {
  const hoursController = new HoursController();

  // GET /api/room/:id/hours - Get all schedules for a room
  fastify.get<{ Params: { id: string } }>(
    '/room/:id/hours',
    { preHandler: [authMiddleware()] },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      return hoursController.getSchedules(request, reply);
    }
  );

  // PUT /api/room/:id/hours - Replace all schedules for a room
  fastify.put<{ Params: { id: string }; Body: { schedules: unknown[] } }>(
    '/room/:id/hours',
    {
      preHandler: [authMiddleware()],
      schema: {
        body: {
          type: 'object',
          required: ['schedules'],
          properties: {
            schedules: {
              type: 'array',
              items: scheduleSchema
            }
          }
        }
      }
    },
    async (request: FastifyRequest<{ Params: { id: string }; Body: { schedules: unknown[] } }>, reply: FastifyReply) => {
      return hoursController.setSchedules(request as any, reply);
    }
  );

  // POST /api/room/:id/hours - Add a single schedule
  fastify.post<{ Params: { id: string }; Body: unknown }>(
    '/room/:id/hours',
    {
      preHandler: [authMiddleware()],
      schema: {
        body: scheduleSchema
      }
    },
    async (request: FastifyRequest<{ Params: { id: string }; Body: unknown }>, reply: FastifyReply) => {
      return hoursController.addSchedule(request as any, reply);
    }
  );

  // PATCH /api/room/:id/hours/:scheduleId - Update a single schedule
  fastify.patch<{ Params: { id: string; scheduleId: string }; Body: unknown }>(
    '/room/:id/hours/:scheduleId',
    {
      preHandler: [authMiddleware()],
      schema: {
        body: {
          type: 'object',
          properties: {
            day_of_week: { type: 'string', enum: DAYS_OF_WEEK },
            start_time: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$' },
            end_time: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$' }
          }
        }
      }
    },
    async (request: FastifyRequest<{ Params: { id: string; scheduleId: string }; Body: unknown }>, reply: FastifyReply) => {
      return hoursController.updateSchedule(request as any, reply);
    }
  );

  // DELETE /api/room/:id/hours/:scheduleId - Delete a single schedule
  fastify.delete<{ Params: { id: string; scheduleId: string } }>(
    '/room/:id/hours/:scheduleId',
    { preHandler: [authMiddleware()] },
    async (request: FastifyRequest<{ Params: { id: string; scheduleId: string } }>, reply: FastifyReply) => {
      return hoursController.deleteSchedule(request, reply);
    }
  );
}
