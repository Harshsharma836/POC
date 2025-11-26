-- Populate Users Table with 1 Million Records
-- Note: Reduce the number if this takes too long
INSERT INTO users (username)
SELECT 'user_' || generate_series(1, 1000000)
ON CONFLICT (username) DO NOTHING;

-- Populate Game Sessions with Random Scores
-- Note: Reduce the number if this takes too long (currently 5 million)
INSERT INTO game_sessions (user_id, score, game_mode, timestamp)
SELECT
    floor(random() * 1000000 + 1)::int,
    floor(random() * 10000 + 1)::int,
    CASE WHEN random() > 0.5 THEN 'story' ELSE 'multiplayer' END,
    NOW() - INTERVAL '1 day' * floor(random() * 365)
FROM generate_series(1, 5000000);

-- Populate Leaderboard by Aggregating Scores
-- This calculates total_score as SUM of scores (not AVG as in original)
INSERT INTO leaderboard (user_id, total_score, game_mode, rank)
SELECT 
    user_id, 
    SUM(score) as total_score,
    game_mode,
    RANK() OVER (PARTITION BY game_mode ORDER BY SUM(score) DESC) as rank
FROM game_sessions
GROUP BY user_id, game_mode
ON CONFLICT (user_id, game_mode) DO UPDATE
SET total_score = EXCLUDED.total_score;

-- Create indexes for better performance (if not already created by TypeORM)
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_game_mode ON game_sessions(game_mode);
CREATE INDEX IF NOT EXISTS idx_game_sessions_timestamp ON game_sessions(timestamp);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_game ON game_sessions(user_id, game_mode);
CREATE INDEX IF NOT EXISTS idx_leaderboard_game_score ON leaderboard(game_mode, total_score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user_game ON leaderboard(user_id, game_mode);

