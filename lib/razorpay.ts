// ============================================
// RAZORPAY TEMPORARILY DISABLED
// Payment integration is not enabled for the
// current Younovate LMS testing/deployment.
// Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
// later to enable Razorpay.
// ============================================

import type Razorpay from 'razorpay';

export const RAZORPAY_ENABLED = false;
export const PAYMENT_DISABLED_MESSAGE = 'Payment service is currently disabled';

// --- Active Razorpay client (commented — enable when ready) ---
// import Razorpay from 'razorpay';
//
// if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
//   throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in .env.local');
// }
//
// export const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

export function isRazorpayConfigured(): boolean {
  return (
    RAZORPAY_ENABLED &&
    Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
  );
}

let razorpayInstance: Razorpay | null = null;

/** Lazy init — never throws at module load. */
export function getRazorpayClient(): Razorpay | null {
  if (!isRazorpayConfigured()) return null;
  if (razorpayInstance) return razorpayInstance;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const RazorpayCtor = require('razorpay') as typeof import('razorpay');
    razorpayInstance = new RazorpayCtor({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
    return razorpayInstance;
  } catch {
    return null;
  }
}
