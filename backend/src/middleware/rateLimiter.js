const rateLimit = require('express-rate-limit');

// ─── General API Rate Limiter ────────────────────────────────
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,                  // 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests, please try again after 15 minutes.',
    },
    skip: (req) => process.env.NODE_ENV === 'test',
});

// ─── Auth Rate Limiter (strict) ──────────────────────────────
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,                   // Only 10 login/register attempts
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again after 15 minutes.',
    },
    skip: (req) => process.env.NODE_ENV === 'test',
});

// ─── AI Feature Rate Limiter ─────────────────────────────────
const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,                   // 20 AI requests per hour
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'AI request limit reached. You can summarize up to 20 tasks per hour.',
    },
    skip: (req) => process.env.NODE_ENV === 'test',
});

module.exports = { generalLimiter, authLimiter, aiLimiter };