# Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites Check
- [ ] Node.js v18+ installed
- [ ] PostgreSQL running
- [ ] Redis running

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env` file:
```env
PORT=8000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=leaderboard_db
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 3. Create Database
```sql
CREATE DATABASE leaderboard_db;
```

### 4. Start Services
```bash
# Terminal 1: Start Redis (if not running as service)
redis-server

# Terminal 2: Start PostgreSQL (if not running as service)
# Usually runs automatically on Windows/Mac
```

### 5. Run Application
```bash
npm run dev
```

### 6. Open Frontend
Open `frontend/index.html` in your browser

## Test the API

### Submit a Score
```bash
curl -X POST http://localhost:8000/api/leaderboard/submit \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "score": 1000, "game_mode": "story"}'
```

### Get Top Players
```bash
curl "http://localhost:8000/api/leaderboard/top?limit=10&game_mode=story"
```

### Get Player Rank
```bash
curl "http://localhost:8000/api/leaderboard/rank/1?game_mode=story"
```

## Health Check
```bash
curl http://localhost:8000/health
```

## Common Issues

**Database connection error?**
- Check PostgreSQL is running: `pg_isready`
- Verify credentials in `.env`

**Redis connection error?**
- Check Redis is running: `redis-cli ping`
- Should return: `PONG`

**Port already in use?**
- Change `PORT` in `.env`
- Or kill process on port 8000

## Next Steps

1. **Populate Test Data**: See `scripts/seed_database.sql`
2. **Run Tests**: `npm test`
3. **Load Test**: `python scripts/load_test.py`
4. **Read Docs**: Check `docs/` folder for detailed documentation

## Need Help?

- Full setup guide: `docs/SETUP_GUIDE.md`
- API documentation: `docs/API_DOCUMENTATION.md`
- Architecture: `docs/HLD.md`

