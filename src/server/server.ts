import fastify, { FastifyReply, FastifyRequest } from "fastify";
import fjwt from "@fastify/jwt";
import { setRouting } from "./routes/routing";
import fastifyStatic from "@fastify/static";
import { userSchemas } from "../service/user/userSchema";
import "reflect-metadata";

export const startFastifyServer = async () => {
  const server = fastify();

  const listeners = ["SIGINT", "SIGTERM"];
  listeners.forEach((signal) => {
    process.on(signal, async () => {
      await server.close();
      process.exit(0);
    });
  });
  if (process.env.JWT_SECRET === undefined) {
    throw new Error("JWT_SECRET is not defined");
  }
  server.register(fjwt, {
    secret: process.env.JWT_SECRET,
    sign: {
      expiresIn: "1h",
    },
  });
  server.register(fastifyStatic, {
    root: `${__dirname}/public`,
  });

  server.decorate(
    "authenticate",
    async function (req: FastifyRequest, reply: FastifyReply) {
      try {
        await req.jwtVerify();
      } catch (err) {
        reply.send(err);
      }
    }
  );

  server.addHook("preHandler", (req, res, next) => {
    // here we are
    req.jwt = server.jwt;
    return next();
  });

  setRouting(server);

  for (let schema of [...userSchemas]) {
    server.addSchema(schema);
  }

  server.listen({ port: 8080, host: "0.0.0.0" }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Server listening at ${address}`);
  });
};
