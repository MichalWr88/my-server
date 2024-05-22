import { z } from 'zod'
import { buildJsonSchemas } from 'fastify-zod'

// data that we need from user to register
const createUserSchema = z.object({
    email: z.string(),
    password: z.string().min(6),
    name: z.string(),
    type: z.enum(['local', 'prod']),
  })
  //exporting the type to provide to the request Body
  export type CreateUserInput = z.infer<typeof createUserSchema>
  // response schema for registering user
  const createUserResponseSchema = z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
    type: z.enum(['local', 'prod']),
  })
  
  // same for login route
  const loginSchema = z.object({
    email: z
      .string({
        required_error: 'Email is required',
        invalid_type_error: 'Email must be a string',

      })
      .email(),
    password: z.string().min(6),
    type: z.enum(['local', 'prod']),
  })
  export type LoginUserInput = z.infer<typeof loginSchema>
  const loginResponseSchema = z.object({
    accessToken: z.string(),
  })

  export const { schemas: userSchemas, $ref } = buildJsonSchemas({
    createUserSchema,
    createUserResponseSchema,
    loginSchema,
    loginResponseSchema,
  })