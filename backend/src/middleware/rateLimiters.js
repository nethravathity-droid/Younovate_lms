'use strict';
const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV !== 'production';

/** Only for credential / OTP endpoints — not refresh, me, or profile. */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 100 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts. Try again in 15 minutes.' },
});

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests — slow down.' },
});

module.exports = { authLimiter, globalLimiter };
