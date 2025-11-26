# Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites Check

- ✅ Node.js 18+ installed
- ✅ Docker installed (optional, for database)
- ✅ HubSpot Personal Access Key ready

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=harsh
DB_PASSWORD=1234@Harsh
DB_NAME=HubspotCRM

HUBSPOT_API_KEY=CiRldTEtOTZiNS0wMTkxLTQ5NzYtYTJkZC1iODdiYzhmY2U3ZDYQ0JSeRhix1NooKhkABeaRggEI4KbCgp-55Yyy9yzPz_zw
HUBSPOT_BASE_URL=https://api.hubapi.com

WEBHOOK_SECRET=your-webhook-secret-here
BASE_URL=http://localhost:3000
```

### 3. Start Database

**Option A: Docker Compose (Easiest)**

```bash
docker-compose up -d postgres
```

**Option B: Local PostgreSQL**

Make sure PostgreSQL is running and create the database:

```sql
CREATE DATABASE HubspotCRM;
```

### 4. Build and Run

```bash
# Build TypeScript
npm run build

# Run in development mode (with auto-reload)
npm run dev

# Or run in production mode
npm start
```

The server will start on `http://localhost:3000`

### 5. Test the API

Open a new terminal and test the health endpoint:

```bash
curl http://localhost:3000/api/health
```

You should see:
```json
{
  "success": true,
  "message": "Service is healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 6. Sync Data from HubSpot

```bash
# Sync all data (contacts, deals, companies)
curl -X POST http://localhost:3000/api/sync

# Or sync specific entities
curl -X POST http://localhost:3000/api/sync/contacts
curl -X POST http://localhost:3000/api/sync/deals
curl -X POST http://localhost:3000/api/sync/companies
```

### 7. Query Synced Data

```bash
# Get contacts
curl http://localhost:3000/api/contacts?limit=10

# Get deals
curl http://localhost:3000/api/deals?limit=10

# Get companies
curl http://localhost:3000/api/companies?limit=10
```

## Common Issues

### Database Connection Error

**Problem**: `Error: connect ECONNREFUSED`

**Solution**: 
- Make sure PostgreSQL is running
- Check database credentials in `.env`
- If using Docker: `docker ps` to verify container is running

### HubSpot API Error

**Problem**: `401 Unauthorized` or `403 Forbidden`

**Solution**:
- Verify your HubSpot API key is correct
- Check that the API key has the necessary scopes
- Ensure the API key hasn't expired

### Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:
- Change `PORT` in `.env` to a different port (e.g., 3001)
- Or stop the process using port 3000

## Next Steps

1. **Set up Webhooks**: See README.md for webhook configuration
2. **Deploy**: See deployment section in README.md
3. **Monitor**: Check logs in `combined.log` and `error.log`

## Need Help?

- Check the full [README.md](README.md) for detailed documentation
- Review error logs: `tail -f error.log`
- Check HubSpot API status: https://status.hubspot.com/

