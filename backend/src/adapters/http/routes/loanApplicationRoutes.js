import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validateBody.js';

const createLoanApplicationSchema = z.object({
  businessProfileId: z.string().uuid('Business profile ID must be a valid UUID'),
  requestedAmountRupees: z.number().positive('Requested amount must be positive'),
  tenureMonths: z.number().int().min(3).max(60, 'Tenure must be between 3 and 60 months'),
  purpose: z.string().min(1, 'Purpose is required'),
});

export function createLoanApplicationRoutes(controller) {
  const router = Router();
  router.post('/', validateBody(createLoanApplicationSchema), controller.create);
  router.get('/:id', controller.getById);
  return router;
}