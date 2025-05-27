import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

import { $ref, JIraTaskIdSchemaParams } from "../../service/jira/jiraSchema";
import {
  getCurrentJiraUser,
  getJiraIssue,
} from "../../service/jira/jiraService";
import {
  searchJiraQuery,
  logJiraLoopDays,
  logJiraTime,
  searchJiraQueryPreConfigured,
  getJiraSprint,
  getJiraSprintIssues,
  getJiraOrgTaskCurrentSprint,
  getLastSprintForRapidViewData,
  searchJiraWorklogByTime,
  getIssueFromJira,
  editJiraIssue,
  copyComponentsToLabels,
  getJiraBoardData,
} from "../../service/jira/jiraController";
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
      reply.send(response);
    }
  );
  server.post(
    "/task/:id",
    {
      preHandler: [server.authenticate],
      schema: {
        params: $ref("JIraTaskIdSchema"),
        body: $ref("JiraGetIssueSchema"),
      },
    },
    getIssueFromJira
  );
  server.post(
    "/task/log-time",
    {
      preHandler: [server.authenticate],
      schema: {
        body: $ref("JiraTaskSchemaRequest"),
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
  server.post(
    "/tasks/search",
    {
      preHandler: [server.authenticate],
      schema: {
        body: $ref("JiraSearchSchema"),
        // response: {
        //   201: $ref("createUserResponseSchema"),
        // },
      },
    },
    searchJiraQuery
  );
  server.post(
    "/tasks/worklog",
    {
      preHandler: [server.authenticate],
      schema: {
        body: $ref("JiraQueryDatesSchemaRequest"),
        // response: {
        //   201: $ref("createUserResponseSchema"),
        // },
      },
    },
    searchJiraWorklogByTime
  );
  server.get(
    "/tasks/search/pre-configured",
    {
      preHandler: [server.authenticate],
      schema: {
        querystring: $ref("JiraWorklogPreConfiguredSchemaRequest"),
        // body: $ref("JiraQueryDatesSchemaRequest"),
        // response: {
        //   201: $ref("createUserResponseSchema"),
        // },
      },
    },
    searchJiraQueryPreConfigured
  );
  server.get(
    "/tasks/my/month",
    {
      preHandler: [server.authenticate],
      schema: {
        querystring: $ref("JiraWorklogPreConfiguredSchemaRequest"),
        // body: $ref("JiraQueryDatesSchemaRequest"),
        // response: {
        //   201: $ref("createUserResponseSchema"),
        // },
      },
    },
    searchJiraQueryPreConfigured
  );
  server.post(
    "/active-sprint-from-board",
    {
      preHandler: [server.authenticate],
      schema: {
        // querystring: $ref("JiraWorklogPreConfiguredSchemaRequest"),
        body: $ref("JiraLastSprintForRapidViewRequestSchema"),
        // response: {
        //   201: $ref("createUserResponseSchema"),
        // },
      },
    },
    getLastSprintForRapidViewData
  );
  server.post(
    "/sprint",
    {
      preHandler: [server.authenticate],
      schema: {
        // querystring: $ref("JiraWorklogPreConfiguredSchemaRequest"),
        body: $ref("JiraSprintRequestSchema"),
        // response: {
        //   201: $ref("createUserResponseSchema"),
        // },
      },
    },
    getJiraSprint
  );

  server.post(
    "/sprint-issues",
    {
      preHandler: [server.authenticate],
      schema: {
        // querystring: $ref("JiraWorklogPreConfiguredSchemaRequest"),
        body: $ref("JiraSprintIssuesRequestSchema"),
        // response: {
        //   201: $ref("createUserResponseSchema"),
        // },
      },
    },
    getJiraSprintIssues
  );

  server.post(
    "/org-task-current-sprint",
    {
      preHandler: [server.authenticate],
      schema: {
        // querystring: $ref("JiraWorklogPreConfiguredSchemaRequest"),
        body: $ref("JiraLastSprintForRapidViewRequestSchema"),
        // response: {
        //   201: $ref("createUserResponseSchema"),
        // },
      },
    },
    getJiraOrgTaskCurrentSprint
  );
  server.post(
    "/task/edit",
    {
      preHandler: [server.authenticate],
      schema: {
        body: $ref("JiraEditIssueSchemaRequest"),
        // response: {
        //   200: $ref("SomeResponseSchema"),
        // },
      },
    },
    editJiraIssue
  );
  server.get(
    "/task/:id/copy-components-to-labels",
    {
      preHandler: [server.authenticate],
      schema: {
        params: $ref("JIraTaskIdSchema"),
        // response: {
        //   200: $ref("SomeResponseSchema"),
        // },
      },
    },
    copyComponentsToLabels
  );
  server.get(
    "/board/:id/sprints-list",
    {
      preHandler: [server.authenticate],
      schema: {
        params: $ref("JIraTaskIdSchema"),
      },
    },
    getJiraBoardData
  );

  server.log.info("jira routes registered");
};
