import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { $ref } from "../../service/user/userSchema";
import { createUser, loginUser } from "../../service/user/userService";

export const userRoutes = async (server: FastifyInstance) => {
  server.get("/", (_req: FastifyRequest, reply: FastifyReply) => {
    reply.send({ message: "/ route hit" });
  });
  server.post(
    "/register",
    {
      schema: {
        body: $ref("createUserSchema"),
        response: {
          201: $ref("createUserResponseSchema"),
        },
      },
    },
   createUser
  );
  server.post(
    "/login",
    {
      schema: {
        body: $ref("loginSchema"),
        response: {
          201: $ref("loginResponseSchema"),
        },
      },
    },
    loginUser
  );
  server.delete("/logout", () => {});
  server.log.info("user routes registered");
};
