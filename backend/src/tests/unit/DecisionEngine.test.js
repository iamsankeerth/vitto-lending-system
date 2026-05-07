import { describe, it } from 'node:test';
import assert from 'node:assert';
import { DecisionEngine } from '../../domain/services/DecisionEngine.js';
import { BusinessProfile } from '../../domain/entities/BusinessProfile.js';
import { LoanApplication } from '../../domain/entities/LoanApplication.js';
import { ReasonCodes } from '../../domain/constants/ReasonCodes.js';

describe('DecisionEngine', () => {
  const engine = new DecisionEngine(18);

  function createProfile(revenueRupees) {
    return new BusinessProfile({
      id: 'profile-1',
      ownerName: 'Test',
      pan: 'ABCDE1234F',
      businessType: 'retail',
      monthlyRevenuePaise: revenueRupees * 100,
    });
  }

  function createLoan(amountRupees, tenureMonths = 18) {
    return new LoanApplication({
      id: 'loan-1',
      businessProfileId: 'profile-1',
      requestedAmountPaise: amountRupees * 100,
      tenureMonths,
      purpose: 'working_capital',
    });
  }

  it('should approve safe profile', () => {
    const profile = createProfile(500000); // 5L monthly
    const loan = createLoan(500000, 12); // 5L loan
    const result = engine.evaluate(profile, loan);
    assert.strictEqual(result.status, 'APPROVED');
    assert.ok(result.creditScore >= 60);
  });

  it('should reject high loan ratio', () => {
    const profile = createProfile(50000); // 50k monthly
    const loan = createLoan(5000000, 18); // 50L loan
    const result = engine.evaluate(profile, loan);
    assert.strictEqual(result.status, 'REJECTED');
    assert.ok(result.reasonCodes.includes(ReasonCodes.HIGH_LOAN_RATIO) || result.reasonCodes.includes(ReasonCodes.LOW_REPAYMENT_CAPACITY));
  });

  it('should penalize very short tenure', () => {
    const profile = createProfile(500000);
    const loan = createLoan(500000, 3);
    const result = engine.evaluate(profile, loan);
    assert.ok(result.reasonCodes.includes(ReasonCodes.EXTREME_TENURE));
  });

  it('should penalize very long tenure', () => {
    const profile = createProfile(500000);
    const loan = createLoan(500000, 60);
    const result = engine.evaluate(profile, loan);
    assert.ok(result.reasonCodes.includes(ReasonCodes.EXTREME_TENURE));
  });

  it('should return derived metrics', () => {
    const profile = createProfile(250000);
    const loan = createLoan(800000, 18);
    const result = engine.evaluate(profile, loan);
    assert.ok(result.derivedMetrics.estimatedEmiRupees > 0);
    assert.ok(result.derivedMetrics.revenueToEmiRatio > 0);
    assert.ok(result.derivedMetrics.loanToRevenueMultiple > 0);
    assert.strictEqual(result.derivedMetrics.annualInterestRatePct, 18);
  });

  it('should hard reject extreme inconsistency', () => {
    const profile = createProfile(10000); // 10k monthly
    const loan = createLoan(10000000, 18); // 1Cr loan
    const result = engine.evaluate(profile, loan);
    assert.strictEqual(result.status, 'REJECTED');
    assert.ok(result.reasonCodes.includes(ReasonCodes.DATA_INCONSISTENCY));
  });
});