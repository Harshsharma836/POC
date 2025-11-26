import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { AppDataSource } from './config/database';
import { redisClient } from './config/redis';
import leaderboardRoutes from './routes/leaderboard.routes';
import authRoutes from './routes/auth.routes';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter, submitScoreLimiter, userRateLimitMiddleware } from './middleware/rateLimiter';
import { validateRequestIntegrity } from './middleware/requestIntegrity';
import { authenticateToken, optionalAuth } from './middleware/auth';
import { SeedService } from './services/SeedService';

if (process.env.NEW_RELIC_LICENSE_KEY) {
  require('newrelic');
}

const app = express();
const PORT = process.env.PORT || 8000;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for React
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: AppDataSource.isInitialized ? 'connected' : 'disconnected',
    redis: redisClient.status === 'ready' ? 'connected' : 'disconnected',
  });
});

app.use('/api/auth', authRoutes);

app.use('/api/leaderboard', authenticateToken);
app.use('/api/leaderboard/submit', submitScoreLimiter);
app.use('/api/leaderboard/submit', userRateLimitMiddleware);
app.use('/api/leaderboard/submit', validateRequestIntegrity);
app.use('/api/leaderboard', leaderboardRoutes);

app.use(errorHandler);

async function startServer() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');
    console.log('✅ Tables synchronized (created/updated automatically by TypeORM)');

    const tables = await AppDataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'game_sessions', 'leaderboard')
    `);
    console.log(`✅ Verified ${tables.length} tables exist:`, tables.map((t: { table_name: string }) => t.table_name).join(', '));

    const seedService = new SeedService();
    await seedService.seedDatabase();

    await redisClient.ping();
    console.log('✅ Redis connected');

    const { LeaderboardService } = require('./services/LeaderboardService');
    const leaderboardService = new LeaderboardService();
    console.log('🔄 Syncing tiered ZSET buckets...');
    await leaderboardService.syncSortedSet('story');
    await leaderboardService.syncSortedSet('multiplayer');
    console.log('✅ Buckets synced');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await AppDataSource.destroy();
  redisClient.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await AppDataSource.destroy();
  redisClient.disconnect();
  process.exit(0);
});

startServer();

