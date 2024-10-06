// src/entities/User.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
} from "typeorm";
import { SurveyResult } from "./SurveyResult";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  email: string;

  @OneToMany(() => SurveyResult, (surveyResult) => surveyResult.user)
  surveyResults: SurveyResult[];
}
