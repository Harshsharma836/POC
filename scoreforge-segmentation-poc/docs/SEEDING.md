# Database Seeding Guide

## Automatic Seeding on Startup

The database is automatically seeded with initial test data when the server starts, **only if the database is empty**.

## What Gets Seeded

When you start the server with an empty database, the seed service creates:

- **100 users** (`user_1`, `user_2`, ..., `user_100`)
- **500-1000 game sessions** (5-10 sessions per user, random scores)
- **Leaderboard entries** (aggregated scores for each user per game mode)
- **Ranks** (calculated for both story and multiplayer modes)

## How It Works

1. **Server starts** → Database connects
2. **Tables created** → TypeORM synchronizes schema
3. **Seed check** → Checks if database is empty
4. **Auto-seed** → If empty, creates test data automatically
5. **Skip if exists** → If data exists, skips seeding

## Console Output

When seeding runs, you'll see:

```
🌱 Seeding database with initial data...
✅ Created 100 users
✅ Created 750 game sessions
✅ Created 200 leaderboard entries
✅ Database seeding completed successfully!
📊 Summary: 100 users, 750 sessions, 200 leaderboard entries
```

If database already has data:

```
📊 Database already has data, skipping seed
💡 To force re-seed, set SEED_DATABASE=true in .env
```

## Environment Variables

Control seeding behavior with `.env`:

```env
# Disable seeding completely
SEED_DATABASE=false

# Force re-seed (clears existing data and re-seeds)
SEED_DATABASE=true

# Default: Auto-seed only if database is empty
# (No variable needed)
```

## Force Re-Seed

To clear existing data and re-seed:

1. **Set environment variable:**
   ```env
   SEED_DATABASE=true
   ```

2. **Restart server:**
   ```bash
   npm run dev
   ```

   The seed service will:
   - Clear all existing data
   - Create fresh test data
   - Recalculate ranks

## Manual Seeding

You can also trigger seeding manually by calling the service:

```typescript
import { SeedService } from './services/SeedService';

const seedService = new SeedService();
await seedService.seedDatabase();
```

## Seed Data Details

### Users
- Format: `user_1`, `user_2`, ..., `user_100`
- Total: 100 users

### Game Sessions
- Per user: 5-10 random sessions
- Scores: 100-10,000 (random)
- Game modes: Random mix of 'story' and 'multiplayer'
- Timestamps: Random dates in last 30 days

### Leaderboard
- Aggregated total scores per user per game mode
- Ranks calculated automatically
- Separate leaderboards for 'story' and 'multiplayer'

## Testing with Seeded Data

After seeding, you can test the API:

```bash
# Get top players (story mode)
curl "http://localhost:8000/api/leaderboard/top?limit=10&game_mode=story"

# Get top players (multiplayer mode)
curl "http://localhost:8000/api/leaderboard/top?limit=10&game_mode=multiplayer"

# Get specific user rank
curl "http://localhost:8000/api/leaderboard/rank/1?game_mode=story"

# Submit a new score
curl -X POST http://localhost:8000/api/leaderboard/submit \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "score": 5000, "game_mode": "story"}'
```

## Customizing Seed Data

To change the amount of seed data, edit `src/services/SeedService.ts`:

```typescript
const numUsers = 100; // Change this number
const numSessions = Math.floor(Math.random() * 6) + 5; // Change range
const score = Math.floor(Math.random() * 10000) + 100; // Change score range
```

## Production

**⚠️ Important:** Seeding is disabled in production by default. The seed service only runs if:
- Database is empty, OR
- `SEED_DATABASE=true` is explicitly set

For production, ensure:
```env
SEED_DATABASE=false
```

Or simply don't set the variable and ensure your database has data before deploying.

