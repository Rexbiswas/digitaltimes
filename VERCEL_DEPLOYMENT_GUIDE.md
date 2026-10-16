# Deploying Digital Times to Vercel

This guide explains how to deploy the **Digital Times Backend** and **Frontend** to Vercel.

---

## Architecture Overview

1. **Backend (`backend/`)**:
   - Packaged as a **Vercel Serverless Function** using Express.
   - Entrypoint: [`backend/api/index.js`](file:///F:/major%20project/digitaltimes/backend/api/index.js)
   - Configuration: [`backend/vercel.json`](file:///F:/major%20project/digitaltimes/backend/vercel.json)
   - Database: MongoDB Atlas with serverless connection pooling & caching in [`backend/src/config/db.js`](file:///F:/major%20project/digitaltimes/backend/src/config/db.js).
   - Real-Time Updates: Supports both Server-Sent Events (SSE) stream (`/api/notifications/stream`) and smart visibility-aware HTTP polling, so live notifications work seamlessly on Vercel serverless without requiring a persistent WebSocket process.

2. **Frontend (`/`)**:
   - Next.js 16 App Router application.
   - Built-in Next.js proxy route handlers forward requests to the backend.

---

## Step-by-Step Deployment Instructions

### Step 1: Deploy Backend to Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/new).
2. Click **Add New...** -> **Project**.
3. Import your `digitaltimes` Git repository.
4. In the **Project Settings**:
   - **Project Name**: e.g. `digitaltimes-backend` (or `digitaltimes-api`)
   - **Root Directory**: Click *Edit* and select **`backend`**
   - **Framework Preset**: *Other*
5. Add the following **Environment Variables** in the Vercel project settings:
   - `MONGODB_URI`: `mongodb+srv://<username>:<password>@digitalnews.tu1spvb.mongodb.net`
   - `JWT_SECRET`: Your secure JWT secret
   - `JWT_EXPIRES_IN`: `7d`
   - `FRONTEND_URL`: `https://your-frontend-project.vercel.app` (or `*` / your custom domain)
   - `NEWS_API_KEY`: Your NewsAPI key (if using wire ingestion)
   - `NODE_ENV`: `production`
6. Click **Deploy**.
7. Once deployed, note down your backend deployment URL (e.g. `https://digitaltimes-api.vercel.app`).
   - You can test it by visiting `https://digitaltimes-api.vercel.app/api/health` — it will return:
     ```json
     {
       "success": true,
       "service": "digitaltimes-backend",
       "environment": "production",
       "database": "connected"
     }
     ```

---

### Step 2: Deploy Frontend to Vercel

1. In your Vercel Dashboard, create a second project (or update your existing frontend project).
2. Import the same `digitaltimes` repository.
3. Keep the **Root Directory** as **`.`** (the root directory for Next.js).
4. In **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL`: `https://digitaltimes-api.vercel.app/api`
   - `BACKEND_API_URL`: `https://digitaltimes-api.vercel.app/api`
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: `740937154591-t7q2uo2s235ridl5n5uob2fsqv0sfc2b.apps.googleusercontent.com`
5. Click **Deploy**.

---

### Step 3: Configure Google OAuth for Your Vercel Domain

For Google Sign-In to open its secure authentication popup on Vercel without an `origin_mismatch` error:

1. Open the [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials).
2. Click on your OAuth 2.0 Client ID (`740937154591-t7q2uo2s235ridl5n5uob2fsqv0sfc2b.apps.googleusercontent.com`).
3. Under **Authorized JavaScript origins**, click **+ ADD URI** and add your live Vercel domain:
   - `https://your-frontend-project.vercel.app`
   - `https://your-custom-domain.com` (if using custom domain)
4. Under **Authorized redirect URIs**, click **+ ADD URI** and add:
   - `https://your-frontend-project.vercel.app`
5. Click **Save**.

> Note: Google origin updates typically take 2–5 minutes to propagate across Google's auth servers worldwide.

---

### Step 4: Verified Features on Vercel Serverless

- **Google Sign-In**: Opens Google's consent popup, exchanges credentials, fetches subscriber name and Google avatar, and securely stores the user record and JWT in MongoDB Atlas.
- **REST APIs**: Full CRUD operations for articles, editions, auth, history, clippings, desks, and verification requests.
- **Follow & Unfollow**: Immediate follow relationship persistence with MongoDB-level idempotency protection.
- **Real-Time Follow Notifications**:
  - SSE stream (`/api/notifications/stream`) sends incoming notifications directly to active subscriber sessions.
  - Smart tab-visibility polling queries `/api/notifications/unread-count` every 12 seconds when the page is active and immediately upon tab focus.
  - Sidebar unread notification badge updates instantly.
  - Toasts display for new follow events.
