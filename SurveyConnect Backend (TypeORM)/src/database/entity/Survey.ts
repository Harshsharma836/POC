import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BaseEntity,
} from "typeorm";
import { SurveyQuestion } from "./SurveyQuestion";
import { SurveyResult } from "./SurveyResult";

@Entity()
export class Survey extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  userId: number;

  @OneToMany(() => SurveyQuestion, (question) => question.survey)
  questions: SurveyQuestion[];

  @OneToMany(() => SurveyResult, (result) => result.survey)
  results: SurveyResult[];
}
