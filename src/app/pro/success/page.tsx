"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";

type VerifyState = "loading" | "success" | "failed";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const paymentId = searchParams.get("id");
  const paymentStatus = searchParams.get("status");

  const hasValidPayment = !!paymentId && paymentStatus === "paid";
  const [state, setState] = useState<VerifyState>(hasValidPayment ? "loading" : "failed");
  const verifiedRef = useRef(false);

  useEffect(() => {
    if (!hasValidPayment || verifiedRef.current) return;
    verifiedRef.current = true;

    // Verify payment server-side
    fetch("/api/moyasar/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId }),
    })
      .then((res) => res.json())
      .then((data: { verified?: boolean }) => {
        setState(data.verified ? "success" : "failed");
      })
      .catch(() => {
        // Verification failed but webhook may still activate pro
        setState("success");
      });
  }, [hasValidPayment, paymentId]);

  if (state === "loading") {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-surface border-2 border-border flex items-center justify-center mx-auto mb-6 animate-pulse">
          <span className="text-2xl">⏳</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">جارٍ التحقق...</h1>
        <p className="text-muted text-sm">نتحقق من حالة الدفع</p>
      </div>
    );
  }

  if (state === "failed") {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-present/20 border-2 border-present flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">✕</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">لم يتم الدفع</h1>
        <p className="text-muted text-sm mb-8">
          حدث خطأ أثناء معالجة الدفع. يمكنك المحاولة مجدداً.
        </p>
        <button
          onClick={() => router.push("/pro")}
          className="w-full h-12 rounded-xl bg-primary text-[#0A0A0A] font-bold hover:opacity-90 transition-opacity"
        >
          حاول مجدداً
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="w-20 h-20 rounded-full bg-correct/20 border-2 border-correct flex items-center justify-center mx-auto mb-6">
        <span className="text-4xl">🎉</span>
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">تم الاشتراك بنجاح!</h1>
      <p className="text-muted text-sm mb-2">مرحباً بك في كلمة برو</p>
      <div className="flex justify-center gap-1 mb-8">
        <span className="bg-primary/20 border border-primary/40 text-primary text-xs font-semibold px-3 py-1 rounded-full tracking-widest uppercase flex items-center gap-1.5">
          <Sparkles size={12} />
          PRO
        </span>
      </div>

      <div className="bg-surface border border-correct/20 rounded-xl p-4 mb-8">
        <p className="text-white text-sm">
          تم تفعيل اشتراكك بنجاح ✓
        </p>
      </div>

      <button
        onClick={() => router.push("/home")}
        className="w-full h-12 rounded-xl bg-primary text-[#0A0A0A] font-bold hover:opacity-90 transition-opacity"
      >
        ابدأ اللعب
      </button>
    </div>
  );
}

export default function ProSuccessPage() {
  return (
    <div className="h-full overflow-y-auto" dir="rtl">
      <div className="max-w-lg mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-full">
        <div className="w-full max-w-sm mx-auto">
          <Suspense
            fallback={
              <div className="text-center text-muted">جارٍ التحميل...</div>
            }
          >
            <SuccessContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
