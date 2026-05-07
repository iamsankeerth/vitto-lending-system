# API Reference

Base URL: `http://localhost:4000/api` (or your deployed backend URL)

All endpoints return a consistent envelope:

```json
{
  "data": { ... },
  "meta": { "requestId": "uuid" }
}
```

Errors use the same envelope:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": { "field": "specific error" }
  },
  "meta": { "requestId": "uuid" }
}
```

---

## Endpoints

### 1. Health Check

**GET** `/api/health`

Check if the backend is running.

**Response:**
```json
{
  "data": { "status": "ok", "timestamp": "2026-05-07T12:00:00.000Z" },
  "meta": { "requestId": "550e8400-e29b-41d4-a716-446655440000" }
}
```

---

### 2. Create Business Profile

**POST** `/api/business-profiles`

Create a new business profile. Revenue is sent in rupees and converted to paise internally.

**Request Body:**
```json
{
  "ownerName": "Amit Sharma",
  "pan": "ABCDE1234F",
  "businessType": "retail",
  "monthlyRevenueRupees": 250000
}
```

**Validation Rules:**
| Field | Rules |
|-------|-------|
| `ownerName` | Required, non-empty string |
| `pan` | Required, must match `AAAAA9999A` format |
| `businessType` | Required, non-empty string |
| `monthlyRevenueRupees` | Required, positive number (>= 1) |

**Success Response (201):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "ownerName": "Amit Sharma",
    "pan": "ABCDE1234F",
    "businessType": "retail",
    "monthlyRevenueRupees": 250000,
    "createdAt": "2026-05-07T12:00:00.000Z"
  },
  "meta": { "requestId": "550e8400-e29b-41d4-a716-446655440000" }
}
```

**Error Response (400 -- Validation Error):**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input validation failed",
    "details": {
      "pan": "PAN must match AAAAA9999A format"
    }
  },
  "meta": { "requestId": "550e8400-e29b-41d4-a716-446655440000" }
}
```

---

### 3. Create Loan Application

**POST** `/api/loan-applications`

Create a loan application linked to an existing business profile.

**Request Body:**
```json
{
  "businessProfileId": "550e8400-e29b-41d4-a716-446655440001",
  "requestedAmountRupees": 800000,
  "tenureMonths": 18,
  "purpose": "working_capital"
}
```

**Validation Rules:**
| Field | Rules |
|-------|-------|
| `businessProfileId` | Required, valid UUID v4 |
| `requestedAmountRupees` | Required, positive number (>= 1) |
| `tenureMonths` | Required, integer between 3 and 60 |
| `purpose` | Required, non-empty string |

**Success Response (201):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "businessProfileId": "550e8400-e29b-41d4-a716-446655440001",
    "requestedAmountRupees": 800000,
    "tenureMonths": 18,
    "purpose": "working_capital",
    "status": "pending",
    "createdAt": "2026-05-07T12:00:00.000Z"
  },
  "meta": { "requestId": "550e8400-e29b-41d4-a716-446655440000" }
}
```

**Error Response (400 -- Validation Error):**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input validation failed",
    "details": {
      "tenureMonths": "Tenure must be between 3 and 60 months"
    }
  },
  "meta": { "requestId": "550e8400-e29b-41d4-a716-446655440000" }
}
```

**Error Response (404 -- Profile Not Found):**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Business profile not found"
  },
  "meta": { "requestId": "550e8400-e29b-41d4-a716-446655440000" }
}
```

---

### 4. Evaluate Loan Application

**POST** `/api/loan-applications/:id/decision`

Run the decision engine on a loan application. Returns a credit score, approval status, reason codes, and derived metrics.

**Path Parameters:**
| Parameter | Description |
|-----------|-------------|
| `id` | Loan application UUID |

**Success Response (201):**
```json
{
  "data": {
    "applicationId": "550e8400-e29b-41d4-a716-446655440002",
    "decisionId": "550e8400-e29b-41d4-a716-446655440003",
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
  "meta": { "requestId": "550e8400-e29b-41d4-a716-446655440000" }
}
```

