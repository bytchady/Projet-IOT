import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service.js';
import { LoginRequest } from '../models/types.js';

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
        // Retour JSON uniforme pour login invalide
        return reply
          .code(401)
          .type('application/json')
          .send({
            message: 'Nom d’utilisateur ou mot de passe invalide',
            error: true
          });
      }

      const token = this.fastify.jwt.sign(
        { id: user.id_user, username: user.username, role: user.role },
        { expiresIn: '24h' }
      );

      // Retour JSON uniforme pour succès
      return reply
        .type('application/json')
        .send({
          message: 'Connexion réussie, redirection en cours...',
          error: false,
          token,
          user: {
            id: user.id_user,
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
          message: 'Erreur serveur interne',
          error: true
        });
    }
  }
}
