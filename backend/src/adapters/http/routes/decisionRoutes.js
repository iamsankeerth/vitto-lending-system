import { Router } from 'express';
import { decisionRateLimit } from '../middleware/rateLimit.js';

export function createDecisionRoutes(controller) {
  const router = Router();
  router.post('/:id/decision', decisionRateLimit, controller.evaluate);
  return router;
}