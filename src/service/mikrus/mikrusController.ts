import { FastifyReply, FastifyRequest } from "fastify";
import { MikrusStatusResponse } from "./mikrusSchemas";
import { MikrusService } from "./mikrusService";

const mikrusInstance = new MikrusService();
export const getMikrusStats = async (
  req: FastifyRequest,
  reply: FastifyReply
): Promise<MikrusStatusResponse | undefined> => {
  try {
    const response = await mikrusInstance.getStatus();

    console.log(response);
    return reply.code(200).send(response);
  } catch (e) {
    return reply.code(500).send(e);
  }
};

