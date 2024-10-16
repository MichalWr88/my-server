import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";
//
const memoryData = z.object({
    free: z.object({
        memory: z.object({
            total: z.number(),
            used: z.number(),
            free: z.number(),
            shared: z.number(),
            'buff/cache': z.number(),
            available: z.number(),
        }),
        swap: z.object({
            total: z.number(),
            used: z.number(),
            free: z.number(),
        }),
    }),
});
const mikrusStatusResponse = z.object({
    free: z.string(),
    uptime: z.string(),
    ps: z.string(),

});
export type MikrusStatusResponse = z.infer<typeof mikrusStatusResponse>;
export type MikrusMemoryData = z.infer<typeof memoryData>;

export const { schemas: jiraSchemas, $ref } = buildJsonSchemas(
  {
    mikrusStatusResponse,memoryData
  },
  { $id: "mikrusSchema" }
);
