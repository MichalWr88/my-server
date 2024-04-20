import fastify from "fastify";
import { IQuerystring } from "./models/fastify";
import "dotenv/config";
import cluster from "node:cluster";
import packageFile from "../package.json";
const numClusterWorkers = parseInt(process.argv[2] || "1");

if (cluster.isPrimary) {
  for (let i = 0; i < numClusterWorkers; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) =>
    console.log(`worker ${worker.process.pid} died`)
  );
} else {
  const server = fastify();

  server.get("/ping", async (request, reply) => {
    return "pong\n";
  });
  server.get("/", function (request, reply) {
    reply.send({
      hello: "22",
      host: process.env.JIRA_HOST,
      v: packageFile.version,
    });
  });

  server.get<{
    Querystring: IQuerystring;
  }>("/auth", async (request, reply) => {
    console.log(request.query);
    const { username, password } = request.query;
    // const customerHeader = request.headers["h-Custom"];
    if (username !== "admin" || password !== "admin") {
      reply.code(404).send({ error: "invalid  " });
    }
    // do something with request data
    // chaining .statusCode/.code calls with .send allows type narrowing. For example:
    // this works
    reply.code(200).send({ success: true });
    // but this gives a type error
    /*  reply.code(200).send('uh-oh'); */
    // it even works for wildcards
    reply.code(404).send({ error: "Not found" });
    return `logged in!`;
  });

  server.listen({ port: 8080, host: "0.0.0.0" }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Server listening at ${address}`);
  });
}
