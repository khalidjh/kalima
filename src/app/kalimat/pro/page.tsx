"use client";

import Link from "next/link";
import { Check } from "lucide-react";

const FEATURES = [
  { icon: "🎮", text: "كل الألعاب مفتوحة بدون قيود" },
  { icon: "🏆", text: "مستويات متقدمة لكل لعبة" },
  { icon: "📊", text: "تقارير تقدّم مفصّلة للوالدين" },
  { icon: "🚫", text: "بدون إعلانات نهائياً" },
  { icon: "🎨", text: "ثيمات وشخصيات إضافية" },
  { icon: "👨‍👩‍👧‍👦", text: "حسابات متعددة للأطفال" },
];

function PlanCard({
  title,
  price,
  period,
  highlight,
  badge,
}: {
  title: string;
  price: string;
  period: string;
  highlight?: boolean;
  badge?: string;
}) {
  return (
    <div
      className="relative rounded-2xl p-5 text-center transition-all duration-200"
      style={{
        background: highlight ? "linear-gradient(135deg, #FF922B 0%, #FF6B6B 50%, #E64980 100%)" : "#FFFFFF",
        border: highlight ? "none" : "2px solid #E0E0E0",
        boxShadow: highlight ? "0 8px 32px rgba(255,105,135,0.3)" : "0 2px 8px rgba(0,0,0,0.05)",
        color: highlight ? "#FFFFFF" : "#2D3436",
      }}
    >
      {badge && (
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold px-3 py-1 rounded-full"
          style={{
            background: "#FFD43B",
            color: "#2D3436",
          }}
        >
          {badge}
        </span>
      )}
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      <div className="flex items-baseline justify-center gap-1 mb-1">
        <span className="text-3xl font-black">{price}</span>
        <span className="text-sm opacity-70">ر.س</span>
      </div>
      <p className="text-sm opacity-70 mb-4">{period}</p>
      <button
        className="w-full py-3 rounded-xl font-bold text-base transition-all duration-200 active:scale-95"
        style={{
          background: highlight ? "rgba(255,255,255,0.2)" : "linear-gradient(135deg, #FF922B, #E64980)",
          color: "#FFFFFF",
          backdropFilter: highlight ? "blur(8px)" : undefined,
        }}
      >
        اشترك الآن
      </button>
    </div>
  );
}

export default function KalimatProPage() {
  return (
    <div className="max-w-lg mx-auto px-5 pt-6 pb-12">
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
      <div className="grid grid-cols-2 gap-3 mb-8">
        <PlanCard title="شهري" price="١٤.٩٩" period="في الشهر" />
        <PlanCard
          title="سنوي"
          price="٩.٩٩"
          period="في الشهر"
          highlight
          badge="وفّر ٣٣٪"
        />
      </div>

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
