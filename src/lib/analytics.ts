import { logEvent } from "firebase/analytics";
import { getFirebaseAnalytics } from "@/lib/firebase";

export async function track(event: string, props?: Record<string, unknown>) {
  try {
    const analytics = await getFirebaseAnalytics();
    if (!analytics) return;
    logEvent(analytics, event, props as Record<string, string | number | boolean> | undefined);
  } catch {
    // Silently fail — never break the game for analytics
  }
}
