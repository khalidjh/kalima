"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useIsPro } from "@/lib/subscription";

const FEATURES = [
  { text: "أرشيف الألغاز — العب أي يوم سابق" },
  { text: "الوضع الصعب — قواعد أصعب وتحدي أكبر" },
  { text: "إحصائيات تفصيلية — تتبع تقدمك كاملاً" },
  { text: "بدون إعلانات إلى الأبد" },
  { text: "تزامن التقدم عبر الأجهزة" },
];

export default function ProPage() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const { isPro, proLoading } = useIsPro(user);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubscribe = async () => {
    if (!user) return;
    setCheckoutLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/moyasar/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "حدث خطأ في الاتصال");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
      setCheckoutLoading(false);
    }
  };

  const isLoading = authLoading || proLoading;

  return (
    <div
      className="min-h-screen bg-[#0F0E17] flex flex-col items-center justify-center px-4 py-12"
      dir="rtl"
      style={{ fontFamily: "'IBM Plex Arabic', sans-serif" }}
    >
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 right-4 text-[#7A7589] hover:text-white transition-colors text-sm"
      >
        ← رجوع
      </button>

      <div className="w-full max-w-sm mx-auto">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span className="bg-[#6B35C8]/20 border border-[#6B35C8]/50 text-[#9B6FE8] text-xs font-semibold px-3 py-1 rounded-full tracking-widest uppercase">
            PRO
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl font-bold text-white text-center mb-2">كلمة برو</h1>
        <p className="text-[#7A7589] text-center mb-8 text-sm">
          تجربة ألعاب كاملة بدون حدود
        </p>

        {/* Price card */}
        <div className="bg-[#1E1B24] border border-[#6B35C8]/30 rounded-2xl p-6 mb-6 shadow-lg shadow-[#6B35C8]/10">
          <div className="text-center mb-6">
            <span className="text-5xl font-bold text-white">٩٫٩٩</span>
            <span className="text-[#7A7589] text-lg mr-2">ريال / شهر</span>
          </div>

          {/* Features */}
          <ul className="space-y-3">
            {FEATURES.map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-[#6B35C8] font-bold text-lg leading-tight flex-shrink-0">
                  ✓
                </span>
                <span className="text-[#F0EDE8] text-sm leading-relaxed">{feature.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA / State */}
        {isLoading ? (
          <div className="h-14 bg-[#1E1B24] rounded-xl animate-pulse" />
        ) : isPro ? (
          <div className="w-full h-14 rounded-xl bg-[#3DAA7A]/20 border border-[#3DAA7A]/50 flex items-center justify-center gap-2">
            <span className="text-[#3DAA7A] font-semibold text-lg">أنت مشترك!</span>
            <span className="text-xl">✓</span>
          </div>
        ) : !user ? (
          <div className="space-y-3">
            <p className="text-[#7A7589] text-center text-sm">
              سجّل دخولك أولاً للاشتراك
            </p>
            <button
              onClick={signInWithGoogle}
              className="w-full h-14 rounded-xl bg-white text-[#0F0E17] font-semibold text-base flex items-center justify-center gap-3 hover:bg-[#F0EDE8] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              سجّل دخولك بـ Google
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {error && (
              <p className="text-[#E8604C] text-center text-sm">{error}</p>
            )}
            <button
              onClick={handleSubscribe}
              disabled={checkoutLoading}
              className="w-full h-14 rounded-xl bg-[#6B35C8] hover:bg-[#7A45D8] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-lg transition-colors shadow-lg shadow-[#6B35C8]/30"
            >
              {checkoutLoading ? "جاري التحويل..." : "اشترك الآن"}
            </button>
            <p className="text-[#7A7589] text-center text-xs">
              يمكنك الإلغاء في أي وقت · دفع آمن عبر Moyasar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
