"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { app } from "./firebase";
import { track } from "./analytics";
import { setCurrentUser, mergeLocalStatsFromFirestore } from "./firestoreSync";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);

    // Handle redirect result on page load (mobile flow)
    getRedirectResult(auth).then(async (result) => {
      if (result?.user) {
        track("login", { method: "google" });
        try {
          await mergeLocalStatsFromFirestore(result.user.uid);
        } catch { /* graceful */ }
      }
    }).catch(() => {});

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
      setCurrentUser(u?.uid ?? null);
      if (u) {
        try {
          await mergeLocalStatsFromFirestore(u.uid);
        } catch {
          // Graceful failure
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      // Use redirect on mobile (popup gets blocked), popup on desktop
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
        track("login", { method: "google" });
      }
    } catch {
      // Graceful failure — never break the app for auth
    }
  };

  const signOut = async () => {
    try {
      const auth = getAuth(app);
      await fbSignOut(auth);
    } catch {
      // Graceful failure
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
