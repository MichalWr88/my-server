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
    return reply.code(200).send(formattedData);
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

const generateHTMLFromGroupedIssues = (
  grouped: Record<string, Record<string, string[]>>,
  sprintInfo?: { id: string; name: string }
) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sprint Issues Report${
      sprintInfo ? ` - ${sprintInfo.name}` : ""
    }</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 3px solid #0052cc;
            padding-bottom: 10px;
            margin-bottom: 30px;
        }
        h2 {
            color: #0052cc;
            margin-top: 30px;
            margin-bottom: 15px;
            padding: 10px;
            background: #f4f5f7;
            border-left: 4px solid #0052cc;
        }
        h3 {
            color: #5e6c84;
            margin-top: 20px;
            margin-bottom: 10px;
            font-size: 1.1em;
        }
        ul {
            margin: 0 0 20px 0;
            padding-left: 20px;
        }
        li {
            margin-bottom: 8px;
            padding: 8px;
            background: #fafbfc;
            border-radius: 4px;
            border-left: 3px solid #dfe1e6;
        }
        a {
            color: #0052cc;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        .issue-status {
            font-weight: bold;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.85em;
            margin-right: 8px;
        }
        .sprint-info {
            background: #e3fcef;
            border: 1px solid #36b37e;
            border-radius: 4px;
            padding: 15px;
            margin-bottom: 20px;
        }
        .project-section {
            margin-bottom: 40px;
        }
        .empty-section {
            color: #6b778c;
            font-style: italic;
            padding: 20px;
            text-align: center;
            background: #f4f5f7;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Sprint Issues Report</h1>
        ${
          sprintInfo
            ? `
        <div class="sprint-info">
            <strong>Sprint:</strong> ${sprintInfo.name} (ID: ${sprintInfo.id})
        </div>
        `
            : ""
        }
        
        ${Object.entries(grouped)
          .map(([projectName, issueTypes]) => {
            if (Object.keys(issueTypes).length === 0) return "";

            return `
        <div class="project-section">
            <h2>${projectName}</h2>
            ${Object.entries(issueTypes)
              .map(
                ([issueType, issues]) => `
            <h3>${issueType} (${issues.length})</h3>
            <ul>
                ${issues
                  .map((issue) => {
                    // Parse the issue string to extract components
                    const match = issue.match(
                      /\[(.*?)\|\s*(.*?)\]\[(.*?)\]\s*-\s*(.*)/
                    );
                    if (match) {
                      const [, issueKey, url, status, summary] = match;
                      return `<li>
                        <a href="${url}" target="_blank">${issueKey}</a>
                        <span class="issue-status">[${status}]</span>
                        - ${summary}
                    </li>`;
                    }
                    return `<li>${issue}</li>`;
                  })
                  .join("")}
            </ul>
            `
              )
              .join("")}
        </div>
          `;
          })
          .filter(Boolean)
          .join("")}
        
        <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #dfe1e6; color: #6b778c; font-size: 0.9em;">
            Generated on ${new Date().toLocaleString()}
        </footer>
    </div>
</body>
</html>`;

  return html;
};

const generateHTMLFromGroupedIssuesByEpic = (
  groupedByEpic: GroupedByEpic,
  sprintInfo?: { id: string; name: string }
) => {
  // Helper function to format status
  const formatStatus = (status: string): string => {
    if (status === "Ready for Deployment") return "RFD";
    if (status === "W toku") return "In progress";
    return status;
  };

  // Helper function to check if status is completed
  const isCompletedStatus = (status: string): boolean => {
    const completedStatuses = ["Closed", "Ready for Deployment", "Done"];
    return completedStatuses.some(
      (s) => status.toLowerCase() === s.toLowerCase()
    );
  };

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sprint Issues Report${
      sprintInfo ? ` - ${sprintInfo.name}` : ""
    }</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Montserrat', sans-serif;
            line-height: 1.6;
            background-color: #1a1a1a;
            color: #ffffff;
            padding: 40px 20px;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        h1 {
            color: #ffffff;
            font-size: 2.5em;
            margin-bottom: 30px;
            font-weight: 700;
            border-bottom: 3px solid #4a9eff;
            padding-bottom: 15px;
        }
        h2 {
            color: #a78bfa;
            font-size: 1.8em;
            margin-top: 50px;
            margin-bottom: 25px;
            font-weight: 600;
            padding: 15px 0;
            border-bottom: 2px solid #a78bfa;
        }
        h3 {
            color: #60a5fa;
            font-size: 1.4em;
            margin-top: 35px;
            margin-bottom: 20px;
            font-weight: 600;
            padding-left: 10px;
            border-left: 4px solid #60a5fa;
        }
        h4 {
            color: #94a3b8;
            font-size: 1.1em;
            margin-top: 25px;
            margin-bottom: 15px;
            font-weight: 500;
        }
        ul {
            list-style: none;
            margin: 0 0 25px 0;
            padding: 0;
        }
        li {
            margin-bottom: 10px;
            padding: 0;
            color: #ffffff;
            font-size: 1em;
            line-height: 1.5;
            font-weight: bold;
        }
        a {
            color: #60a5fa;
            text-decoration: none;
            font-weight: 700;
        }
        a:hover {
            color: #93c5fd;
            text-decoration: underline;
        }
        .extra-badge {
            background: #fb923c;
            color: #000000;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.75em;
            margin-left: 8px;
            font-weight: 700;
            text-transform: uppercase;
        }
        .status {
            font-weight: 700;
            padding: 3px 8px;
            border-radius: 4px;
        }
        .status-completed {
            color: #10b981;
            background: #064e3b;
        }
        .status-in-progress {
            color: #f59e0b;
            background: #451a03;
        }
        .assignee {
            color: #94a3b8;
            font-weight: 700;
            font-style: italic;
        }
        .sprint-info {
            background: #065f46;
            border: 2px solid #10b981;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 40px;
            color: #ffffff;
        }
        .sprint-info strong {
            color: #6ee7b7;
        }
        .epic-section {
            margin-bottom: 60px;
        }
        .project-section {
            margin-bottom: 40px;
            padding-left: 20px;
        }
        .separator {
            color: #475569;
            margin: 0 8px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Sprint Issues Report</h1>
        ${
          sprintInfo
            ? `
        <div class="sprint-info">
            <strong>Sprint:</strong> ${sprintInfo.name} (ID: ${sprintInfo.id})
        </div>
        `
            : ""
        }
        
        ${Object.entries(groupedByEpic)
          .map(([epicName, projects]) => {
            return `
        <div class="epic-section">
            <h2>📌 ${epicName}</h2>
            ${Object.entries(projects)
              .map(([projectName, issueTypes]) => {
                if (Object.keys(issueTypes).length === 0) return "";

                return `
            <div class="project-section">
                <h3>🔷 ${projectName}</h3>
                ${Object.entries(issueTypes)
                  .map(
                    ([issueType, issues]) => `
                <h4>${issueType} (${issues.length})</h4>
                <ul>
                    ${issues
                      .map((issue) => {
                        const formattedStatus = formatStatus(issue.status);
                        const statusClass = isCompletedStatus(issue.status)
                          ? "status status-completed"
                          : "status status-in-progress";
                        const assigneeText = issue.assigneeName
                          ? ` <span class="assignee">${issue.assigneeName}</span>`
                          : "";
                        const extraBadge = issue.extra
                          ? '<span class="extra-badge">Extra</span>'
                          : "";

                        return `<li>
                        <a href="https://${process.env.JIRA_HOST}/browse/${issue.key}" target="_blank">${issue.key}</a>${extraBadge}<span class="separator">-</span>${issue.summary}<span class="separator">-</span><span class="${statusClass}">${formattedStatus}</span>${assigneeText}
                    </li>`;
                      })
                      .join("")}
                </ul>
                `
                  )
                  .join("")}
            </div>
                `;
              })
              .join("")}
        </div>
            `;
          })
          .join("")}
        
        <footer style="margin-top: 60px; padding-top: 30px; border-top: 1px solid #334155; color: #64748b; font-size: 0.9em;">
            Generated on ${new Date().toLocaleString()}
        </footer>
    </div>
</body>
</html>`;

  return html;
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
        "customfield_10018",
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
            summary
          );
          console.log(
            "Matched project key in components:",
            hasProjectKey(components, project.keys),
            components
          );
          // console.log(
          //   "Matched project key in description:",
          //   hasProjectKey(description, project.keys),
          //   description
          // );
          console.log(
            "Matched project key in labels:",
            hasProjectKey(labels, project.keys),
            labels
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

export const getGroupedSprintIssuesHTML = async (
  req: FastifyRequest,
  reply: FastifyReply
): Promise<any> => {
  try {
    const jiraResp = await getLastSprintForRapidView("972");
    const sprintId = jiraResp.id;

    // Get sprint data with parsed issues
    const jiraRespSprint = await getSprintIssues("972", sprintId.toString());
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
      searchIssues.map((issue: Issue) => [issue.key, issue])
    );

    // Merge data from formattedData with searchJira results
    const enhancedIssues: EnhancedIssue[] = [];

    formattedData.issuesByType.forEach((typeGroup) => {
      typeGroup.issues.forEach((issue) => {
        const searchIssue = issuesMap.get(issue.key);
        if (searchIssue && searchIssue.fields) {
          const assignee = (searchIssue.fields as any).assignee;
          enhancedIssues.push({
            key: issue.key,
            summary: issue.summary || searchIssue.fields.summary || "",
            status: issue.status,
            type: issue.type,
            epic: issue.epic,
            extra: issue.extra,
            components: (searchIssue.fields.components || []).map(
              (c: any) => c.name
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
    return reply.code(500).send(e);
  }
};
