# HubSpot Integration Service 🚀

A production-ready backend microservice to integrate with HubSpot CRM.
Sync contacts, deals, and companies, handle webhooks, and access synced data via REST APIs.

---

## ✨ Features

* **Authentication**: Secure HubSpot API key integration
* **Data Sync**: Automatic sync of contacts, deals, and companies
* **Webhook Handling**: Receive and process real-time HubSpot events
* **REST API**: Clean and documented endpoints
* **Error Handling**: Exponential backoff and rate-limit support
* **Database**: PostgreSQL with TypeORM
* **Logging**: Structured logging with Winston
* **TypeScript**: Full type safety

---

## 📋 Prerequisites

* Node.js 18+
* PostgreSQL 15+
* HubSpot Personal Access Key

---

## 🛠️ Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd HubSpot_Integration
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and update the values:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=harsh
DB_PASSWORD=1234@Harsh
DB_NAME=HubspotCRM

HUBSPOT_API_KEY=your-hubspot-api-key
HUBSPOT_BASE_URL=https://api.hubapi.com

WEBHOOK_SECRET=your-webhook-secret
BASE_URL=http://localhost:3000
```

### 3. Database Setup

**Local PostgreSQL**:

```sql
CREATE DATABASE HubspotCRM;
```

**If PostgreSQL is running in Docker**:

```bash
docker exec -it mypostgres psql -U harsh -d HubspotCRM
```

### 4. Build and Run

```bash
# Build TypeScript
npm run build

# Development
npm run dev

# Production
npm start
```

Server runs at `http://localhost:3000`.

---

## 📡 API Endpoints

### Health Check

```http
GET /api/health
```

### Sync

```http
POST /api/sync           # Sync all entities
POST /api/sync/contacts  # Sync contacts
POST /api/sync/deals     # Sync deals
POST /api/sync/companies # Sync companies
```

### Contacts

```http
GET /api/contacts?limit=50&offset=0&email=test@example.com
GET /api/contacts/:id
```

### Deals

```http
GET /api/deals?stage=qualifiedtobuy&minAmount=1000
GET /api/deals/:id
```

### Companies

```http
GET /api/companies?industry=Technology
GET /api/companies/:id
```

### Webhooks

```http
POST /api/webhook                  # Receive events
GET /api/webhooks                  # List received events
GET /api/webhook-subscriptions     # List subscriptions
POST /api/webhook-subscriptions    # Create subscription
DELETE /api/webhook-subscriptions/:id  # Delete subscription
```

> ⚠️ Webhook events and HubSpot UI screenshots are attached for reference.
Note: Don’t forget to create subscriptions for Contacts, Deals, and other relevant objects in HubSpot to ensure all events are captured correctly.

---

## 🔐 Webhook Setup

1. **Register via API**

```bash
curl -X POST http://localhost:3000/api/webhook-subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "contact.creation",
    "webhookUrl": "https://your-domain.com/api/webhook"
  }'
```

2. **Register via HubSpot UI**
   HubSpot → Settings → Integrations → Private Apps → Webhooks → Add your webhook URL

3. **Security**
   Set `WEBHOOK_SECRET` in `.env` and configure HubSpot to use the same secret.

---

## 🏗️ Architecture

```
src/
├── config/          # Config (DB, logger)
├── controllers/     # Request handlers
├── entities/        # TypeORM entities
├── middleware/      # Express middleware
├── routes/          # API routes
├── services/        # Business logic (HubSpot sync)
└── index.ts         # Entry point
```

**Highlights**:

* Idempotent updates using `hubspotId`
* Exponential backoff for API retries
* Structured logging with Winston
* Centralized error handling middleware
* Rate-limiting protection

---

## 🧪 Testing

```bash
npm test
npm run test:watch
```

---

## 📸 Screenshots

### Webhook and Hubspot Events

<img width="1392" height="530" alt="Screenshot 2025-11-21 014333" src="https://github.com/user-attachments/assets/08000b20-236e-4bc4-a07a-593f84460907" />

---

<img width="1359" height="245" alt="Screenshot 2025-11-21 104931" src="https://github.com/user-attachments/assets/76bea475-5949-4fa2-b5f1-80d2b6f74d6a" />

---

<img width="1915" height="955" alt="Screenshot 2025-11-21 112113" src="https://github.com/user-attachments/assets/2e1f096a-7370-4370-bcb8-5aac902e9ddd" />

*Shows sample webhook and Hubspot events received in the service.*

### HubSpot UI


<img width="1007" height="749" alt="Screenshot 2025-11-21 111634" src="https://github.com/user-attachments/assets/1356e769-24d5-4b48-b43d-c9cf3aba97d6" />

---

<img width="1556" height="787" alt="Screenshot 2025-11-21 111655" src="https://github.com/user-attachments/assets/a2a5f241-a60c-4e1b-8306-301a533189b2" />

---

<img width="1561" height="611" alt="Screenshot 2025-11-21 112246" src="https://github.com/user-attachments/assets/66d4344c-b3c7-4f44-909f-1d4aa7b33a79" />

*Shows the Private App & Webhooks configuration in HubSpot.*


---

## 📚 HubSpot Documentation

* [CRM API](https://developers.hubspot.com/docs/api/crm/understanding-the-crm)
* [Webhooks](https://developers.hubspot.com/docs/api/webhooks)
* [Rate Limits](https://developers.hubspot.com/docs/api/working-with-apis/rate-limits)

---

## 🐛 Troubleshooting

* **Database issues**: Verify PostgreSQL is running locally or via Docker
* **Webhook issues**: Ensure URL is publicly accessible & check `GET /api/webhooks`
* **API errors**: Confirm HubSpot API key and check rate limits

---

## 📄 License

MIT

## 👤 Author

Build by **Harsh**
