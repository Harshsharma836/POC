# Swagger/OpenAPI Documentation Guide

## Overview

The Gaming Leaderboard API is fully documented using OpenAPI 3.0.3 specification. Two formats are available:
- `swagger.yaml` - YAML format (human-readable)
- `swagger.json` - JSON format (machine-readable)

## Viewing the Documentation

### Option 1: Swagger UI (Recommended)

1. **Install swagger-ui-express** (if not already installed):
   ```bash
   npm install --save-dev swagger-ui-express
   npm install --save-dev @types/swagger-ui-express
   ```

2. **Add Swagger UI to your server** (`src/server.ts`):
   ```typescript
   import swaggerUi from 'swagger-ui-express';
   import * as swaggerDocument from '../swagger.json';
   
   // Add after middleware setup
   app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
   ```

3. **Access Swagger UI**:
   - Open browser: `http://localhost:8000/api-docs`

### Option 2: Online Swagger Editor

1. Go to [Swagger Editor](https://editor.swagger.io/)
2. Copy contents of `swagger.yaml`
3. Paste into the editor
4. View interactive documentation

### Option 3: Postman

1. Open Postman
2. Import → File → Select `swagger.json`
3. All endpoints will be imported with examples

## API Endpoints

### 1. Submit Score
- **Method**: POST
- **Path**: `/api/leaderboard/submit`
- **Request Body**:
  ```json
  {
    "user_id": 123,
    "score": 1500,
    "game_mode": "story"
  }
  ```
- **Response**: Success message

### 2. Get Top Players
- **Method**: GET
- **Path**: `/api/leaderboard/top`
- **Query Parameters**:
  - `limit` (optional, default: 10, max: 100)
  - `game_mode` (optional, default: "story")
- **Response**: Array of top players

### 3. Get Player Rank
- **Method**: GET
- **Path**: `/api/leaderboard/rank/{user_id}`
- **Path Parameters**:
  - `user_id` (required)
- **Query Parameters**:
  - `game_mode` (optional, default: "story")
- **Response**: Player rank and score

### 4. Health Check
- **Method**: GET
- **Path**: `/health`
- **Response**: System health status

## Request/Response Examples

All endpoints include comprehensive examples in the Swagger documentation:
- Request body examples
- Success response examples
- Error response examples
- Multiple scenarios (story mode, multiplayer mode)

## Schema Definitions

The Swagger file includes complete schema definitions for:
- `SubmitScoreRequest` - Score submission payload
- `SubmitScoreResponse` - Success response
- `LeaderboardPlayer` - Player data structure
- `TopPlayersResponse` - Top players response
- `PlayerRank` - Player rank data
- `PlayerRankResponse` - Rank lookup response
- `HealthResponse` - Health check response
- `ErrorResponse` - Error response format
- `GameMode` - Enum for game modes

## Rate Limiting

The API implements rate limiting:
- **General API**: 100 requests per 15 minutes per IP
- **Score Submission**: 60 requests per minute per IP

Rate limit errors return HTTP 429 with `RateLimitResponse` schema.

## Error Codes

- **200**: Success
- **400**: Bad Request (invalid parameters)
- **404**: Not Found (player not in leaderboard)
- **429**: Too Many Requests (rate limit exceeded)
- **500**: Internal Server Error

## Using with Code Generators

The Swagger specification can be used to generate client SDKs:

### OpenAPI Generator
```bash
# Install OpenAPI Generator
npm install @openapitools/openapi-generator-cli -g

# Generate TypeScript client
openapi-generator-cli generate -i swagger.yaml -g typescript-axios -o ./generated-client
```

### Swagger Codegen
```bash
# Generate JavaScript client
swagger-codegen generate -i swagger.yaml -l javascript -o ./generated-client
```

## Validation

The Swagger file validates:
- Request body schemas
- Query parameters
- Path parameters
- Response schemas
- Error responses
- Data types and constraints

## Integration with Testing Tools

### Postman
- Import `swagger.json` directly
- All endpoints pre-configured with examples

### Insomnia
- Import `swagger.yaml` or `swagger.json`
- Auto-generate requests

### REST Client (VS Code)
- Use Swagger to understand API structure
- Create `.http` files with examples

## Keeping Documentation Updated

When adding new endpoints or modifying existing ones:
1. Update `swagger.yaml` or `swagger.json`
2. Regenerate the other format if needed
3. Test in Swagger UI
4. Update this guide if needed

## Best Practices

1. **Always include examples** - Makes API easier to understand
2. **Document all error cases** - Helps developers handle errors
3. **Use descriptive summaries** - Clear endpoint descriptions
4. **Include constraints** - min/max values, required fields
5. **Keep schemas reusable** - Use `$ref` for common structures

