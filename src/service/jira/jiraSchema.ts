import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";
//
const JiraTaskSchemaRequest = z.object({
  date: z.date(),
  jiraTaskId: z.string(),
  comment: z.string(),
  timeSpent: z.string(),
});
export type JiraTaskRequest = z.infer<typeof JiraTaskSchemaRequest>;
//

const JiraOfMonthSchemaRequest = z.object({
  user: z.string(),
  type: z.literal("M"),
  prevStart: z.number().optional(),
  prevEnd: z.number().optional(),
});
const JiraOfDaySchemaRequest = z.object({
  user: z.string(),
  type: z.literal("D"),
  prevStart: z.number().optional(),
  prevEnd: z.number().optional(),
});
const JiraOfWeekSchemaRequest = z.object({
  user: z.string(),
  type: z.literal("W"),
  prevStart: z.number().optional(),
  prevEnd: z.number().optional(),
});

export type JiraOfMonth = z.infer<typeof JiraOfMonthSchemaRequest>;
export type JiraOfDay = z.infer<typeof JiraOfDaySchemaRequest>;
export type JiraOfWeek = z.infer<typeof JiraOfWeekSchemaRequest>;

const JiraQueryDatesSchemaRequest = z.union([
  JiraOfDaySchemaRequest,
  JiraOfWeekSchemaRequest,
  JiraOfMonthSchemaRequest,
]);
export type JiraWorklogByTimeRequest = z.infer<
  typeof JiraQueryDatesSchemaRequest
>;

const JiraWorklogPreConfiguredSchemaRequest = z.object({
  type: z.union([
    z.literal("currentMonth"),
    z.literal("currentWeek"),
    z.literal("currentDay"),
    z.literal("yesterday"),
    z.literal("lastWeek"),
    z.literal("lastMonth"),
  ]),
  user: z.string(),
});
export type JiraWorklogPreConfiguredRequest = z.infer<typeof JiraWorklogPreConfiguredSchemaRequest>;

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
    JiraQueryDatesSchemaRequest,
    JiraWorklogPreConfiguredSchemaRequest,
  },
  { $id: "jiraSchema" }
);
