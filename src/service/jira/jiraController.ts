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
  searchJiraAll,
  parseJiraSprintData,
  formatItemsForGoogleSlides,
  getJiraIssue,
  editIssue,
} from "./jiraService";
import { renderTemplate } from "./jiraTemplates";
import {
  Fields,
  Issue,
  JiraWorklogListResponse,
} from "./models/jiraSchemaQueryWorklog";

// Types for enhanced issue data
interface EnhancedIssue {
  key: string;
  summary: string;
  status: string;
  type: string;
  epic: string | undefined;
  extra: boolean;
  components: string[];
  labels: string[];
  description?: string;
  assigneeName?: string;
}

interface GroupedByEpic {
  [epicName: string]: {
    [projectName: string]: {
      [issueType: string]: EnhancedIssue[];
    };
  };
}

export const logJiraTime = async (
  req: FastifyRequest<{
    Body: JiraTaskRequest;
  }>,
  reply: FastifyReply,
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
  reply: FastifyReply,
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
  reply: FastifyReply,
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
  reply: FastifyReply,
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
  reply: FastifyReply,
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
  reply: FastifyReply,
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
  req: FastifyRequest<{
    Params: { id: string };
  }>,
  reply: FastifyReply,
): Promise<JiraApi.JsonResponse | undefined> => {
  try {
    const { id } = req.params;
    const jiraResp = await getJiraBoard(id);
    return reply.code(200).send(jiraResp);
  } catch (e) {
    return reply.code(500).send(e);
  }
};
export const getLastSprintForRapidViewData = async (
  req: FastifyRequest<{
    Body: JiraLastSprintForRapidViewRequest;
  }>,
  reply: FastifyReply,
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
  reply: FastifyReply,
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
  reply: FastifyReply,
): Promise<JiraSprintIssuesResponse | undefined> => {
  const { boardId, sprintId } = req.body;
  try {
    const jiraResp = await getSprintIssues(
      boardId.toString(),
      sprintId.toString(),
    );
    const formattedData = parseJiraSprintData(jiraResp);
    formatItemsForGoogleSlides(formattedData.issuesByType[0].issues);
    return reply.code(200).send(formattedData);
  } catch (e) {
    return reply.code(500).send(e);
  }
};

export const getJiraOrgTaskCurrentSprint = async (
  req: FastifyRequest<{
    Body: JiraLastSprintForRapidViewRequest;
  }>,
  reply: FastifyReply,
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
  reply: FastifyReply,
): Promise<JiraApi.JsonResponse | undefined> => {
  try {
    const { issueId, fields } = req.body;
    const jiraResp = await editIssue(issueId, fields);
    return reply.code(200).send(jiraResp);
  } catch (e) {
    return reply.code(500).send(e);
  }
};

export const copyComponentsToLabels = async (
  req: FastifyRequest<{
    Params: { id: string };
  }>,
  reply: FastifyReply,
): Promise<JiraApi.JsonResponse> => {
  try {
    const { id } = req.params;
    const issue = await getJiraIssue(id, ["components", "labels"]);
    const componentsNames = issue.fields.components.map((c) => c.name);
    return await editIssue(id, {
      labels: [...issue.fields.labels, ...componentsNames],
    });
  } catch (e) {
    return reply.code(500).send(e);
  }
};

const copyComponentsToLabelsForIssues = async (sprintId: string) => {
  const data = {
    query: `Sprint = ${sprintId} and issuetype != Sub-task`,
    params: {
      fields: [
        "summary",
        "description",
        "worklog",
        "status",
        "customfield_11902",
        "issuetype",
        "customfield_13200",
        "components",
        "labels",
        "parent",
      ],
    },
  };
  const response = (await searchJira(
    data.query,
    data.params,
  )) as JiraWorklogListResponse;

  const results = await Promise.all(
    response.issues.map(async (issue: Issue) => {
      try {
        const componentsNames = issue.fields.components.map((c) => c.name);
        const labels = issue.fields.labels;

        if (componentsNames.length > 0) {
          const updatedLabels = [...labels, ...componentsNames];
          const result = await editIssue(issue.id, { labels: updatedLabels });
          return { id: issue.key, success: true, result };
        }
        return {
          id: issue.key,
          success: true,
          message: "No components to copy",
        };
      } catch (error) {
        return {
          id: issue.key,
          success: false,
          error: (error as Error).message,
        };
      }
    }),
  );

  return results;
};

