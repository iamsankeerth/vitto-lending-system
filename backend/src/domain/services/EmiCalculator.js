export class EmiCalculator {
  constructor(annualInterestRatePct) {
    this.monthlyRate = annualInterestRatePct / 12 / 100;
  }

  calculate(principalPaise, tenureMonths) {
    const P = principalPaise / 100;
    const r = this.monthlyRate;
    const n = tenureMonths;

    if (r === 0) {
      return Math.round((P / n) * 100);
    }

    const emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi * 100);
  }
}