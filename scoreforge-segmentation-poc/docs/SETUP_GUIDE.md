# Setup Guide - Gaming Leaderboard System

This guide will help you set up and run the Gaming Leaderboard system on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **Redis** (v6 or higher) - [Download](https://redis.io/download)
- **Python 3** (for load testing script) - [Download](https://www.python.org/downloads/)

## Step 1: Clone and Install Dependencies

1. Navigate to the project directory:
   ```bash
   cd analytics
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Install Python dependencies (for load testing):
   ```bash
   pip install requests
   ```

## Step 2: Database Setup

1. **Create PostgreSQL Database:**
   ```sql
   CREATE DATABASE leaderboard_db;
   ```

2. **Update Environment Variables:**
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_NAME=leaderboard_db
   ```

3. **Initialize Database Schema:**
   TypeORM will automatically create tables when you start the server in development mode.
   
   Alternatively, you can run the SQL script manually:
   ```bash
   psql -U postgres -d leaderboard_db -f scripts/seed_database.sql
   ```
   
   **Note:** The seed script includes data population. For testing, you may want to reduce the number of records:
   - Change `1000000` to `10000` for users
   - Change `5000000` to `50000` for game sessions

## Step 3: Redis Setup

1. **Start Redis Server:**
   ```bash
   # On Windows (if installed as service, it may already be running)
   redis-server
   
   # On Linux/Mac
   redis-server
   ```

2. **Verify Redis is Running:**
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

3. **Update Redis Configuration in `.env`:**
   ```env
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=
   ```

## Step 4: New Relic Setup (Optional)

1. **Create New Relic Account:**
   - Sign up at [newrelic.com](https://newrelic.com) (100GB free tier available)

2. **Get License Key:**
   - Navigate to Account Settings → API Keys
   - Copy your license key

3. **Update `.env`:**
   ```env
   NEW_RELIC_LICENSE_KEY=your_license_key_here
   NEW_RELIC_APP_NAME=Gaming Leaderboard
   ```

4. **Verify Configuration:**
   The `newrelic.js` file is already configured. The agent will only activate in production mode with a valid license key.

## Step 5: Build and Run

1. **Build TypeScript:**
   ```bash
   npm run build
   ```

2. **Run in Development Mode:**
   ```bash
   npm run dev
   ```

3. **Or Run in Production Mode:**
   ```bash
   npm start
   ```

4. **Verify Server is Running:**
   - Open browser: `http://localhost:8000/health`
   - You should see a JSON response with status information

## Step 6: Populate Database (Optional)

If you want to test with a large dataset:

1. **Run Seed Script:**
   ```bash
   psql -U postgres -d leaderboard_db -f scripts/seed_database.sql
   ```
   
   **Warning:** This may take a long time with full dataset (1M users, 5M sessions).
   Consider reducing the numbers for initial testing.

2. **Or Use TypeORM to Create Sample Data:**
   You can create a simple script to insert test data programmatically.

## Step 7: Run Frontend

1. **Open Frontend:**
   - Simply open `frontend/index.html` in your browser
   - Or use a local server:
     ```bash
     # Using Python
     cd frontend
     python -m http.server 3000
     ```
   - Access at: `http://localhost:3000`

2. **Update API URL (if needed):**
   If your API is running on a different port, update `API_BASE_URL` in `frontend/app.js`

## Step 8: Run Tests

1. **Unit Tests:**
   ```bash
   npm test
   ```

2. **Load Testing:**
   ```bash
   python scripts/load_test.py
   ```

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready`
- Check credentials in `.env`
- Ensure database exists: `psql -U postgres -l`

### Redis Connection Issues

- Verify Redis is running: `redis-cli ping`
- Check Redis port in `.env`
- Check firewall settings

### Port Already in Use

- Change `PORT` in `.env`
- Or kill the process using port 8000:
  ```bash
  # Windows
  netstat -ano | findstr :8000
  taskkill /PID <PID> /F
  
  # Linux/Mac
  lsof -ti:8000 | xargs kill
  ```

### TypeORM Migration Issues

- If tables already exist, set `synchronize: false` in `src/config/database.ts`
- Or drop and recreate database:
  ```sql
  DROP DATABASE leaderboard_db;
  CREATE DATABASE leaderboard_db;
  ```

## Next Steps

1. **Monitor Performance:**
   - Check New Relic dashboard (if configured)
   - Monitor Redis cache hit rates
   - Check database query performance

2. **Optimize:**
   - Adjust cache TTL values in `.env`
   - Tune database connection pool size
   - Add more indexes if needed

3. **Scale:**
   - Consider horizontal scaling with multiple server instances
   - Use Redis cluster for high availability
   - Implement database read replicas

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in `.env`
2. Use environment-specific database credentials
3. Enable New Relic monitoring
4. Set up proper logging (Winston is configured)
5. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start dist/server.js --name leaderboard-api
   ```
6. Set up reverse proxy (nginx) for SSL termination
7. Configure firewall rules
8. Set up database backups

## Support

For issues or questions:
- Check the documentation in `docs/` folder
- Review API documentation: `docs/API_DOCUMENTATION.md`
- Check logs for error messages

