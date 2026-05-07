import { describe, it } from 'node:test';
import assert from 'node:assert';

const BASE_URL = 'http://localhost:4001';

async function post(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

describe('Edge Cases', () => {
  it('should reject missing fields on business profile', async () => {
    const { status, data } = await post('/api/business-profiles', {});
    assert.strictEqual(status, 400);
    assert.strictEqual(data.error.code, 'VALIDATION_ERROR');
  });

  it('should reject missing fields on loan application', async () => {
    const { status, data } = await post('/api/loan-applications', {});
    assert.strictEqual(status, 400);
    assert.strictEqual(data.error.code, 'VALIDATION_ERROR');
  });

  it('should reject invalid PAN format', async () => {
    const { status, data } = await post('/api/business-profiles', {
      ownerName: 'Test',
      pan: 'INVALID',
      businessType: 'retail',
      monthlyRevenueRupees: 100000,
    });
    assert.strictEqual(status, 400);
    assert.strictEqual(data.error.code, 'VALIDATION_ERROR');
    assert.ok(data.error.details.pan);
  });

  it('should reject negative revenue', async () => {
    const { status, data } = await post('/api/business-profiles', {
      ownerName: 'Test',
      pan: 'ABCDE1234F',
      businessType: 'retail',
      monthlyRevenueRupees: -5000,
    });
    assert.strictEqual(status, 400);
    assert.strictEqual(data.error.code, 'VALIDATION_ERROR');
  });

  it('should reject zero revenue', async () => {
    const { status, data } = await post('/api/business-profiles', {
      ownerName: 'Test',
      pan: 'ABCDE1234F',
      businessType: 'retail',
      monthlyRevenueRupees: 0,
    });
    assert.strictEqual(status, 400);
    assert.strictEqual(data.error.code, 'VALIDATION_ERROR');
  });

  it('should reject tenure too short (< 3)', async () => {
    const { status, data } = await post('/api/loan-applications', {
      businessProfileId: '550e8400-e29b-41d4-a716-446655440000',
      requestedAmountRupees: 100000,
      tenureMonths: 2,
      purpose: 'test',
    });
    assert.strictEqual(status, 400);
    assert.strictEqual(data.error.code, 'VALIDATION_ERROR');
  });

  it('should reject tenure too long (> 60)', async () => {
    const { status, data } = await post('/api/loan-applications', {
      businessProfileId: '550e8400-e29b-41d4-a716-446655440000',
      requestedAmountRupees: 100000,
      tenureMonths: 61,
      purpose: 'test',
    });
    assert.strictEqual(status, 400);
    assert.strictEqual(data.error.code, 'VALIDATION_ERROR');
  });

  it('should reject negative loan amount', async () => {
    const { status, data } = await post('/api/loan-applications', {
      businessProfileId: '550e8400-e29b-41d4-a716-446655440000',
      requestedAmountRupees: -1000,
      tenureMonths: 12,
      purpose: 'test',
    });
    assert.strictEqual(status, 400);
    assert.strictEqual(data.error.code, 'VALIDATION_ERROR');
  });

  it('should reject invalid UUID format', async () => {
    const { status, data } = await post('/api/loan-applications', {
      businessProfileId: 'not-a-uuid',
      requestedAmountRupees: 100000,
      tenureMonths: 12,
      purpose: 'test',
    });
    assert.strictEqual(status, 400);
    assert.strictEqual(data.error.code, 'VALIDATION_ERROR');
  });

  it('should return 404 for non-existent business profile', async () => {
    const { status, data } = await post('/api/loan-applications', {
      businessProfileId: '550e8400-e29b-41d4-a716-44665544000a',
      requestedAmountRupees: 100000,
      tenureMonths: 12,
      purpose: 'test',
    });
    assert.strictEqual(status, 404);
    assert.strictEqual(data.error.code, 'NOT_FOUND');
  });

  it('should return 404 for non-existent loan application', async () => {
    const { status, data } = await post('/api/loan-applications/550e8400-e29b-41d4-a716-44665544000a/decision', {});
    assert.strictEqual(status, 404);
    assert.strictEqual(data.error.code, 'NOT_FOUND');
  });

  it('should handle conflicting data (rejected, not 500)', async () => {
    const p = await post('/api/business-profiles', {
      ownerName: 'Small',
      pan: 'CONFL' + Math.floor(Math.random() * 9000 + 1000) + 'X',
      businessType: 'retail',
      monthlyRevenueRupees: 10000,
    });
    if (p.status !== 201) {
      console.log('Profile creation failed:', p.status, JSON.stringify(p.data));
    }
    assert.strictEqual(p.status, 201);

    const l = await post('/api/loan-applications', {
      businessProfileId: p.data.data.id,
      requestedAmountRupees: 5000000,
      tenureMonths: 18,
      purpose: 'test',
    });
    if (l.status !== 201) {
      console.log('Loan creation failed:', l.status, JSON.stringify(l.data));
    }
    assert.strictEqual(l.status, 201);

    const d = await post(`/api/loan-applications/${l.data.data.id}/decision`, {});
    if (d.status !== 200) {
      console.log('Decision failed:', d.status, JSON.stringify(d.data));
    }
    assert.strictEqual(d.status, 200);
    assert.strictEqual(d.data.data.status, 'REJECTED');
    assert.ok(d.data.data.reasonCodes.length > 0);
  });

  it('should approve boundary case (revenueToEmiRatio ~3.0)', async () => {
    const p = await post('/api/business-profiles', {
      ownerName: 'Boundary',
      pan: 'BOUND1234Y',
      businessType: 'retail',
      monthlyRevenueRupees: 300000,
    });
    if (p.status !== 201) {
      console.log('Boundary profile failed:', p.status, JSON.stringify(p.data));
    }
    assert.strictEqual(p.status, 201);

    const l = await post('/api/loan-applications', {
      businessProfileId: p.data.data.id,
      requestedAmountRupees: 500000,
      tenureMonths: 24,
      purpose: 'test',
    });
    if (l.status !== 201) {
      console.log('Boundary loan failed:', l.status, JSON.stringify(l.data));
    }
    assert.strictEqual(l.status, 201);

    const d = await post(`/api/loan-applications/${l.data.data.id}/decision`, {});
    if (d.status !== 200) {
      console.log('Boundary decision failed:', d.status, JSON.stringify(d.data));
    }
    assert.strictEqual(d.status, 200);
    assert.strictEqual(d.data.data.status, 'APPROVED');
  });

  it('should enforce rate limiting', async () => {
    const p = await post('/api/business-profiles', {
      ownerName: 'RateLimit',
      pan: 'RATEL1234Z',
      businessType: 'retail',
      monthlyRevenueRupees: 500000,
    });
    const l = await post('/api/loan-applications', {
      businessProfileId: p.data.data.id,
      requestedAmountRupees: 100000,
      tenureMonths: 12,
      purpose: 'test',
    });

    let rateLimitHits = 0;
    for (let i = 0; i < 120; i++) {
      const r = await post(`/api/loan-applications/${l.data.data.id}/decision`, {});
      if (r.status === 429) rateLimitHits++;
      if (rateLimitHits > 0) break; // Exit early once we hit the limit
    }
    assert.ok(rateLimitHits > 0, 'Expected at least one 429 rate limit response');
  });
});
