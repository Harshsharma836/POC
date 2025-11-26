# Low-Level Design (LLD) - Gaming Leaderboard System

## Detailed Component Design

### 1. Service Layer: LeaderboardService

#### Class Structure
```typescript
class LeaderboardService {
  submitScore(userId, score, gameMode): Promise<void>
  getTopPlayers(gameMode, limit): Promise<LeaderboardEntry[]>
  getPlayerRank(userId, gameMode): Promise<RankData | null>
  recalculateRanks(gameMode): Promise<void>
  invalidateCache(userId, gameMode): Promise<void>
}
```

#### submitScore Implementation Details

**Transaction Flow:**
```
BEGIN TRANSACTION
  INSERT INTO game_sessions (user_id, score, game_mode)
  SELECT leaderboard WHERE user_id = X AND game_mode = Y
  IF EXISTS:
    UPDATE leaderboard SET total_score = total_score + score
  ELSE:
    INSERT INTO leaderboard (user_id, total_score, game_mode)
  DELETE FROM redis_cache WHERE key LIKE 'leaderboard:*'
COMMIT TRANSACTION
```

**Error Handling:**
- Rollback on any database error
- Log error details
- Return appropriate error to client

**Cache Invalidation:**
- Delete pattern: `leaderboard:top:{gameMode}:*`
- Delete key: `leaderboard:rank:{userId}:{gameMode}`
- Delete key: `leaderboard:score:{userId}:{gameMode}`

#### getTopPlayers Implementation Details

**Query Optimization:**
```sql
SELECT 
  l.user_id,
  u.username,
  l.total_score
FROM leaderboard l
INNER JOIN users u ON l.user_id = u.id
WHERE l.game_mode = $1
ORDER BY l.total_score DESC
LIMIT $2
```

**Index Usage:**
- Uses `idx_leaderboard_game_score` for efficient sorting
- JOIN uses primary key on users table

**Caching Logic:**
```typescript
cacheKey = `leaderboard:top:${gameMode}:${limit}`
if (redis.exists(cacheKey)):
  return JSON.parse(redis.get(cacheKey))
else:
  result = queryDatabase()
  redis.setex(cacheKey, TTL, JSON.stringify(result))
  return result
```

#### getPlayerRank Implementation Details

**Rank Calculation:**
```sql
-- Step 1: Get player's score
SELECT total_score FROM leaderboard 
WHERE user_id = $1 AND game_mode = $2

-- Step 2: Count players with higher scores
SELECT COUNT(*) FROM leaderboard
WHERE game_mode = $2 AND total_score > $playerScore
-- Rank = COUNT + 1
```

**Optimization:**
- Single query with subquery (if database supports)
- Index on `(game_mode, total_score)` enables fast counting

### 2. Database Schema Details

#### Indexes Strategy

**game_sessions table:**
```sql
CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX idx_game_sessions_game_mode ON game_sessions(game_mode);
CREATE INDEX idx_game_sessions_timestamp ON game_sessions(timestamp);
CREATE INDEX idx_game_sessions_user_game ON game_sessions(user_id, game_mode);
CREATE INDEX idx_game_sessions_user_game_time 
  ON game_sessions(user_id, game_mode, timestamp);
```

**leaderboard table:**
```sql
CREATE UNIQUE INDEX idx_leaderboard_user_game 
  ON leaderboard(user_id, game_mode);
CREATE INDEX idx_leaderboard_game_score 
  ON leaderboard(game_mode, total_score DESC);
```

**Index Selection Rationale:**
- Composite indexes support multi-column WHERE clauses
- DESC index for leaderboard ordering
- Unique constraint prevents duplicate entries

### 3. Redis Caching Implementation

#### Cache Structure

**Top Leaderboard Cache:**
```json
{
  "key": "leaderboard:top:story:10",
  "value": [
    {"userId": 123, "username": "user_123", "totalScore": 50000, "rank": 1},
    ...
  ],
  "ttl": 30
}
```

