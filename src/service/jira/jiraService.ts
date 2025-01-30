import JiraApi from "jira-client";
import { isWorkday } from "../../utils";
import {
  JiraOfDay,
  JiraOfMonth,
  JiraOfWeek,
  JiraSprintIssuesResponse,
  JiraTaskRequest,
  JiraWorklogByTimeRequest,
  JiraWorklogPreConfiguredRequest,
  LastSprintForRapidViewResponse,
} from "./jiraSchema";
import {
  JiraWorklogListResponse,
  Worklog,
} from "./models/jiraSchemaQueryWorklog";
type fnJiraDates = "OfMonth" | "OfWeek" | "OfDay";

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
export const getJiraBoard = async (
  boardId: string
): Promise<JiraApi.JsonResponse> => {
  return await jira.getBoard(boardId);
};
export const getLastSprintForRapidView = async (
  boardId: string
): Promise<LastSprintForRapidViewResponse> => {
  return (await jira.getLastSprintForRapidView(
    boardId
  )) as LastSprintForRapidViewResponse;
};

export const getSprint = async (
  sprintId: string
): Promise<JiraApi.JsonResponse> => {
  return await jira.getSprint(sprintId);
};

export const getSprintIssues = async (
  boardId: string,
  sprintId: string
): Promise<JiraSprintIssuesResponse> => {
  return (await jira.getSprintIssues(
    boardId,
    sprintId
  )) as JiraSprintIssuesResponse;
};
export const getOrgTaskCurrentSprint = async (
  boardId: string
): Promise<string | null> => {
  const sprint = await getLastSprintForRapidView(boardId);
  const sprintIssues = await getSprintIssues(boardId, sprint.id.toString());
  const orgIssue = sprintIssues.contents.issuesNotCompletedInCurrentSprint.find(
    (issue) => (issue.summary === "Sprawy organizacyjne i spotkania")
  );
  return orgIssue?.key ?? null;
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
export const getJiraWorklogs = async (
  jiraTaskId: string
): Promise<JiraApi.JsonResponse> => {
  return await jira.getIssueWorklogs(jiraTaskId);
};

const getFnJiraDates = (
  type: JiraOfMonth["type"] | JiraOfWeek["type"] | JiraOfDay["type"]
): fnJiraDates => {
  switch (type) {
    case "M":
      return "OfMonth";
    case "W":
      return "OfWeek";
    case "D":
      return "OfDay";
    default:
      return "OfMonth";
  }
};

const checkIfWorklogIsInDateRange = (
  type: JiraOfMonth["type"] | JiraOfWeek["type"] | JiraOfDay["type"],
  diffStartDate = 0,
  diffEndDate = 0
) => {
  switch (type) {
    case "M":
      return {
        startDate: new Date(
          new Date(
            new Date().getFullYear(),
            new Date().getMonth() + diffStartDate,
            1
          ).setHours(0, 0, 0, 0)
        ),
        endDate: new Date(
          new Date(
            new Date().getFullYear(),
            new Date().getMonth() + diffEndDate,
            0
          ).setHours(23, 59, 59, 999)
        ),
      };

    case "W":
      return {
        startDate: new Date(
          new Date(
            new Date().setDate(new Date().getDate() + diffStartDate * 7)
          ).setHours(0, 0, 0, 0)
        ),
        endDate: new Date(
          new Date(
            new Date().setDate(new Date().getDate() + diffEndDate * 8)
          ).setHours(23, 59, 59, 999)
        ),
      };
    case "D":
      return {
        startDate: new Date(
          new Date(
            new Date().setDate(new Date().getDate() + diffStartDate)
          ).setHours(0, 0, 0, 0)
        ),
        endDate: new Date(
          new Date(
            new Date().setDate(new Date().getDate() + diffEndDate)
          ).setHours(23, 59, 59, 999)
        ),
      };

    default:
      throw new Error("Invalid type");
  }
};

export const getJiraWorklogByTime = async ({
  user,
  type,
  prevStart,
  prevEnd,
}: JiraWorklogByTimeRequest) => {
  const fn = getFnJiraDates(type);
  const query = `worklogAuthor =  ${user}  AND  worklogDate >= start${fn}(${
    prevStart ?? ""
  }) AND worklogDate < end${fn}(${prevEnd ?? ""})`;
  console.log(query);

  const resp = (await jira.searchJira(query, {
    fields: [
      "summary",
      "description",
      "worklog",
      "customfield_11902",
      "issuetype",
      "customfield_13200",
      "components",
      "labels",
      "parent",
    ],
  })) as JiraWorklogListResponse;

  let flatWorklogs = resp.issues.reduce(
    (worklogs, issue) => worklogs.concat(issue.fields.worklog.worklogs),
    [] as Worklog[]
  );

  for (const issue of resp.issues) {
    if (issue.fields.worklog.total > issue.fields.worklog.maxResults) {
      const resp = await getJiraWorklogs(issue.key);
      flatWorklogs = [...flatWorklogs, ...resp.worklogs];
    }
  }

  const obj = checkIfWorklogIsInDateRange(type, prevStart, prevEnd);

  console.log(obj);

  const totalTimeInSecondsGroupByDay = flatWorklogs.reduce((acc, worklog) => {
    if (
      (worklog.author?.name === user || worklog.updateAuthor?.name === user) &&
      new Date(worklog.started) > obj.startDate &&
      new Date(worklog.started) < obj.endDate
    ) {
      const date = new Date(worklog.started).toLocaleDateString("en-US");
      acc[date] = acc[date] ?? 0;
      acc[date] += worklog.timeSpentSeconds;
    }
    return acc;
  }, {} as { [key: string]: number });
  console.log(totalTimeInSecondsGroupByDay);
  const sum = Object.values(totalTimeInSecondsGroupByDay).reduce(
    (acc, time) => acc + time,
    0
  );

  const timeSpent = convertSecondsToHours(sum);
  return timeSpent;
};

const convertSecondsToHours = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

export const mapPreConfiguredDates = (
  obj: JiraWorklogPreConfiguredRequest
): JiraWorklogByTimeRequest => {
  switch (obj.type) {
    case "currentMonth":
      return { user: obj.user, type: "M", prevStart: 0, prevEnd: 1 };
    case "currentWeek":
      return { user: obj.user, type: "W" };
    case "currentDay":
      return { user: obj.user, type: "D" };
    case "yesterday":
      return { user: obj.user, type: "D", prevStart: -1, prevEnd: 0 };
    case "lastWeek":
      return { user: obj.user, type: "W", prevStart: -2, prevEnd: -1 };
    case "lastMonth":
      return { user: obj.user, type: "M", prevStart: -1, prevEnd: 0 };
    default:
      return { user: obj.user, type: "M" };
  }
};
export default jira;
