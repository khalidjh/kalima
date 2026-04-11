"use client";

import { useState } from "react";
import { requestNotificationPermission } from "@/lib/notifications";

interface Props {
  uid: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function NotificationPrompt({ uid, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleEnable() {
    setLoading(true);
    try {
      const result = await requestNotificationPermission(uid);
      if (result === "granted") {
        onSuccess?.();
      } else {
        localStorage.setItem("kalima_notif_asked", "denied");
      }
    } finally {
      setLoading(false);
      onClose();
    }
  }

  function handleDismiss() {
    localStorage.setItem("kalima_notif_asked", "denied");
    onClose();
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center pointer-events-none">
      <div
        className="w-full max-w-sm pointer-events-auto animate-slide-up"
        dir="rtl"
        style={{ fontFamily: "'Cairo', sans-serif" }}
      >
        <div className="bg-surface border border-border rounded-t-3xl px-6 pt-5 pb-8 shadow-2xl">
          {/* Handle bar */}
          <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />

          <div className="text-3xl text-center mb-3">🔔</div>
          <h2 className="text-lg font-bold text-white text-center mb-2">
            لا تنسى لغز اليوم
          </h2>
          <p className="text-muted text-sm text-center mb-6 leading-relaxed">
            فعّل الإشعارات وصلك كل يوم تذكير بكلمة اليوم
          </p>

          <button
            onClick={handleEnable}
            disabled={loading}
            className="w-full h-11 rounded-xl bg-primary text-[#0A0A0A] font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 mb-3"
          >
            {loading ? "جارٍ التفعيل..." : "فعّل الإشعارات"}
          </button>

          <button
            onClick={handleDismiss}
            className="w-full text-muted text-sm py-1 hover:text-white transition-colors"
          >
            لا شكراً
          </button>
        </div>
      </div>
    </div>
  );
}
