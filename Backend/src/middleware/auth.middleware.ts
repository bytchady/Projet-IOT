import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export function authMiddleware(fastify: FastifyInstance) {
  return async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      return reply.status(401).send({ error: 'Unauthorized: Invalid or missing token' });
    }
  };
}
