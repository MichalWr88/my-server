import { FastifyInstance } from "fastify";

import { jiraRoutes } from "./jiraRoutes";
import { mainRoutes } from "./mainRoutes";
import { userRoutes } from "./userRoutes";
import { mikrusRoutes } from "./mikrusRoutes";

export const setRouting = (server: FastifyInstance) => {
  server.register(mainRoutes);
  server.register(jiraRoutes, { prefix: "api/jira" });
  server.register(userRoutes, { prefix: "api/user" });
  server.register(mikrusRoutes, { prefix: "api/mikrus" });
};
