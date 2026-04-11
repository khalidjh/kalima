import { NextRequest, NextResponse } from "next/server";
import { getAdminApp } from "@/lib/firebaseAdmin";

export async function GET(req: NextRequest) {
  try {
    const secret = req.headers.get("x-admin-secret");
    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminApp = getAdminApp();
    if (!adminApp) {
      return NextResponse.json({ error: "Admin not initialized" }, { status: 500 });
    }

    const { getFirestore } = await import("firebase-admin/firestore");
    const db = getFirestore(adminApp);

    const snapshot = await db.collection("users").get();

    let totalUsers = 0;
    let proUsers = 0;
    let totalGamesPlayed = 0;
    let notifEnabled = 0;

    const allUsers: {
      uid: string;
      displayName: string;
      email: string;
      gamesPlayed: number;
      currentStreak: number;
      isPro: boolean;
      updatedAt: string;
    }[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      totalUsers++;
      if (data.isPro) proUsers++;
      if (data.notificationsEnabled) notifEnabled++;

      const gamesPlayed = data.kalimaStats?.gamesPlayed ?? 0;
      totalGamesPlayed += gamesPlayed;

      allUsers.push({
        uid: doc.id,
        displayName: data.displayName ?? "",
        email: data.email ?? "",
        gamesPlayed,
        currentStreak: data.kalimaStats?.currentStreak ?? 0,
        isPro: data.isPro ?? false,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? "",
      });
    });

    allUsers.sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1));
    const recentUsers = allUsers.slice(0, 20);

    return NextResponse.json({
      totalUsers,
      proUsers,
      totalGamesPlayed,
      notifEnabled,
      recentUsers,
    });
  } catch (err) {
    console.error("admin stats error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
