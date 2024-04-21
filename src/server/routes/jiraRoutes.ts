import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { createRoute } from "./routeUtils";
import { getCurrentJiraUser } from "../../service/jira/jiraService";

export const jiraRoutes = async (server: FastifyInstance) => {
  createRoute(server, "/user", async(req, reply) => {
    const response = await getCurrentJiraUser();
    console.log(response);
    reply.send(response);
  });

  server.get("/", (req: FastifyRequest, reply: FastifyReply) => {
    reply.send({ message: "/ route hit" });
  });

  server.log.info("user routes registered");
};
