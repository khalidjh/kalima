"use client";

import { useEffect } from "react";
import { getFirebaseAnalytics } from "@/lib/firebase";

export default function FirebaseInit() {
  useEffect(() => {
    // Initialize Firebase Analytics on mount
    getFirebaseAnalytics().catch(() => {});
  }, []);

  return null;
}
