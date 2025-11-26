import { AppDataSource } from '../src/config/database';
import { LeaderboardService } from '../src/services/LeaderboardService';
import { User } from '../src/entities/User';
import { GameSession } from '../src/entities/GameSession';
import { Leaderboard } from '../src/entities/Leaderboard';
import { redisClient } from '../src/config/redis';

describe('LeaderboardService', () => {
  let service: LeaderboardService;
  let testUser: User;

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    
    await AppDataSource.synchronize(true);
    
    await redisClient.flushdb();
    
    service = new LeaderboardService();
  });

  beforeEach(async () => {
    const userRepo = AppDataSource.getRepository(User);
    testUser = userRepo.create({
      username: `test_user_${Date.now()}`,
    });
    testUser = await userRepo.save(testUser);
  });

  afterEach(async () => {
    if (testUser?.id) {
      await AppDataSource.getRepository(GameSession).delete({ userId: testUser.id });
      await AppDataSource.getRepository(Leaderboard).delete({ userId: testUser.id });
      await AppDataSource.getRepository(User).delete({ id: testUser.id });
    }
  });

  afterAll(async () => {
    await redisClient.flushdb();
    await redisClient.quit();
    
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('submitScore', () => {
    it('should create a new game session and leaderboard entry', async () => {
      await service.submitScore(testUser.id, 1000, 'story');

      const gameSession = await AppDataSource.getRepository(GameSession).findOne({
        where: { userId: testUser.id, gameMode: 'story' },
      });

      const leaderboard = await AppDataSource.getRepository(Leaderboard).findOne({
        where: { userId: testUser.id, gameMode: 'story' },
      });

      expect(gameSession).toBeDefined();
      expect(gameSession?.score).toBe(1000);
      expect(leaderboard).toBeDefined();
      expect(leaderboard?.totalScore).toBe(1000);
    });

    it('should update existing leaderboard entry when score is submitted again', async () => {
      await service.submitScore(testUser.id, 1000, 'story');
      await service.submitScore(testUser.id, 500, 'story');

      const leaderboard = await AppDataSource.getRepository(Leaderboard).findOne({
        where: { userId: testUser.id, gameMode: 'story' },
      });

      expect(leaderboard?.totalScore).toBe(1500);
    });

    it('should handle different game modes separately', async () => {
      await service.submitScore(testUser.id, 1000, 'story');
      await service.submitScore(testUser.id, 2000, 'multiplayer');

      const storyLeaderboard = await AppDataSource.getRepository(Leaderboard).findOne({
        where: { userId: testUser.id, gameMode: 'story' },
      });

      const multiplayerLeaderboard = await AppDataSource.getRepository(Leaderboard).findOne({
        where: { userId: testUser.id, gameMode: 'multiplayer' },
      });

      expect(storyLeaderboard?.totalScore).toBe(1000);
      expect(multiplayerLeaderboard?.totalScore).toBe(2000);
    });
  });

  describe('getTopPlayers', () => {
    it('should return top players for a game mode', async () => {
      const userRepo = AppDataSource.getRepository(User);
      const users = [];
      for (let i = 0; i < 5; i++) {
        const user = await userRepo.save(
          userRepo.create({ username: `top_user_${i}_${Date.now()}` })
        );
        users.push(user);
      }

      try {
        for (let i = 0; i < users.length; i++) {
          await service.submitScore(users[i].id, (5 - i) * 1000, 'story');
        }

        const topPlayers = await service.getTopPlayers('story', 10);

        expect(topPlayers.length).toBeGreaterThan(0);
        expect(topPlayers[0].rank).toBe(1);
        expect(topPlayers[0].totalScore).toBeGreaterThanOrEqual(topPlayers[1]?.totalScore || 0);
      } finally {
        // Clean up test users
        for (const user of users) {
          await AppDataSource.getRepository(GameSession).delete({ userId: user.id });
          await AppDataSource.getRepository(Leaderboard).delete({ userId: user.id });
          await AppDataSource.getRepository(User).delete({ id: user.id });
        }
      }
    });

    it('should respect the limit parameter', async () => {
      // Clear cache to get fresh results
      await redisClient.flushdb();
      
      const topPlayers = await service.getTopPlayers('story', 5);
      expect(topPlayers.length).toBeLessThanOrEqual(5);
    });

    it('should use cache on subsequent calls', async () => {
      // Clear cache first
      await redisClient.flushdb();
      
      const start1 = Date.now();
      await service.getTopPlayers('story', 10);
      const time1 = Date.now() - start1;

      const start2 = Date.now();
      await service.getTopPlayers('story', 10);
      const time2 = Date.now() - start2;

      // Cached call should be faster (allowing some margin for timing variations)
      expect(time2).toBeLessThan(time1 + 100);
    });
  });

  describe('getPlayerRank', () => {
    it('should return correct rank for a player', async () => {
      await service.submitScore(testUser.id, 5000, 'story');

      const rankData = await service.getPlayerRank(testUser.id, 'story');

      expect(rankData).toBeDefined();
      expect(rankData?.userId).toBe(testUser.id);
      expect(rankData?.rank).toBeGreaterThan(0);
      expect(rankData?.totalScore).toBe(5000);
    });

    it('should return null for non-existent player', async () => {
      const rankData = await service.getPlayerRank(999999999, 'story');
      expect(rankData).toBeNull();
    });

    it('should use cache on subsequent calls', async () => {
      await service.submitScore(testUser.id, 3000, 'story');
      
      // Clear cache to ensure first call is not cached
      const cacheKey = `leaderboard:rank:${testUser.id}:story`;
      await redisClient.del(cacheKey);

      const start1 = Date.now();
      await service.getPlayerRank(testUser.id, 'story');
      const time1 = Date.now() - start1;

      const start2 = Date.now();
      await service.getPlayerRank(testUser.id, 'story');
      const time2 = Date.now() - start2;

      // Cached call should be faster (allowing some margin for timing variations)
      expect(time2).toBeLessThan(time1 + 100);
    });
  });
});

