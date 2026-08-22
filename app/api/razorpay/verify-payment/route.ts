// ============================================
// RAZORPAY TEMPORARILY DISABLED
// Payment integration is not enabled for the
// current Younovate LMS testing/deployment.
// ============================================

import { isRazorpayConfigured, PAYMENT_DISABLED_MESSAGE } from '@/lib/razorpay';

export async function POST(req: Request) {
  if (!isRazorpayConfigured()) {
    return Response.json(
      { success: false, message: PAYMENT_DISABLED_MESSAGE },
      { status: 503 }
    );
  }

  // --- Enable when Razorpay is active ---
  // const body = await req.json();
  // const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
  // verify HMAC signature with RAZORPAY_KEY_SECRET
  // return Response.json({ success: true });

  return Response.json(
    { success: false, message: PAYMENT_DISABLED_MESSAGE },
    { status: 503 }
  );
}
