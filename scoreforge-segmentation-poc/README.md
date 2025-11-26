# Gaming Leaderboard System

A high-performance gaming leaderboard system built with Express.js, TypeORM, PostgreSQL, and Redis. Supports real-time leaderboard updates, caching, and monitoring.

## Features

- 🎮 **Game Modes**: Story Mode and Multiplayer Mode
- ⚡ **High Performance**: Redis caching and optimized database queries
- 🔒 **Data Consistency**: Transaction-based atomic operations
- 📊 **Monitoring**: New Relic integration for performance tracking
- 🎯 **Real-time Updates**: Live leaderboard updates via frontend
- 🧪 **Tested**: Unit tests and load testing scripts included

## Tech Stack

- **Backend**: Express.js, TypeScript
- **Frontend**: React 18 + TypeScript + Vite
- **ORM**: TypeORM
- **Database**: PostgreSQL
- **Cache**: Redis (ioredis)
- **Monitoring**: New Relic
- **Testing**: Jest, Supertest

## Project Structure

```
├── src/
│   ├── config/          # Configuration files
│   ├── entities/        # TypeORM entities
│   ├── services/        # Business logic
│   ├── controllers/     # Route handlers
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── utils/           # Utility functions
│   └── server.ts        # Application entry point
├── frontend/            # React frontend (React 18 + TypeScript + Vite)
├── tests/               # Test files
├── scripts/             # Utility scripts
└── docs/                # Documentation
```

## Setup Instructions

### Prerequisites

- Node.js (v18+)
- PostgreSQL (v14+)
- Redis (v6+)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your database and Redis credentials

5. Run database migrations:
   ```bash
   npm run migration:run
   ```

6. Start the backend development server:
   ```bash
   npm run dev
   ```

7. Start the React frontend (in a new terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   
   The frontend will be available at `http://localhost:3000`

## API Endpoints

### Submit Score
```
POST /api/leaderboard/submit
Body: { "user_id": number, "score": number, "game_mode": "story" | "multiplayer" }
```

### Get Top Players
```
GET /api/leaderboard/top?limit=10&game_mode=story
```

### Get Player Rank
```
GET /api/leaderboard/rank/:user_id?game_mode=story
```

## Performance Optimizations

- Database indexes on frequently queried columns
- Redis caching for leaderboard data
- Optimized SQL queries with proper joins
- Transaction-based updates for consistency
- Connection pooling

## Testing

Run unit tests:
```bash
npm test
```

Run load testing:
```bash
python scripts/load_test.py
```

## Documentation

See `docs/` folder for:
- High-Level Design (HLD)
- Low-Level Design (LLD)
- API Documentation
- Performance Reports


