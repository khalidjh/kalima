"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { setUserPro } from "@/lib/subscription";
import { Suspense } from "react";

function SuccessContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const didRun = useRef(false);

  const paymentStatus = searchParams.get("status");

  useEffect(() => {
    if (authLoading) return;
    if (didRun.current) return;
    didRun.current = true;

    async function activate() {
      if (paymentStatus !== "paid") {
        setStatus("failed");
        return;
      }
      if (user) {
        await setUserPro(user.uid);
      }
      setStatus("success");
    }

    void activate();
  }, [authLoading, user, paymentStatus]);

  if (status === "loading") {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-[#6B35C8]/20 border-2 border-[#6B35C8] flex items-center justify-center mx-auto mb-6 animate-pulse">
          <span className="text-2xl">⏳</span>
        </div>
        <p className="text-[#7A7589]">جارٍ التحقق من الدفع...</p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-[#E8604C]/20 border-2 border-[#E8604C] flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">✕</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">لم يتم الدفع</h1>
        <p className="text-[#7A7589] text-sm mb-8">
          حدث خطأ أثناء معالجة الدفع. يمكنك المحاولة مجدداً.
        </p>
        <button
          onClick={() => router.push("/pro")}
          className="w-full h-12 rounded-xl bg-[#6B35C8] hover:bg-[#7A45D8] text-white font-semibold transition-colors"
        >
          حاول مجدداً
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="w-20 h-20 rounded-full bg-[#3DAA7A]/20 border-2 border-[#3DAA7A] flex items-center justify-center mx-auto mb-6">
        <span className="text-4xl">🎉</span>
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">تم الاشتراك بنجاح!</h1>
      <p className="text-[#7A7589] text-sm mb-2">مرحباً بك في كلمة برو</p>
      <div className="flex justify-center gap-1 mb-8">
        <span className="bg-[#6B35C8]/20 border border-[#6B35C8]/50 text-[#9B6FE8] text-xs font-semibold px-3 py-1 rounded-full tracking-widest uppercase">
          PRO
        </span>
      </div>

      <div className="bg-[#1E1B24] border border-[#3DAA7A]/20 rounded-xl p-4 mb-8">
        <p className="text-[#F0EDE8] text-sm">
          تم تفعيل اشتراكك ✓ يمكنك الآن الوصول إلى جميع المزايا
        </p>
      </div>

      <button
        onClick={() => router.push("/home")}
        className="w-full h-14 rounded-xl bg-[#6B35C8] hover:bg-[#7A45D8] text-white font-bold text-lg transition-colors shadow-lg shadow-[#6B35C8]/30"
      >
        ابدأ اللعب
      </button>
    </div>
  );
}

export default function ProSuccessPage() {
  return (
    <div
      className="min-h-screen bg-[#0F0E17] flex flex-col items-center justify-center px-4 py-12"
      dir="rtl"
      style={{ fontFamily: "'IBM Plex Arabic', sans-serif" }}
    >
      <div className="w-full max-w-sm mx-auto">
        <Suspense
          fallback={
            <div className="text-center text-[#7A7589]">جارٍ التحميل...</div>
          }
        >
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
