import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

export type GameMode = 'story' | 'multiplayer';

@Entity('game_sessions')
@Index('idx_game_sessions_user_id', ['userId'])
@Index('idx_game_sessions_game_mode', ['gameMode'])
@Index('idx_game_sessions_timestamp', ['timestamp'])
@Index('idx_game_sessions_user_game', ['userId', 'gameMode'])
@Index('idx_game_sessions_user_game_time', ['userId', 'gameMode', 'timestamp'])
export class GameSession {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id', type: 'int' })
  userId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'int' })
  score!: number;

  @Column({ name: 'game_mode', type: 'varchar', length: 50 })
  gameMode!: GameMode;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp!: Date;
}

