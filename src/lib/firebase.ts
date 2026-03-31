import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCX4-z17BPJISkHxv8_t5eoLHygus1k0V8",
  authDomain: "kalima-85c92.firebaseapp.com",
  projectId: "kalima-85c92",
  storageBucket: "kalima-85c92.firebasestorage.app",
  messagingSenderId: "270885100241",
  appId: "1:270885100241:web:a4c4c393a7c6b6380403f0",
  measurementId: "G-GPZQEQRWNX",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

let analyticsInstance: Analytics | null = null;

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") return null;
  if (analyticsInstance) return analyticsInstance;
  const supported = await isSupported();
  if (!supported) return null;
  analyticsInstance = getAnalytics(app);
  return analyticsInstance;
}
