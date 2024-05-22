import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { TokenHistory } from "./entity/TokenHistory";
import { MysqlConnectionOptions } from "typeorm/driver/mysql/MysqlConnectionOptions";

if (
  !process.env.DB_TYPE ||
  !process.env.DB_HOST ||
  !process.env.DB_PORT ||
  !process.env.DB_USERNAME ||
  !process.env.DB_PASSWORD ||
  !process.env.DB_DATABASE
) {
  throw new Error(
    "Please provide all the necessary environment variables for the database connection"
  );
}
const typeDb = process.env.DB_TYPE as MysqlConnectionOptions["type"];
export const AppDataSource = new DataSource({
  type: typeDb,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: true,
  logging: false,
  entities: [User, TokenHistory],
  migrationsTableName: "migrations_my",
  migrations: [],
  subscribers: [],
});

AppDataSource.initialize()
  .then(() => {
    console.info("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
  });
