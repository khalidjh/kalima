import { app } from "@/lib/firebase";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? "";

export function getMessagingInstance() {
  if (typeof window === "undefined") return null;
  try {
    const { getMessaging } = require("firebase/messaging");
    return getMessaging(app);
  } catch {
    return null;
  }
}

export async function saveTokenToFirestore(uid: string, token: string): Promise<void> {
  try {
    const db = getFirestore(app);
    const ref = doc(db, "users", uid);
    await setDoc(ref, { fcmToken: token, notificationsEnabled: true }, { merge: true });
  } catch {
    // Silently fail — never break the game
  }
}

export async function requestNotificationPermission(uid: string): Promise<"granted" | "denied" | "error"> {
  try {
    if (typeof window === "undefined") return "error";
    if (!("Notification" in window)) return "error";

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return "denied";

    const messaging = getMessagingInstance();
    if (!messaging) return "error";

    const { getToken } = require("firebase/messaging");

    // Register the service worker first
    let swReg: ServiceWorkerRegistration | undefined;
    if ("serviceWorker" in navigator) {
      swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    }

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swReg,
    });

    if (token) {
      await saveTokenToFirestore(uid, token);
      localStorage.setItem("kalima_notif_asked", "granted");
      return "granted";
    }
    return "error";
  } catch {
    return "error";
  }
}

export async function hasNotificationsEnabled(uid: string): Promise<boolean> {
  try {
    const db = getFirestore(app);
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    return snap.exists() && snap.data()?.notificationsEnabled === true;
  } catch {
    return false;
  }
}
