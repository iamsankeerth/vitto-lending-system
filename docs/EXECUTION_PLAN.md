# Vitto Lending System Execution Plan

## Final Stack

- Frontend: `React + Vite + JavaScript`
- Backend: `Node.js + Express + JavaScript`
- Databases: `PostgreSQL + MongoDB`

## Repo Structure

```text
vitto-lending-system/
  frontend/
    index.html
    package.json
    vite.config.js
    src/
      main.jsx
      App.jsx
      styles.css
      components/
        SectionCard.jsx
        Field.jsx
        NumberField.jsx
        SubmitButton.jsx
        ResultBanner.jsx
        ReasonCodeChips.jsx
        MetricsGrid.jsx
        ErrorAlert.jsx
      features/
        application/
          ApplicationForm.jsx
          DecisionResult.jsx
          applicationSchema.js
          applicationMapper.js
      lib/
        api/
          client.js
          endpoints.js
        validation/
          pan.js
      tests/
        ApplicationForm.test.jsx
        DecisionResult.test.jsx

  backend/
    package.json
    .env.example
    src/
      index.js
      app.js
      domain/
        entities/
          BusinessProfile.js
          LoanApplication.js
          CreditDecision.js
        value-objects/
          PanNumber.js
          Money.js
          TenureMonths.js
        services/
          DecisionEngine.js
          EmiCalculator.js
        ports/
          BusinessProfileRepository.js
          LoanApplicationRepository.js
          CreditDecisionRepository.js
          AuditLogPort.js
        constants/
          ReasonCodes.js
          DecisionThresholds.js
        errors/
          DomainValidationError.js
      application/
        dto/
          CreateBusinessProfileDto.js
          CreateLoanApplicationDto.js
          EvaluateLoanApplicationDto.js
          GetLoanApplicationDto.js
        use-cases/
          CreateBusinessProfileUseCase.js
          CreateLoanApplicationUseCase.js
          EvaluateLoanApplicationUseCase.js
          GetLoanApplicationDetailsUseCase.js
      adapters/
        http/
          controllers/
            BusinessProfileController.js
            LoanApplicationController.js
            DecisionController.js
          routes/
            businessProfileRoutes.js
            loanApplicationRoutes.js
            healthRoutes.js
          middleware/
            requestId.js
            errorHandler.js
            validateBody.js
            notFound.js
            rateLimit.js
          presenters/
            ApiPresenter.js
        persistence/
          postgres/
            PostgresBusinessProfileRepository.js
            PostgresLoanApplicationRepository.js
            PostgresCreditDecisionRepository.js
            schema.sql
            pool.js
          mongo/
            MongoAuditLogAdapter.js
            client.js
      infrastructure/
        config/
          env.js
        logging/
          logger.js
      tests/
        unit/
          PanNumber.test.js
          Money.test.js
          EmiCalculator.test.js
          DecisionEngine.test.js
        integration/
          businessProfileRoutes.test.js
          loanApplicationRoutes.test.js
          decisionRoutes.test.js

  shared/
    constants/
      reasonCodes.js
      businessTypes.js
      purposeTypes.js
    contracts/
      requests.js
      responses.js

  README.md
  docker-compose.yml
  docs/
    architecture-writeup.md
```

## Architecture

Use a lightweight Clean Architecture shape:

```text
React SPA
  -> Express Controllers
    -> Use Cases
      -> Decision Engine
      -> Repository Ports
        -> PostgreSQL Adapters
        -> MongoDB Audit Adapter
```

Important boundary for the core engine:

The `DecisionEngine` must **not**:
- know about Express
- know about SQL
- write logs directly
- fetch data itself

It should only:
- accept loaded domain objects
- compute derived metrics
- apply rules
- return decision output

## Backend Endpoints

1. `POST /api/business-profiles`
2. `POST /api/loan-applications`
3. `POST /api/loan-applications/:id/decision`
4. `GET /api/loan-applications/:id`
5. `GET /api/health`

## Request/Response Contracts

`POST /api/business-profiles`

```json
{
  "ownerName": "Amit Sharma",
  "pan": "ABCDE1234F",
  "businessType": "retail",
  "monthlyRevenueRupees": 250000
}
```

`POST /api/loan-applications`

```json
{
  "businessProfileId": "uuid",
  "requestedAmountRupees": 800000,
  "tenureMonths": 18,
  "purpose": "working_capital"
}
```

`POST /api/loan-applications/:id/decision`

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

Error shape:

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

## Database Plan

PostgreSQL tables:
- `business_profiles`
- `loan_applications`
- `credit_decisions`

MongoDB collection:
- `audit_events`

Ownership:
- Postgres = source of truth
- MongoDB = audit trail only

## PostgreSQL Schema

`business_profiles`

