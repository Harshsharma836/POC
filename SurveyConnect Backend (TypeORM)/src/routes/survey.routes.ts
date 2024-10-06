// src/routes/surveyRoute.ts
import express from "express";
import SurveyController from "../controllers/survey.controller";
import { verifyJwtToken } from "../middleware/jwtMiddleware";

const surveyRoute = express.Router();

surveyRoute.post("/create", verifyJwtToken, SurveyController.createSurvey);
surveyRoute.get("/all", verifyJwtToken, SurveyController.getAllSurveys);
surveyRoute.post("/take", verifyJwtToken, SurveyController.takeSurvey);
surveyRoute.get("/results", verifyJwtToken, SurveyController.getSurveyResults);

export default surveyRoute;
