"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { Check } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { MOYASAR_PUBLISHABLE_KEY } from "@/lib/subscription";

const FEATURES = [
  { icon: "🎮", text: "كل الألعاب مفتوحة بدون قيود" },
  { icon: "🏆", text: "مستويات متقدمة لكل لعبة" },
  { icon: "📊", text: "تقارير تقدّم مفصّلة للوالدين" },
  { icon: "🚫", text: "بدون إعلانات نهائياً" },
  { icon: "🎨", text: "ثيمات وشخصيات إضافية" },
  { icon: "👨‍👩‍👧‍👦", text: "حسابات متعددة للأطفال" },
];

const PLANS = [
  { id: "monthly", title: "شهري", price: "١٤.٩٩", priceNum: 1499, period: "في الشهر" },
  { id: "yearly", title: "سنوي", price: "٩.٩٩", priceNum: 999, period: "في الشهر", highlight: true, badge: "وفّر ٣٣٪" },
];

declare global {
  interface Window {
    Moyasar?: {
      init: (config: Record<string, unknown>) => void;
    };
  }
}

export default function KalimatProPage() {
  const { user, signInWithGoogle } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [moyasarReady, setMoyasarReady] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const formInitRef = useRef<string | null>(null);

  // Initialize Moyasar form when a plan is selected
  useEffect(() => {
    if (!selectedPlan || !user || !moyasarReady || !window.Moyasar) return;
    if (!MOYASAR_PUBLISHABLE_KEY) return;
    if (!formRef.current) return;

    const plan = PLANS.find(p => p.id === selectedPlan);
    if (!plan) return;

    // Only init once per plan selection
    const key = `${user.uid}_${selectedPlan}`;
    if (formInitRef.current === key) return;
    formInitRef.current = key;

    // Clear previous form
    formRef.current.innerHTML = "";

    const appUrl = typeof window !== "undefined" ? window.location.origin : "https://kalima.fun";

    window.Moyasar.init({
      element: formRef.current,
      amount: plan.priceNum,
      currency: "SAR",
      description: `Kalimat Plus - ${plan.title}`,
      publishable_api_key: MOYASAR_PUBLISHABLE_KEY,
      callback_url: `${appUrl}/pro/success`,
      methods: ["creditcard"],
      supported_networks: ["mada", "visa", "mastercard"],
      language: "ar",
      metadata: { uid: user.uid, plan: selectedPlan },
    });
  }, [selectedPlan, user, moyasarReady]);

  const handleSelectPlan = (planId: string) => {
    if (!user) {
      signInWithGoogle();
      return;
    }
    formInitRef.current = null; // reset so form re-inits
    setSelectedPlan(planId);
  };

  return (
    <div className="max-w-lg mx-auto px-5 pt-6 pb-12">
      {/* Moyasar SDK */}
      <link rel="stylesheet" href="https://cdn.moyasar.com/mpf/1.14.0/moyasar.css" />
      <Script
        src="https://cdn.moyasar.com/mpf/1.14.0/moyasar.js"
        strategy="afterInteractive"
        onReady={() => setMoyasarReady(true)}
      />

      {/* Hero */}
      <div className="text-center mb-8" style={{ animation: "bounce-in 0.5s ease-out both" }}>
        <div className="text-5xl mb-3">✨</div>
        <h1 className="text-2xl font-black mb-2" style={{ color: "#2D3436" }}>
          Kalimat Plus
        </h1>
        <p className="text-sm" style={{ color: "#636E72" }}>
          تجربة تعليمية كاملة بدون حدود
        </p>
      </div>

      {/* Features */}
      <div className="space-y-3 mb-8">
        {FEATURES.map((f, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{
              background: "#FFFFFF",
              border: "1px solid #F0E6D9",
              animation: `bounce-in 0.4s ease-out ${0.1 + i * 0.06}s both`,
            }}
          >
            <span className="text-xl flex-shrink-0">{f.icon}</span>
            <span className="text-sm font-semibold flex-1" style={{ color: "#2D3436" }}>
              {f.text}
            </span>
            <Check size={16} className="flex-shrink-0" style={{ color: "#51CF66" }} />
          </div>
        ))}
      </div>

      {/* Plans */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl p-5 text-center transition-all duration-200 cursor-pointer ${
              selectedPlan === plan.id ? "ring-2 ring-offset-2" : ""
            }`}
            style={{
              background: plan.highlight
                ? "linear-gradient(135deg, #FF922B 0%, #FF6B6B 50%, #E64980 100%)"
                : "#FFFFFF",
              border: plan.highlight ? "none" : "2px solid #E0E0E0",
              boxShadow: plan.highlight
                ? "0 8px 32px rgba(255,105,135,0.3)"
                : "0 2px 8px rgba(0,0,0,0.05)",
              color: plan.highlight ? "#FFFFFF" : "#2D3436",
            }}
            onClick={() => handleSelectPlan(plan.id)}
          >
            {plan.badge && (
              <span
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold px-3 py-1 rounded-full"
                style={{ background: "#FFD43B", color: "#2D3436" }}
              >
                {plan.badge}
              </span>
            )}
            <h3 className="font-bold text-lg mb-1">{plan.title}</h3>
            <div className="flex items-baseline justify-center gap-1 mb-1">
              <span className="text-3xl font-black">{plan.price}</span>
              <span className="text-sm opacity-70">ر.س</span>
            </div>
            <p className="text-sm opacity-70 mb-4">{plan.period}</p>
            <div
              className="w-full py-3 rounded-xl font-bold text-base transition-all duration-200 active:scale-95"
              style={{
                background: plan.highlight
                  ? "rgba(255,255,255,0.2)"
                  : "linear-gradient(135deg, #FF922B, #E64980)",
                color: "#FFFFFF",
              }}
            >
              {!user ? "سجّل دخول واشترك" : "اشترك الآن"}
            </div>
          </div>
        ))}
      </div>

      {/* Payment form */}
      {selectedPlan && user && (
        <div
          className="rounded-2xl p-5 mb-6"
          style={{
            background: "#FFFFFF",
            border: "1px solid #F0E6D9",
          }}
        >
          <h3 className="font-bold text-base mb-3 text-center" style={{ color: "#2D3436" }}>
            أدخل بيانات الدفع
          </h3>
          <div ref={formRef} />
        </div>
      )}

      {/* Trust signals */}
      <div className="text-center space-y-2 mb-6">
        <p className="text-xs" style={{ color: "#636E72" }}>
          يمكنك إلغاء الاشتراك في أي وقت
        </p>
        <div className="flex items-center justify-center gap-4 text-xs" style={{ color: "#999" }}>
          <span>🔒 دفع آمن</span>
          <span>•</span>
          <span>7 أيام تجربة مجانية</span>
        </div>
      </div>

      {/* Back */}
      <div className="text-center">
        <Link
          href="/kalimat"
          className="text-sm font-semibold transition-colors"
          style={{ color: "#636E72" }}
        >
          ← رجوع للألعاب
        </Link>
      </div>
    </div>
  );
}
