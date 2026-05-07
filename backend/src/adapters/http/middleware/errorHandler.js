import { error as errorResponse } from '../presenters/ApiPresenter.js';

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const code = err.code || (statusCode === 500 ? 'INTERNAL_ERROR' : 'ERROR');
  const details = err.details || null;

  if (statusCode === 500) {
    console.error('Unhandled error:', err);
  }

  res.status(statusCode).json(
    errorResponse({ message: err.message, code, details }, { requestId: req.requestId })
  );
}