# The Digital Times — Backend Service

A production-ready Node.js, Express, MongoDB, and Socket.IO backend service powering **The Digital Times** cinematic broadsheet application.

## Architecture

- **Server Framework:** Express 4 with Helmet, CORS, and Express Rate Limit
- **Database:** MongoDB via Mongoose with comprehensive indexing, text search, and in-memory development fallback
- **Real-Time Layer:** Socket.IO with rooms for daily editions (`edition:YYYY-MM-DD`), desks (`desk:ai`, etc.), and `breaking-news`
- **Ingestion Pipeline:** Automated NewsAPI + Multi-source RSS feed fetchers, content normalizers, SHA256-based deduplication, and deterministic 10-desk keyword classification
- **Editions Architecture:** Daily edition generation (`/api/editions/today`), calendar archive index (`/api/editions/calendar`), and historic edition retrieval (`/api/editions/:date`)

---

## 10 Editorial Desks

1. AI & Machine Learning (`ai`)
2. Web Development (`web`)
3. Startups & Capital (`startups`)
4. Editorial Design & UX (`design`)
5. Cybersecurity & Cryptography (`security`)
6. Technology (`technology`)
7. Gaming & Simulation (`gaming`)
8. Internet Culture (`culture`)
9. Business & Markets (`business`)
10. Future Technology (`future`)

---

## Getting Started

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set your configuration variables:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/digitaltimes
FRONTEND_URL=http://localhost:3000
NEWS_API_KEY=your_news_api_key_here
JWT_SECRET=your_secret_key_here
```

*(Note: In local development, if an external MongoDB daemon is not running on port 27017, the server will seamlessly launch an in-memory MongoDB instance for zero-friction development!)*

### 3. Run Server

```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

---

## Key API Endpoints

- `GET /api/health` — System and database health status
- `GET /api/articles` — Paginated articles (supports `?desk=`, `?editionDate=`, `?page=`, `?limit=`)
- `GET /api/articles/:id` — Retrieve article by MongoDB ID or slug
- `GET /api/articles/search?q=` — Full text search across title, description, body, author, and tags
- `GET /api/editions/today` — Current daily structured broadsheet edition
- `GET /api/editions/calendar` — Available dates in the broadsheet archives
- `GET /api/editions/:date` — Historical edition for date (YYYY-MM-DD)
- `GET /api/editions/:date/articles` — All articles published in an edition
- `GET /api/editions/:date/:desk` — Articles for a desk in an edition
- `GET /api/newsroom/live` — Live dispatches for newsroom updates
- `GET /api/trending` — Top trending dispatches
- `POST /api/users/auth` — Reader authentication and session token
- `GET /api/users/bookmarks` — Reader clippings / bookmarks
- `POST /api/admin/ingest` — Manually trigger news ingestion job
