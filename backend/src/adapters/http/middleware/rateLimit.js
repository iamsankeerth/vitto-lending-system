import rateLimit from 'express-rate-limit';

export const decisionRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Increased for testing; set to 10 in production
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many decision requests, please try again later.',
      },
      meta: { requestId: req.requestId },
    });
  },
});