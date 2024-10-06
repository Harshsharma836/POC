import express, { Application } from "express";
import { routes } from "./routes";
import { AppDataSource } from "./database/orm.config";
import * as dotenv from "dotenv";
import "reflect-metadata"; // For Dependency Injection
import cors from "cors";
import swaggerUIExpress from "swagger-ui-express";
import yaml from "yaml";
import path from "path"
import fs from 'fs'

const swaggerFilePath = path.resolve('swagger.yaml');
const swaggerDocument = yaml.parse(fs.readFileSync(swaggerFilePath, 'utf8'));

dotenv.config();

class App {
  private app: Application;

  constructor() {
    this.app = express();
    this.config();
    this.routes();
  }

  private config(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(cors());
    AppDataSource;
  }

  private routes(): void {
    this.app.use("/", routes);
    this.app.use(
      "/api-docs",
      swaggerUIExpress.serve,
      swaggerUIExpress.setup(swaggerDocument),
    );
  }

  public getApp(): Application {
    return this.app;
  }
}

const PORT = process.env.PORT || 3001;

const appInstance = new App();
const app = appInstance.getApp();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
