import { DomainValidationError } from '../errors/DomainValidationError.js';

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export class PanNumber {
  constructor(value) {
    if (!value || typeof value !== 'string') {
      throw new DomainValidationError('PAN is required', 'pan');
    }
    const normalized = value.trim().toUpperCase();
    if (!PAN_REGEX.test(normalized)) {
      throw new DomainValidationError('PAN must match AAAAA9999A format', 'pan');
    }
    this.value = normalized;
  }

  toString() {
    return this.value;
  }

  equals(other) {
    return other instanceof PanNumber && this.value === other.value;
  }
}