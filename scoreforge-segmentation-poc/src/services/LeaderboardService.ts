import { AppDataSource } from '../config/database';
import { GameSession } from '../entities/GameSession';
import { Leaderboard } from '../entities/Leaderboard';
import { redisClient, CacheKeys, CacheTTL, getBucketForScore, BUCKET_RANGES } from '../config/redis';
import { GameMode } from '../entities/GameSession';


// syncSortedSet For putting all the data in the redis buckets

export class LeaderboardService {

  async submitScore(
    userId: number,
    score: number,
    gameMode: GameMode
  ): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const gameSession = queryRunner.manager.create(GameSession, {
        userId,
        score,
        gameMode,
      });
      await queryRunner.manager.save(gameSession);
3
      let leaderboardEntry = await queryRunner.manager.findOne(Leaderboard, {
        where: { userId, gameMode },
      });

      let oldTotalScore = 0;
      if (leaderboardEntry) {
        oldTotalScore = leaderboardEntry.totalScore;
        leaderboardEntry.totalScore += score;
        await queryRunner.manager.save(leaderboardEntry);
      } else {
        leaderboardEntry = queryRunner.manager.create(Leaderboard, {
          userId,
          totalScore: score,
          gameMode,
        });
        await queryRunner.manager.save(leaderboardEntry);
      }

      const newTotalScore = leaderboardEntry.totalScore;
      const oldBucket = oldTotalScore > 0 ? getBucketForScore(oldTotalScore) : -1;
      const newBucket = getBucketForScore(newTotalScore);

      if (oldBucket >= 0 && oldBucket !== newBucket) {
        const oldBucketKey = CacheKeys.bucketKey(gameMode, oldBucket);
        await redisClient.zrem(oldBucketKey, userId.toString());
      }

      const newBucketKey = CacheKeys.bucketKey(gameMode, newBucket);
      await redisClient.zadd(newBucketKey, newTotalScore, userId.toString());

      const userBucketKey = CacheKeys.userBucket(userId, gameMode);
      await redisClient.set(userBucketKey, newBucket.toString());

      await this.invalidateCache(userId, gameMode);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getTopPlayers(
    gameMode: GameMode,
    limit: number = 10
  ): Promise<Array<{ userId: number; username: string; totalScore: number; rank: number }>> {
    const cacheKey = CacheKeys.topLeaderboard(gameMode, limit);

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const allPlayers: Array<{ userId: number; totalScore: number }> = [];
    
    for (let bucketIndex = BUCKET_RANGES.length - 1; bucketIndex >= 0; bucketIndex--) {
      const bucketKey = CacheKeys.bucketKey(gameMode, bucketIndex);
      
      const bucketData = await redisClient.zrevrange(bucketKey, 0, -1, 'WITHSCORES');
      
      /// converting it to an object okay
      if (bucketData && bucketData.length > 0) {
        for (let i = 0; i < bucketData.length; i += 2) {
          const userId = parseInt(bucketData[i]);
          const totalScore = parseFloat(bucketData[i + 1]);
          allPlayers.push({ userId, totalScore });
        }
      }

      if (allPlayers.length >= limit) {
        break;
      }
    }

    if (allPlayers.length === 0) {
      const results = await AppDataSource.getRepository(Leaderboard)
        .createQueryBuilder('leaderboard')
        .innerJoin('leaderboard.user', 'user')
        .select([
          'leaderboard.userId',
          'user.username',
          'leaderboard.totalScore',
        ])
        .where('leaderboard.game_mode = :gameMode', { gameMode })
        .orderBy('leaderboard.total_score', 'DESC')
        .limit(limit)
        .getRawMany();

      const leaderboard = results.map((row, index) => ({
        userId: row.leaderboard_user_id,
        username: row.user_username,
        totalScore: row.leaderboard_total_score,
        rank: index + 1,
      }));

      await redisClient.setex(
        cacheKey,
        CacheTTL.LEADERBOARD,
        JSON.stringify(leaderboard)
      );

      return leaderboard;
    }

    // optinal if redis has maybe an issue you know
    allPlayers.sort((a, b) => b.totalScore - a.totalScore);
    const topPlayers = allPlayers.slice(0, limit);

    const userIds = topPlayers.map(p => p.userId);

    // getting the username here
    const users = await AppDataSource.getRepository(Leaderboard)
      .createQueryBuilder('leaderboard')
      .innerJoin('leaderboard.user', 'user')
      .select([
        'leaderboard.userId',
        'user.username',
        'leaderboard.totalScore',
      ])
      .where('leaderboard.user_id IN (:...userIds)', { userIds })
      .andWhere('leaderboard.game_mode = :gameMode', { gameMode })
      .getRawMany();

    const leaderboard = topPlayers.map((player, index) => {
      const userData = users.find(u => u.leaderboard_user_id === player.userId);
      return {
        userId: player.userId,
        username: userData?.user_username || `user_${player.userId}`,
        totalScore: player.totalScore,
        rank: index + 1,
      };
    });

    await redisClient.setex(
      cacheKey,
      CacheTTL.LEADERBOARD,
      JSON.stringify(leaderboard)
    );

    return leaderboard;
  }

