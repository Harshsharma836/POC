import "reflect-metadata";
import { config } from "dotenv";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Survey } from "./entity/Survey";
import { SurveyQuestion } from "./entity/SurveyQuestion";
import { SurveyResult } from "./entity/SurveyResult";
config();
export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.HOST,
  port: 3306,
  username: 'admin',
  password: process.env.PASSWORD,
  database: "Survey",
  synchronize: true,
  logging: false,
  entities: [User, Survey, SurveyQuestion, SurveyResult],
  migrations: ["src/database/migrations/*.ts"],
});

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
  });
