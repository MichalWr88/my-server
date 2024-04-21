import fastify from "fastify";
import fjwt, { FastifyJWT } from "@fastify/jwt";
import { setRouting } from "./routes/routing";
import fastifyStatic  from "@fastify/static"

export const startFastifyServer = async () => {
  const server = fastify();

  const listeners = ["SIGINT", "SIGTERM"];
  listeners.forEach((signal) => {
    process.on(signal, async () => {
      await server.close();
      process.exit(0);
    });
  });

  server.register(fjwt, { secret: "supersecretcode-CHANGE_THIS-USE_ENV_FILE" });
  server.register(fastifyStatic,{
    root: `${__dirname}/public`
  
  });
  server.addHook("preHandler", (req, res, next) => {
    // here we are
    req.jwt = server.jwt;
    return next();
  });

  setRouting(server);

  server.listen({ port: 8080, host: "0.0.0.0" }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Server listening at ${address}`);
  });
};