export const copyComponentsToLabelsForSprintIssues = async (
  req: FastifyRequest<{
    Params: { id: string };
  }>,
  reply: FastifyReply,
): Promise<JiraApi.JsonResponse> => {
  try {
    const { id } = req.params;
    const results = await copyComponentsToLabelsForIssues(id);
    return reply.code(200).send({ results });
  } catch (e) {
    return reply.code(500).send(e);
  }
};

export const copyComponentsToLabelsForCurrentSprint = async (
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<JiraApi.JsonResponse> => {
  try {
    // Pobierz obecny sprint dla boardId 2493
    const currentSprint = await getLastSprintForRapidView("2493");
    const sprintId = currentSprint.id;

    const results = await copyComponentsToLabelsForIssues(sprintId.toString());

    return reply.code(200).send({
      sprintId,
      sprintName: currentSprint.name,
      results,
    });
  } catch (e) {
    return reply.code(500).send(e);
  }
};

const generateHTMLFromGroupedIssues = (
  grouped: Record<string, Record<string, string[]>>,
  sprintInfo?: { id: string; name: string },
) => {
  const projects = Object.entries(grouped)
    .filter(([, issueTypes]) => Object.keys(issueTypes).length > 0)
    .map(([name, issueTypes]) => ({
      name,
      issueTypes: Object.entries(issueTypes).map(([typeName, issues]) => ({
        name: typeName,
        issues: issues.map((issue) => {
          const match = issue.match(/\[(.*?)\|\s*(.*?)\]\[(.*?)\]\s*-\s*(.*)/);
          if (!match) return { raw: issue };
          const [, key, url, status, summary] = match;
          return { key, url, status, summary };
        }),
      })),
    }));

  return renderTemplate("groupedIssues", {
    sprintInfo,
    projects,
    generatedAt: new Date().toLocaleString(),
  });
};

const formatStatus = (status: string): string => {
  if (status === "Ready for Deployment") return "RFD";
  if (status === "W toku") return "In progress";
  return status;
};

const isCompletedStatus = (status: string): boolean => {
  const completedStatuses = ["Closed", "Ready for Deployment", "Done"];
  return completedStatuses.some((s) => status.toLowerCase() === s.toLowerCase());
};

const generateHTMLFromGroupedIssuesByEpic = (
  groupedByEpic: GroupedByEpic,
  sprintInfo?: { id: string; name: string },
) => {
  const epics = Object.entries(groupedByEpic).map(([name, projects]) => ({
    name,
    projects: Object.entries(projects)
      .filter(([, issueTypes]) => Object.keys(issueTypes).length > 0)
      .map(([projectName, issueTypes]) => ({
        name: projectName,
        issueTypes: Object.entries(issueTypes).map(([typeName, issues]) => ({
          name: typeName,
          issues: issues.map((issue) => ({
            ...issue,
            formattedStatus: formatStatus(issue.status),
            statusClass: isCompletedStatus(issue.status)
              ? "status status-completed"
              : "status status-in-progress",
          })),
        })),
      })),
  }));

  return renderTemplate("groupedIssuesByEpic", {
    sprintInfo,
    epics,
    jiraHost: process.env.JIRA_HOST,
    generatedAt: new Date().toLocaleString(),
  });
};

export const getGroupedSprintIssues = async (
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<any> => {
  try {
    const jiraResp = await getLastSprintForRapidView("2493");
    const sprintId = jiraResp.id;
    const query = `Sprint = ${sprintId} and issuetype != Sub-task`;
    const params = {
      fields: [
        "summary",
        "description",
        "worklog",
        "status",
        "customfield_11902",
        "issuetype",
        "customfield_13200",
        "components",
        "labels",
        "parent",
        "customfield_10018",
      ],
    };

    const response = await searchJira(query, params);
    const issues = response.issues;

    const projects = [
      {
        name: "GFFP",
        keys: ["[GFFP]", "Company Monitor", "company-monitor",'gffp'],
      },
      {
        name: "Payments Module",
        keys: ["[PM]", "Payments Module", "payments-module"],
      },
      {
        name: "Company Verifications",
        keys: ["[CV]", "Company Verifications", "company-verifications"],
      },
      {
        name: "Company Statuses",
        keys: ["[CS]", "Company Statuses", "company-statuses"],
      },
      {
        name: "Formularz Rejestracji ",
        keys: ["[FE]", "Formularz Rejestracji", "formularz-rejestracji",'Registration'],
      },
      {
        name: "Customer Extended Data Center",
        keys: [
          "[CEDC]",
          "Customer Extended Data Center",
          "customer-extended-data-center",
        ],
      },
    ];
    // Helper to check if any project key is present in a string (case-insensitive)
    function hasProjectKey(str: string, keys: string[]): boolean {
      if (!str) return false;
      const lower = str.toLowerCase();
      return keys.some((key) => lower.includes(key.toLowerCase()));
    }

    // Group issues by project and then by issue type
    const grouped: Record<string, Record<string, string[]>> = {};
    for (const project of projects) {
      grouped[project.name] = {};
    }
    grouped["Other"] = {};

    for (const issue of issues) {
      const summary = issue.fields.summary || "";
      const description = issue.fields.description || "";
      const components = (issue.fields.components || [])
        .map((c: any) => c.name)
        .join(" ");
      const labels = (issue.fields.labels || []).join(" ");
      const issueType = issue.fields.issuetype?.name || "Unknown";
      const issueStatus = issue.fields.status?.name || "Unknown";
      const line = `[${issue.key}| https://${process.env.JIRA_HOST}/browse/${issue.key}][${issueStatus}] - ${summary}`;

      let projectName = "Other";
      for (const project of projects) {
        if (
          hasProjectKey(summary, project.keys) ||
          hasProjectKey(components, project.keys) ||
          // hasProjectKey(description, project.keys) ||
          hasProjectKey(labels, project.keys)
        ) {
          console.log(
            "Matched project key in summary:",
            hasProjectKey(summary, project.keys),
            summary,
          );
          console.log(
            "Matched project key in components:",
            hasProjectKey(components, project.keys),
            components,
          );
          // console.log(
          //   "Matched project key in description:",
          //   hasProjectKey(description, project.keys),
          //   description
          // );
          console.log(
            "Matched project key in labels:",
            hasProjectKey(labels, project.keys),
            labels,
          );
          console.log("Matched project:", project.name);
          projectName = project.name;
          break;
        }
      }

      if (!grouped[projectName][issueType]) {
        grouped[projectName][issueType] = [];
      }
      grouped[projectName][issueType].push(line);
    }

    // Format output
    const output: string[] = [];
    for (const project of projects) {
      if (Object.keys(grouped[project.name]).length) {
        output.push(`# ${project.name}`);
        for (const [issueType, lines] of Object.entries(
          grouped[project.name],
        )) {
          output.push(`## ${issueType}`);
          output.push(...lines);
          output.push("");
        }
      }
    }
    if (Object.keys(grouped["Other"]).length) {
      output.push(`# Other`);
      for (const [issueType, lines] of Object.entries(grouped["Other"])) {
        output.push(`## ${issueType}`);
        output.push(...lines);
        output.push("");
      }
    }

    return reply.code(200).send(grouped);
  } catch (e) {
    return reply.code(500).send(e);
  }
};

export const getGroupedSprintIssuesHTML = async (
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<any> => {
  try {
    const jiraResp = await getLastSprintForRapidView("2493");
    const sprintId = jiraResp.id;

    // Get sprint data with parsed issues
    const jiraRespSprint = await getSprintIssues("2493", sprintId.toString());
    const formattedData = parseJiraSprintData(jiraRespSprint);

    // Get additional fields from searchJira (epic field)
    const query = `Sprint = ${sprintId} and issuetype != Sub-task`;
    const params = {
      fields: [
        "summary",
        "description",
        "worklog",
        "status",
        "customfield_11902",
        "issuetype",
        "customfield_13200",
        "components",
        "labels",
        "parent",
        "customfield_10018", // Epic link field
        "assignee",
      ],
    };

    const response = await searchJira(query, params);
    const searchIssues = response.issues;

    // Create a map of issues from searchJira for quick lookup
    const issuesMap = new Map<string, Issue>(
      searchIssues.map((issue: Issue) => [issue.key, issue]),
    );

    // Merge data from formattedData with searchJira results
    const enhancedIssues: EnhancedIssue[] = [];

    formattedData.issuesByType.forEach((typeGroup) => {
      typeGroup.issues.forEach((issue) => {
        const searchIssue = issuesMap.get(issue.key);
        if (searchIssue && searchIssue.fields) {
          const assignee = (searchIssue.fields as any).assignee;
          const searchFields = searchIssue.fields as any;
          enhancedIssues.push({
            key: issue.key,
            summary: issue.summary || searchIssue.fields.summary || "",
            status: searchFields.status?.name || issue.status,
            type: searchFields.issuetype?.name || issue.type,
            epic: issue.epic || searchFields.parent?.fields?.summary,
            extra: issue.extra,
            components: (searchIssue.fields.components || []).map(
              (c: any) => c.name,
            ),
            labels: searchIssue.fields.labels || [],
            description: searchIssue.fields.description || undefined,
            assigneeName: assignee?.displayName || assignee?.name || undefined,
          });
        } else {
          // If searchIssue not found or fields is null, use data from formattedData only
          enhancedIssues.push({
            key: issue.key,
            summary: issue.summary,
            status: issue.status,
            type: issue.type,
            epic: issue.epic,
            extra: issue.extra,
            components: [],
            labels: [],
            description: undefined,
            assigneeName: undefined,
          });
        }
      });
    });

    const projects = [
      {
        name: "Company Monitor",
        keys: ["[CM]", "Company Monitor", "company-monitor"],
      },
      {
        name: "Company Data Provider",
        keys: ["[CDP]", "Company Data Provider", "company-data-provider"],
      },
      {
        name: "Company Verifications",
        keys: ["[CV]", "Company Verifications", "company-verifications"],
      },
      {
        name: "Company Statuses",
        keys: ["[CS]", "Company Statuses", "company-statuses"],
      },
      {
        name: "Payments Gateway",
        keys: ["[PG]", "Payments Gateway", "payments-gateway"],
      },
      {
        name: "Customer Extended Data Center",
        keys: [
          "[CEDC]",
          "Customer Extended Data Center",
          "customer-extended-data-center",
        ],
      },
    ];

    // Helper to check if any project key is present in a string (case-insensitive)
    function hasProjectKey(str: string, keys: string[]): boolean {
      if (!str) return false;
      const lower = str.toLowerCase();
      return keys.some((key) => lower.includes(key.toLowerCase()));
    }

    // Group by Epic -> Project -> Issue Type
    const groupedByEpic: GroupedByEpic = {};

    for (const issue of enhancedIssues) {
      const epicName = issue.epic || "No Epic";
      const componentsStr = issue.components.join(" ");
      const labelsStr = issue.labels.join(" ");

      // Determine project
      let projectName = "Other";
      for (const project of projects) {
        if (
          hasProjectKey(issue.summary, project.keys) ||
          hasProjectKey(componentsStr, project.keys) ||
          hasProjectKey(labelsStr, project.keys)
        ) {
          projectName = project.name;
          break;
        }
      }

      // Initialize nested structure
      if (!groupedByEpic[epicName]) {
        groupedByEpic[epicName] = {};
      }
      if (!groupedByEpic[epicName][projectName]) {
        groupedByEpic[epicName][projectName] = {};
      }
      if (!groupedByEpic[epicName][projectName][issue.type]) {
        groupedByEpic[epicName][projectName][issue.type] = [];
      }

      groupedByEpic[epicName][projectName][issue.type].push(issue);
    }

    const html = generateHTMLFromGroupedIssuesByEpic(groupedByEpic, {
      id: sprintId.toString(),
      name: jiraResp.name,
    });

    return reply
      .code(200)
      .header("Content-Type", "text/html; charset=utf-8")
      .send(html);
  } catch (e) {
    console.error("getGroupedSprintIssuesHTML failed:", e);
    return reply.code(500).send(e);
  }
};

const FEATURE_TEAM_FIELD = "customfield_11410";
const TNT_TEAM = "TNT";
const JQL_CHUNK_SIZE = 50;
const EXCLUDED_STATUSES = ["Closed", "Rejected", "Freezed"];
const STATUS_FILTER_JQL = `status NOT IN (${EXCLUDED_STATUSES.map((s) => `"${s}"`).join(", ")})`;

interface JiraBlocker {
  key: string;
  summary: string;
  status: string;
}

const toTntIssue = (issue: JiraApi.IssueObject) => ({
  key: issue.key,
  summary: issue.fields.summary,
  status: issue.fields.status?.name,
  type: issue.fields.issuetype?.name,
  assignee: issue.fields.assignee?.displayName ?? null,
  featureTeam: issue.fields[FEATURE_TEAM_FIELD]?.value ?? null,
  blockedBy: ((issue.fields.issuelinks ?? []) as any[])
    .filter(
      (l: any) => l.inwardIssue && /blocked by/i.test(l.type?.inward ?? ""),
    )
    .map((l: any): JiraBlocker => ({
      key: l.inwardIssue.key as string,
      summary: l.inwardIssue.fields?.summary as string,
      status: l.inwardIssue.fields?.status?.name as string,
    })),
});

export const getTntEpics = async (
  req: FastifyRequest<{ Querystring: { format?: string } }>,
  reply: FastifyReply,
): Promise<any> => {
  try {
    const epics = await searchJiraAll(
      `issuetype = Epic AND ("Feature Team" = ${TNT_TEAM} OR "Participating Teams" = ${TNT_TEAM}) AND ${STATUS_FILTER_JQL} ORDER BY status ASC, created DESC`,
      ["summary", "status", "assignee", FEATURE_TEAM_FIELD],
    );

    const tasksByEpic: Record<string, ReturnType<typeof toTntIssue>[]> = {};
    const closedCountByEpic: Record<string, number> = {};
    for (let i = 0; i < epics.length; i += JQL_CHUNK_SIZE) {
      const keys = epics
        .slice(i, i + JQL_CHUNK_SIZE)
        .map((e) => e.key)
        .join(",");
      const tasks = await searchJiraAll(
        `parent in (${keys}) AND "Feature Team" = ${TNT_TEAM} AND status != Cancelled`,
        ["summary", "status", "assignee", "issuetype", "parent", "issuelinks", FEATURE_TEAM_FIELD],
      );
      for (const task of tasks) {
        const parentKey = task.fields.parent?.key;
        if (!parentKey) continue;
        if (EXCLUDED_STATUSES.includes(task.fields.status?.name)) {
          closedCountByEpic[parentKey] = (closedCountByEpic[parentKey] ?? 0) + 1;
          continue;
        }
        (tasksByEpic[parentKey] ??= []).push(toTntIssue(task));
      }
    }

    const result = epics.map((epic) => ({
      ...toTntIssue(epic),
      tasks: tasksByEpic[epic.key] ?? [],
      closedTasksCount: closedCountByEpic[epic.key] ?? 0,
    }));
    if (req.query?.format === "html") {
      return reply
        .code(200)
        .header("Content-Type", "text/html; charset=utf-8")
        .send(
          renderTemplate("tntEpics", {
            total: result.length,
            epics: result,
            jiraHost: process.env.JIRA_HOST,
            closedStatuses: EXCLUDED_STATUSES.join(", "),
          }),
        );
    }
    return reply.code(200).send({ total: result.length, epics: result });
  } catch (e) {
    return reply.code(500).send(e instanceof Error ? { message: e.message } : e);
  }
};
