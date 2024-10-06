import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
} from "typeorm";
import { Survey } from "./Survey";

enum ResponseType {
  YES = "yes",
  NO = "no",
}

@Entity()
export class SurveyQuestion extends BaseEntity {
  @PrimaryGeneratedColumn()
  question_id: number;

  @Column()
  question_text: string;

  @Column({
    type: "enum",
    enum: ResponseType,
    default: ResponseType.NO,
  })
  answer: ResponseType;

  @ManyToOne(() => Survey, (survey) => survey.questions)
  survey: Survey;
}
