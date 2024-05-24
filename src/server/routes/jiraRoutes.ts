import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import {
  getCurrentJiraUser,
  getJiraIssue,
  logJiraLoopDays,
  logJiraTime,
} from "../../service/jira/jiraService";
import { $ref, JIraTaskIdSchemaParams } from "../../service/jira/jiraSchema";

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
  server.post(
    "/task/log-time",
    {
      preHandler: [server.authenticate],
      schema: {
        body: $ref("JiraTaskSchemaRequest"),
        // response: {
        //   201: $ref("createUserResponseSchema"),
        // },
      },
    },
    logJiraTime
  );
  server.post(
    "/task/log-time-range",
    {
      preHandler: [server.authenticate],
      schema: {
        body: $ref("JiraLoopDaysSchemaRequest"),
        // response: {
        //   201: $ref("createUserResponseSchema"),
        // },
      },
    },
    logJiraLoopDays
  );

  server.log.info("jira routes registered");
};
