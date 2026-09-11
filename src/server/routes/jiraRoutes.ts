import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

import {
  JIraTaskIdSchemaParams,
  JIraTaskIdSchema,
  JiraGetIssueSchema,
  JiraTaskSchemaRequest,
  JiraLoopDaysSchemaRequest,
  JiraSearchSchema,
  JiraQueryDatesSchemaRequest,
  JiraWorklogPreConfiguredSchemaRequest,
  JiraLastSprintForRapidViewRequestSchema,
  JiraSprintRequestSchema,
  JiraSprintIssuesRequestSchema,
  JiraEditIssueSchemaRequest,
} from "../../service/jira/jiraSchema";
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
  copyComponentsToLabelsForSprintIssues,
  copyComponentsToLabelsForCurrentSprint,
  getGroupedSprintIssues,
  getGroupedSprintIssuesHTML,
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
        params: JIraTaskIdSchema,
        body: JiraGetIssueSchema,
      },
    },
    getIssueFromJira
  );
  server.post(
    "/task/log-time",
    {
      preHandler: [server.authenticate],
      schema: {
        body: JiraTaskSchemaRequest,
      },
    },
    logJiraTime
  );
  server.post(
    "/task/log-time-range",
    {
      preHandler: [server.authenticate],
      schema: {
        body: JiraLoopDaysSchemaRequest,
        // response: {
        //   201: createUserResponseSchema,
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
        body: JiraSearchSchema,
        // response: {
        //   201: createUserResponseSchema,
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
        body: JiraQueryDatesSchemaRequest,
        // response: {
        //   201: createUserResponseSchema,
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
        querystring: JiraWorklogPreConfiguredSchemaRequest,
        // body: JiraQueryDatesSchemaRequest,
        // response: {
        //   201: createUserResponseSchema,
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
        querystring: JiraWorklogPreConfiguredSchemaRequest,
        // body: JiraQueryDatesSchemaRequest,
        // response: {
        //   201: createUserResponseSchema,
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
        // querystring: JiraWorklogPreConfiguredSchemaRequest,
        body: JiraLastSprintForRapidViewRequestSchema,
        // response: {
        //   201: createUserResponseSchema,
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
        // querystring: JiraWorklogPreConfiguredSchemaRequest,
        body: JiraSprintRequestSchema,
        // response: {
        //   201: createUserResponseSchema,
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
        // querystring: JiraWorklogPreConfiguredSchemaRequest,
        body: JiraSprintIssuesRequestSchema,
        // response: {
        //   201: createUserResponseSchema,
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
        // querystring: JiraWorklogPreConfiguredSchemaRequest,
        body: JiraLastSprintForRapidViewRequestSchema,
        // response: {
        //   201: createUserResponseSchema,
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
        body: JiraEditIssueSchemaRequest,
        // response: {
        //   200: SomeResponseSchema,
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
        params: JIraTaskIdSchema,
        // response: {
        //   200: SomeResponseSchema,
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
        params: JIraTaskIdSchema,
      },
    },
    getJiraBoardData
  );
  server.get(
    "/sprint/:id/copy-components-to-labels",
    {
      preHandler: [server.authenticate],
      schema: {
        params: JIraTaskIdSchema,
      },
    },
    copyComponentsToLabelsForSprintIssues
  );
  server.get(
    "/sprint/current/grouped-issues",
    {
      preHandler: [server.authenticate],
    },
    getGroupedSprintIssues
  );
  server.get(
    "/sprint/current/grouped-issues-html",
    {
      preHandler: [server.authenticate],
    },
    getGroupedSprintIssuesHTML
  );
  server.get(
    "/sprint/current/copy-components-to-labels",
    {
      preHandler: [server.authenticate],
    },
    copyComponentsToLabelsForCurrentSprint
  );

  server.log.info("jira routes registered");
};
