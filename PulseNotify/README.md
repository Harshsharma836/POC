# 🔔 Real-Time Notification Server

A real-time notification backend using **Node.js, Express, Socket.IO, Redis (Pub/Sub + Cache + List)** and **MySQL/MongoDB**.

---

## 📽 Demo Video

🔗 [https://screenrec.com/share/oEe1lqMfb5](https://screenrec.com/share/oEe1lqMfb5)

---

## 🚀 Features

* Stores notifications permanently in DB
* Real-time delivery using Socket.IO
* Redis Pub/Sub for instant broadcasting
* Redis caching for fast `/notifications/:userId` API
* Tracks recent notifications using Redis list

---


## ⚡ Real-Time Flow

```
Create notification → save to DB
→ publish to Redis "new_notification"
→ Socket server receives it
→ emits "notify" to room user:<userId>
→ user gets notification instantly
```

---

## 🛠 Setup

```bash
npm install
npm run dev
```

Environment variables required:

```
PORT=3000
DB_URL=your_database_url
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## 📂 Folder Structure

```
/src
  /routes
  /socket
  /db
  /services
  server.js
```

---

## 👨‍💻 Author

Harsh Sharma
Backend Developer — Node.js | Redis | Socket.IO | Microservices