**Player Rank Cache:**
```json
{
  "key": "leaderboard:rank:123:story",
  "value": {
    "userId": 123,
    "username": "user_123",
    "totalScore": 50000,
    "rank": 1
  },
  "ttl": 60
}
```

#### Cache Invalidation Strategy

**On Score Submission:**
1. Pattern match: `leaderboard:top:{gameMode}:*`
2. Delete all matching keys
3. Delete specific player caches

**TTL-based Expiration:**
- Automatic expiration after TTL
- No manual cleanup needed for expired entries

### 4. API Endpoints Design

#### POST /api/leaderboard/submit

**Request:**
```json
{
  "user_id": 123,
  "score": 1000,
  "game_mode": "story"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Score submitted successfully"
}
```

**Response (Error):**
```json
{
  "error": "Invalid user_id"
}
```

**Validation:**
- `user_id`: number, > 0
- `score`: number, >= 0
- `game_mode`: enum ['story', 'multiplayer']

#### GET /api/leaderboard/top

**Query Parameters:**
- `limit` (optional, default: 10, range: 1-100)
- `game_mode` (optional, default: 'story')

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "userId": 123,
      "username": "user_123",
      "totalScore": 50000,
      "rank": 1
    },
    ...
  ],
  "gameMode": "story",
  "limit": 10
}
```

#### GET /api/leaderboard/rank/:user_id

**Path Parameters:**
- `user_id`: number

**Query Parameters:**
- `game_mode` (optional, default: 'story')

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "userId": 123,
    "username": "user_123",
    "totalScore": 50000,
    "rank": 1
  },
  "gameMode": "story"
}
```

**Response (Not Found):**
```json
{
  "error": "Player not found in leaderboard",
  "userId": 123,
  "gameMode": "story"
}
```

### 5. Error Handling

#### Error Types

1. **Validation Errors** (400)
   - Invalid input format
   - Missing required fields
   - Out of range values

2. **Not Found Errors** (404)
   - User not in leaderboard
   - Invalid user ID

3. **Server Errors** (500)
   - Database connection failures
   - Redis connection failures
   - Unexpected exceptions

#### Error Response Format
```json
{
  "error": "Error message",
  "message": "Detailed error description (dev only)"
}
```

### 6. Concurrency Handling

#### Race Condition Prevention

**Score Submission:**
- Uses database transactions (ACID properties)
- Row-level locking on leaderboard updates
- Serialized execution within transaction

**Leaderboard Updates:**
- Optimistic locking (if needed)
- Transaction isolation level: READ COMMITTED

#### Cache Consistency

**Write-Through Pattern:**
- Update database first
- Invalidate cache immediately
- Next read will fetch fresh data

**Cache Stampede Prevention:**
- Short TTL reduces stale data window
- Cache warming for frequently accessed data

### 7. Performance Metrics

#### Key Metrics

1. **API Latency:**
   - Submit Score: < 100ms (p95)
   - Get Top Players: < 50ms (p95, cached)
   - Get Player Rank: < 80ms (p95, cached)

2. **Database Performance:**
   - Query execution time
   - Index usage statistics
   - Connection pool utilization

3. **Cache Performance:**
   - Cache hit rate (target: > 80%)
   - Cache memory usage
   - Cache eviction rate

### 8. Testing Strategy

#### Unit Tests
- Service layer methods
- Cache operations
- Error handling

#### Integration Tests
- API endpoints
- Database operations
- Redis operations

#### Load Tests
- Concurrent score submissions
- High-frequency leaderboard queries
- Mixed workload simulation

### 9. Deployment Considerations

#### Environment Variables
- Database connection strings
- Redis connection details
- New Relic license key
- Port configuration

#### Health Checks
- Database connectivity
- Redis connectivity
- API endpoint availability

#### Graceful Shutdown
- Close database connections
- Disconnect Redis
- Complete in-flight requests

