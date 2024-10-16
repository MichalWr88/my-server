import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

const MIKRUS_API_URL = process.env.MIKRUS_HOST;
const MIKRUS_SRV = process.env.MIKRUS_SRV;
const MIKRUS_KEY = process.env.MIKRUS_KEY;

if (!MIKRUS_API_URL || !MIKRUS_SRV || !MIKRUS_KEY) {
  throw new Error(
    "Please provide all the necessary environment variables for the Mikrus API connection"
  );
}

interface MikrusRequestBody {
  [key: string]: any;
}

interface DomainRequestBody extends MikrusRequestBody {
  port: string;
  domena: string;
}

async function mikrusRequest(
  endpoint: string,
  data: MikrusRequestBody = {}
): Promise<any> {
    try {
      if (!MIKRUS_API_URL || !MIKRUS_SRV || !MIKRUS_KEY) {
        throw new Error(
          "Please provide all the necessary environment variables for the Mikrus API connection"
        );
      }
    const formData = new URLSearchParams({
      srv: MIKRUS_SRV,
      key: MIKRUS_KEY,
      ...data,
    });

    const response = await fetch(`${MIKRUS_API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`MIKR.US API Error: ${error.message}`);
    }
    throw error;
  }
}

export const mikrusRoutes = async (server: FastifyInstance) => {
  //   server.addHook(
  //     "preHandler",
  //     (request: FastifyRequest, reply: FastifyReply, done) => {
  //       const { srv, key } = request.body as MikrusRequestBody;
  //       if (!srv || !key) {
  //         reply
  //           .code(400)
  //           .send({ error: "Missing required parameters: srv and key" });
  //       } else {
  //         done();
  //       }
  //     }
  //   );

  // Define allowed routes
//   const allowedRoutes: string[] = [
//     "/info",
//     "/serwery",
//     "/restart",
//     "/logs",
//     "/amfetamina",
//     "/db",
//     "/exec",
//     "/stats",
//     "/porty",
//     "/cloud",
//     "/domain",
//   ];

  //   Middleware to check if the route is allowed
  //   server.addHook('onRequest', (request: FastifyRequest, reply: FastifyReply, done) => {
  //     const path = request.routerPath || request.raw.url!.split('?')[0];
  //     console.log(path);
  //     if (!allowedRoutes.includes(path) && !path.startsWith('/logs/')) {
  //       reply.code(404).send({ error: 'Route not found for mikrus' });
  //     } else {
  //       done();
  //     }
  //   });

  // Routes
  server.get("/info", async (request: FastifyRequest, reply: FastifyReply) => {
    return mikrusRequest("/info");
  });

  server.get(
    "/serwery",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return mikrusRequest("/serwery");
    }
  );

  server.get(
    "/restart",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return mikrusRequest("/restart");
    }
  );

  server.post("/logs", async (request: FastifyRequest, reply: FastifyReply) => {
    return mikrusRequest("/logs");
  });

  server.post<{ Params: { id: string } }>(
    "/logs/:id",
    async (request, reply) => {
      const { id } = request.params;
      return mikrusRequest(`/logs/${id}`);
    }
  );

  server.post(
    "/amfetamina",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return mikrusRequest("/amfetamina");
    }
  );

  server.post("/db", async (request: FastifyRequest, reply: FastifyReply) => {
    return mikrusRequest("/db");
  });

  server.post("/exec", async (request: FastifyRequest, reply: FastifyReply) => {
    const { cmd } = request.body as { cmd: string };
    if (!cmd) {
      reply.code(400).send({ error: "Missing required parameter: cmd" });
      return;
    }
    return mikrusRequest("/exec", { cmd });
  });

  server.get(
    "/stats",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return mikrusRequest("/stats");
    }
  );

  server.get(
    "/porty",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return mikrusRequest("/porty");
    }
  );

  server.get(
    "/cloud",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return mikrusRequest("/cloud");
    }
  );

  server.post(
    "/domain",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { port, domena } = request.body as DomainRequestBody;
      if (!port || !domena) {
        reply
          .code(400)
          .send({ error: "Missing required parameters: port and domena" });
        return;
      }
      return mikrusRequest("/domain", { port, domena });
    }
  );
  server.log.info("mikrus routes registered");
};
