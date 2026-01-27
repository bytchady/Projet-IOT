import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service.js';
import { LoginRequest } from '../models/types.js';
import { UnauthorizedError } from '../utils/errors.js';

export class AuthController {
  private authService: AuthService;
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.authService = new AuthService();
  }

  async login(request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply) {
    try {
      const { username, password } = request.body;

      const user = await this.authService.validateUser(username, password);

      if (!user) {
        throw new UnauthorizedError('Invalid username or password');
      }

      const token = this.fastify.jwt.sign({
        id: user.id_user,
        username: user.username,
        role: user.role
      }, { expiresIn: '24h' });

      return reply.send({
        token,
        user: {
          id: user.id_user,
          username: user.username,
          role: user.role
        }
      });
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return reply.status(401).send({ error: error.message });
      }
      request.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }
}
