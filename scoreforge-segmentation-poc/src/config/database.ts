import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { GameSession } from '../entities/GameSession';
import { Leaderboard } from '../entities/Leaderboard';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'harsh',
  password: process.env.DB_PASSWORD || '1234@Harsh',
  database: process.env.DB_NAME || 'gamedev',
  entities: [User, GameSession, Leaderboard],
  logging: process.env.NODE_ENV === 'development',
  extra: {
    max: 20,
  },
});
