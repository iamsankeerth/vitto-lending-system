import { error as errorResponse } from '../presenters/ApiPresenter.js';

export function validateBody(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err.errors) {
        const details = {};
        for (const e of err.errors) {
          const field = e.path.join('.');
          details[field] = e.message;
        }
        const validationError = new Error('Input validation failed');
        validationError.statusCode = 400;
        validationError.code = 'VALIDATION_ERROR';
        validationError.details = details;
        return next(validationError);
      }
      next(err);
    }
  };
}