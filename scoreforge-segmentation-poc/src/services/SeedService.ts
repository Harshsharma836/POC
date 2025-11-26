import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { GameSession } from '../entities/GameSession';
import { Leaderboard } from '../entities/Leaderboard';
import { GameMode } from '../entities/GameSession';

export class SeedService {
  async seedDatabase(): Promise<void> {
    try {
      if (process.env.SEED_DATABASE === 'false') {
        console.log('📊 Database seeding disabled (SEED_DATABASE=false)');
        return;
      }

      const userCount = await AppDataSource.getRepository(User).count();
      
      if (userCount > 0) {
        if (process.env.SEED_DATABASE === 'true') {
          console.log('🔄 Force re-seeding enabled, clearing existing data...');
          await AppDataSource.getRepository(Leaderboard).delete({});
          await AppDataSource.getRepository(GameSession).delete({});
          await AppDataSource.getRepository(User).delete({});
          console.log('✅ Existing data cleared');
        } else {
          console.log('📊 Database already has data, skipping seed');
          console.log('💡 To force re-seed, set SEED_DATABASE=true in .env');
          return;
        }
      }

      console.log('🌱 Seeding database with initial data...');

      const userRepo = AppDataSource.getRepository(User);
      const gameSessionRepo = AppDataSource.getRepository(GameSession);
      const leaderboardRepo = AppDataSource.getRepository(Leaderboard);

      const users: User[] = [];
      const numUsers = 100; 

      for (let i = 1; i <= numUsers; i++) {
        const user = userRepo.create({
          username: `user_${i}`,
        });
        users.push(user);
      }

      const savedUsers = await userRepo.save(users);
      console.log(`✅ Created ${savedUsers.length} users`);

      const gameSessions: GameSession[] = [];
      const gameModes: GameMode[] = ['story', 'multiplayer'];

      for (const user of savedUsers) {
        const numSessions = Math.floor(Math.random() * 6) + 5;
        
        for (let i = 0; i < numSessions; i++) {
          const gameMode = gameModes[Math.floor(Math.random() * gameModes.length)];
          const score = Math.floor(Math.random() * 10000) + 100; 
          
          const gameSession = gameSessionRepo.create({
            userId: user.id,
            score: score,
            gameMode: gameMode,
            timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          });
          gameSessions.push(gameSession);
        }
      }

      const savedSessions = await gameSessionRepo.save(gameSessions);
      console.log(`✅ Created ${savedSessions.length} game sessions`);

      const leaderboardMap = new Map<string, { userId: number; totalScore: number; gameMode: GameMode }>();

      for (const session of savedSessions) {
        const key = `${session.userId}_${session.gameMode}`;
        const existing = leaderboardMap.get(key);
        
        if (existing) {
          existing.totalScore += session.score;
        } else {
          leaderboardMap.set(key, {
            userId: session.userId,
            totalScore: session.score,
            gameMode: session.gameMode,
          });
        }
      }

      const leaderboardEntries: Leaderboard[] = [];
      for (const [key, data] of leaderboardMap) {
        const leaderboard = leaderboardRepo.create({
          userId: data.userId,
          totalScore: data.totalScore,
          gameMode: data.gameMode,
          rank: null,
        });
        leaderboardEntries.push(leaderboard);
      }

      const savedLeaderboard = await leaderboardRepo.save(leaderboardEntries);
      console.log(`✅ Created ${savedLeaderboard.length} leaderboard entries`);

      await this.calculateRanks('story');
      await this.calculateRanks('multiplayer');

      console.log('✅ Database seeding completed successfully!');
      console.log(`📊 Summary: ${savedUsers.length} users, ${savedSessions.length} sessions, ${savedLeaderboard.length} leaderboard entries`);
    } catch (error) {
      console.error('❌ Error seeding database:', error);
      throw error;
    }
  }

  private async calculateRanks(gameMode: GameMode): Promise<void> {
    const leaderboardRepo = AppDataSource.getRepository(Leaderboard);
    
    const entries = await leaderboardRepo.find({
      where: { gameMode },
      order: { totalScore: 'DESC' },
    });

    for (let i = 0; i < entries.length; i++) {
      entries[i].rank = i + 1;
      await leaderboardRepo.save(entries[i]);
    }
  }
}

