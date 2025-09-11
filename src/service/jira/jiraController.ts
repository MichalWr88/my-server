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
import {
  Fields,
  Issue,
  JiraWorklogListResponse,
} from "./models/jiraSchemaQueryWorklog";

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
  req: FastifyRequest<{
    Params: { id: string };
  }>,
  reply: FastifyReply
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

export const copyComponentsToLabels = async (
  req: FastifyRequest<{
    Params: { id: string };
  }>,
  reply: FastifyReply
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
    data.params
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
    })
  );

  return results;
};

export const copyComponentsToLabelsForSprintIssues = async (
  req: FastifyRequest<{
    Params: { id: string };
  }>,
  reply: FastifyReply
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
  reply: FastifyReply
): Promise<JiraApi.JsonResponse> => {
  try {
    // Pobierz obecny sprint dla boardId 972
    const currentSprint = await getLastSprintForRapidView("972");
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

export const getGroupedSprintIssues = async (
  req: FastifyRequest,
  reply: FastifyReply
): Promise<any> => {
  try {
    const jiraResp = await getLastSprintForRapidView("972");
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
      ],
    };

    const response = await searchJira(query, params);
    const issues = response.issues;

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
      const line = `[${issue.key}| https://${process.env.JIRA_HOST}/${issue.key}][${issueStatus}] - ${summary}`;

      let projectName = "Other";
      for (const project of projects) {
        if (
          hasProjectKey(summary, project.keys) ||
          hasProjectKey(components, project.keys) ||
          hasProjectKey(description, project.keys) ||
          hasProjectKey(labels, project.keys)
        ) {
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
          grouped[project.name]
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
