import JiraApi from "jira-client";
import { FastifyReply, FastifyRequest } from "fastify";
import {
  JiraEditIssueRequest,
  JiraGetIssue,
  JiraLastSprintForRapidViewRequest,
  JiraLoopDaysRequest,
  JiraSearchParams,
  JiraSprintIssuesRequest,
  JiraSprintIssuesResponse,
  JiraSprintRequest,
  JiraTaskRequest,
  JiraWorklogByTimeRequest,
  JiraWorklogPreConfiguredRequest,
} from "./jiraSchema";
import {
  addJiraWorklog,
  getJiraWorklogByTime,
  loopDays,
  mapPreConfiguredDates,
  getJiraBoard,
  getLastSprintForRapidView,
  getSprintIssues,
  getSprint,
  getOrgTaskCurrentSprint,
  searchJira,
  parseJiraSprintData,
  formatItemsForGoogleSlides,
  getJiraIssue,
  editIssue,
} from "./jiraService";
export const logJiraTime = async (
  req: FastifyRequest<{
    Body: JiraTaskRequest;
  }>,
  reply: FastifyReply
): Promise<JiraApi.JsonResponse | undefined> => {
  try {
    const { comment, date, jiraTaskId, timeSpent } = req.body;
    const jiraResp = await addJiraWorklog({
      comment,
      date,
      jiraTaskId,
      timeSpent,
    });
    return reply.code(200).send(jiraResp);
  } catch (e) {
    return reply.code(500).send(e);
  }
};

export const logJiraLoopDays = async (
  req: FastifyRequest<{
    Body: JiraLoopDaysRequest;
  }>,
  reply: FastifyReply
): Promise<JiraApi.JsonResponse | undefined> => {
  try {
    const { comment, startDate, endDate, boardId } = req.body;
    const jiraResp = await loopDays({
      comment,
      startDate,
      endDate,
      boardId,
    });
    console.log(jiraResp);
    return reply.code(200).send({ message: "success" });
  } catch (e) {
    return reply.code(500).send(e);
  }
};
export const searchJiraQuery = async (
  req: FastifyRequest<{
    Body: JiraSearchParams;
  }>,
  reply: FastifyReply
): Promise<JiraApi.JsonResponse | undefined> => {
  try {
    const { query, params } = req.body;
    const jiraResp = await searchJira(query, params);
    console.log(jiraResp);
    return reply.code(200).send(jiraResp);
  } catch (e) {
    return reply.code(500).send(e);
  }
};

export const getIssueFromJira = async (
  req: FastifyRequest<{
    Params: { id: string };
    Body: JiraGetIssue;
  }>,
  reply: FastifyReply
): Promise<JiraApi.JsonResponse | undefined> => {
  try {
    const {
      body: { fields },
      params,
    } = req;
    const jiraResp = await getJiraIssue(params.id, fields);
    console.log(jiraResp);
    return reply.code(200).send(jiraResp);
  } catch (e) {
    return reply.code(500).send(e);
  }
};

export const searchJiraWorklogByTime = async (
  req: FastifyRequest<{
    Body: JiraWorklogByTimeRequest;
  }>,
  reply: FastifyReply
): Promise<JiraApi.JsonResponse | undefined> => {
  try {
    const { user, type, prevStart, prevEnd } = req.body;
    const jiraResp = await getJiraWorklogByTime({
      user,
      type,
      prevStart,
      prevEnd,
    });
    console.log(jiraResp);
    return reply.code(200).send(jiraResp);
  } catch (e) {
    return reply.code(500).send(e);
  }
};
export const searchJiraQueryPreConfigured = async (
  req: FastifyRequest<{
    Querystring: JiraWorklogPreConfiguredRequest;
  }>,
  reply: FastifyReply
): Promise<JiraApi.JsonResponse | undefined> => {
  try {
    const { user, type } = req.query;

    const jiraWorklogRequest = mapPreConfiguredDates({ type, user });
    const jiraResp = await getJiraWorklogByTime({
      user: jiraWorklogRequest.user,
      type: jiraWorklogRequest.type,
      prevStart: jiraWorklogRequest.prevStart,
      prevEnd: jiraWorklogRequest.prevEnd,
    });
    console.log(jiraResp);
    return reply.code(200).send(jiraResp);
  } catch (e) {
    return reply.code(500).send(e);
  }
};

export const getJiraBoardData = async (
  req: FastifyRequest,
  reply: FastifyReply
): Promise<JiraApi.JsonResponse | undefined> => {
  try {
    const jiraResp = await getJiraBoard("972");
    return reply.code(200).send(jiraResp);
  } catch (e) {
    return reply.code(500).send(e);
  }
};
export const getLastSprintForRapidViewData = async (
  req: FastifyRequest<{
    Body: JiraLastSprintForRapidViewRequest;
  }>,
  reply: FastifyReply
): Promise<JiraApi.JsonResponse | undefined> => {
  const { boardId } = req.body;
  try {
    const jiraResp = await getLastSprintForRapidView(boardId.toString());
    return reply.code(200).send(jiraResp);
  } catch (e) {
    return reply.code(500).send(e);
  }
};

export const getJiraSprint = async (
  req: FastifyRequest<{
    Body: JiraSprintRequest;
  }>,
  reply: FastifyReply
): Promise<JiraApi.JsonResponse | undefined> => {
  const { sprintId } = req.body;
  try {
    const jiraResp = await getSprint(sprintId.toString());
    return reply.code(200).send(jiraResp);
  } catch (e) {
    return reply.code(500).send(e);
  }
};

export const getJiraSprintIssues = async (
  req: FastifyRequest<{
    Body: JiraSprintIssuesRequest;
  }>,
  reply: FastifyReply
): Promise<JiraSprintIssuesResponse | undefined> => {
  const { boardId, sprintId } = req.body;
  try {
    const jiraResp = await getSprintIssues(
      boardId.toString(),
      sprintId.toString()
    );
    const formattedData = parseJiraSprintData(jiraResp);
    formatItemsForGoogleSlides(formattedData.issuesByType[0].issues);
    return reply.code(200).send(jiraResp);
  } catch (e) {
    return reply.code(500).send(e);
  }
};

export const getJiraOrgTaskCurrentSprint = async (
  req: FastifyRequest<{
    Body: JiraLastSprintForRapidViewRequest;
  }>,
  reply: FastifyReply
): Promise<string | null> => {
  const { boardId } = req.body;
  try {
    const jiraResp = await getOrgTaskCurrentSprint(boardId.toString());
    return reply.code(200).send(jiraResp);
  } catch (e) {
    return reply.code(500).send(e);
  }
};

export const editJiraIssue = async (
  req: FastifyRequest<{
    Body: JiraEditIssueRequest;
  }>,
  reply: FastifyReply
): Promise<JiraApi.JsonResponse | undefined> => {
  try {
    const { issueId, fields } = req.body;
    const jiraResp = await editIssue(issueId, fields);
    return reply.code(200).send(jiraResp);
  } catch (e) {
    return reply.code(500).send(e);
  }
};
