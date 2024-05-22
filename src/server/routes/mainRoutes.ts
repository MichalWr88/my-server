import packageFile from "../../../package.json";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
const path = require("node:path");

export const mainRoutes = async (server: FastifyInstance) => {
  server.get("/token", (req: FastifyRequest, reply: FastifyReply) => {
    const token = req.jwt.sign({ hello: "world" });
    reply.send({
      hello: "22",
      host: process.env.JIRA_HOST,
      v: packageFile.version,
      token,
    });
  });
  server.get("/", (req: FastifyRequest, reply: FastifyReply) => {
    reply.sendFile("index.html");
  });
};
