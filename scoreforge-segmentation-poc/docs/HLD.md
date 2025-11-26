# High-Level Design (HLD) - Gaming Leaderboard System

## Overview

The Gaming Leaderboard System is a high-performance, scalable solution for tracking and displaying player rankings in gaming applications. The system supports multiple game modes (Story and Multiplayer) and provides real-time leaderboard updates with optimized performance through caching and database indexing.

## Architecture

### System Components

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │ HTTP/REST
       │
┌──────▼─────────────────────────────────────┐
│         Express.js API Server              │
│  ┌──────────────────────────────────────┐  │
│  │  Controllers (Request Handling)       │  │
│  └──────────────┬───────────────────────┘  │
│  ┌──────────────▼───────────────────────┐  │
│  │  Services (Business Logic)           │  │
│  └──────────────┬───────────────────────┘  │
│  ┌──────────────▼───────────────────────┐  │
│  │  Middleware (Rate Limiting, Security)│  │
│  └──────────────────────────────────────┘  │
└──────┬──────────────────┬──────────────────┘
       │                  │
       │                  │
┌──────▼──────┐    ┌──────▼──────┐
│ PostgreSQL  │    │    Redis    │
│  Database   │    │    Cache    │
└─────────────┘    └─────────────┘
```

## Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **ORM**: TypeORM
- **Database**: PostgreSQL
- **Cache**: Redis (ioredis)
- **Monitoring**: New Relic

### Frontend
- **Technology**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3 with modern features
- **Updates**: Polling-based (5-second intervals)

## Data Flow

### Score Submission Flow
1. Client sends POST request with `user_id`, `score`, and `game_mode`
2. API validates input
3. Service layer starts database transaction
4. Insert new game session record
5. Update or create leaderboard entry (atomic operation)
6. Invalidate relevant Redis cache entries
7. Commit transaction
8. Return success response

### Leaderboard Retrieval Flow
1. Client sends GET request for top players
2. Check Redis cache for cached result
3. If cache hit: return cached data
4. If cache miss:
   - Query database with optimized query
   - Calculate ranks
   - Store in Redis cache with TTL
   - Return result

### Rank Lookup Flow
1. Client sends GET request with `user_id`
2. Check Redis cache
3. If cache miss:
   - Query player's total score
   - Calculate rank (count players with higher scores)
   - Cache result
4. Return rank data

## Database Schema

### Tables

**users**
- `id` (PK, Serial)
- `username` (Unique, VARCHAR)
- `join_date` (Timestamp)

**game_sessions**
- `id` (PK, Serial)
- `user_id` (FK → users.id)
- `score` (INT)
- `game_mode` (VARCHAR: 'story' | 'multiplayer')
- `timestamp` (Timestamp)

**leaderboard**
- `id` (PK, Serial)
- `user_id` (FK → users.id)
- `total_score` (INT)
- `game_mode` (VARCHAR)
- `rank` (INT, nullable)

### Indexes

Critical indexes for performance:
- `game_sessions(user_id, game_mode, timestamp)` - Composite index for user queries
- `leaderboard(game_mode, total_score DESC)` - For top players queries
- `leaderboard(user_id, game_mode)` - Unique constraint + index for lookups

## Caching Strategy

### Cache Keys
- Top Leaderboard: `leaderboard:top:{gameMode}:{limit}`
- Player Rank: `leaderboard:rank:{userId}:{gameMode}`
- Player Score: `leaderboard:score:{userId}:{gameMode}`

### Cache TTL
- Leaderboard: 30 seconds (frequent updates)
- Player Rank: 60 seconds (less frequent changes)
- Player Score: 60 seconds

### Cache Invalidation
- On score submission: Invalidate all related caches
- Pattern-based deletion for top leaderboard caches
- Direct deletion for player-specific caches

## Performance Optimizations

1. **Database Indexing**: Strategic indexes on frequently queried columns
2. **Redis Caching**: Reduces database load for read-heavy operations
3. **Connection Pooling**: PostgreSQL connection pool (max 20 connections)
4. **Query Optimization**: Efficient JOINs and ORDER BY with indexes
5. **Transaction Management**: Atomic operations prevent race conditions
6. **Rate Limiting**: Prevents abuse and ensures fair resource usage

## Scalability Considerations

### Horizontal Scaling
- Stateless API design allows multiple server instances
- Shared Redis cache for consistency across instances
- Database connection pooling handles concurrent requests

### Vertical Scaling
- Database indexes support millions of records
- Redis memory can be increased for larger cache
- Connection pool size can be adjusted based on load

## Security Measures

1. **Helmet.js**: Security headers
2. **Rate Limiting**: Prevents DDoS and abuse
3. **Input Validation**: Type checking and range validation
4. **CORS**: Configured for controlled origins
5. **SQL Injection Prevention**: TypeORM parameterized queries

## Monitoring & Observability

### New Relic Integration
- API endpoint latency tracking
- Database query performance
- Error rate monitoring
- Custom metrics for business logic

### Health Checks
- `/health` endpoint for system status
- Database connection status
- Redis connection status

## Future Enhancements

1. **Real-time Updates**: WebSocket support for instant leaderboard updates
2. **Pagination**: Support for large leaderboard queries
3. **Time-based Rankings**: Daily, weekly, monthly leaderboards
4. **Achievement System**: Badges and milestones
5. **Analytics Dashboard**: Player statistics and trends

