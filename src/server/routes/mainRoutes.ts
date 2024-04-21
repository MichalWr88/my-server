import packageFile from "../../../package.json";
import { FastifyInstance } from "fastify";
import { createRoute } from "./routeUtils";
const path = require('node:path')
export const mainRoutes = async (server: FastifyInstance) => {
  createRoute(server, "/token", (req, reply) => {
    const token = req.jwt.sign({ hello: "world" });
    reply.send({
      hello: "22",
      host: process.env.JIRA_HOST,
      v: packageFile.version,
      token,
    });
  });
  createRoute(server, "/", (req, reply) => {
   reply.sendFile('index.html')
  });
};
