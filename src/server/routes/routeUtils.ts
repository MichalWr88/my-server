import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

type RouteHandler = (req: FastifyRequest, reply: FastifyReply) => void;

export function createRoute(
  server: FastifyInstance,
  path: string,
  handler: RouteHandler,
  method?: "post" | "get"
) {
  server[method ?? "get"](path, handler);
}
