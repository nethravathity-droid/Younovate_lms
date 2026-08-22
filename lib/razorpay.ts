// ============================================
// RAZORPAY TEMPORARILY DISABLED
// Younovate LMS courses are FREE — payment
// processing is not active for deployment.
//
// To enable later:
// 1. Set RAZORPAY_ENABLED = true
// 2. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
// ============================================

/** Set to true when company is ready to enable Razorpay. */
export const RAZORPAY_ENABLED = false;

export const RAZORPAY_DISABLED_MESSAGE = 'Razorpay payments are currently disabled.';

// --- Original implementation preserved for future use ---
// import Razorpay from 'razorpay';
//
// if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
//   throw new Error(
//     'RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in .env.local'
//   );
// }
//
// export const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

/**
 * Lazy Razorpay client — never throws during module import/build.
 * Returns null while RAZORPAY_ENABLED is false or credentials are missing.
 */
export function getRazorpay() {
  if (!RAZORPAY_ENABLED) {
    return null;
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  // Load only when explicitly enabled — avoids module-level Razorpay init.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Razorpay = require('razorpay');
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}
