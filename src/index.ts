import fastify from "fastify";
import { IQuerystring } from "./models/fastify";

const server = fastify();

server.get("/ping", async (request, reply) => {
  return "pong\n";
});
server.get("/", function (request, reply) {
  reply.send({ hello: "world" });
});

server.get<{
  Querystring: IQuerystring;
}>("/auth", async (request, reply) => {
  console.log(request.query);
  const { username, password } = request.query;
  const customerHeader = request.headers["h-Custom"];
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
