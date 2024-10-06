import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
} from "typeorm";
import { Survey } from "./Survey";
import { User } from "./User";

@Entity()
export class SurveyResult extends BaseEntity {
  @PrimaryGeneratedColumn()
  result_id: number;

  @Column()
  user_id: number;

  @Column()
  survey_id: number;

  @Column()
  question_id: number;

  @Column()
  answer: string;

  @ManyToOne(() => Survey, (survey) => survey.results)
  survey: Survey;

  @ManyToOne(() => User, (user) => user.surveyResults)
  user: User;
}
