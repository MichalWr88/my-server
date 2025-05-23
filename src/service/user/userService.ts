import { FastifyReply, FastifyRequest } from "fastify";
import { CreateUserInput, LoginUserInput } from "./userSchema";
import { hash, compare } from "bcrypt";
import { User } from "../../entity/User";
import { AppDataSource } from "../../data-source";
import { TokenHistory } from "../../entity/TokenHistory";

if (!process.env.SALT_ROUNDS) {
  throw new Error("SALT_ROUNDS is not defined");
}
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS);
export async function createUser(
  req: FastifyRequest<{
    Body: CreateUserInput;
  }>,
  reply: FastifyReply
) {
  const { password, email, name, type } = req.body;

  const userInDB = await AppDataSource.manager.findOneBy(User, { email, type });

  if (userInDB) {
    return reply.code(401).send({
      message: "User already exists with this email",
    });
  }
  try {
    const passHash = await hash(password, SALT_ROUNDS);
    const user = new User();
    user.email = email;
    user.name = name;
    user.password = passHash;
    const savedUser = await AppDataSource.manager.save(user);

    return reply.code(201).send(savedUser);
  } catch (e) {
    return reply.code(500).send(e);
  }
}

export async function loginUser(
  req: FastifyRequest<{
    Body: LoginUserInput;
  }>,
  reply: FastifyReply
) {
  const { email, password, type } = req.body;
  const userInDB = await AppDataSource.manager.findOneBy(User, { email, type });

  const isMatch = userInDB && (await compare(password, userInDB.password));
  if (!userInDB || !isMatch) {
    return reply.code(401).send({
      message: "Invalid email or password",
    });
  }
  const payload = {
    id: userInDB.id,
    email: userInDB.email,
    name: userInDB.name,
    type: userInDB.type,
  };
  const token = req.jwt.sign(payload);

  console.log(req.jwt);
  const tokenHistory = new TokenHistory();
  tokenHistory.email = userInDB.email;
  tokenHistory.type = userInDB.type;
  await AppDataSource.manager.save(tokenHistory);
  return { accessToken: token };
}
