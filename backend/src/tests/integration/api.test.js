import { describe, it } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { createApp } from '../../app.js';

describe('Integration Tests', () => {
  const app = createApp();

  describe('GET /api/health', () => {
    it('should return ok status', async () => {
      const res = await request(app)
        .get('/api/health')
        .expect(200);

      assert.strictEqual(res.body.data.status, 'ok');
      assert.ok(res.body.meta.requestId);
    });
  });

  describe('POST /api/business-profiles', () => {
    it('should reject invalid PAN format', async () => {
      const res = await request(app)
        .post('/api/business-profiles')
        .send({
          ownerName: 'Amit Sharma',
          pan: 'INVALID',
          businessType: 'retail',
          monthlyRevenueRupees: 250000,
        })
        .expect(400);

      assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
      assert.ok(res.body.error.details.pan);
      assert.ok(res.body.meta.requestId);
    });

    it('should reject negative revenue', async () => {
      const res = await request(app)
        .post('/api/business-profiles')
        .send({
          ownerName: 'Amit Sharma',
          pan: 'ABCDE1234F',
          businessType: 'retail',
          monthlyRevenueRupees: -5000,
        })
        .expect(400);

      assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
      assert.ok(res.body.error.details.monthlyRevenueRupees);
    });

    it('should reject missing fields', async () => {
      const res = await request(app)
        .post('/api/business-profiles')
        .send({})
        .expect(400);

      assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
      assert.ok(Object.keys(res.body.error.details).length >= 3);
    });
  });

  describe('POST /api/loan-applications', () => {
    it('should reject invalid tenure (too short)', async () => {
      const res = await request(app)
        .post('/api/loan-applications')
        .send({
          businessProfileId: '550e8400-e29b-41d4-a716-446655440000',
          requestedAmountRupees: 800000,
          tenureMonths: 2,
          purpose: 'working_capital',
        })
        .expect(400);

      assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
      assert.ok(res.body.error.details.tenureMonths);
    });

    it('should reject invalid tenure (too long)', async () => {
      const res = await request(app)
        .post('/api/loan-applications')
        .send({
          businessProfileId: '550e8400-e29b-41d4-a716-446655440000',
          requestedAmountRupees: 800000,
          tenureMonths: 61,
          purpose: 'working_capital',
        })
        .expect(400);

      assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
      assert.ok(res.body.error.details.tenureMonths);
    });

    it('should reject negative loan amount', async () => {
      const res = await request(app)
        .post('/api/loan-applications')
        .send({
          businessProfileId: '550e8400-e29b-41d4-a716-446655440000',
          requestedAmountRupees: -1000,
          tenureMonths: 18,
          purpose: 'working_capital',
        })
        .expect(400);

      assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
      assert.ok(res.body.error.details.requestedAmountRupees);
    });

    it('should reject invalid UUID for businessProfileId', async () => {
      const res = await request(app)
        .post('/api/loan-applications')
        .send({
          businessProfileId: 'not-a-uuid',
          requestedAmountRupees: 800000,
          tenureMonths: 18,
          purpose: 'working_capital',
        })
        .expect(400);

      assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
      assert.ok(res.body.error.details.businessProfileId);
    });
  });

  describe('POST /api/loan-applications/:id/decision', () => {
    it('should return 404 for non-existent loan application', async () => {
      const res = await request(app)
        .post('/api/loan-applications/550e8400-e29b-41d4-a716-446655440000/decision')
        .expect(404);

      assert.strictEqual(res.body.error.code, 'NOT_FOUND');
    });

    it('should enforce rate limiting', async () => {
      // Hit the endpoint multiple times rapidly to trigger rate limit
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const requests = [];
      for (let i = 0; i < 15; i++) {
        requests.push(
          request(app).post(`/api/loan-applications/${id}/decision`)
        );
      }
      const results = await Promise.all(requests);
      const has429 = results.some(r => r.status === 429);
      assert.ok(has429, 'Expected at least one request to be rate limited');
    });
  });

  describe('404 handling', () => {
    it('should return structured 404 for unknown routes', async () => {
      const res = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      assert.strictEqual(res.body.error.code, 'NOT_FOUND');
      assert.ok(res.body.meta.requestId);
    });
  });

  describe('Response envelope consistency', () => {
    it('should include requestId in success responses', async () => {
      const res = await request(app).get('/api/health').expect(200);
      assert.ok(res.body.meta.requestId);
      assert.ok(res.headers['x-request-id']);
    });

    it('should include requestId in error responses', async () => {
      const res = await request(app)
        .post('/api/business-profiles')
        .send({})
        .expect(400);
      assert.ok(res.body.meta.requestId);
      assert.ok(res.headers['x-request-id']);
    });
  });
});
