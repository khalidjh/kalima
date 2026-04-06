import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebaseAdmin";

const MOYASAR_API = "https://api.moyasar.com/v1";

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
    const { paymentId } = (await req.json()) as { paymentId?: string };
    if (!paymentId) {
      return NextResponse.json({ error: "Missing paymentId" }, { status: 400 });
    }

    const secretKey = process.env.MOYASAR_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "Payment not configured" }, { status: 503 });
    }

    // Fetch payment from Moyasar API to verify status
    const response = await fetch(`${MOYASAR_API}/payments/${paymentId}`, {
      headers: {
        Authorization: `Basic ${Buffer.from(secretKey + ":").toString("base64")}`,
      },
    });

    if (!response.ok) {
      console.error("Moyasar verify error:", response.status);
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const payment = (await response.json()) as MoyasarPayment;

    if (payment.status !== "paid") {
      return NextResponse.json({ verified: false, status: payment.status });
    }

    if (payment.amount < 999 || payment.currency !== "SAR") {
      return NextResponse.json({ error: "Invalid payment" }, { status: 400 });
    }

    const uid = payment.metadata?.uid;
    if (!uid) {
      return NextResponse.json({ error: "No user linked to payment" }, { status: 400 });
    }

    // Activate pro in Firestore
    const db = getAdminFirestore();
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    await db.collection("users").doc(uid).set(
      {
        isPro: true,
        subscribedAt: new Date().toISOString(),
        lastPaymentId: payment.id,
      },
      { merge: true }
    );

    return NextResponse.json({ verified: true, uid });
  } catch (error) {
    console.error("Verify route error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
