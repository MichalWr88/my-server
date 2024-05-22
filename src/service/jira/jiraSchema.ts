import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

// f.zod.get(
//     `/item/:id`,
//     {
//       operationId: `getTodoItem`,
//       params: `TodoItemId`,
//       response: {
//         200: `TodoItem`,
//         404: `TodoItemNotFoundError`,
//       },
//     },
 const JIraTaskIdSchema = z.object({
  id: z.string(),
});
export type JIraTaskIdSchemaParams = z.infer<typeof JIraTaskIdSchema>
export const { schemas: jiraSchemas, $ref } = buildJsonSchemas({
  JIraTaskIdSchema,
});
