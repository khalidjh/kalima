import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebaseAdmin";

interface MoyasarPayment {
  id: string;
  status: string;
  amount: number;
  currency: string;
  metadata?: {
    uid?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { type?: string; data?: MoyasarPayment };

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

    const db = getAdminFirestore();
    if (!db) {
      console.error("Moyasar webhook: Firebase Admin not configured");
      return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
    }

    await db.collection("users").doc(uid).set(
      {
        isPro: true,
        subscribedAt: new Date().toISOString(),
        lastPaymentId: payment?.id ?? "",
      },
      { merge: true }
    );

    return NextResponse.json({ received: true, uid });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
