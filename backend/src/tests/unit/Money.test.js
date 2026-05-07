import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Money } from '../../domain/value-objects/Money.js';
import { DomainValidationError } from '../../domain/errors/DomainValidationError.js';

describe('Money', () => {
  it('should create from paise', () => {
    const m = new Money(10000);
    assert.strictEqual(m.paise, 10000);
    assert.strictEqual(m.toRupees(), 100);
  });

  it('should create from rupees', () => {
    const m = Money.fromRupees(250000);
    assert.strictEqual(m.paise, 25000000);
    assert.strictEqual(m.toRupees(), 250000);
  });

  it('should throw for negative amount', () => {
    assert.throws(() => new Money(-100), DomainValidationError);
  });

  it('should throw for zero', () => {
    assert.throws(() => new Money(0), DomainValidationError);
  });

  it('should support arithmetic', () => {
    const a = Money.fromRupees(100);
    const b = Money.fromRupees(50);
    assert.strictEqual(a.add(b).toRupees(), 150);
    assert.strictEqual(a.subtract(b).toRupees(), 50);
    assert.strictEqual(a.multiply(2).toRupees(), 200);
    assert.strictEqual(a.divide(2).toRupees(), 50);
  });
});