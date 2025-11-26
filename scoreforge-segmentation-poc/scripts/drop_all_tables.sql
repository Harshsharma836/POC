-- Drop all tables for clean start
-- TypeORM will recreate them automatically with synchronize: true

-- Drop tables in correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS leaderboard CASCADE;
DROP TABLE IF EXISTS game_sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Verify tables are dropped
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'game_sessions', 'leaderboard');

-- Should return 0 rows if successful

