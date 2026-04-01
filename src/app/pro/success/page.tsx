"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { setUserPro } from "@/lib/subscription";
import { Suspense } from "react";
import { Sparkles } from "lucide-react";

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
        <div className="w-16 h-16 rounded-full bg-[#F5C200]/20 border-2 border-[#F5C200] flex items-center justify-center mx-auto mb-6 animate-pulse">
          <span className="text-2xl">⏳</span>
        </div>
        <p className="text-[#8A7A3A]">جارٍ التحقق من الدفع...</p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-[#F5820A]/20 border-2 border-[#F5820A] flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">✕</span>
        </div>
        <h1 className="text-2xl font-bold text-[#FFF8DC] mb-3">لم يتم الدفع</h1>
        <p className="text-[#8A7A3A] text-sm mb-8">
          حدث خطأ أثناء معالجة الدفع. يمكنك المحاولة مجدداً.
        </p>
        <button
          onClick={() => router.push("/pro")}
          className="w-full h-12 rounded-xl bg-[#F5C200] hover:bg-[#FFD740] text-[#0F0C00] font-semibold transition-colors"
        >
          حاول مجدداً
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="w-20 h-20 rounded-full bg-[#22A65A]/20 border-2 border-[#22A65A] flex items-center justify-center mx-auto mb-6">
        <span className="text-4xl">🎉</span>
      </div>
      <h1 className="text-3xl font-bold text-[#FFF8DC] mb-2">تم الاشتراك بنجاح!</h1>
      <p className="text-[#8A7A3A] text-sm mb-2">مرحباً بك في كلمة برو</p>
      <div className="flex justify-center gap-1 mb-8">
        <span className="bg-[#F5C200]/20 border border-[#F5C200]/50 text-[#F5C200] text-xs font-semibold px-3 py-1 rounded-full tracking-widest uppercase flex items-center gap-1.5">
          <Sparkles size={12} />
          PRO
        </span>
      </div>

      <div className="bg-[#1E1900] border border-[#22A65A]/20 rounded-xl p-4 mb-8">
        <p className="text-[#FFF8DC] text-sm">
          تم تفعيل اشتراكك ✓ يمكنك الآن الوصول إلى جميع المزايا
        </p>
      </div>

      <button
        onClick={() => router.push("/home")}
        className="w-full h-14 rounded-xl bg-[#F5C200] hover:bg-[#FFD740] text-[#0F0C00] font-bold text-lg transition-colors shadow-lg shadow-[#F5C200]/30"
      >
        ابدأ اللعب
      </button>
    </div>
  );
}

export default function ProSuccessPage() {
  return (
    <div
      className="min-h-screen bg-[#0F0C00] flex flex-col items-center justify-center px-4 py-12"
      dir="rtl"
      style={{ fontFamily: "'Cairo', sans-serif" }}
    >
      <div className="w-full max-w-sm mx-auto">
        <Suspense
          fallback={
            <div className="text-center text-[#8A7A3A]">جارٍ التحميل...</div>
          }
        >
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
