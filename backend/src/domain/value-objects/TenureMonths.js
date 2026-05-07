import { DomainValidationError } from '../errors/DomainValidationError.js';

const MIN_TENURE = 3;
const MAX_TENURE = 60;

export class TenureMonths {
  constructor(value) {
    if (typeof value !== 'number' || !Number.isInteger(value)) {
      throw new DomainValidationError('Tenure must be a whole number of months', 'tenureMonths');
    }
    if (value < MIN_TENURE || value > MAX_TENURE) {
      throw new DomainValidationError(`Tenure must be between ${MIN_TENURE} and ${MAX_TENURE} months`, 'tenureMonths');
    }
    this.value = value;
  }

  isVeryShort() {
    return this.value <= 6;
  }

  isVeryLong() {
    return this.value >= 48;
  }
}