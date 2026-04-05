"use client";

import { useState, useEffect } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
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

export function useIsPro(user: User | null): { isPro: boolean; proLoading: boolean } {
  const [isPro, setIsPro] = useState(false);
  const [proLoading, setProLoading] = useState(!!user);

  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProLoading(true);
    checkIsPro(user).then((result) => {
      setIsPro(result);
      setProLoading(false);
    });
  }, [user]);

  return { isPro, proLoading };
}
