# API Documentation - Gaming Leaderboard

## Base URL
```
http://localhost:8000/api/leaderboard
```

## Authentication
Currently, no authentication is required. Rate limiting is applied per IP address.

## Rate Limits
- General API: 100 requests per 15 minutes per IP
- Score Submission: 60 requests per minute per IP

## Endpoints

### 1. Submit Score

Submit a new score for a user in a specific game mode.

**Endpoint:** `POST /api/leaderboard/submit`

**Request Body:**
```json
{
  "user_id": 123,
  "score": 1000,
  "game_mode": "story"
}
```

**Parameters:**
- `user_id` (number, required): The ID of the user submitting the score
- `score` (number, required): The score value (must be >= 0)
- `game_mode` (string, required): Either "story" or "multiplayer"

**Success Response (200):**
```json
{
  "success": true,
  "message": "Score submitted successfully"
}
```

**Error Responses:**

400 Bad Request - Invalid input:
```json
{
  "error": "Invalid user_id"
}
```

500 Internal Server Error:
```json
{
  "error": "Internal server error",
  "message": "Detailed error message"
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/leaderboard/submit \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 123,
    "score": 1000,
    "game_mode": "story"
  }'
```

---

### 2. Get Top Players

Retrieve the top N players for a specific game mode.

**Endpoint:** `GET /api/leaderboard/top`

**Query Parameters:**
- `limit` (number, optional): Number of players to return (default: 10, max: 100)
- `game_mode` (string, optional): Game mode filter (default: "story")

**Success Response (200):**
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
    {
      "userId": 456,
      "username": "user_456",
      "totalScore": 45000,
      "rank": 2
    }
  ],
  "gameMode": "story",
  "limit": 10
}
```

**Error Responses:**

400 Bad Request:
```json
{
  "error": "Invalid game_mode"
}
```

500 Internal Server Error:
```json
{
  "error": "Internal server error"
}
```

**Example:**
```bash
curl "http://localhost:8000/api/leaderboard/top?limit=10&game_mode=story"
```

---

### 3. Get Player Rank

Get the current rank and score for a specific player.

**Endpoint:** `GET /api/leaderboard/rank/:user_id`

**Path Parameters:**
- `user_id` (number, required): The ID of the user

**Query Parameters:**
- `game_mode` (string, optional): Game mode filter (default: "story")

**Success Response (200):**
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

**Error Responses:**

400 Bad Request:
```json
{
  "error": "Invalid user_id"
}
```

404 Not Found:
```json
{
  "error": "Player not found in leaderboard",
  "userId": 123,
  "gameMode": "story"
}
```

500 Internal Server Error:
```json
{
  "error": "Internal server error"
}
```

**Example:**
```bash
curl "http://localhost:8000/api/leaderboard/rank/123?game_mode=story"
```

---

## Health Check

**Endpoint:** `GET /health`

**Success Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "database": "connected",
  "redis": "connected"
}
```

**Example:**
```bash
curl http://localhost:8000/health
```

---

## Error Codes

| Status Code | Description |
|------------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input parameters |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

---

## Game Modes

The system supports two game modes:

1. **story**: Single-player story mode
2. **multiplayer**: Multiplayer competitive mode

Each game mode maintains its own separate leaderboard.

---

## Response Times

Expected response times (with caching):
- Submit Score: < 100ms (p95)
- Get Top Players: < 50ms (p95)
- Get Player Rank: < 80ms (p95)

Without caching, database queries may take longer depending on data size.

---

## Best Practices

1. **Caching**: Top players and rank lookups are cached. Expect faster responses on subsequent requests.

2. **Game Mode**: Always specify the game mode when querying to get accurate results.

3. **Rate Limiting**: Be mindful of rate limits. Use exponential backoff for retries.

4. **Error Handling**: Always check the `success` field in responses and handle errors appropriately.

5. **User IDs**: Ensure user IDs exist in the database before submitting scores.