**Rejected Example:**
```json
{
  "data": {
    "applicationId": "550e8400-e29b-41d4-a716-446655440002",
    "decisionId": "550e8400-e29b-41d4-a716-446655440003",
    "status": "REJECTED",
    "creditScore": 35,
    "reasonCodes": ["LOW_REPAYMENT_CAPACITY", "HIGH_LOAN_RATIO"],
    "derivedMetrics": {
      "estimatedEmiRupees": 85000,
      "revenueToEmiRatio": 1.18,
      "loanToRevenueMultiple": 12.5,
      "annualInterestRatePct": 18
    },
    "createdAt": "2026-05-07T12:03:00.000Z"
  },
  "meta": { "requestId": "550e8400-e29b-41d4-a716-446655440000" }
}
```

**Error Response (404 -- Application Not Found):**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Loan application not found"
  },
  "meta": { "requestId": "550e8400-e29b-41d4-a716-446655440000" }
}
```

**Error Response (429 -- Rate Limited):**
```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests, please try again later."
  },
  "meta": { "requestId": "550e8400-e29b-41d4-a716-446655440000" }
}
```

**Rate Limits:**
- Decision endpoint: 100 requests per minute per IP (10 in production)

---

### 5. Get Loan Application Details

**GET** `/api/loan-applications/:id`

Retrieve a loan application with its linked business profile and latest credit decision.

**Path Parameters:**
| Parameter | Description |
|-----------|-------------|
| `id` | Loan application UUID |

**Success Response (200):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "businessProfileId": "550e8400-e29b-41d4-a716-446655440001",
    "requestedAmountRupees": 800000,
    "tenureMonths": 18,
    "purpose": "working_capital",
    "status": "decided",
    "createdAt": "2026-05-07T12:00:00.000Z",
    "businessProfile": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "ownerName": "Amit Sharma",
      "pan": "ABCDE1234F",
      "businessType": "retail",
      "monthlyRevenueRupees": 250000,
      "createdAt": "2026-05-07T12:00:00.000Z"
    },
    "decision": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "decisionStatus": "APPROVED",
      "creditScore": 74,
      "reasonCodes": ["HIGH_LOAN_RATIO"],
      "derivedMetrics": {
        "estimatedEmiRupees": 51045,
        "revenueToEmiRatio": 4.91,
        "loanToRevenueMultiple": 3.2,
        "annualInterestRatePct": 18
      },
      "createdAt": "2026-05-07T12:03:00.000Z"
    }
  },
  "meta": { "requestId": "550e8400-e29b-41d4-a716-446655440000" }
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Input failed schema validation |
| `NOT_FOUND` | 404 | Resource does not exist |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Request/Response Headers

All responses include:
```
Content-Type: application/json
X-Request-Id: <uuid>
```

---

## cURL Examples

### Complete Flow

```bash
# 1. Create business profile
PROFILE=$(curl -s -X POST http://localhost:4000/api/business-profiles \
  -H "Content-Type: application/json" \
  -d '{
    "ownerName": "Amit Sharma",
    "pan": "ABCDE1234F",
    "businessType": "retail",
    "monthlyRevenueRupees": 250000
  }')
PROFILE_ID=$(echo $PROFILE | grep -oP '"id":"\K[^"]+')

# 2. Create loan application
APP=$(curl -s -X POST http://localhost:4000/api/loan-applications \
  -H "Content-Type: application/json" \
  -d "{
    \"businessProfileId\": \"$PROFILE_ID\",
    \"requestedAmountRupees\": 800000,
    \"tenureMonths\": 18,
    \"purpose\": \"working_capital\"
  }")
APP_ID=$(echo $APP | grep -oP '"id":"\K[^"]+')

# 3. Get decision
curl -s -X POST "http://localhost:4000/api/loan-applications/$APP_ID/decision" | jq

# 4. Get full details
curl -s "http://localhost:4000/api/loan-applications/$APP_ID" | jq
```

### Test Validation Errors

```bash
# Invalid PAN
curl -s -X POST http://localhost:4000/api/business-profiles \
  -H "Content-Type: application/json" \
  -d '{"ownerName":"Test","pan":"INVALID","businessType":"retail","monthlyRevenueRupees":100000}' | jq

# Negative revenue
curl -s -X POST http://localhost:4000/api/business-profiles \
  -H "Content-Type: application/json" \
  -d '{"ownerName":"Test","pan":"ABCDE1234F","businessType":"retail","monthlyRevenueRupees":-1000}' | jq

# Invalid tenure (too short)
curl -s -X POST http://localhost:4000/api/loan-applications \
  -H "Content-Type: application/json" \
  -d '{"businessProfileId":"550e8400-e29b-41d4-a716-446655440000","requestedAmountRupees":100000,"tenureMonths":2,"purpose":"test"}' | jq
```