```sql
CREATE TABLE business_profiles (
  id UUID PRIMARY KEY,
  owner_name TEXT NOT NULL,
  pan VARCHAR(10) NOT NULL,
  business_type TEXT NOT NULL,
  monthly_revenue_paise BIGINT NOT NULL CHECK (monthly_revenue_paise > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

`loan_applications`

```sql
CREATE TABLE loan_applications (
  id UUID PRIMARY KEY,
  business_profile_id UUID NOT NULL REFERENCES business_profiles(id),
  requested_amount_paise BIGINT NOT NULL CHECK (requested_amount_paise > 0),
  tenure_months INT NOT NULL CHECK (tenure_months BETWEEN 3 AND 60),
  purpose TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

`credit_decisions`

```sql
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

## MongoDB Audit Event Shape

```json
{
  "eventType": "DECISION_CREATED",
  "requestId": "uuid",
  "businessProfileId": "uuid",
  "loanApplicationId": "uuid",
  "decisionId": "uuid",
  "payload": {
    "request": {},
    "response": {}
  },
  "createdAt": "2026-05-07T12:03:00.000Z"
}
```

## Decision Logic

Fixed assumptions:
- annual interest rate = `18%`
- approval threshold = `60`
- tenure range = `3` to `60`
- PAN is format-validated only

Signals:
- revenue-to-EMI ratio
- loan-to-revenue multiple
- tenure risk
- inconsistency/fraud-style checks

Reason codes:
- `LOW_REVENUE`
- `HIGH_LOAN_RATIO`
- `LOW_REPAYMENT_CAPACITY`
- `EXTREME_TENURE`
- `DATA_INCONSISTENCY`
- `INVALID_PAN_FORMAT`

Scoring:
- start at `100`
- subtract penalties
- hard reject impossible cases
- approve if `score >= 60` and no hard reject

Suggested thresholds:
- `revenueToEmiRatio >= 3.0` -> `0`
- `2.0 - 2.99` -> `-10`
- `1.5 - 1.99` -> `-25`
- `1.2 - 1.49` -> `-40`
- `< 1.2` -> reject

- `loanToRevenueMultiple <= 4` -> `0`
- `4.01 - 8` -> `-10`
- `8.01 - 12` -> `-25`
- `12.01 - 18` -> `-40`
- `> 18` -> reject

## Frontend Plan

Single-page React app with:
- business profile section
- loan application section
- submit button
- inline validation
- decision result panel

Main files:
- `App.jsx`
- `ApplicationForm.jsx`
- `DecisionResult.jsx`
- `client.js`

Frontend flow:

```text
Submit form
  -> create profile
  -> create application
  -> request decision
  -> render result
```

## Validation Plan

Frontend and backend both validate:
- owner name required
- PAN required and correctly formatted
- business type required
- revenue must be positive
- requested amount must be positive
- tenure must be between `3` and `60`
- purpose required

Use:
- frontend: simple schema validation in JS
- backend: `zod` or `joi`

## Testing Plan

Backend unit tests:
- PAN validation
- money validation
- EMI calculation
- score calculation
- hard reject logic
- reason code generation

Backend integration tests:
- profile creation success
- invalid PAN rejected
- loan application success
- negative revenue rejected
- huge inconsistent loan rejected cleanly
- decision endpoint returns status + score + reasons
- application details endpoint returns stitched object

Frontend tests:
- required fields validation
- invalid PAN display
- happy path form submit
- rejected result render
- backend error render

## Implementation Order

1. Create repo structure
2. Set up Express app
3. Set up Postgres + Mongo connections
4. Add SQL schema
5. Build domain value objects
6. Build entities
7. Build `EmiCalculator.js`
8. Build `DecisionEngine.js`
9. Write core unit tests
10. Build repository interfaces
11. Implement Postgres repositories
12. Implement Mongo audit adapter
13. Build use cases
14. Build validation middleware
15. Build controllers and routes
16. Add integration tests
17. Set up React app
18. Build form UI
19. Build API client
20. Build result UI
21. Add frontend tests
22. Add rate limiting and error middleware
23. Add Docker Compose
24. Deploy backend
25. Deploy frontend
26. Write README
27. Write architecture PDF

## Deployment

- Frontend: `Vercel`
- Backend: `Render`
- PostgreSQL: `Neon` or `Render Postgres`
- MongoDB: `MongoDB Atlas`

## Env Vars

```env
PORT=4000
NODE_ENV=production
POSTGRES_URL=...
MONGODB_URL=...
CORS_ORIGIN=...
ANNUAL_INTEREST_RATE_PCT=18
APPROVAL_SCORE_THRESHOLD=60
```

## README Must Include

- overview
- architecture
- setup instructions
- env vars
- API docs
- decision logic explanation
- thresholds
- edge-case handling
- deployment links
- tradeoffs

## Write-Up PDF Must Include

- why React + Node/Express were used
- why Postgres is primary
- why MongoDB is audit-only
- why the decision engine is isolated
- scoring assumptions
- tradeoffs
- what to improve with more time

## Definition of Done

The project is done only if:
- React frontend works
- Express backend works
- PostgreSQL is used
- MongoDB is used
- all required endpoints exist
- decision returns binary outcome + score + reasons
- single-page form exists
- result screen exists
- invalid/missing/conflicting inputs are handled gracefully
- frontend deployed
- backend deployed
- README complete
- write-up PDF complete
