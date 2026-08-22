// ============================================
// RAZORPAY TEMPORARILY DISABLED
// Payment integration is not enabled for the
// current Younovate LMS testing/deployment.
// Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
// later to enable Razorpay.
// ============================================
'use strict';

const PAYMENT_DISABLED_MESSAGE = 'Payment service is currently disabled';

let razorpayInstance = null;
let initAttempted = false;

/**
 * Returns true only when both Razorpay env vars are present.
 * Safe to call at any time — never throws.
 */
function isRazorpayConfigured() {
  return Boolean(
    process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  );
}

/**
 * Lazy Razorpay client — initialized on first paid API call only.
 * Returns null when keys are missing or the razorpay package is not installed.
 */
function getRazorpayClient() {
  if (!isRazorpayConfigured()) return null;
  if (razorpayInstance) return razorpayInstance;
  if (initAttempted) return null;

  initAttempted = true;
  try {
    const Razorpay = require('razorpay');
    razorpayInstance = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    return razorpayInstance;
  } catch (_) {
    return null;
  }
}

/**
 * Standard JSON response when payment APIs are called while Razorpay is off.
 */
function sendPaymentDisabled(res) {
  return res.status(503).json({
    success: false,
    message: PAYMENT_DISABLED_MESSAGE,
  });
}

module.exports = {
  isRazorpayConfigured,
  getRazorpayClient,
  sendPaymentDisabled,
  PAYMENT_DISABLED_MESSAGE,
};
