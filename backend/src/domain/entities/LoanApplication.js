import { Money } from '../value-objects/Money.js';
import { TenureMonths } from '../value-objects/TenureMonths.js';

export class LoanApplication {
  constructor({ id, businessProfileId, requestedAmountPaise, tenureMonths, purpose, status, createdAt }) {
    this.id = id;
    this.businessProfileId = businessProfileId;
    this.requestedAmount = new Money(requestedAmountPaise);
    this.tenure = tenureMonths instanceof TenureMonths ? tenureMonths : new TenureMonths(tenureMonths);
    this.purpose = purpose;
    this.status = status || 'pending';
    this.createdAt = createdAt || new Date();
  }

  getRequestedAmountRupees() {
    return this.requestedAmount.toRupees();
  }
}