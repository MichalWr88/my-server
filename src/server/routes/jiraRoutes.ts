import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import {
  getCurrentJiraUser,
  getJiraIssue,
} from "../../service/jira/jiraService";
import { JIraTaskIdSchemaParams } from "../../service/jira/jiraSchema";

export const jiraRoutes = async (server: FastifyInstance) => {
  server.get(
    "/user",
    {
      preHandler: [server.authenticate],
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const response = await getCurrentJiraUser();
      reply.send(response);
    }
  );
  server.get(
    "/task/:id",
    {
      preHandler: [server.authenticate],
    },
    async (
      {
        params: { id },
      }: FastifyRequest<{
        Params: JIraTaskIdSchemaParams;
      }>,
      reply: FastifyReply
    ) => {
      const response = await getJiraIssue(id);
      response.fields;
      reply.send(response);
    }
  );

  server.log.info("jira routes registered");
};
