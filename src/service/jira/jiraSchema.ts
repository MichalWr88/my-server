import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";
import { parse, isValid } from "date-fns";

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
export type JiraWorklogPreConfiguredRequest = z.infer<
  typeof JiraWorklogPreConfiguredSchemaRequest
>;
// Validate a date string in "YYYY-MM-DD" format
export const DateStringSchema = z.string().refine(
  (val) => {
    const parsed = parse(val, "yyyy-MM-dd", new Date());
    return isValid(parsed);
  },
  {
    message: "Must be a valid date in YYYY-MM-DD format",
  }
);
const JiraLoopDaysSchemaRequest = z.object({
  startDate: DateStringSchema,
  endDate: DateStringSchema,
  comment: z.string(),
  boardId: z.number(),
});
export type JiraLoopDaysRequest = z.infer<typeof JiraLoopDaysSchemaRequest>;

const JIraTaskIdSchema = z.object({
  id: z.string(),
});
export type JIraTaskIdSchemaParams = z.infer<typeof JIraTaskIdSchema>;

const JiraLastSprintForRapidViewRequestSchema = z.object({
  boardId: z.number(),
});

const JiraSprintRequestSchema = z.object({
  sprintId: z.number(),
});
export type JiraSprintRequest = z.infer<typeof JiraSprintRequestSchema>;

export const JiraSprintIssuesRequestSchema = z.object({
  boardId: z.number(),
  sprintId: z.number(),
});
export type JiraSprintIssuesRequest = z.infer<
  typeof JiraSprintIssuesRequestSchema
>;

export type JiraLastSprintForRapidViewRequest = z.infer<
  typeof JiraLastSprintForRapidViewRequestSchema
>;
const JiraGetLastSprintForRapidViewResponseSchema = z.object({
  id: z.number(),
  sequence: z.number(),
  rapidViewId: z.number(),
  name: z.string(),
  state: z.string(),
  goal: z.string(),
  autoStartStop: z.boolean(),
  synced: z.boolean(),
});
export type LastSprintForRapidViewResponse = z.infer<
  typeof JiraGetLastSprintForRapidViewResponseSchema
>;

/* ----- */

export const AllIssuesEstimateSumClassSchema = z.object({
  value: z.number(),
  text: z.string(),
});

export type AllIssuesEstimateSumClass = z.infer<
  typeof AllIssuesEstimateSumClassSchema
>;

// Assuming StatFieldID and StatFieldValue are string types
const StatFieldIDSchema = z.string();
const StatFieldValueSchema = z.string();

export const EstimateStatisticSchema = z.object({
  statFieldId: StatFieldIDSchema,
  statFieldValue: StatFieldValueSchema,
});

export type EstimateStatistic = z.infer<typeof EstimateStatisticSchema>;

export type StatFieldID = "customfield_10021";

export interface StatFieldValue {
  value?: number;
}

export const EpicFieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  editable: z.boolean(),
  renderer: z.string(),
  epicKey: z.string(),
  epicColor: z.string(),
  text: z.string(),
});
export const EpicSchema = z.object({
  epicField: EpicFieldSchema,
});

export type Epic = z.infer<typeof EpicSchema>;

export type EpicField = z.infer<typeof EpicFieldSchema>;

export const PrioritySchema = z.object({
  priorityName: z.string(),
  priorityUrl: z.string(),
});

export type Priority = z.infer<typeof PrioritySchema>;

export const StatusCategorySchema = z.object({
  id: z.string(),
  key: z.string(),
  colorName: z.string(),
});

export const StatusStatusSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  iconUrl: z.string(),
  statusCategory: StatusCategorySchema,
});

export const StatusValueSchema = z.object({
  statusUrl: z.string(),
  statusName: z.string(),
  status: StatusStatusSchema,
});

export type StatusValue = z.infer<typeof StatusValueSchema>;

export type StatusStatus = z.infer<typeof StatusStatusSchema>;

export type StatusCategory = z.infer<typeof StatusCategorySchema>;

export const TypeSchema = z.object({
  typeUrl: z.string(),
  typeName: z.string(),
});

export type Type = z.infer<typeof TypeSchema>;
export const IssuesCompletedInAnotherSprintEstimateSumClassSchema = z.object({
  text: z.string(),
});

export type IssuesCompletedInAnotherSprintEstimateSumClass = z.infer<
  typeof IssuesCompletedInAnotherSprintEstimateSumClassSchema
