import { Request, Response } from "express";
import { Container } from "typedi";
import { SurveyService } from "../services/surveyService";
import { UserRequest } from "../helper/UserRequestInterfaces";

class SurveyController {
  static async createSurvey(req: UserRequest, res: Response): Promise<void> {
    try {
      const { title, description, questions } = req.body;
      const userId: number = req.body.user; // as we have save this in jwt verify

      const surveyServiceInstance: SurveyService = Container.get(SurveyService);
      const survey = await surveyServiceInstance.createSurvey(
        title,
        description,
        questions,
        userId,
      );

      res.json({ survey });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getAllSurveys(req: Request, res: Response): Promise<void> {
    try {
      const surveyServiceInstance: SurveyService = Container.get(SurveyService);
      const surveys = await surveyServiceInstance.getAllSurveys();

      res.json({ surveys });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getSurveyResults(
    req: UserRequest,
    res: Response,
  ): Promise<void> {
    try {
      const userId: number = req.body.user;
      if (!userId) {
        throw new Error("User ID not found in request.");
      }
      const surveyServiceInstance: SurveyService = Container.get(SurveyService);
      const surveyResults =
        await surveyServiceInstance.getSurveyResultsForUser(userId);

      res.json({ surveyResults });
    } catch (error: any) {
      console.log(error);
      res.status(400).json({ message: error.message });
    }
  }

  static async takeSurvey(req: UserRequest, res: Response): Promise<void> {
    try {
      const { surveyId, answers } = req.body;
      const userId: number = req.body.user;
      const surveyServiceInstance: SurveyService = Container.get(SurveyService);
      await surveyServiceInstance.takeSurvey(surveyId, answers, userId);

      res.json({ message: "Survey taken successfully." });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default SurveyController;
