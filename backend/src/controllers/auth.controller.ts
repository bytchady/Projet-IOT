import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service.js';
import { LoginRequest } from '../models/types.js';
import {BadRequestError} from '../utils/errors';

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

      if (!user) throw new BadRequestError("Nom d’utilisateur ou mot de passe invalide");

      const token = this.fastify.jwt.sign(
        { id: user.idUser, username: user.username, role: user.role },
        { expiresIn: '24h' }
      );

      return reply
        .type('application/json')
        .send({
          message: "Connexion réussie, redirection en cours...",
          error: false,
          token,
          user: {
            id: user.idUser,
            username: user.username,
            role: user.role
          }
        });

    } catch (error) {
      request.log.error(error);
      return reply
        .code(500)
        .type('application/json')
        .send({
          message: "Erreur serveur interne",
          error: true
        });
    }
  }
}
