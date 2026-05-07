import { describe, it } from 'node:test';
import assert from 'node:assert';
import { EmiCalculator } from '../../domain/services/EmiCalculator.js';

describe('EmiCalculator', () => {
  it('should calculate EMI correctly for 18% annual rate', () => {
    const calc = new EmiCalculator(18);
    const emiPaise = calc.calculate(800000 * 100, 18); // 8L loan, 18 months
    const emiRupees = emiPaise / 100;
    assert.ok(emiRupees > 51000 && emiRupees < 51100, `EMI ${emiRupees} not in expected range`);
  });

  it('should handle zero interest', () => {
    const calc = new EmiCalculator(0);
    const emiPaise = calc.calculate(600000 * 100, 12);
    assert.strictEqual(emiPaise, 5000000); // 50,000 per month
  });
});