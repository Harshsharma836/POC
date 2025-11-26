import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './User';
import { GameMode } from './GameSession';

@Entity('leaderboard')
@Index('idx_leaderboard_game_score', ['gameMode', 'totalScore'])
@Index('idx_leaderboard_user_game', ['userId', 'gameMode'])
@Unique(['userId', 'gameMode'])
export class Leaderboard {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id', type: 'int' })
  userId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'total_score', type: 'int' })
  totalScore!: number;

  @Column({ name: 'game_mode', type: 'varchar', length: 50 })
  gameMode!: GameMode;

  @Column({ type: 'int', nullable: true })
  rank!: number | null;
}

