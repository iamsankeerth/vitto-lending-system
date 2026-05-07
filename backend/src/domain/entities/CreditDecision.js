export class CreditDecision {
  constructor({ id, loanApplicationId, status, creditScore, reasonCodes, estimatedEmiPaise, derivedMetrics, createdAt }) {
    this.id = id;
    this.loanApplicationId = loanApplicationId;
    this.status = status;
    this.creditScore = creditScore;
    this.reasonCodes = reasonCodes;
    this.estimatedEmi = estimatedEmiPaise;
    this.derivedMetrics = derivedMetrics;
    this.createdAt = createdAt || new Date();
  }
}