import { describe, it } from 'node:test';
import assert from 'node:assert';
import { PanNumber } from '../../domain/value-objects/PanNumber.js';
import { DomainValidationError } from '../../domain/errors/DomainValidationError.js';

describe('PanNumber', () => {
  it('should accept valid PAN format', () => {
    const pan = new PanNumber('ABCDE1234F');
    assert.strictEqual(pan.value, 'ABCDE1234F');
  });

  it('should normalize lowercase to uppercase', () => {
    const pan = new PanNumber('abcde1234f');
    assert.strictEqual(pan.value, 'ABCDE1234F');
  });

  it('should throw for missing PAN', () => {
    assert.throws(() => new PanNumber(''), DomainValidationError);
    assert.throws(() => new PanNumber(null), DomainValidationError);
  });

  it('should throw for invalid format', () => {
    assert.throws(() => new PanNumber('INVALID'), DomainValidationError);
    assert.throws(() => new PanNumber('12345ABCDE'), DomainValidationError);
    assert.throws(() => new PanNumber('ABCDE12345'), DomainValidationError);
  });
});