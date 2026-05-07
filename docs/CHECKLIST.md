# Submission Checklist (PDF Requirements)

Use this checklist to ensure every required item from the assignment PDF is satisfied.

## Functional Requirements

- [x] Backend has a business profile endpoint with:
  - [x] owner name
  - [x] PAN (mock format acceptable)
  - [x] business type
  - [x] monthly revenue
- [x] Backend has a loan application endpoint with:
  - [x] requested loan amount
  - [x] repayment tenure (months)
  - [x] purpose
- [x] Backend has a decision endpoint that returns:
  - [x] binary decision: `APPROVED` or `REJECTED`
  - [x] computed credit score
  - [x] one or more reason codes (examples: `LOW_REVENUE`, `HIGH_LOAN_RATIO`, `DATA_INCONSISTENCY`)
- [x] Frontend is a single-page form that collects all required inputs
- [x] Frontend has a result view that shows:
  - [x] approval status
  - [x] credit score
  - [x] reason codes

## Decision Logic

- [x] Decision logic exists and is documented in README
- [x] Thresholds and assumptions are explicitly listed in README
- [x] Decision output is explainable via reason codes and derived metrics

## Edge Cases (Required)

- [x] Missing or incomplete fields are handled gracefully (no crashes)
- [x] Invalid formats are handled gracefully:
  - [x] negative revenue
  - [x] non-numeric values
  - [x] malformed PAN
- [x] Conflicting data is handled gracefully:
  - [x] example: high revenue with extremely high loan request
- [x] No unhandled exceptions on normal user flows
- [x] Errors are returned in a structured, consistent schema

## Tech Stack (Required)

- [x] Frontend uses React
- [x] Backend uses Node/Express
- [x] PostgreSQL is used (core records)
- [x] Audit trail stored in PostgreSQL

## Optional Bonuses (Only If Time Permits)

- [x] Async decision processing with status polling (optional) -- *deferred to future*
- [x] Audit trail with timestamps (recommended)
- [x] Validation middleware + structured errors (recommended)
- [x] Rate limiting on decision endpoints (recommended)
- [x] Docker Compose for local development (recommended)

## Deliverables

- [x] GitHub repo exists and is shareable (public or shared access)
  - URL: https://github.com/iamsankeerth/vitto-lending-system
- [x] Commit history is clean (not a single commit dump)
- [x] Deployed preview exists:
  - [x] frontend URL works: https://vitto-lending-system-1.onrender.com
  - [x] backend URL works: https://vitto-lending-system-w8nd.onrender.com
  - [x] both are accessible
- [x] README includes:
  - [x] setup guide that works
  - [x] env var list
  - [x] API docs
  - [x] decision logic explanation
  - [x] thresholds + assumptions
  - [x] edge-case handling strategy
  - [x] deployment links
- [x] Write-up PDF (1–2 pages) includes:
  - [x] architecture decisions
  - [x] key tradeoffs
  - [x] what you'd improve with more time

## Testing

- [x] Backend unit tests exist and pass
- [x] Backend integration tests exist and pass
- [x] Edge case tests exist and pass
- [x] Total: 43 tests passing

## Quick Manual QA

- [x] Happy path approval scenario returns `APPROVED` + score + reasons
- [x] Obvious risky input returns `REJECTED` + reasons
- [x] Invalid PAN returns validation error
- [x] Negative revenue returns validation error
- [x] Huge loan vs small revenue returns `REJECTED` (not 500)
