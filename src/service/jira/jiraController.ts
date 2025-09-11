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
      const line = `[${issue.key}| https://${process.env.JIRA_HOST}/browse/${issue.key}][${issueStatus}] - ${summary}`;

      let projectName = "Other";
      for (const project of projects) {
        if (
          hasProjectKey(summary, project.keys) ||
          hasProjectKey(components, project.keys) ||
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

    const html = generateHTMLFromGroupedIssues(grouped, {
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
