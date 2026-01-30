import { FastifyRequest, FastifyReply } from 'fastify';

export function authMiddleware() {
  return async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
    } catch (error) {
      request.log.error(error);
      return reply
        .code(401)
        .send({
          message: "Non autorisé: jeton invalide ou manquant",
          error: true
        });
    }
  };
}
