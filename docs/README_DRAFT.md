# Vitto Lending Decision System

Lightweight end-to-end lending decision system for MSME loan applications. Collects a business profile and loan request, evaluates using an explainable scoring model, and returns a structured decision with a credit score and reason codes.

## Stack

- Frontend: React + Vite (JavaScript)
- Backend: Node.js + Express (JavaScript)
- PostgreSQL: system of record
- MongoDB: audit trail

## Features

- Business profile creation (owner name, PAN, business type, monthly revenue)
- Loan application creation (amount, tenure, purpose)
- Decision engine endpoint returning:
  - `APPROVED` or `REJECTED`
  - credit score
  - reason codes
  - derived metrics (EMI, ratios)
- Single-page React UI to submit and view results
- Structured validation and error responses
- Graceful handling of missing/invalid/conflicting inputs

## Architecture (High Level)

```text
React SPA
  -> Express API (controllers + validation)
    -> Use cases
      -> Decision engine (pure logic)
      -> Postgres repositories (core state)
      -> Mongo audit logger (events)
```

Decision engine hard boundaries (non-responsibilities):
- does not know about Express
- does not know about SQL
- does not write logs directly
- does not fetch data itself

## Local Setup

### Prerequisites

- Node.js (18+ recommended)
- PostgreSQL
- MongoDB

### Backend

1. Install dependencies
2. Set env vars
3. Apply schema to Postgres
4. Run the server

Example env (`backend/.env`):

```env
PORT=4000
NODE_ENV=development
POSTGRES_URL=postgres://USER:PASSWORD@HOST:5432/DB
MONGODB_URL=mongodb+srv://USER:PASSWORD@HOST/DB
CORS_ORIGIN=http://localhost:5173
ANNUAL_INTEREST_RATE_PCT=18
APPROVAL_SCORE_THRESHOLD=60
```

### Frontend

1. Install dependencies
2. Start dev server

Frontend config:
- Set API base URL to `http://localhost:4000` in `frontend/src/lib/api/client.js`

## API

Base URL: `/api`

### `POST /api/business-profiles`

Request:

```json
{
  "ownerName": "Amit Sharma",
  "pan": "ABCDE1234F",
  "businessType": "retail",
  "monthlyRevenueRupees": 250000
}
```

### `POST /api/loan-applications`

Request:

```json
{
  "businessProfileId": "uuid",
  "requestedAmountRupees": 800000,
  "tenureMonths": 18,
  "purpose": "working_capital"
}
```

### `POST /api/loan-applications/:id/decision`

Response (example):

```json
{
  "data": {
    "applicationId": "uuid",
    "decisionId": "uuid",
    "status": "APPROVED",
    "creditScore": 74,
    "reasonCodes": ["HIGH_LOAN_RATIO"],
    "derivedMetrics": {
      "estimatedEmiRupees": 50918,
      "revenueToEmiRatio": 4.91,
      "loanToRevenueMultiple": 3.2,
      "annualInterestRatePct": 18
    },
    "createdAt": "2026-05-07T12:03:00.000Z"
  },
  "meta": {
    "requestId": "uuid"
  }
}
```

### Error Responses (all endpoints)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input validation failed",
    "details": {
      "pan": "PAN must match AAAAA9999A format"
    }
  },
  "meta": {
    "requestId": "uuid"
  }
}
```

## Decision Logic

Goal: explainable, defensible, documented thresholds.

Assumptions:
- PAN validation is format-only (mock acceptable)
- Annual interest rate used for EMI estimate: `18%`
- Approval threshold: `60`
- Tenure range: `3` to `60` months

Signals used:
- Revenue-to-EMI ratio
- Loan amount as a multiple of monthly revenue
- Tenure risk
- Consistency checks (extreme mismatch)

Reason codes (examples):
- `LOW_REPAYMENT_CAPACITY`
- `HIGH_LOAN_RATIO`
- `EXTREME_TENURE`
- `DATA_INCONSISTENCY`
- `INVALID_PAN_FORMAT`

## Edge Case Handling

- Missing fields: client + server validation
- Invalid formats: structured validation errors (no crashes)
- Conflicting data: rejected decisions with reason codes (no 500s)

## Deployment

- Backend: Render/Railway
- Frontend: Vercel/Netlify
- PostgreSQL: Neon/Supabase/Render Postgres
- MongoDB: MongoDB Atlas

Add your deployed URLs here:
- Frontend: `<TODO>`
- Backend: `<TODO>`

## What I’d Improve With More Time

- Async decision processing (background job + polling)
- Better observability (metrics, tracing)
- More realistic model calibration with data
- Stronger abuse prevention (advanced rate limiting)

