# Submission Checklist (PDF Requirements)

Use this checklist to ensure every required item from the assignment PDF is satisfied.

## Functional Requirements

- Backend has a business profile endpoint with:
  - owner name
  - PAN (mock format acceptable)
  - business type
  - monthly revenue
- Backend has a loan application endpoint with:
  - requested loan amount
  - repayment tenure (months)
  - purpose
- Backend has a decision endpoint that returns:
  - binary decision: `APPROVED` or `REJECTED`
  - computed credit score
  - one or more reason codes (examples: `LOW_REVENUE`, `HIGH_LOAN_RATIO`, `DATA_INCONSISTENCY`)
- Frontend is a single-page form that collects all required inputs
- Frontend has a result view that shows:
  - approval status
  - credit score
  - reason codes

## Decision Logic

- Decision logic exists and is documented in README
- Thresholds and assumptions are explicitly listed in README
- Decision output is explainable via reason codes and derived metrics

## Edge Cases (Required)

- Missing or incomplete fields are handled gracefully (no crashes)
- Invalid formats are handled gracefully:
  - negative revenue
  - non-numeric values
  - malformed PAN
- Conflicting data is handled gracefully:
  - example: high revenue with extremely high loan request
- No unhandled exceptions on normal user flows
- Errors are returned in a structured, consistent schema

## Tech Stack (Required)

- Frontend uses React
- Backend uses Node/Express
- PostgreSQL is used (core records)
- MongoDB is used (audit trail)

## Optional Bonuses (Only If Time Permits)

- Async decision processing with status polling (optional)
- Audit trail with timestamps (recommended; satisfies MongoDB purpose cleanly)
- Validation middleware + structured errors (recommended)
- Rate limiting on decision endpoints (recommended)
- Docker Compose for local development (recommended)

## Deliverables

- GitHub repo exists and is shareable (public or shared access)
- Commit history is clean (not a single commit dump)
- Deployed preview exists:
  - frontend URL works
  - backend URL works
  - both are accessible
- README includes:
  - setup guide that works
  - env var list
  - API docs
  - decision logic explanation
  - thresholds + assumptions
  - edge-case handling strategy
  - deployment links
- Write-up PDF (1–2 pages) includes:
  - architecture decisions
  - key tradeoffs
  - what you'd improve with more time

## Quick Manual QA

- Happy path approval scenario returns `APPROVED` + score + reasons
- Obvious risky input returns `REJECTED` + reasons
- Invalid PAN returns validation error
- Negative revenue returns validation error
- Huge loan vs small revenue returns `REJECTED` (not 500)

