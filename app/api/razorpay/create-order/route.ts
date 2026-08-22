// ============================================
// RAZORPAY TEMPORARILY DISABLED
// Payment integration is not enabled for the
// current Younovate LMS testing/deployment.
// ============================================

import { getRazorpayClient, PAYMENT_DISABLED_MESSAGE } from '@/lib/razorpay';

export async function POST(req: Request) {
  const razorpay = getRazorpayClient();
  if (!razorpay) {
    return Response.json(
      { success: false, message: PAYMENT_DISABLED_MESSAGE },
      { status: 503 }
    );
  }

  // --- Enable when Razorpay is active ---
  // const body = await req.json();
  // const order = await razorpay.orders.create({ ... });
  // return Response.json({ success: true, order });

  return Response.json(
    { success: false, message: PAYMENT_DISABLED_MESSAGE },
    { status: 503 }
  );
}
