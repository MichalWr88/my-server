import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import {
  createUserSchema,
  createUserResponseSchema,
  loginSchema,
  loginResponseSchema,
} from "../../service/user/userSchema";
import { createUser, loginUser } from "../../service/user/userService";

export const userRoutes = async (server: FastifyInstance) => {
  server.get("/", (_req: FastifyRequest, reply: FastifyReply) => {
    reply.send({ message: "/ route hit" });
  });
  server.post(
    "/register",
    {
      schema: {
        body: createUserSchema,
        response: {
          201: createUserResponseSchema,
        },
      },
    },
   createUser
  );
  server.post(
    "/login",
    {
      schema: {
        body: loginSchema,
        response: {
          201: loginResponseSchema,
        },
      },
    },
    loginUser
  );
  server.delete("/logout", () => {});
  server.log.info("user routes registered");
};
