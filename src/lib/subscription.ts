"use client";

import { useState, useEffect } from "react";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { app } from "./firebase";
import { User } from "firebase/auth";

export const MOYASAR_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MOYASAR_KEY ?? "";

export interface SubscriptionData {
  isPro: boolean;
  subscribedAt?: string;
}

export async function checkIsPro(user: User | null): Promise<boolean> {
  if (!user) return false;
  try {
    const db = getFirestore(app);
    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists()) return false;
    return snap.data().isPro === true;
  } catch {
    return false;
  }
}

export async function getSubscription(uid: string): Promise<SubscriptionData> {
  try {
    const db = getFirestore(app);
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return { isPro: false };
    const data = snap.data();
    return {
      isPro: data.isPro === true,
      subscribedAt: data.subscribedAt as string | undefined,
    };
  } catch {
    return { isPro: false };
  }
}

export async function setUserPro(uid: string): Promise<void> {
  try {
    const db = getFirestore(app);
    await setDoc(
      doc(db, "users", uid),
      { isPro: true, subscribedAt: new Date().toISOString() },
      { merge: true }
    );
  } catch {
    // Graceful failure
  }
}

export function useIsPro(user: User | null): { isPro: boolean; proLoading: boolean } {
  const [isPro, setIsPro] = useState(false);
  const [proLoading, setProLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsPro(false);
      setProLoading(false);
      return;
    }
    checkIsPro(user).then((result) => {
      setIsPro(result);
      setProLoading(false);
    });
  }, [user]);

  return { isPro, proLoading };
}
