import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validateBody.js';

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

const createBusinessProfileSchema = z.object({
  ownerName: z.string().min(1, 'Owner name is required'),
  pan: z.string().min(1, 'PAN is required').regex(PAN_REGEX, 'PAN must match AAAAA9999A format'),
  businessType: z.string().min(1, 'Business type is required'),
  monthlyRevenueRupees: z.number().positive('Monthly revenue must be positive'),
});

export function createBusinessProfileRoutes(controller) {
  const router = Router();
  router.post('/', validateBody(createBusinessProfileSchema), controller.create);
  return router;
}