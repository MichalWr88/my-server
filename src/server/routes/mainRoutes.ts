import packageFile from "../../../package.json";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
const path = require("node:path");

export const mainRoutes = async (server: FastifyInstance) => {
  server.get("/status", (req: FastifyRequest, reply: FastifyReply) => {
    reply.send({
      status: "OK",
      v: packageFile.version,
    });
  });
  server.get("/", (req: FastifyRequest, reply: FastifyReply) => {
    reply.sendFile("index.html");
  });
};
