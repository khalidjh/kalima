import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebaseAdmin";
import crypto from "crypto";

interface MoyasarPayment {
  id: string;
  status: string;
  amount: number;
  currency: string;
  metadata?: {
    uid?: string;
  };
}

// Moyasar signs webhooks with HMAC-SHA256
function verifyMoyasarSignature(body: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Read raw body as text first for signature verification
    const rawBody = await req.text();

    // Verify webhook signature (MOYASAR_WEBHOOK_SECRET must be set in Vercel env vars)
    const secret = process.env.MOYASAR_WEBHOOK_SECRET;
    if (!secret) {
      console.error("Moyasar webhook: MOYASAR_WEBHOOK_SECRET not configured");
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 503 });
    }

    const signature = req.headers.get("x-moyasar-signature") ?? "";
    if (!signature || !verifyMoyasarSignature(rawBody, signature, secret)) {
      console.warn("Moyasar webhook: invalid or missing signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody) as { type?: string; data?: MoyasarPayment };

    // Verify the event is a successful payment
    if (body.type !== "payment_paid" && body.data?.status !== "paid") {
      return NextResponse.json({ received: true });
    }

    const payment = body.data;
    const uid = payment?.metadata?.uid;

    if (!uid) {
      console.warn("Moyasar webhook: no uid in payment metadata");
      return NextResponse.json({ received: true });
    }

    // Verify payment amount === 999 halalas (9.99 SAR) to prevent partial payment tricks
    if (!payment || payment.amount < 999) {
      console.warn("Moyasar webhook: invalid payment amount", payment?.amount);
      return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 });
    }

    // Verify payment currency is SAR
    if (payment.currency !== "SAR") {
      console.warn("Moyasar webhook: invalid currency", payment.currency);
      return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
    }

    const db = getAdminFirestore();
    if (!db) {
      console.error("Moyasar webhook: Firebase Admin not configured");
      return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
    }

    await db.collection("users").doc(uid).set(
      {
        isPro: true,
        subscribedAt: new Date().toISOString(),
        lastPaymentId: payment.id ?? "",
      },
      { merge: true }
    );

    return NextResponse.json({ received: true, uid });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
