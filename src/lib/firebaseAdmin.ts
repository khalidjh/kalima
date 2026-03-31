import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let adminApp: App | null = null;

function getAdminApp(): App | null {
  try {
    const apps = getApps();
    if (apps.length > 0) {
      adminApp = apps[0];
      return adminApp;
    }

    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountKey && serviceAccountKey.trim().startsWith("{")) {
      const serviceAccount = JSON.parse(serviceAccountKey);
      adminApp = initializeApp({ credential: cert(serviceAccount) });
    } else {
      // Minimal init — works on Google Cloud with ADC, returns null otherwise
      adminApp = initializeApp({ projectId: "kalima-85c92" });
    }
    return adminApp;
  } catch {
    return null;
  }
}

export function getAdminFirestore(): Firestore | null {
  try {
    const app = getAdminApp();
    if (!app) return null;
    return getFirestore(app);
  } catch {
    return null;
  }
}
