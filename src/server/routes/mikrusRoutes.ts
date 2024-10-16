import { FastifyInstance,} from "fastify";
import { getMikrusStats } from "../../service/mikrus/mikrusController";


export const mikrusRoutes = async (server: FastifyInstance) => {
  server.get(
    "/stats",{
      preHandler: [server.authenticate],
    },
    getMikrusStats
  );

  // Routes
  // server.get("/info", async (request: FastifyRequest, reply: FastifyReply) => {
  //   return mikrusRequest("/info");
  // });

  // server.get(
  //   "/serwery",
  //   async (request: FastifyRequest, reply: FastifyReply) => {
  //     return mikrusRequest("/serwery");
  //   }
  // );

  // server.get(
  //   "/restart",
  //   async (request: FastifyRequest, reply: FastifyReply) => {
  //     return mikrusRequest("/restart");
  //   }
  // );

  // server.post("/logs", async (request: FastifyRequest, reply: FastifyReply) => {
  //   return mikrusRequest("/logs");
  // });

  // server.post<{ Params: { id: string } }>(
  //   "/logs/:id",
  //   async (request, reply) => {
  //     const { id } = request.params;
  //     return mikrusRequest(`/logs/${id}`);
  //   }
  // );

  // server.post(
  //   "/amfetamina",
  //   async (request: FastifyRequest, reply: FastifyReply) => {
  //     return mikrusRequest("/amfetamina");
  //   }
  // );

  // server.post("/db", async (request: FastifyRequest, reply: FastifyReply) => {
  //   return mikrusRequest("/db");
  // });

  // server.post("/exec", async (request: FastifyRequest, reply: FastifyReply) => {
  //   const { cmd } = request.body as { cmd: string };
  //   if (!cmd) {
  //     reply.code(400).send({ error: "Missing required parameter: cmd" });
  //     return;
  //   }
  //   return mikrusRequest("/exec", { cmd });
  // });



  // server.get(
  //   "/porty",
  //   async (request: FastifyRequest, reply: FastifyReply) => {
  //     return mikrusRequest("/porty");
  //   }
  // );

  // server.get(
  //   "/cloud",
  //   async (request: FastifyRequest, reply: FastifyReply) => {
  //     return mikrusRequest("/cloud");
  //   }
  // );

  // server.post(
  //   "/domain",
  //   async (request: FastifyRequest, reply: FastifyReply) => {
  //     const { port, domena } = request.body as DomainRequestBody;
  //     if (!port || !domena) {
  //       reply
  //         .code(400)
  //         .send({ error: "Missing required parameters: port and domena" });
  //       return;
  //     }
  //     return mikrusRequest("/domain", { port, domena });
  //   }
  // );
  server.log.info("mikrus routes registered");
};
