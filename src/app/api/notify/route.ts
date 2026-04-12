import { NextRequest, NextResponse } from "next/server";
import { getAdminApp } from "@/lib/firebaseAdmin";

async function sendNotifications() {
  const adminApp = getAdminApp();
  if (!adminApp) {
    return NextResponse.json({ error: "Admin not initialized" }, { status: 500 });
  }

  const { getFirestore } = await import("firebase-admin/firestore");
  const { getMessaging } = await import("firebase-admin/messaging");

  const db = getFirestore(adminApp);
  const messaging = getMessaging(adminApp);

  // Get all users with notifications enabled
  const snapshot = await db
    .collection("users")
    .where("notificationsEnabled", "==", true)
    .get();

  if (snapshot.empty) {
    return NextResponse.json({ sent: 0, message: "No subscribers" });
  }

  // Get puzzle number (days since launch date 2025-01-01)
  const launch = new Date("2025-01-01");
  const today = new Date();
  const puzzleNumber =
    Math.floor((today.getTime() - launch.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const tokens: string[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.fcmToken && typeof data.fcmToken === "string") {
      tokens.push(data.fcmToken);
    }
  });

  if (tokens.length === 0) {
    return NextResponse.json({ sent: 0, message: "No valid tokens" });
  }

  // Send in batches of 500 (FCM limit)
  let sent = 0;
  const batchSize = 500;
  for (let i = 0; i < tokens.length; i += batchSize) {
    const batch = tokens.slice(i, i + batchSize);
    try {
      const response = await messaging.sendEachForMulticast({
        tokens: batch,
        notification: {
          title: "كلمة اليوم 🟩",
          body: `لغز #${puzzleNumber} جاهز — كم محاولة تحتاج؟`,
        },
        webpush: {
          notification: {
            icon: "/favicon.svg",
            badge: "/favicon.svg",
            dir: "rtl",
            lang: "ar",
            tag: "kalima-daily",
            renotify: true,
          },
          fcmOptions: {
            link: "https://kalima.fun",
          },
        },
      });
      sent += response.successCount;
    } catch {
      // Continue with next batch on error
    }
  }

  return NextResponse.json({ sent, total: tokens.length });
}

// Called by Vercel Cron Jobs
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return sendNotifications();
  } catch (err) {
    console.error("notify cron error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// Called manually via x-notify-secret header
export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("x-notify-secret");
    if (!secret || secret !== process.env.NOTIFY_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return sendNotifications();
  } catch (err) {
    console.error("notify route error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
