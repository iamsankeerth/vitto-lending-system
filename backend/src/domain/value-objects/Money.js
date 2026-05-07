import { DomainValidationError } from '../errors/DomainValidationError.js';

export class Money {
  constructor(paise) {
    if (typeof paise !== 'number' || !Number.isFinite(paise)) {
      throw new DomainValidationError('Amount must be a valid number', 'amount');
    }
    if (paise <= 0) {
      throw new DomainValidationError('Amount must be positive', 'amount');
    }
    if (!Number.isInteger(paise)) {
      throw new DomainValidationError('Amount must be a whole number (in paise)', 'amount');
    }
    this.paise = paise;
  }

  static fromRupees(rupees) {
    return new Money(Math.round(rupees * 100));
  }

  toRupees() {
    return this.paise / 100;
  }

  add(other) {
    return new Money(this.paise + other.paise);
  }

  subtract(other) {
    return new Money(this.paise - other.paise);
  }

  multiply(factor) {
    return new Money(Math.round(this.paise * factor));
  }

  divide(divisor) {
    return new Money(Math.round(this.paise / divisor));
  }
}