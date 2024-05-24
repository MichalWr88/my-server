import JiraApi from "jira-client";
import { isWorkday } from "../../utils";
import { FastifyReply, FastifyRequest } from "fastify";
import { JiraLoopDaysRequest, JiraTaskRequest } from "./jiraSchema";

if (!process.env.JIRA_HOST || !process.env.JIRA_BEARER) {
  throw new Error("Missing env variables");
}

const jira = new JiraApi({
  protocol: "https",
  host: process.env.JIRA_HOST,
  bearer: process.env.JIRA_BEARER,
  apiVersion: "2",
  strictSSL: true,
});

const formatJiraDate = (date: Date): string => {
  return `${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDate()}T${date.getHours()}:${date.getMinutes()}:00.000+0000`;
};

export const logJiraTime = async (
  req: FastifyRequest<{
    Body: JiraTaskRequest;
  }>,
  reply: FastifyReply
): Promise<JiraApi.JsonResponse | undefined> => {
  try {
    console.log(req.body);
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
    const { comment, startDate, endDate, jiraTaskId, timeSpent } = req.body;
    const jiraResp = await loopDays({
      comment,
      startDate,
      endDate,
      jiraTaskId,
      timeSpent,
    });
    console.log(jiraResp);
    return reply.code(200).send({ message: "success" });
  } catch (e) {
    return reply.code(500).send(e);
  }
};

export const loopDays = async ({
  startDate,
  endDate,
  jiraTaskId,
  comment,
  timeSpent,
}: {
  startDate: Date;
  endDate: Date;
  jiraTaskId: string;
  comment: string;
  timeSpent: string;
}): Promise<void> => {
  const currentDate = new Date(startDate);
  const loopEndDate = new Date(endDate);

  // eslint-disable-next-line no-unmodified-loop-condition
  while (currentDate <= loopEndDate) {
    if (isWorkday(currentDate)) {
      await addJiraWorklog({
        date: currentDate,
        jiraTaskId,
        comment,
        timeSpent,
      });
    } else {
      console.log("free");
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
};

export const getJiraTask = async (
  jiraTaskId: string
): Promise<JiraApi.JsonResponse> => {
  return await jira.findIssue(jiraTaskId);
};

export const updateJiraIssue = async (
  jiraTaskId: string,
  data: any
): Promise<JiraApi.JsonResponse> => {
  return await jira.updateIssue(jiraTaskId, data);
};
export const getCurrentJiraUser = async (): Promise<JiraApi.JsonResponse> => {
  return await jira.getCurrentUser();
};
export const getJiraIssue = async (
  id: string
): Promise<JiraApi.IssueObject> => {
  return await jira.getIssue(id);
};
export const searchJira = async (
  searchString: string,
  searchQuery?: JiraApi.SearchQuery
): Promise<JiraApi.IssueObject> => {
  return await jira.searchJira(searchString, searchQuery);
};
export const getJiraSprint = async (
  sprintId: string
): Promise<JiraApi.JsonResponse> => {
  return await jira.getSprint(sprintId);
};
export const getJiraUsersInGroup = async (
  groupname: string,
  startAt?: number | undefined,
  maxResults?: number | undefined
): Promise<JiraApi.JsonResponse> => {
  return await jira.getUsersInGroup(groupname, startAt, maxResults);
};
export const getJiraUsersIssues = async (
  username: string,
  open: boolean
): Promise<JiraApi.JsonResponse> => {
  return await jira.getUsersIssues(username, open);
};
export const getJiraUpdateIssue = async (
  issueId: string,
  issueUpdate: JiraApi.IssueObject,
  query?: JiraApi.Query | undefined
): Promise<JiraApi.JsonResponse> => {
  return await jira.updateIssue(issueId, issueUpdate, query);
};
export const addJiraWorklog = async (
  jiraTask: JiraTaskRequest
): Promise<JiraApi.JsonResponse> => {
  const { comment, date, jiraTaskId, timeSpent } = jiraTask;
  const jiraLogDate = new Date(date);
  jiraLogDate.setHours(9, 40, 0, 0);

  return await jira.addWorklog(jiraTaskId, {
    comment,
    started: formatJiraDate(jiraLogDate),
    timeSpent,
  });
};

export default jira;