  async getPlayerRank(
    userId: number,
    gameMode: GameMode
  ): Promise<{ userId: number; username: string; totalScore: number; rank: number } | null> {
    const cacheKey = CacheKeys.playerRank(userId, gameMode);

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const leaderboardEntry = await AppDataSource.getRepository(Leaderboard)
      .createQueryBuilder('leaderboard')
      .innerJoin('leaderboard.user', 'user')
      .select([
        'leaderboard.userId',
        'user.username',
        'leaderboard.totalScore',
      ])
      .where('leaderboard.user_id = :userId', { userId })
      .andWhere('leaderboard.game_mode = :gameMode', { gameMode })
      .getRawOne();

    if (!leaderboardEntry) {
      return null;
    }

    const totalScore = leaderboardEntry.leaderboard_total_score;
    
    const userBucket = getBucketForScore(totalScore);
    const bucketKey = CacheKeys.bucketKey(gameMode, userBucket);

    await redisClient.zadd(bucketKey, totalScore, userId.toString());
    await redisClient.set(CacheKeys.userBucket(userId, gameMode), userBucket.toString());

    const rankInBucket = await redisClient.zrevrank(bucketKey, userId.toString());

    if (rankInBucket === null) {
      console.log('User not found in bucket, using database calculation');
      const rankResult = await AppDataSource.getRepository(Leaderboard)
        .createQueryBuilder('leaderboard')  
        .where('leaderboard.game_mode = :gameMode', { gameMode })
        .andWhere('leaderboard.total_score > :totalScore', {
          totalScore: totalScore,
        })
        .getCount();
      
      const result = {
        userId: leaderboardEntry.leaderboard_user_id,
        username: leaderboardEntry.user_username,
        totalScore: leaderboardEntry.leaderboard_total_score,
        rank: rankResult + 1,
      };

      await redisClient.setex(
        cacheKey,
        CacheTTL.PLAYER_RANK,
        JSON.stringify(result)
      );

      return result;
    }

    let usersInHigherBuckets = 0;
    for (let i = userBucket + 1; i < BUCKET_RANGES.length; i++) {
      const higherBucketKey = CacheKeys.bucketKey(gameMode, i);
      const count = await redisClient.zcard(higherBucketKey);
      usersInHigherBuckets += count;
    }

    const usersAboveInBucket = await redisClient.zcount(
      bucketKey,
      `(${totalScore}`,
      '+inf'
    );
    
    const globalRank = usersInHigherBuckets + usersAboveInBucket + 1;

    const result = {
      userId: leaderboardEntry.leaderboard_user_id,
      username: leaderboardEntry.user_username,
      totalScore: leaderboardEntry.leaderboard_total_score,
      rank: globalRank,
    };

    await redisClient.setex(
      cacheKey,
      CacheTTL.PLAYER_RANK,
      JSON.stringify(result)
    );

    return result;
  }

  private async invalidateCache(userId: number, gameMode: GameMode): Promise<void> {
    const pattern = CacheKeys.topLeaderboard(gameMode, 0).replace(':0', '*');
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }

    const rankKey = CacheKeys.playerRank(userId, gameMode);
    await redisClient.del(rankKey);

    const scoreKey = CacheKeys.playerTotalScore(userId, gameMode);
    await redisClient.del(scoreKey);

  }

  async syncSortedSet(gameMode: GameMode): Promise<void> {
    const entries = await AppDataSource.getRepository(Leaderboard)
      .createQueryBuilder('leaderboard')
      .where('leaderboard.game_mode = :gameMode', { gameMode })
      .getMany();

    if (entries.length === 0) {
      const pipeline = redisClient.pipeline();
      for (let i = 0; i < BUCKET_RANGES.length; i++) {
        pipeline.del(CacheKeys.bucketKey(gameMode, i));
      }
      await pipeline.exec();
      return;
    }

    const bucketEntries: { [bucketIndex: number]: Array<{ userId: number; totalScore: number }> } = {};
    for (const entry of entries) {
      const bucketIndex = getBucketForScore(entry.totalScore);
      if (!bucketEntries[bucketIndex]) {
        bucketEntries[bucketIndex] = [];
      }
      bucketEntries[bucketIndex].push({
        userId: entry.userId,
        totalScore: entry.totalScore,
      });
    }

    const pipeline = redisClient.pipeline();
    
    for (let i = 0; i < BUCKET_RANGES.length; i++) {
      pipeline.del(CacheKeys.bucketKey(gameMode, i));
    }

    for (const [bucketIndexStr, bucketUsers] of Object.entries(bucketEntries)) {
      const bucketIndex = parseInt(bucketIndexStr);
      const bucketKey = CacheKeys.bucketKey(gameMode, bucketIndex);
      
      for (const user of bucketUsers) {
        pipeline.zadd(bucketKey, user.totalScore, user.userId.toString());
        pipeline.set(CacheKeys.userBucket(user.userId, gameMode), bucketIndex.toString());
      }
    }

    await pipeline.exec();
    
    console.log(`Synced tiered buckets for ${gameMode}: ${entries.length} players across ${Object.keys(bucketEntries).length} buckets`);
  }

  async recalculateRanks(gameMode: GameMode): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entries = await queryRunner.manager
        .getRepository(Leaderboard)
        .createQueryBuilder('leaderboard')
        .where('leaderboard.game_mode = :gameMode', { gameMode })
        .orderBy('leaderboard.total_score', 'DESC')
        .getMany();

      for (let i = 0; i < entries.length; i++) {
        entries[i].rank = i + 1;
        await queryRunner.manager.save(entries[i]);
      }

      await queryRunner.commitTransaction();

      await this.syncSortedSet(gameMode);

      const pattern = CacheKeys.topLeaderboard(gameMode, 0).replace(':0', '*');
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

