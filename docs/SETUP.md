# Setup Guide

Complete instructions for setting up the Vitto Lending Decision System on your local machine.

---

## Table of Contents

- [Quick Start (Docker)](#quick-start-docker)
- [Manual Setup](#manual-setup)
  - [Windows](#windows)
  - [macOS](#macos)
  - [Linux](#linux)
- [PostgreSQL Setup](#postgresql-setup)
- [MongoDB Setup](#mongodb-setup)
- [Environment Variables](#environment-variables)
- [Running Tests](#running-tests)
- [Common Issues](#common-issues)

---

## Quick Start (Docker)

The fastest way to get everything running.

### Prerequisites
- Docker Desktop installed and running
- Git

### Steps

```bash
# Clone repository
git clone https://github.com/iamsankeerth/vitto-lending-system.git
cd vitto-lending-system

# Start all services
docker-compose up --build
```

Wait for all containers to start, then:
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000

### Stop
```bash
# Stop containers
docker-compose down

# Stop and remove volumes (clears database data)
docker-compose down -v
```

---

## Manual Setup

### Prerequisites
- Node.js 18+ (`node --version`)
- PostgreSQL 14+ installed and running
- MongoDB 6+ (optional -- backend works without it)

### Windows

#### 1. Install PostgreSQL

**Option A: Using installer**
1. Download from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
2. Run installer, remember the password you set for `postgres` user
3. During installation, note the port (default: 5432)

**Option B: Using Chocolatey**
```powershell
choco install postgresql16
```

#### 2. Create Database

Open pgAdmin or psql and run:
```sql
CREATE DATABASE vitto_lending;
```

Or via command line:
```powershell
& 'C:\Program Files\PostgreSQL\16\bin\psql.exe' -U postgres -c "CREATE DATABASE vitto_lending;"
```

#### 3. Run Schema

```powershell
Get-Content backend\src\adapters\persistence\postgres\schema.sql | & 'C:\Program Files\PostgreSQL\16\bin\psql.exe' -U postgres -d vitto_lending
```

#### 4. Configure pg_hba.conf (if needed)

If you get "password authentication failed" errors, edit:
```
C:\Program Files\PostgreSQL\16\data\pg_hba.conf
```

Change:
```
host    all             all             127.0.0.1/32            scram-sha-256
```
To:
```
host    all             all             127.0.0.1/32            trust
```

Restart PostgreSQL service.

#### 5. Setup Backend

```powershell
cd backend
copy .env.example .env
# Edit .env with your database URL
npm install
npm run dev
```

#### 6. Setup Frontend

```powershell
cd frontend
npm install
npm run dev
```

### macOS

#### 1. Install PostgreSQL

**Using Homebrew:**
```bash
brew install postgresql@16
brew services start postgresql@16
```

#### 2. Create Database

```bash
createdb vitto_lending
```

#### 3. Run Schema

```bash
psql -d vitto_lending -f backend/src/adapters/persistence/postgres/schema.sql
```

#### 4. Setup Backend

```bash
cd backend
cp .env.example .env
# Edit .env
npm install
npm run dev
```

#### 5. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

### Linux (Ubuntu/Debian)

#### 1. Install PostgreSQL

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### 2. Create Database

```bash
sudo -u postgres createdb vitto_lending
```

#### 3. Run Schema

```bash
sudo -u postgres psql -d vitto_lending -f backend/src/adapters/persistence/postgres/schema.sql
```

#### 4. Setup Backend & Frontend

Same as macOS steps 4-5.

---

## PostgreSQL Setup

### Schema

The schema creates three tables:

```sql
-- Business profiles
CREATE TABLE business_profiles (
  id UUID PRIMARY KEY,
  owner_name TEXT NOT NULL,
  pan VARCHAR(10) NOT NULL,
  business_type TEXT NOT NULL,
  monthly_revenue_paise BIGINT NOT NULL CHECK (monthly_revenue_paise > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Loan applications
CREATE TABLE loan_applications (
  id UUID PRIMARY KEY,
  business_profile_id UUID NOT NULL REFERENCES business_profiles(id),
  requested_amount_paise BIGINT NOT NULL CHECK (requested_amount_paise > 0),
  tenure_months INT NOT NULL CHECK (tenure_months BETWEEN 3 AND 60),
  purpose TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Credit decisions
CREATE TABLE credit_decisions (
  id UUID PRIMARY KEY,
  loan_application_id UUID NOT NULL REFERENCES loan_applications(id) UNIQUE,
  decision_status TEXT NOT NULL,
  credit_score INT NOT NULL CHECK (credit_score BETWEEN 0 AND 100),
  reason_codes JSONB NOT NULL,
  estimated_emi_paise BIGINT NOT NULL,
  derived_metrics_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Connection URLs

**Local (no password):**
```
postgresql://postgres@localhost:5432/vitto_lending
```

**Local (with password):**
```
postgresql://postgres:yourpassword@localhost:5432/vitto_lending
```

**Docker:**
```
postgresql://postgres:postgres@localhost:5432/vitto_lending
```

---

## MongoDB Setup

**Note:** MongoDB is optional. The backend works without it -- audit logging is gracefully skipped.

### Using Docker

```bash
docker run -d -p 27017:27017 --name vitto-mongo mongo:7
```

### Using Homebrew (macOS)

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Connection URL

```
mongodb://localhost:27017/vitto_lending
```

---

## Environment Variables

### Backend `.env`

```env
# Server
PORT=4000
NODE_ENV=development

# Database
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/vitto_lending
MONGODB_URL=mongodb://localhost:27017/vitto_lending

# CORS
CORS_ORIGIN=http://localhost:5173

# Business Logic
ANNUAL_INTEREST_RATE_PCT=18
APPROVAL_SCORE_THRESHOLD=60
```

### Frontend `.env`

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:4000
```

---

## Running Tests

### All Tests

```bash
cd backend
npm test
```

### Unit Tests Only

```bash
cd backend
npm run test:unit
```

### Integration Tests Only

```bash
cd backend
npm run test:integration
```

### With Coverage (Node.js 20+)

```bash
cd backend
node --test --experimental-test-coverage src/tests/**/*.test.js
```

**Note:** Tests require a running PostgreSQL database. The test suite automatically creates and cleans up test data.

---

## Common Issues

### "ECONNREFUSED 127.0.0.1:5432"

PostgreSQL is not running or listening on a different port.

```bash
# Check if PostgreSQL is running
# Windows:
Get-Service postgresql*

# macOS/Linux:
pg_isready

# Start PostgreSQL
# Windows: Services app -> Start PostgreSQL
# macOS: brew services start postgresql@16
# Linux: sudo systemctl start postgresql
```

### "password authentication failed for user postgres"

Edit `pg_hba.conf` to use `trust` auth for local connections, or set the correct password in `.env`.

### "Port 4000 is already in use"

```bash
# Find the process
lsof -i :4000        # macOS/Linux
netstat -ano | findstr :4000   # Windows

# Kill it or change PORT in .env
```

### "relation business_profiles does not exist"

Run the schema file:
```bash
psql -d vitto_lending -f backend/src/adapters/persistence/postgres/schema.sql
```

### MongoDB connection errors

These are safe to ignore. The backend works without MongoDB -- it just won't log audit events.

To suppress the warnings, either:
1. Start MongoDB
2. Remove `MONGODB_URL` from `.env`
3. Set `NODE_ENV=production` (hides warnings)

### Frontend "Failed to fetch"

1. Make sure backend is running
2. Check `VITE_API_URL` in frontend `.env`
3. Check CORS origin in backend `.env`
4. Check browser console for CORS errors

---

## Development Workflow

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Tests (optional)
cd backend
npm run test:unit --watch
```

Both servers support hot reload -- changes are reflected immediately.
