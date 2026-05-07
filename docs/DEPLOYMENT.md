# Deployment Guide

This guide covers deploying the Vitto Lending Decision System to various platforms.

---

## Table of Contents

- [Docker Compose (Local Production)](#docker-compose-local-production)
- [Render (Recommended)](#render)
- [Railway](#railway)
- [Vercel (Frontend Only)](#vercel-frontend-only)
- [Environment Variables](#environment-variables)
- [Health Checks](#health-checks)
- [Troubleshooting](#troubleshooting)

---

## Docker Compose (Local Production)

The easiest way to run the entire stack locally.

```bash
# Clone the repo
git clone https://github.com/iamsankeerth/vitto-lending-system.git
cd vitto-lending-system

# Start everything
docker-compose up --build
```

**Services:**
| Service | URL | Notes |
|---------|-----|-------|
| Frontend | http://localhost:5173 | React dev server with hot reload |
| Backend | http://localhost:4000 | Express API |
| PostgreSQL | localhost:5432 | Credentials: postgres/postgres |


**Stop:**
```bash
docker-compose down
# Or to remove volumes:
docker-compose down -v
```

---

## Render

### Backend (Web Service)

1. Go to [render.com](https://render.com) and sign up
2. Create a **New Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Name:** `vitto-lending-backend`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free
5. Add environment variables (see [Environment Variables](#environment-variables))
6. Create a **PostgreSQL** instance on Render
7. Copy the internal connection URL to `POSTGRES_URL`
8. Deploy

### Frontend (Static Site)

1. Create a **New Static Site**
2. Connect your GitHub repo
3. Configure:
   - **Name:** `vitto-lending-frontend`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
4. Add environment variable:
   - `VITE_API_URL=https://vitto-lending-backend.onrender.com`
5. Deploy

**CORS:** Make sure `CORS_ORIGIN` on the backend matches your frontend URL.

---

## Railway

### One-Click Deploy

1. Go to [railway.app](https://railway.app)
2. Click **New Project** -> **Deploy from GitHub repo**
3. Select your repo
4. Railway will auto-detect the Node.js services

### Manual Service Setup

**Backend Service:**
1. Add a new service from your repo
2. Set root directory to `backend`
3. Add PostgreSQL addon from Railway marketplace
4. Copy the `DATABASE_URL` to `POSTGRES_URL`
5. Add remaining env vars (see below)
6. Deploy

**Frontend Service:**
1. Add a new static site service
2. Set root directory to `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add `VITE_API_URL` pointing to your backend service URL

---

## Vercel (Frontend Only)

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repo
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add environment variable:
   - `VITE_API_URL=https://your-backend-url.com`
5. Deploy

**Note:** Vercel only hosts the frontend. You still need a backend service (Render, Railway, Fly.io, etc.)

---

## Environment Variables

### Backend

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 4000 | HTTP server port |
| `NODE_ENV` | No | development | `development` or `production` |
| `POSTGRES_URL` | **Yes** | -- | PostgreSQL connection string |
| `CORS_ORIGIN` | No | * | Allowed CORS origin |
| `ANNUAL_INTEREST_RATE_PCT` | No | 18 | Interest rate for EMI calc |
| `APPROVAL_SCORE_THRESHOLD` | No | 60 | Minimum score to approve |

### Frontend

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | No | /api | Backend API base URL |

### Example Production `.env`

```env
# Backend
PORT=4000
NODE_ENV=production
POSTGRES_URL=postgresql://user:pass@host:5432/vitto_lending
CORS_ORIGIN=https://vitto-lending-frontend.vercel.app
ANNUAL_INTEREST_RATE_PCT=18
APPROVAL_SCORE_THRESHOLD=60

# Frontend
VITE_API_URL=https://vitto-lending-backend.onrender.com
```

---

## Health Checks

After deployment, verify everything is working:

```bash
# Backend health
curl https://your-backend-url.com/api/health

# Should return:
{"data":{"status":"ok","timestamp":"..."},"meta":{"requestId":"..."}}

# Create a test profile
curl -X POST https://your-backend-url.com/api/business-profiles \
  -H "Content-Type: application/json" \
  -d '{"ownerName":"Test","pan":"ABCDE1234F","businessType":"retail","monthlyRevenueRupees":100000}'
```

---

## Troubleshooting

### Backend won't start

**Check PostgreSQL connection:**
```bash
# Test connection
psql $POSTGRES_URL -c "SELECT 1"
```

**Check port conflicts:**
```bash
# Find what's using port 4000
lsof -i :4000
# Kill if needed
kill -9 <PID>
```

**Check logs:**
```bash
# Docker
docker-compose logs -f backend

# Render/Railway
# Check platform dashboard logs
```

### Frontend can't reach backend

1. Verify `VITE_API_URL` is set correctly
2. Check `CORS_ORIGIN` on backend matches frontend domain
3. Check browser Network tab for CORS errors
4. Ensure backend is running and accessible

### Database schema errors

```bash
# Re-run schema (PostgreSQL)
psql $POSTGRES_URL -f backend/src/adapters/persistence/postgres/schema.sql
```

### Rate limiting in tests

The backend uses `express-rate-limit`. For integration tests, the limit is set to 100 req/min. In production, it defaults to 10 req/min on decision endpoints.

---

## Database Hosting Options

| Provider | Type | Free Tier | Best For |
|----------|------|-----------|----------|
| **Render Postgres** | Managed | Yes (1 GB) | Simplicity |
| **Neon** | Serverless | Yes (500 MB) | Auto-scaling |
| **Supabase** | Managed | Yes (500 MB) | Full Postgres |
| **Railway** | Managed | Yes ($5 credit) | Easy setup |

**Recommendation for quick deployment:** Render Postgres + Render Web Service + Vercel Frontend.
