# Hour-By-Hour Build Plan (1-Day Sprint)

This schedule targets all required deliverables from the assignment PDF:
- Working React frontend (single-page form + result view)
- Working Node/Express backend (profile + application + decision endpoints)
- PostgreSQL + MongoDB used
- Deployed preview (frontend + backend accessible)
- README (setup + API docs + decision logic)
- 1–2 page write-up PDF (architecture + tradeoffs + improvements)

Assumptions:
- You have accounts ready for deployment targets (Vercel/Netlify + Render/Railway + Neon/Supabase + Mongo Atlas).
- You keep scope tight (no auth, no queue, no webhooks unless time remains).

## Hour 1: Repo + Backend Skeleton

- Create repo folders: `frontend/`, `backend/`, `shared/`, `docs/`
- Backend: initialize `backend/package.json`
- Add `backend/src/app.js` with Express app, JSON body parsing, CORS, and a `/api/health` route
- Add request ID middleware and a centralized error handler (structured errors)
- Create `.env.example` and basic env loader

Exit criteria:
- `GET /api/health` returns `{ data: { status: "ok" }, meta: { requestId } }`

## Hour 2: DB Wiring + Schema

- PostgreSQL: add connection pool module and `schema.sql`
- MongoDB: add Mongo client and an audit logger adapter stub
- Decide money storage: accept rupees from API, store paise in Postgres (integers)

Exit criteria:
- Backend can connect to both DBs locally (or at least via env values)
- Schema file exists and is runnable

## Hour 3: Domain Core (Pure Logic)

- Implement value objects:
  - `PanNumber` (format check only)
  - `Money` (positive integers in paise)
  - `TenureMonths` (3..60)
- Implement `EmiCalculator` (fixed annual rate 18%)
- Implement `DecisionEngine` as a pure function/service

Hard rule:
- `DecisionEngine` must not know about Express, SQL, logging, or data fetching.

Exit criteria:
- Unit tests for EMI + PAN + basic scoring pass (even if minimal at first)

## Hour 4: Persistence + Use Cases

- Implement repository ports + Postgres adapters:
  - `BusinessProfileRepository`
  - `LoanApplicationRepository`
  - `CreditDecisionRepository`
- Implement use cases:
  - create profile
  - create application
  - evaluate application (loads data, calls decision engine, persists decision)
  - get application details (stitches profile + application + latest decision)
- Implement Mongo audit adapter:
  - `AUDIT_EVENT` on create profile/application/decision
- Define audit failure behavior:
  - if audit write fails after Postgres commit, request still succeeds (log server-side)

Exit criteria:
- You can create profile + application in Postgres
- You can generate a decision and persist it

## Hour 5: HTTP Layer (Routes + Validation)

- Add `POST /api/business-profiles`
- Add `POST /api/loan-applications`
- Add `POST /api/loan-applications/:id/decision`
- Add `GET /api/loan-applications/:id`
- Add validation middleware (zod/joi) with structured field errors
- Add rate limiting on decision endpoint (optional but recommended)

Exit criteria:
- All endpoints respond with consistent success/error envelopes
- Invalid inputs return `VALIDATION_ERROR` without crashing

## Hour 6: Integration Tests (Backend)

- Add integration tests for:
  - invalid PAN rejected
  - negative revenue rejected
  - conflicting data returns a clean rejection decision (no 500)
  - decision includes status + score + reason codes

Exit criteria:
- Tests cover the required edge cases from the PDF

## Hour 7: Frontend Skeleton (React + Vite, JS only)

- Initialize `frontend/` with Vite React template (JS)
- Create single page with:
  - business profile section
  - loan section
  - submit button
- Add basic styling for readability and clarity

Exit criteria:
- UI renders and accepts inputs (no backend wiring required yet)

## Hour 8: Frontend Wiring (API Flow + Result View)

- Implement API client and endpoint calls:
  - create profile
  - create application
  - request decision
- Build `DecisionResult` panel:
  - approved/rejected banner
  - credit score
  - reason code chips
  - derived metrics grid
- Handle loading state and structured server errors

Exit criteria:
- End-to-end happy path works locally (frontend -> backend -> DBs -> result)

## Hour 9: Frontend Validation + UX Polish

- Client-side validation:
  - required fields
  - PAN format
  - positive numbers
  - tenure range
- Add clear error messages and disable submit during processing
- Add "Start new application" reset

Exit criteria:
- Missing/invalid fields handled gracefully before submit
- Server-side errors displayed cleanly

## Hour 10: Deployment (Backend First)

- Deploy backend to Render/Railway
- Set env vars for DB URLs and CORS origin
- Verify `/api/health`
- Verify decision flow against deployed backend using curl/Postman

Exit criteria:
- Live backend URL works and is stable

## Hour 11: Deployment (Frontend)

- Deploy frontend to Vercel/Netlify
- Configure frontend to call deployed backend URL
- Verify end-to-end flow using deployed frontend

Exit criteria:
- Live frontend URL works end-to-end

## Hour 12: Documentation + Write-up PDF

- Finalize README:
  - setup steps
  - env vars
  - API docs
  - decision logic + thresholds
  - edge-case handling
  - deployment links
- Produce 1–2 page write-up PDF:
  - architecture
  - tradeoffs
  - what you would improve

Exit criteria:
- All deliverables are ready to submit (GitHub + deployed URLs + README + PDF)

