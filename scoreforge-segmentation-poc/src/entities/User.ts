import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { GameSession } from './GameSession';
import { Leaderboard } from './Leaderboard';

@Entity('users')
@Index(['username'], { unique: true })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  username!: string;

  @CreateDateColumn({ name: 'join_date', type: 'timestamp' })
  joinDate!: Date;

  @OneToMany(() => GameSession, (gameSession) => gameSession.user)
  gameSessions!: GameSession[];

  @OneToMany(() => Leaderboard, (leaderboard) => leaderboard.user)
  leaderboardEntries!: Leaderboard[];
}

