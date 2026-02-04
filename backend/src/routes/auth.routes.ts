import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AuthController } from '../controllers/auth.controller.js';
import { LoginRequest } from '../models/types.js';

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  const authController = new AuthController(fastify);

  // POST /api/login
  fastify.post<{ Body: LoginRequest }>(
    '/login',
    {
      schema: {
        body: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string' },
            password: { type: 'string' }
          }
        }
      }
    },
    async (request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply) => {
      return authController.login(request, reply);
    }
  );
}
