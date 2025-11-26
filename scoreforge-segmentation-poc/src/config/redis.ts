import Redis from 'ioredis';

export const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

export const BUCKET_RANGES = [
  { min: 0, max: 1000 },         
  { min: 1001, max: 5000 },        
  { min: 5001, max: 10000 },       
  { min: 10001, max: 25000 },      
  { min: 25001, max: 50000 },     
  { min: 50001, max: 100000 },     
  { min: 100001, max: 250000 },    
  { min: 250001, max: 500000 },   
  { min: 500001, max: 1000000 },  
  { min: 1000001, max: Infinity },
];


export function getBucketForScore(score: number): number {
  for (let i = 0; i < BUCKET_RANGES.length; i++) {
    if (score >= BUCKET_RANGES[i].min && score <= BUCKET_RANGES[i].max) {
      return i;
    }
  }
  return BUCKET_RANGES.length - 1;
}

export const CacheKeys = {
  topLeaderboard: (gameMode: string, limit: number) => 
    `leaderboard:top:${gameMode}:${limit}`,
  playerRank: (userId: number, gameMode: string) => 
    `leaderboard:rank:${userId}:${gameMode}`,
  playerTotalScore: (userId: number, gameMode: string) => 
    `leaderboard:score:${userId}:${gameMode}`,
  bucketKey: (gameMode: string, bucketIndex: number) => 
    `leaderboard:bucket:${gameMode}:${bucketIndex}`,
  userBucket: (userId: number, gameMode: string) => 
    `leaderboard:user_bucket:${userId}:${gameMode}`,
};

export const CacheTTL = {
  LEADERBOARD: parseInt(process.env.LEADERBOARD_CACHE_TTL || '30'),
  PLAYER_RANK: parseInt(process.env.CACHE_TTL || '60'),
  PLAYER_SCORE: parseInt(process.env.CACHE_TTL || '60'),
};

