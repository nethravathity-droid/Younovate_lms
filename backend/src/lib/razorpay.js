// ============================================
// RAZORPAY TEMPORARILY DISABLED
// Payment integration is not enabled for the
// current Younovate LMS testing/deployment.
// Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
// later to enable Razorpay.
// ============================================
'use strict';

// Set to true when company is ready to enable online payments.
const RAZORPAY_ENABLED = false;

const PAYMENT_DISABLED_MESSAGE = 'Payment service is currently disabled';

// ── Active Razorpay client code (commented — enable when ready) ─────────────
// let razorpayInstance = null;
// let initAttempted = false;
//
// function isRazorpayConfigured() {
//   return Boolean(
//     process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
//   );
// }
//
// function getRazorpayClient() {
//   if (!RAZORPAY_ENABLED || !isRazorpayConfigured()) return null;
//   if (razorpayInstance) return razorpayInstance;
//   if (initAttempted) return null;
//
//   initAttempted = true;
//   try {
//     const Razorpay = require('razorpay');
//     razorpayInstance = new Razorpay({
//       key_id:     process.env.RAZORPAY_KEY_ID,
//       key_secret: process.env.RAZORPAY_KEY_SECRET,
//     });
//     return razorpayInstance;
//   } catch (_) {
//     return null;
//   }
// }

/** Always false while RAZORPAY_ENABLED is false. */
function isRazorpayConfigured() {
  return RAZORPAY_ENABLED && Boolean(
    process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  );
}

/** Always null while Razorpay is disabled. */
function getRazorpayClient() {
  return null;
}

function sendPaymentDisabled(res) {
  return res.status(503).json({
    success: false,
    message: PAYMENT_DISABLED_MESSAGE,
  });
}

module.exports = {
  RAZORPAY_ENABLED,
  isRazorpayConfigured,
  getRazorpayClient,
  sendPaymentDisabled,
  PAYMENT_DISABLED_MESSAGE,
};
