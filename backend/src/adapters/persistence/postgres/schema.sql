CREATE TABLE IF NOT EXISTS business_profiles (
  id UUID PRIMARY KEY,
  owner_name TEXT NOT NULL,
  pan VARCHAR(10) NOT NULL,
  business_type TEXT NOT NULL,
  monthly_revenue_paise BIGINT NOT NULL CHECK (monthly_revenue_paise > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loan_applications (
  id UUID PRIMARY KEY,
  business_profile_id UUID NOT NULL REFERENCES business_profiles(id),
  requested_amount_paise BIGINT NOT NULL CHECK (requested_amount_paise > 0),
  tenure_months INT NOT NULL CHECK (tenure_months BETWEEN 3 AND 60),
  purpose TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS credit_decisions (
  id UUID PRIMARY KEY,
  loan_application_id UUID NOT NULL REFERENCES loan_applications(id) UNIQUE,
  decision_status TEXT NOT NULL,
  credit_score INT NOT NULL CHECK (credit_score BETWEEN 0 AND 100),
  reason_codes JSONB NOT NULL,
  estimated_emi_paise BIGINT NOT NULL,
  derived_metrics_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);