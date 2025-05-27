import JiraApi from "jira-client";
import { isWorkday } from "../../utils";
import {
  getCalendarEventsByDateRange,
  GoogleCalendarEvent,
} from "../n8n/n8nProvider";
import {
  JiraOfDay,
  JiraOfMonth,
  JiraOfWeek,
  JiraSprintIssuesResponse,
  JiraTaskRequest,
  JiraWorklogByTimeRequest,
  JiraWorklogPreConfiguredRequest,
  LastSprintForRapidViewResponse,
  JiraLoopDaysRequest,
  DayRecord,
} from "./jiraSchema";
import {
  Issue,
  JiraWorklogListResponse,
  Worklog,
} from "./models/jiraSchemaQueryWorklog";
type fnJiraDates = "OfMonth" | "OfWeek" | "OfDay";

if (!process.env.JIRA_HOST || !process.env.JIRA_BEARER) {
  throw new Error(
    "Please provide all the necessary environment variables for the Jira API connection"
  );
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
const findRecordByDay = (
  records: DayRecord[],
  dateArg: Date
): DayRecord | undefined => {
  const dayStr = dateArg.toISOString().split("T")[0];
  return records.find((record) => record.day === dayStr);
};

export const loopDays = async ({
  startDate,
  endDate,
  comment,
  boardId,
}: JiraLoopDaysRequest): Promise<void> => {
  const currentDate = new Date(startDate);
  const loopEndDate = new Date(endDate);

  const calendar = await getCalendarEventsByDateRange(startDate, endDate);
  const groupedByDay = groupByDay(calendar);
  const orgTask = await getOrgTaskCurrentSprint(boardId.toString());
  if (!orgTask) {
    throw new Error("Org task not found");
  }

  while (currentDate <= loopEndDate) {
    if (isWorkday(currentDate)) {
      const result = findRecordByDay(groupedByDay, currentDate);

      await addJiraWorklog({
        date: currentDate,
        jiraTaskId: orgTask,
        comment,
        timeSpent: result?.decimal ?? "0",
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
  id: string,
  fields?: string | string[]
): Promise<Issue> => {
  return (await jira.getIssue(id, fields)) as Promise<Issue>;
};
export const searchJira = async (
  searchString: string,
  searchQuery?: JiraApi.SearchQuery
): Promise<JiraApi.IssueObject> => {
  const searchQueryObj = searchQuery ?? {
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
  };
  return await jira.searchJira(searchString, searchQueryObj);
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
  const response = await jira.listSprints(boardId);
  console.log(response,boardId);
  return response;
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
    (issue) => issue.summary === "Sprawy organizacyjne i spotkania"
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

  const resp = (await searchJira(query, {
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

// Helper to format milliseconds as decimal hours (e.g., "1.5")
const formatTimeDecimal = (ms: number) => {
  const hours = ms / (1000 * 60 * 60);
  return hours.toFixed(1); // "1.5"
};

// Helper to format milliseconds as "Xh Ym" (e.g., "1h 30m")
const formatTimeHMS = (ms: number) => {
  const totalMinutes = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (minutes > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${hours}h`;
};

const groupByDay = (entries: GoogleCalendarEvent[]): DayRecord[] => {
  const dayMap: Record<string, number> = {};

  entries.forEach((item) => {
    const day = new Date(item.startTime).toISOString().split("T")[0];
    const ms = parseInt(item.time, 10);
    if (!dayMap[day]) {
      dayMap[day] = 0;
    }
    dayMap[day] += ms;
  });

  // Convert the map to an array of objects with both decimal and "Xh Ym" formats
  return Object.entries(dayMap).map(([day, totalMs]) => ({
    day,
    decimal: formatTimeDecimal(totalMs),
    jiraFormat: formatTimeHMS(totalMs),
  }));
};

export function parseJiraSprintData(resp: JiraSprintIssuesResponse) {
  const { sprint, contents } = resp;
  const {
    entityData,
    completedIssues,
    issuesNotCompletedInCurrentSprint,
    issuesCompletedInAnotherSprint,
    issueKeysAddedDuringSprint,
  } = contents;

  // Gather all issues in one array
  const allIssues = [
    ...completedIssues,
    ...issuesNotCompletedInCurrentSprint,
    ...issuesCompletedInAnotherSprint,
  ];

  // Group issues by typeName
  const issuesByType: Record<string, { typeName: string; issues: any[] }> = {};

  allIssues.forEach((issue) => {
    const typeName = entityData.types[issue.typeId]?.typeName || "Unknown";
    const statusName =
      entityData.statuses[issue.statusId]?.statusName || "Unknown";
    const epicText = issue.epicId
      ? entityData.epics[issue.epicId]?.epicField?.text
      : undefined;
    const isExtra = !!issueKeysAddedDuringSprint[issue.key];

    if (!issuesByType[typeName]) {
      issuesByType[typeName] = { typeName, issues: [] };
    }
    issuesByType[typeName].issues.push({
      key: issue.key,
      summary: issue.summary,
      status: statusName,
      type: typeName,
      epic: epicText,
      extra: isExtra,
    });
  });

  return {
    sprintName: sprint.name,
    sprintGoal: sprint.goal,
    issuesByType: Object.values(issuesByType),
  };
}

export function formatItemsForGoogleSlides(
  items: Array<{
    key: string;
    summary: string;
    status: string;
    type: string;
    epic: string;
    extra: boolean;
  }>
): string {
  // Header row (tab-separated)
  let result = "Key\tSummary\tStatus\tType\tEpic\tExtra\n";

  // Each item as a tab-separated row
  for (const item of items) {
    result += `${item.key}\t${item.summary}\t${item.status}\t${item.type}\t${item.epic}\t${item.extra}\n`;
  }

  // You can just copy the returned string and paste it into Google Slides
  return result;
}

export function formatItemsAsCSV(
  items: Array<{
    key: string;
    summary: string;
    status: string;
    epic: string;
    extra: boolean;
  }>
): string {
  // Header row (no 'type' column)
  let result = "Key;Summary;Status;Epic\n";

  for (const item of items) {
    // Wrap key in [] and add '*' if 'extra' is true
    const keyWithBrackets = item.extra ? `[${item.key}]*` : `[${item.key}]`;

    // Semicolon-separated row (no 'type' field)
    result += `${keyWithBrackets};${item.summary};${item.status};${item.epic}\n`;
  }

  return result;
}

export function editIssue(
  issueId: string,
  fields: Record<string, any>
): Promise<JiraApi.JsonResponse> {
  return jira.updateIssue(issueId, {
    fields,
  });
}
