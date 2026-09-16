const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

// GET request limiter
const getLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 GETs per 15 min per IP
  keyGenerator: (req) => {
    return req.user?.userId || ipKeyGenerator(req);
  },
  message: {
    status: 'FAILED',
    message: 'Too many GET requests. Please try again later.',
  },
  standardHeaders: true, // Adds RateLimit-* headers
  legacyHeaders: false, // Disables old X-RateLimit-* headers
});

// POST request limiter
const postLimiter = rateLimit({
  //   windowMs: 2 * 60 * 60 * 1000, // 2 hours
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 POSTs per 15 min per IP
  keyGenerator: (req) => {
    return req.user?.userId || ipKeyGenerator(req);
  },
  message: {
    status: 'FAILED',
    message: 'Too many POST requests. Please try again letter.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Login limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  keyGenerator: (req) => {
    const userId = req.body?.userId?.trim() || 'unknown';
    return `${userId}-${ipKeyGenerator(req)}`;
  },
  message: {
    status: 'FAILED',
    message: 'Too many login attempts. Try again later.',
  },

  standardHeaders: true,
  legacyHeaders: false,
});

// Combined middleware
const rateLimiterMiddleware = (req, res, next) => {
  if (req.method === 'GET') return getLimiter(req, res, next);
  if (req.method === 'POST') return postLimiter(req, res, next);
  next();
};

module.exports = {
  rateLimiterMiddleware,
  loginLimiter,
};
