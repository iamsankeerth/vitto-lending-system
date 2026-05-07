export const DecisionThresholds = {
  baseScore: 100,
  approvalThreshold: 60,
  minTenureMonths: 3,
  maxTenureMonths: 60,
  revenueToEmiThresholds: [
    { min: 3.0, penalty: 0 },
    { min: 2.0, penalty: -10 },
    { min: 1.5, penalty: -25 },
    { min: 1.2, penalty: -40 },
    { min: 0, penalty: null, hardReject: true },
  ],
  loanToRevenueThresholds: [
    { max: 4, penalty: 0 },
    { max: 8, penalty: -10 },
    { max: 12, penalty: -25 },
    { max: 18, penalty: -40 },
    { max: Infinity, penalty: null, hardReject: true },
  ],
  tenurePenalties: {
    veryShort: { max: 6, penalty: -10 },
    veryLong: { min: 48, penalty: -10 },
  },
  inconsistencyThreshold: 50,
  inconsistencyPenalty: -30,
};