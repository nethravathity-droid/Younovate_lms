// ============================================
// RAZORPAY TEMPORARILY DISABLED
// Payment integration is not enabled for the
// current Younovate LMS testing/deployment.
// ============================================

import { isRazorpayConfigured, PAYMENT_DISABLED_MESSAGE } from '@/lib/razorpay';

export const runtime = 'nodejs';

// Removed deprecated Pages Router config:
// export const config = { api: { bodyParser: false } }

function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function POST(req: Request) {
  if (!isRazorpayConfigured()) {
    return Response.json(
      { success: false, message: PAYMENT_DISABLED_MESSAGE },
      { status: 503 }
    );
  }

  // --- Enable when Razorpay is active ---
  // const ip = getClientIp(req);
  // const rawBody = await req.text();
  // verify webhook signature with raw body bytes

  void getClientIp(req);
  return Response.json(
    { success: false, message: PAYMENT_DISABLED_MESSAGE },
    { status: 503 }
  );
}
