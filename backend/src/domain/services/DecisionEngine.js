import { ReasonCodes } from '../constants/ReasonCodes.js';
import { DecisionThresholds } from '../constants/DecisionThresholds.js';
import { EmiCalculator } from './EmiCalculator.js';

export class DecisionEngine {
  constructor(annualInterestRatePct) {
    this.emiCalculator = new EmiCalculator(annualInterestRatePct);
  }

  evaluate(businessProfile, loanApplication) {
    const revenueRupees = businessProfile.getMonthlyRevenueRupees();
    const loanRupees = loanApplication.getRequestedAmountRupees();
    const tenure = loanApplication.tenure.value;

    const estimatedEmiPaise = this.emiCalculator.calculate(
      loanApplication.requestedAmount.paise,
      tenure
    );
    const estimatedEmiRupees = estimatedEmiPaise / 100;

    const revenueToEmiRatio = revenueRupees / estimatedEmiRupees;
    const loanToRevenueMultiple = loanRupees / revenueRupees;
    const annualInterestRatePct = this.emiCalculator.monthlyRate * 12 * 100;

    let score = DecisionThresholds.baseScore;
    const reasonCodes = [];
    let hardReject = false;

    // Revenue-to-EMI ratio scoring
    const revenueEmiThresholds = DecisionThresholds.revenueToEmiThresholds;
    for (let i = 0; i < revenueEmiThresholds.length; i++) {
      const t = revenueEmiThresholds[i];
      if (revenueToEmiRatio >= t.min) {
        if (t.hardReject) {
          hardReject = true;
          reasonCodes.push(ReasonCodes.LOW_REPAYMENT_CAPACITY);
        } else {
          score += t.penalty;
          if (t.penalty < 0) reasonCodes.push(ReasonCodes.LOW_REPAYMENT_CAPACITY);
        }
        break;
      }
    }

    // Loan-to-revenue multiple scoring
    const loanRevThresholds = DecisionThresholds.loanToRevenueThresholds;
    for (let i = 0; i < loanRevThresholds.length; i++) {
      const t = loanRevThresholds[i];
      if (loanToRevenueMultiple <= t.max) {
        if (t.hardReject) {
          hardReject = true;
          reasonCodes.push(ReasonCodes.HIGH_LOAN_RATIO);
        } else {
          score += t.penalty;
          if (t.penalty < 0) reasonCodes.push(ReasonCodes.HIGH_LOAN_RATIO);
        }
        break;
      }
    }

    // Tenure risk
    if (loanApplication.tenure.isVeryShort()) {
      score += DecisionThresholds.tenurePenalties.veryShort.penalty;
      reasonCodes.push(ReasonCodes.EXTREME_TENURE);
    } else if (loanApplication.tenure.isVeryLong()) {
      score += DecisionThresholds.tenurePenalties.veryLong.penalty;
      reasonCodes.push(ReasonCodes.EXTREME_TENURE);
    }

    // Data inconsistency check
    if (loanToRevenueMultiple > DecisionThresholds.inconsistencyThreshold) {
      score += DecisionThresholds.inconsistencyPenalty;
      reasonCodes.push(ReasonCodes.DATA_INCONSISTENCY);
    }

    // Deduplicate reason codes
    const uniqueReasons = [...new Set(reasonCodes)];

    // Clamp score
    score = Math.max(0, Math.min(100, score));

    let status;
    if (hardReject) {
      status = 'REJECTED';
    } else if (score >= DecisionThresholds.approvalThreshold) {
      status = 'APPROVED';
      if (uniqueReasons.length === 0) uniqueReasons.push(ReasonCodes.APPROVED);
    } else {
      status = 'REJECTED';
    }

    return {
      status,
      creditScore: Math.round(score),
      reasonCodes: uniqueReasons,
      derivedMetrics: {
        estimatedEmiRupees: Math.round(estimatedEmiRupees),
        revenueToEmiRatio: parseFloat(revenueToEmiRatio.toFixed(2)),
        loanToRevenueMultiple: parseFloat(loanToRevenueMultiple.toFixed(2)),
        annualInterestRatePct: parseFloat(annualInterestRatePct.toFixed(2)),
      },
      estimatedEmiPaise,
    };
  }
}