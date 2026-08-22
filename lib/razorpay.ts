import Razorpay from 'razorpay';

// ============================================
// RAZORPAY TEMPORARILY DISABLED
// Younovate LMS is currently deployed without
// payment processing.
//
// To enable later, add:
// RAZORPAY_KEY_ID
// RAZORPAY_KEY_SECRET
// ============================================

export function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

// Preserved for future enablement — do not throw at module load.
// if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
//   throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in .env.local');
// }
// export const razorpay = new Razorpay({ ... });
