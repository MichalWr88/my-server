import { FastifyInstance } from "fastify";
// import { IQuerystring } from "../../models/fastify";

import { jiraRoutes } from "./jiraRoutes";
import { mainRoutes } from "./mainRoutes";

export const setRouting = (server: FastifyInstance) => {
  server.register(jiraRoutes, { prefix: "api/jira" });
  server.register(mainRoutes);


  // server.get<{
  //   Querystring: IQuerystring;
  // }>("/auth", async (request, reply) => {
  //   console.log(request.query);
  //   const { username, password } = request.query;
  //   // const customerHeader = request.headers["h-Custom"];
  //   if (username !== "admin" || password !== "admin") {
  //     reply.code(404).send({ error: "invalid  " });
  //   }
  //   // do something with request data
  //   // chaining .statusCode/.code calls with .send allows type narrowing. For example:
  //   // this works
  //   reply.code(200).send({ success: true });
  //   // but this gives a type error
  //   /*  reply.code(200).send('uh-oh'); */
  //   // it even works for wildcards
  //   reply.code(404).send({ error: "Not found" });
  //   return `logged in!`;
  // });
};
