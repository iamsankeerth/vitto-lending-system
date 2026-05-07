# Vitto Lending Decision System

A production-ready MSME lending decision platform. Collects business profiles and loan applications, evaluates risk through an explainable scoring model, and returns structured credit decisions with reason codes.

**Live Demo:**
- Frontend: http://localhost:5173 (local) | *Deployed URL coming soon*
- Backend API: http://localhost:4001 (local) | *Deployed URL coming soon*

**Repository:** https://github.com/iamsankeerth/vitto-lending-system

---

## Table of Contents

- [Quick Start](#quick-start)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Architecture](#architecture)
- [Decision Logic](#decision-logic)
- [API Overview](#api-overview)
- [Testing](#testing)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Tradeoffs](#tradeoffs)
- [License](#license)

---

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or Docker)

### Option 1: Docker Compose (Recommended)

```bash
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:4000 |
| PostgreSQL | localhost:5432 |

### Option 2: Manual Setup

**Backend:**
```bash
cd backend
cp .env.example .env
npm install
# Update .env with your database URLs, then:
npm run dev        # Server starts on :4000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev        # Vite dev server on :5173
```

See [docs/SETUP.md](docs/SETUP.md) for detailed setup instructions including PostgreSQL configuration on Windows and macOS.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Backend | Node.js 20 + Express |
| Validation | Zod (runtime schema validation) |
| Core Database | PostgreSQL 16 (system of record) |
| Audit Trail | PostgreSQL `audit_events` table |
| Testing | Node.js built-in test runner + Supertest |
| Deployment | Docker Compose / Render / Vercel |

---

## Features

### Core
- **Business Profile Creation** -- owner name, PAN, business type, monthly revenue
- **Loan Application** -- amount, tenure (3--60 months), purpose
- **Credit Decision** -- binary APPROVED/REJECTED with credit score (0--100) and reason codes
- **Explainable Metrics** -- EMI estimate, revenue-to-EMI ratio, loan-to-revenue multiple

### Quality of Service
- **Structured Validation** -- Zod schemas on every endpoint with field-level error details
- **Consistent API Envelope** -- every response includes `{ data/error, meta: { requestId } }`
- **Rate Limiting** -- decision endpoints protected against abuse
- **Comprehensive Testing** -- 43 tests covering unit logic, integration flows, and edge cases

### Frontend
- Single-page React application
- Inline validation with clear error messages
- Decision result panel with score, status, reason codes, and derived metrics
- Responsive layout

---

## Architecture

```text
React SPA (Port 5173)
  -> Express API (Port 4000/4001)
    -> Validation Middleware (Zod schemas)
    -> Use Cases (application orchestration)
      -> Decision Engine (pure business logic)
      -> PostgreSQL Repositories (core state)
      -> PostgreSQL Audit Logger (events)
```

### Design Principles

1. **Decision Engine Isolation** -- pure domain module with zero dependencies on Express, SQL, or logging
2. **Paise Storage** -- all monetary values stored as integers (paise) in PostgreSQL to avoid floating-point errors
3. **API Contracts** -- rupees in the API, paise in the database; conversion happens at the controller boundary
4. **Audit Independence** -- Core state and audit trail both live in PostgreSQL, but in separate tables with different access patterns

See [docs/ARCHITECTURE_WRITEUP.md](docs/ARCHITECTURE_WRITEUP.md) for the full write-up and [docs/Architecture_Writeup.pdf](docs/Architecture_Writeup.pdf) for the PDF version.

---

## Decision Logic

### Assumptions
- PAN validation is format-only (mock acceptable)
- Annual interest rate for EMI estimate: **18%**
- Approval threshold: **60** (score >= 60 = approved)
- Tenure range: **3** to **60** months

### Scoring Model
- Start with base score of **100**
- Apply penalties per risk signal
- Hard-reject on extreme inconsistencies
- Approve if `score >= 60` and no hard reject

### Thresholds

**Revenue-to-EMI Ratio:**
| Ratio | Penalty |
|-------|---------|
| >= 3.0 | 0 |
| 2.0 -- 2.99 | -10 |
| 1.5 -- 1.99 | -25 |
| 1.2 -- 1.49 | -40 |
| < 1.2 | Hard Reject |

**Loan-to-Revenue Multiple:**
| Multiple | Penalty |
|----------|---------|
| <= 4 | 0 |
| 4.01 -- 8 | -10 |
| 8.01 -- 12 | -25 |
| 12.01 -- 18 | -40 |
| > 18 | Hard Reject |

**Tenure Risk:**
- <= 6 months: -10
- >= 48 months: -10

**Inconsistency:**
- Loan-to-revenue > 50x: -30 (DATA_INCONSISTENCY)

### Reason Codes
- `LOW_REPAYMENT_CAPACITY` -- EMI too high relative to revenue
- `HIGH_LOAN_RATIO` -- Loan disproportionate to revenue
- `EXTREME_TENURE` -- Very short or very long tenure
- `DATA_INCONSISTENCY` -- Extreme mismatch in inputs
- `INVALID_PAN_FORMAT` -- Malformed PAN
- `APPROVED` -- Application meets criteria

---

## API Overview

Base URL: `/api`

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/business-profiles` | Create business profile |
| POST | `/api/loan-applications` | Create loan application |
| POST | `/api/loan-applications/:id/decision` | Evaluate and return credit decision |
| GET | `/api/loan-applications/:id` | Get application with profile and decision |
| GET | `/api/health` | Health check |

### Example: Create Business Profile
```bash
curl -X POST http://localhost:4000/api/business-profiles \
  -H "Content-Type: application/json" \
  -d '{
    "ownerName": "Amit Sharma",
    "pan": "ABCDE1234F",
    "businessType": "retail",
    "monthlyRevenueRupees": 250000
  }'
```

### Example: Evaluate Decision
```bash
curl -X POST http://localhost:4000/api/loan-applications/UUID/decision
```

See [docs/API.md](docs/API.md) for the complete API reference with all request/response schemas and error formats.

---

## Testing

```bash
cd backend

# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration
```

**Test Coverage:**
- **Unit (20 tests):** PAN validation, Money arithmetic, EMI calculation, DecisionEngine scoring, hard-reject logic
- **Integration (23 tests):** Profile creation, loan application, decision evaluation, validation errors, 404 handling, rate limiting, edge cases
- **Total: 43 tests, all passing**

### Key Test Scenarios
- Invalid PAN format rejected
- Negative/zero revenue rejected
- Invalid tenure (< 3, > 60) rejected
- Negative loan amount rejected
- Invalid UUID format rejected
- Non-existent resources return 404
- Conflicting data (high loan vs low revenue) returns REJECTED, not 500
- Boundary case (revenueToEmiRatio ~3.0) correctly approved
- Rate limiting returns 429

---

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for platform-specific guides.

**Quick Options:**

| Platform | Frontend | Backend | Database |
|----------|----------|---------|----------|
| **Docker Compose** | `localhost:5173` | `localhost:4000` | Built-in |
| **Render** | Static Site | Web Service | Render Postgres |
| **Railway** | Static Site | Service | Railway Postgres |
| **Vercel** | Project | -- | -- |
| **Neon** | -- | -- | Serverless Postgres |


**Deployed URLs:**
- Frontend: `<TODO>`
- Backend: `<TODO>`

---

## Project Structure

```text
vitto-lending-system/
  frontend/                  # React + Vite SPA
    src/
      App.jsx               # Main application
      features/
        application/
          ApplicationForm.jsx
          DecisionResult.jsx
      lib/
        api/client.js        # Axios-style fetch wrapper
    package.json
    vite.config.js

  backend/                   # Node.js + Express API
    src/
      domain/                # Pure business logic
        entities/
        value-objects/
        services/
          DecisionEngine.js
          EmiCalculator.js
        ports/
      application/           # Use cases
        dto/
        use-cases/
      adapters/              # HTTP + persistence
        http/
          controllers/
          routes/
          middleware/
        persistence/
          postgres/
          PostgresAuditLogAdapter.js
      tests/
        unit/
        integration/
    package.json
    .env.example

  docs/                      # Documentation
    ARCHITECTURE_WRITEUP.md
    Architecture_Writeup.pdf
    API.md
    DEPLOYMENT.md
    SETUP.md
    CHECKLIST.md
    EXECUTION_PLAN.md

  docker-compose.yml
  README.md
```

---

## Documentation

| Document | Purpose |
|----------|---------|
| [docs/SETUP.md](docs/SETUP.md) | Detailed local setup (manual + Docker) |
| [docs/API.md](docs/API.md) | Complete API reference |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Platform-specific deployment guides |
| [docs/ARCHITECTURE_WRITEUP.md](docs/ARCHITECTURE_WRITEUP.md) | Architecture decisions & tradeoffs |
| [docs/Architecture_Writeup.pdf](docs/Architecture_Writeup.pdf) | PDF version for submission |
| [docs/CHECKLIST.md](docs/CHECKLIST.md) | Assignment requirement checklist |
| [docs/EXECUTION_PLAN.md](docs/EXECUTION_PLAN.md) | Original implementation plan |

---

## Tradeoffs Chosen

1. **Synchronous Decisioning** -- Chosen for simplicity and reliability in a time-boxed sprint; async job queue deferred to future work.
2. **Format-Only PAN Validation** -- Real verification requires external government APIs outside assignment scope.
3. **Minimal UI** -- Prioritized clarity, correctness, and accessibility over complex visual design.
4. **Paise Storage in PostgreSQL** -- Avoids floating-point rounding issues by storing money as integers.
5. **Single Database** -- Both core state and audit trail live in PostgreSQL, simplifying deployment and reducing external dependencies.
6. **Node.js Built-in Test Runner** -- Avoids external test framework dependencies; works out of the box with Node 20+.

## What I'd Improve With More Time

- **Async Decision Processing** -- Background job queue + polling endpoint for heavy evaluations
- **Frontend Testing** -- React Testing Library tests for form validation and result rendering
- **Better Observability** -- Structured logs (Pino), metrics (Prometheus), distributed tracing
- **Model Calibration** -- Train on sample datasets for nuanced risk weights
- **Stronger Abuse Prevention** -- Per-IP rate limiting, request fingerprinting, CAPTCHA
- **Real PAN Verification** -- Integration with government verification APIs
- **Admin Dashboard** -- View audit trail, decision trends, and model performance
- **CI/CD Pipeline** -- GitHub Actions for automated testing and deployment

---

## License

This project was built as a technical assessment for **Vitto**.
