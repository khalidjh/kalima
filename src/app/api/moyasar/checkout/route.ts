import { NextRequest, NextResponse } from "next/server";

const MOYASAR_API = "https://api.moyasar.com/v1";

export async function POST(req: NextRequest) {
  try {
    const { uid } = (await req.json()) as { uid?: string };
    const secretKey = process.env.MOYASAR_SECRET_KEY ?? "";

    // Test/placeholder mode — simulate a redirect to success page
    if (!secretKey || secretKey === "sk_test_placeholder") {
      const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://kalima.fun";
      return NextResponse.json({
        url: `${base}/pro/success?status=paid&test=true${uid ? `&uid=${uid}` : ""}`,
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://kalima.fun";
    const response = await fetch(`${MOYASAR_API}/payments`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(secretKey + ":").toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: 999,
        currency: "SAR",
        description: "كلمة برو - اشتراك شهري",
        callback_url: `${appUrl}/pro/success`,
        source: { type: "creditcard" },
        metadata: { uid: uid ?? "" },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Moyasar API error:", response.status, text);
      return NextResponse.json({ error: "Payment creation failed" }, { status: 502 });
    }

    const payment = (await response.json()) as {
      source?: { transaction_url?: string };
      url?: string;
    };

    const checkoutUrl =
      payment.source?.transaction_url ?? payment.url ?? `${appUrl}/pro/success?status=pending`;

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error("Checkout route error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
