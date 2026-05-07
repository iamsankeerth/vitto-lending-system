# Vitto Lending Decision System

Lightweight end-to-end lending decision system for MSME loan applications. Collects a business profile and loan request, evaluates using an explainable scoring model, and returns a structured decision with a credit score and reason codes.

## Stack

- **Frontend:** React + Vite (JavaScript)
- **Backend:** Node.js + Express (JavaScript)
- **PostgreSQL:** System of record for profiles, applications, and decisions
- **MongoDB:** Audit trail of submissions and decisions with timestamps

## Features

- Business profile creation (owner name, PAN, business type, monthly revenue)
- Loan application creation (amount, tenure, purpose)
- Decision engine endpoint returning:
  - `APPROVED` or `REJECTED`
  - Credit score (0–100)
  - Reason codes (e.g., `LOW_REPAYMENT_CAPACITY`, `HIGH_LOAN_RATIO`)
  - Derived metrics (EMI, revenue-to-EMI ratio, loan-to-revenue multiple)
- Single-page React UI to submit and view results
- Structured validation and error responses
- Graceful handling of missing/invalid/conflicting inputs
- Rate limiting on decision endpoints
- Docker Compose for local development

## Architecture

```text
React SPA
  -> Express API (controllers + validation)
    -> Use Cases
      -> Decision Engine (pure logic)
      -> Postgres Repositories (core state)
      -> Mongo Audit Logger (events)
```

**Decision Engine Hard Boundaries:**
- Does not know about Express
- Does not know about SQL
- Does not write logs directly
- Does not fetch data itself

## Local Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or Docker)
- MongoDB 6+ (or Docker)

### Option 1: Docker Compose (Recommended)

```bash
docker-compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:4000
- PostgreSQL: localhost:5432
- MongoDB: localhost:27017

### Option 2: Manual Setup

**Backend:**

```bash
cd backend
cp .env.example .env
# Edit .env with your database URLs
npm install
# Run schema.sql against your PostgreSQL database
npm run dev
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

Create `backend/.env`:

```env
PORT=4000
NODE_ENV=development
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/vitto_lending
MONGODB_URL=mongodb://localhost:27017/vitto_lending
CORS_ORIGIN=http://localhost:5173
ANNUAL_INTEREST_RATE_PCT=18
APPROVAL_SCORE_THRESHOLD=60
```

## API Documentation

Base URL: `/api`

### `POST /api/business-profiles`

Create a business profile.

**Request:**
```json
{
  "ownerName": "Amit Sharma",
  "pan": "ABCDE1234F",
  "businessType": "retail",
  "monthlyRevenueRupees": 250000
}
```

### `POST /api/loan-applications`

Create a loan application linked to a profile.

**Request:**
```json
{
  "businessProfileId": "uuid",
  "requestedAmountRupees": 800000,
  "tenureMonths": 18,
  "purpose": "working_capital"
}
```

### `POST /api/loan-applications/:id/decision`

Evaluate a loan application and return a credit decision.

**Response:**
```json
{
  "data": {
    "applicationId": "uuid",
    "decisionId": "uuid",
    "status": "APPROVED",
    "creditScore": 74,
    "reasonCodes": ["HIGH_LOAN_RATIO"],
    "derivedMetrics": {
      "estimatedEmiRupees": 51045,
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

### `GET /api/loan-applications/:id`

Get full application details including profile and latest decision.

### Error Responses

All endpoints return consistent error envelopes:

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

**Goal:** Explainable, defensible, documented thresholds.

### Assumptions
- PAN validation is format-only (mock acceptable)
- Annual interest rate for EMI estimate: `18%`
- Approval threshold: `60`
- Tenure range: `3` to `60` months

### Signals Used
1. **Revenue-to-EMI ratio** — can the business afford monthly repayments?
2. **Loan amount as a multiple of monthly revenue** — is the loan proportional to business size?
3. **Tenure risk** — very short (≤6) or very long (≥48) tenures carry penalties
4. **Consistency checks** — extreme mismatches (e.g., ₹10k revenue + ₹1Cr loan) are hard-rejected

### Scoring Model
- Start with base score of `100`
- Apply penalties per risk signal
- Hard-reject on extreme inconsistencies
- Approve if `score >= 60` and no hard reject

### Thresholds

**Revenue-to-EMI Ratio:**
| Ratio | Penalty |
|-------|---------|
| ≥ 3.0 | 0 |
| 2.0 – 2.99 | -10 |
| 1.5 – 1.99 | -25 |
| 1.2 – 1.49 | -40 |
| < 1.2 | Hard Reject |

**Loan-to-Revenue Multiple:**
| Multiple | Penalty |
|----------|---------|
| ≤ 4 | 0 |
| 4.01 – 8 | -10 |
| 8.01 – 12 | -25 |
| 12.01 – 18 | -40 |
| > 18 | Hard Reject |

**Tenure Risk:**
- ≤ 6 months: -10
- ≥ 48 months: -10

**Inconsistency:**
- Loan-to-revenue > 50x: -30

### Reason Codes
- `LOW_REPAYMENT_CAPACITY` — EMI too high relative to revenue
- `HIGH_LOAN_RATIO` — Loan disproportionate to revenue
- `EXTREME_TENURE` — Very short or very long tenure
- `DATA_INCONSISTENCY` — Extreme mismatch in inputs
- `INVALID_PAN_FORMAT` — Malformed PAN
- `APPROVED` — Application meets criteria

## Edge Case Handling

| Scenario | Handling |
|----------|----------|
| Missing fields | Client-side + server-side validation with structured errors |
| Invalid formats | Structured validation errors (malformed PAN, negative numbers, non-numeric) |
| Conflicting data | Valid request accepted, decision rejected with explainable reason codes |
| Database failures | Graceful error responses; audit failure does not block core decision |
| Rate limiting | 429 responses on excessive decision requests |

## Testing

**Backend Unit Tests:**
```bash
cd backend
npm run test:unit
```

Tests cover:
- PAN format validation
- Money value object arithmetic
- EMI calculation correctness
- Decision engine scoring and hard-reject logic

## Deployment

- **Backend:** Render / Railway
- **Frontend:** Vercel / Netlify
- **PostgreSQL:** Neon / Supabase / Render Postgres
- **MongoDB:** MongoDB Atlas

**Deployed URLs:**
- Frontend: `<TODO>`
- Backend: `<TODO>`

## Tradeoffs Chosen

1. **Synchronous decisioning** — Chosen for simplicity and reliability in a 1-day sprint; async job queue deferred to bonus.
2. **Format-only PAN validation** — Real verification would require external integrations outside assignment scope.
3. **Minimal UI** — Prioritized clarity and correctness over complex UI states.
4. **Paise storage in Postgres** — Avoids floating-point rounding issues by storing money as integers.
5. **MongoDB audit-only** — Keeps core domain data in PostgreSQL; Mongo handles append-only audit events.

## What I'd Improve With More Time

- **Async decision processing** — Background job + polling endpoint for heavy evaluations
- **Better observability** — Structured logs, metrics, distributed tracing
- **Model calibration** — Train on sample datasets for nuanced risk weights
- **Stronger abuse prevention** — Advanced rate limiting, IP blocking, request fingerprinting
- **Real PAN verification** — Integrate with government APIs
- **Admin dashboard** — View audit trail, decision trends, and model performance

## License

This project was built as a technical assessment for Vitto.
