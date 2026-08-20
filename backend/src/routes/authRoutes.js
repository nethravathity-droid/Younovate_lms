// src/routes/authRoutes.js
'use strict';
const express = require('express');
const {
  register, login, logout, refresh, getMe,
  updateProfile, changePassword, forgotPassword, verifyOtp, resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

// ── Public (rate-limited — credential / OTP only) ───────────────────────────────
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/verify-otp', authLimiter, verifyOtp);
router.post('/reset-password', authLimiter, resetPassword);

// Refresh is called often on token expiry — do not count toward login attempt limit
router.post('/refresh', refresh);

// ── Protected ─────────────────────────────────────────────────────────────────
// POST /api/auth/logout   [requires JWT]
router.post('/logout', protect, logout);

// GET  /api/auth/me       [requires JWT]
router.get('/me', protect, getMe);

// PUT  /api/auth/profile  [requires JWT]
//   Body: { name?, phone?, bio?, profilePicture?, linkedIn?, github?, skills?, expertise? }
router.put('/profile', protect, updateProfile);

// PUT /api/auth/profile-photo  [requires JWT]
//   multipart/form-data with field `profilePhoto`
router.put(
  '/profile-photo',
  protect,
  require('../middleware/upload').uploadProfilePhoto,
  require('../controllers/authController').updateProfilePhoto
);


// PUT  /api/auth/change-password  [requires JWT]
//   Body: { currentPassword: string, newPassword: string }
router.put('/change-password', protect, changePassword);

module.exports = router;
