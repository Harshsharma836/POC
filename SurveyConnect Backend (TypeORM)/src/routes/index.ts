import { Router } from "express";
import userRoute from "./user.route";
import surveyRoute from "./survey.routes";

export const routes = Router();

routes.use("/user", userRoute);
routes.use("/survey", surveyRoute);