>;
export const SprintSchema = z.object({
  id: z.number(),
  sequence: z.number(),
  rapidViewId: z.number(),
  name: z.string(),
  state: z.string(),
  goal: z.string(),
  autoStartStop: z.boolean(),
  synced: z.boolean(),
  startDate: z.string(),
  endDate: z.string(),
  activatedDate: z.string(),
  completeDate: z.string(),
  canUpdateSprint: z.boolean(),
  canStartStopSprint: z.boolean(),
  canUpdateDates: z.boolean(),
  remoteLinks: z.array(z.any()),
  daysRemaining: z.number(),
});

export type Sprint = z.infer<typeof SprintSchema>;
export const EntityDataSchema = z.object({
  statuses: z.record(z.string(), StatusValueSchema),
  priorities: z.record(z.string(), PrioritySchema),
  types: z.record(z.string(), TypeSchema),
  epics: z.record(z.string(), EpicSchema),
});

export type EntityData = z.infer<typeof EntityDataSchema>;
export const CompletedIssueSchema = z.object({
  id: z.number(),
  key: z.string(),
  hidden: z.boolean(),
  typeId: z.string(),
  summary: z.string(),
  priorityId: z.string(),
  done: z.boolean(),
  assignee: z.string().optional(),
  assigneeName: z.string().optional(),
  avatarUrl: z.string().optional(),
  hasCustomUserAvatar: z.boolean(),
  epicId: z.string().optional(),
  epic: z.string().optional(),
  currentEstimateStatistic: EstimateStatisticSchema,
  estimateStatisticRequired: z.boolean(),
  estimateStatistic: EstimateStatisticSchema,
  statusId: z.string(),
  fixVersions: z.array(z.number()),
  projectId: z.number(),
  flagged: z.boolean().optional(),
});

export type CompletedIssue = z.infer<typeof CompletedIssueSchema>;
export const ContentsSchema = z.object({
  completedIssues: z.array(CompletedIssueSchema),
  issuesNotCompletedInCurrentSprint: z.array(CompletedIssueSchema),
  puntedIssues: z.array(z.any()),
  issuesCompletedInAnotherSprint: z.array(z.any()),
  entityData: EntityDataSchema,
  completedIssuesInitialEstimateSum: AllIssuesEstimateSumClassSchema,
  completedIssuesEstimateSum: AllIssuesEstimateSumClassSchema,
  issuesNotCompletedInitialEstimateSum: AllIssuesEstimateSumClassSchema,
  issuesNotCompletedEstimateSum: AllIssuesEstimateSumClassSchema,
  allIssuesEstimateSum: AllIssuesEstimateSumClassSchema,
  puntedIssuesInitialEstimateSum:
    IssuesCompletedInAnotherSprintEstimateSumClassSchema,
  puntedIssuesEstimateSum: IssuesCompletedInAnotherSprintEstimateSumClassSchema,
  issuesCompletedInAnotherSprintInitialEstimateSum:
    IssuesCompletedInAnotherSprintEstimateSumClassSchema,
  issuesCompletedInAnotherSprintEstimateSum:
    IssuesCompletedInAnotherSprintEstimateSumClassSchema,
  issueKeysAddedDuringSprint: z.record(z.string(), z.boolean()),
});

export type Contents = z.infer<typeof ContentsSchema>;
export const JiraSprintIssuesResponseSchema = z.object({
  contents: ContentsSchema,
  sprint: SprintSchema,
  lastUserToClose: z.string(),
  userWhoStarted: z.string(),
  supportsPages: z.boolean(),
});

export type JiraSprintIssuesResponse = z.infer<
  typeof JiraSprintIssuesResponseSchema
>;
/*  ---------------------------  */
export const DayRecordSchema = z.object({
  day: z.string(),
  decimal: z.string(),
  jiraFormat: z.string(),
});

export type DayRecord = z.infer<typeof DayRecordSchema>;


export const { schemas: jiraSchemas, $ref } = buildJsonSchemas(
  {
    JiraSprintIssuesRequestSchema,
    JiraSprintRequestSchema,
    JIraTaskIdSchema,
    JiraLoopDaysSchemaRequest,
    JiraTaskSchemaRequest,
    JiraQueryDatesSchemaRequest,
    JiraWorklogPreConfiguredSchemaRequest,
    JiraLastSprintForRapidViewRequestSchema,
    JiraGetLastSprintForRapidViewResponseSchema,
    AllIssuesEstimateSumClassSchema,
    CompletedIssueSchema,
    ContentsSchema,
    EntityDataSchema,
    EpicFieldSchema,
    EpicSchema,
    EstimateStatisticSchema,
    JiraSprintIssuesResponseSchema,
    PrioritySchema,
    SprintSchema,
    StatusCategorySchema,
    StatusStatusSchema,
    StatusValueSchema,
    TypeSchema,
  },
  { $id: "jiraSchema" }
);
