import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

const JiraTaskSchemaRequest = z.object({
  date: z.date(),
  jiraTaskId: z.string(),
  comment: z.string(),
  timeSpent: z.string(),
});
export type JiraTaskRequest = z.infer<typeof JiraTaskSchemaRequest>;

const JiraLoopDaysSchemaRequest = z.object({
  startDate: z.date(),
  endDate: z.date(),
  jiraTaskId: z.string(),
  comment: z.string(),
  timeSpent: z.string(),
});
export type JiraLoopDaysRequest = z.infer<typeof JiraLoopDaysSchemaRequest>;

const JIraTaskIdSchema = z.object({
  id: z.string(),
});
export type JIraTaskIdSchemaParams = z.infer<typeof JIraTaskIdSchema>;
export const { schemas: jiraSchemas, $ref } = buildJsonSchemas(
  {
    JIraTaskIdSchema,
    JiraLoopDaysSchemaRequest,
    JiraTaskSchemaRequest,
  },
  { $id: "jiraSchema" }
);
