import { Router } from 'express';
import { success } from '../presenters/ApiPresenter.js';

export function createHealthRoutes() {
  const router = Router();
  router.get('/', (req, res) => {
    res.json(success({ status: 'ok' }, { requestId: req.requestId }));
  });
  return router;
}