# Database Setup Guide

## Automatic Table Creation with TypeORM

**No manual SQL scripts needed!** TypeORM automatically creates all tables, indexes, and relationships from your entity definitions.

## How It Works

The database is configured with `synchronize: true` in `src/config/database.ts`. When you start the server, TypeORM will:

1. ✅ Read your entity definitions (`User`, `GameSession`, `Leaderboard`)
2. ✅ Compare with existing database schema
3. ✅ Automatically create/update tables, columns, indexes, and foreign keys
4. ✅ Verify tables exist on startup

## Quick Start

**Just start your server** and TypeORM handles everything:

```bash
npm run dev
```

You should see:
```
✅ Database connected
✅ Tables synchronized (created/updated automatically by TypeORM)
✅ Verified 3 tables exist: users, game_sessions, leaderboard
```

## Clean Start (Drop All Tables)

If you want to start fresh and test TypeORM table creation:

1. **Drop all existing tables:**
   ```bash
   psql -U harsh -d gamedev -f scripts/drop_all_tables.sql
   ```
   (Or use your database credentials from `.env`)

2. **Restart the server:**
   ```bash
   npm run dev
   ```

   TypeORM will automatically recreate all tables with the correct schema!

## Verify Tables Were Created

After running any of the above methods, verify the tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'game_sessions', 'leaderboard');
```

You should see:
- users
- game_sessions
- leaderboard

## Troubleshooting

### If synchronize is not working:

1. **Check your `.env` file:**
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_NAME=leaderboard_db
   ```

2. **Check database connection:**
   - Make sure PostgreSQL is running
   - Verify credentials are correct
   - Ensure the database exists:
     ```sql
     CREATE DATABASE leaderboard_db;
     ```

3. **Check TypeORM logs:**
   - Look for connection errors in the console
   - Check if `synchronize: true` is set in `src/config/database.ts`

### For Production:

In production, set `synchronize: false` and use migrations instead:

```typescript
synchronize: false, // Never use in production
```

Then create and run migrations:
```bash
npm run migration:generate -- -n InitialSchema
npm run migration:run
```

## Next Steps

After tables are created:

1. **Test the API:**
   ```bash
   curl http://localhost:8000/health
   ```

2. **Submit a test score:**
   ```bash
   curl -X POST http://localhost:8000/api/leaderboard/submit \
     -H "Content-Type: application/json" \
     -d '{"user_id": 1, "score": 1000, "game_mode": "story"}'
   ```

3. **Get top players:**
   ```bash
   curl "http://localhost:8000/api/leaderboard/top?limit=10&game_mode=story"
   ```

