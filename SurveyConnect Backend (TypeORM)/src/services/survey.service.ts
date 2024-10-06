import { Service } from "typedi";
import { Survey } from "../database/entity/Survey";
import { SurveyQuestion } from "../database/entity/SurveyQuestion";
import { SurveyResult } from "../database/entity/SurveyResult";
import { User } from "../database/entity/User";

@Service()
export class SurveyService {
  async createSurvey(
    title: string,
    description: string,
    questions: string[],
    userId: number,
  ): Promise<void> {
    const survey = new Survey();
    survey.title = title;
    survey.description = description;
    survey.userId = userId;

    await survey.save();

    for (const questionText of questions) {
      const question = new SurveyQuestion();
      question.question_text = questionText;
      question.survey = survey;

      await question.save();
    }
  }

  async getAllSurveys(): Promise<Survey[]> {
    try {
      const surveys = await Survey.createQueryBuilder("survey")
        .leftJoinAndSelect("survey.questions", "question")
        .getMany();

      return surveys;
    } catch (error: any) {
      throw new Error("Error fetching surveys: " + error.message);
    }
  }

  async getSurveyResultsForUser(user_id: number): Promise<SurveyResult[]> {
    const surveyResultsWithQuestions = await SurveyResult.createQueryBuilder(
      "result",
    )
      .innerJoinAndSelect(
        SurveyQuestion,
        "question",
        "question.question_id = result.question_id",
      )
      .addSelect("question.question_text")
      .where("result.user_id = :user_id", { user_id })
      .getMany();

    const data: any = await Promise.all(
      surveyResultsWithQuestions.map(async (val) => {
        const questions = await SurveyQuestion.findOne({
          where: { question_id: val.question_id },
        });

        const result = {
          userId: user_id,
          question: questions?.question_text,
          surveyId: val.survey_id,
          ans: val.answer,
        };
        return result;
      }),
    );
    return data;
  }

  async takeSurvey(
    surveyId: number,
    answers: string[],
    userId: number,
  ): Promise<void> {
    const survey = await Survey.findOne({ where: { id: surveyId } });
    if (!survey) {
      throw new Error("Survey not found.");
    }

    const questions = await SurveyQuestion.find({ where: { survey } });
    if (questions.length !== answers.length) {
      throw new Error(
        "Number of answers does not match number of questions in the survey.",
      );
    }

    const user = await User.findOne({ where: { user_id: userId } });

    if (!user) {
      throw new Error("User not found.");
    }

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const answer = answers[i];

      if (answer !== "yes" && answer !== "no") {
        throw new Error("Answer must be 'yes' or 'no'.");
      }

      const surveyResult = new SurveyResult();
      surveyResult.user_id = userId;
      surveyResult.survey_id = surveyId;
      surveyResult.question_id = question.question_id;
      surveyResult.answer = answer;
      surveyResult.survey = survey;
      surveyResult.user = user;
      await surveyResult.save();
    }
  }
}
