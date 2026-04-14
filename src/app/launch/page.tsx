"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// ── Animated tile grid that simulates a game being played ──
function LiveGameDemo() {
  const rows = [
    { letters: ["ك", "ل", "م", "ة"], states: ["correct", "correct", "correct", "correct"] },
    { letters: ["ن", "ه", "م", "ة"], states: ["absent", "absent", "present", "correct"] },
    { letters: ["ش", "ج", "ر", "ة"], states: ["absent", "absent", "absent", "correct"] },
  ];
  const [visibleRows, setVisibleRows] = useState(0);
  const [revealedCols, setRevealedCols] = useState<number[]>([]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    let delay = 600;
    for (let r = 0; r < rows.length; r++) {
      timers.push(setTimeout(() => setVisibleRows(r + 1), delay));
      for (let c = 0; c < 4; c++) {
        timers.push(
          setTimeout(() => setRevealedCols((prev) => [...prev, r * 4 + c]), delay + 200 + c * 180)
        );
      }
      delay += 1200;
    }
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stateColor = (s: string) =>
    s === "correct" ? "#22A65A" : s === "present" ? "#F5820A" : "#2A2400";

  return (
    <div className="flex flex-col gap-1.5">
      {rows.map((row, ri) => (
        <div
          key={ri}
          className="flex gap-1.5 justify-center"
          style={{
            opacity: ri < visibleRows ? 1 : 0,
            transform: ri < visibleRows ? "translateY(0)" : "translateY(8px)",
            transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {row.letters.map((letter, ci) => {
            const idx = ri * 4 + ci;
            const revealed = revealedCols.includes(idx);
            return (
              <div
                key={ci}
                className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-lg sm:text-xl font-bold border-2 rounded-lg"
                style={{
                  background: revealed ? stateColor(row.states[ci]) : "#1A1A1A",
                  borderColor: revealed ? stateColor(row.states[ci]) : "#3A3A3A",
                  color: "#fff",
                  transform: revealed ? "rotateX(0deg)" : "rotateX(0deg)",
                  transition: "background 0.3s, border-color 0.3s",
                }}
              >
                <span style={{ fontVariantLigatures: "none", unicodeBidi: "isolate" }}>
                  {letter}
                </span>
              </div>
            );
          })}
        </div>
      ))}
      {/* Empty rows */}
      {[...Array(3)].map((_, i) => (
        <div key={`empty-${i}`} className="flex gap-1.5 justify-center">
          {[...Array(4)].map((_, j) => (
            <div
              key={j}
              className="w-12 h-12 sm:w-14 sm:h-14 border-2 rounded-lg"
              style={{ borderColor: "#2A2A2A", background: "#1A1A1A" }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Floating particles ──
function Particles() {
  const particles = useRef(
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 3,
    }))
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.current.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: "#CCFF00",
            opacity: 0.15,
            animation: `launch-float ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

// ── Game showcase card ──
function GameShowcase({
  icon,
  title,
  desc,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  delay: number;
}) {
  return (
    <div
      className="group relative bg-[#1A1A1A]/80 backdrop-blur-sm rounded-2xl p-5 border border-[#2A2A2A] hover:border-[#CCFF00]/30 transition-all duration-500"
      style={{ animation: `launch-rise 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s both` }}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#CCFF00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative">
        <div className="w-12 h-12 rounded-xl bg-[#0F0C00] border border-[#2A2A2A] flex items-center justify-center mb-3 group-hover:border-[#CCFF00]/20 transition-colors">
          {icon}
        </div>
        <h3 className="text-white font-bold text-lg mb-1">{title}</h3>
        <p className="text-[#999] text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ── Stat counter ──
function StatBlock({ value, label, delay }: { value: string; label: string; delay: number }) {
  return (
    <div
      className="text-center"
      style={{ animation: `launch-rise 0.6s ease-out ${delay}s both` }}
    >
      <div className="text-3xl sm:text-4xl font-black text-[#CCFF00]">{value}</div>
      <div className="text-xs sm:text-sm text-[#999] mt-1">{label}</div>
    </div>
  );
}

// ── Mini icons for game cards ──
function HoroufMini() {
  return (
    <div className="grid grid-cols-2 gap-[3px] w-8 h-8">
      <div className="rounded-[3px] bg-[#22A65A]" />
      <div className="rounded-[3px] bg-[#F5820A]" />
      <div className="rounded-[3px] bg-[#2A2400]" />
      <div className="rounded-[3px] bg-[#22A65A]" />
    </div>
  );
}

function WaffleMini() {
  return (
    <div className="grid grid-cols-3 gap-[2px] w-8 h-8">
      {[1, 1, 1, 1, 0, 1, 1, 1, 1].map((v, i) =>
        v ? (
          <div key={i} className={`rounded-[2px] ${i % 2 === 0 ? "bg-[#22A65A]" : "bg-[#CCFF00]"}`} />
        ) : (
          <div key={i} />
        )
      )}
    </div>
  );
}

function RawabetMini() {
  return (
    <div className="grid grid-cols-4 gap-[2px] w-8 h-8">
      {Array.from({ length: 16 }, (_, i) => (
        <div key={i} className={`rounded-[1px] ${i % 3 === 0 ? "bg-[#CCFF00]" : i % 3 === 1 ? "bg-[#22A65A]" : "bg-[#F5820A]"}`} />
      ))}
    </div>
  );
}

function RubaeiMini() {
  return (
    <div className="grid grid-cols-2 gap-1 w-8 h-8">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="grid grid-cols-2 gap-[1px]">
          {[0, 1, 2, 3].map((j) => (
            <div key={j} className={`rounded-[1px] ${j % 2 === 0 ? "bg-[#22A65A]" : "bg-[#F5820A]"}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

function CrosswordMini() {
  return (
    <div className="grid grid-cols-4 gap-[2px] w-8 h-8">
      {[1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0].map((v, i) =>
        v ? (
          <div key={i} className="rounded-[1px] bg-[#CCFF00]" />
        ) : (
          <div key={i} className="rounded-[1px] bg-[#0F0C00]" />
        )
      )}
    </div>
  );
}

function KalimatMini() {
  return (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: "linear-gradient(135deg, #FF922B, #FFD43B)" }}>
      📝
    </div>
  );
}

export default function LaunchPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-full overflow-y-auto bg-[#0F0C00] text-white" dir="rtl">
      <style>{`
        @keyframes launch-float {
          from { transform: translateY(0px) scale(1); opacity: 0.15; }
          to { transform: translateY(-30px) scale(1.5); opacity: 0.05; }
        }
        @keyframes launch-rise {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes launch-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes launch-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @keyframes launch-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes launch-typing {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes launch-blink {
          0%, 50% { border-color: #CCFF00; }
          51%, 100% { border-color: transparent; }
        }
        @keyframes launch-shake-subtle {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
        .launch-text-gradient {
          background: linear-gradient(135deg, #CCFF00 0%, #88DD00 40%, #FFFF33 100%);
          background-size: 200% 200%;
          animation: launch-gradient 4s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .launch-line-glow {
          background: linear-gradient(90deg, transparent, #CCFF00, transparent);
          animation: launch-glow 3s ease-in-out infinite;
        }
        .launch-grid-pattern {
          background-image:
            linear-gradient(rgba(204,255,0,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(204,255,0,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .launch-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
        }
      `}</style>

      {/* Grid pattern overlay */}
      <div className="fixed inset-0 launch-grid-pattern pointer-events-none" />
      <div className="fixed inset-0 launch-noise pointer-events-none" />
      <Particles />

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-4 overflow-hidden">
        {/* Radial glow behind hero */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(204,255,0,0.08) 0%, transparent 70%)",
            animation: "launch-glow 4s ease-in-out infinite",
          }}
        />

        <div className="relative z-10 text-center max-w-2xl mx-auto">
          {/* Logo mark */}
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6"
            style={{
              background: "linear-gradient(135deg, #CCFF00, #88DD00)",
              boxShadow: "0 0 60px rgba(204,255,0,0.2), 0 8px 32px rgba(0,0,0,0.4)",
              animation: mounted ? "launch-rise 0.6s ease-out both, launch-pulse 3s ease-in-out 1s infinite" : "none",
            }}
          >
            <span className="text-[#0F0C00] font-black text-4xl" style={{ fontFamily: "'Cairo', sans-serif" }}>
              ك
            </span>
          </div>

          {/* Title */}
          <h1
            className="text-5xl sm:text-7xl font-black mb-4 leading-tight"
            style={{ animation: mounted ? "launch-rise 0.6s ease-out 0.15s both" : "none" }}
          >
            <span className="launch-text-gradient">كلمة</span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-xl sm:text-2xl text-[#999] mb-2 font-medium"
            style={{ animation: mounted ? "launch-rise 0.6s ease-out 0.3s both" : "none" }}
          >
            منصة ألعاب الكلمات العربية
          </p>

          {/* Tagline */}
          <p
            className="text-sm sm:text-base text-[#666] mb-8 max-w-md mx-auto leading-relaxed"
            style={{ animation: mounted ? "launch-rise 0.6s ease-out 0.4s both" : "none" }}
          >
            ١٠ ألعاب يومية ، لغز جديد كل يوم ، تحدّ نفسك وشارك أصدقاءك
          </p>

          {/* CTA */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
            style={{ animation: mounted ? "launch-rise 0.6s ease-out 0.5s both" : "none" }}
          >
            <Link
              href="/home"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(204,255,0,0.3)] active:scale-95"
              style={{
                background: "linear-gradient(135deg, #CCFF00, #88DD00)",
                color: "#0F0C00",
              }}
            >
              العب الآن
              <span className="text-xl">←</span>
            </Link>
          </div>
        </div>

        {/* Live demo */}
        <div
          className="relative z-10 mt-12"
          style={{ animation: mounted ? "launch-rise 0.8s ease-out 0.7s both" : "none" }}
        >
          <LiveGameDemo />
        </div>

      </section>

      {/* ═══════════════ DIVIDER ═══════════════ */}
      <div className="h-px launch-line-glow mx-auto max-w-md" />

      {/* ═══════════════ STATS ═══════════════ */}
      <section className="py-16 px-4 relative">
        <div className="max-w-lg mx-auto">
          <div className="grid grid-cols-3 gap-6">
            <StatBlock value="١٠+" label="لعبة يومية" delay={0.1} />
            <StatBlock value="∞" label="تحدّيات" delay={0.2} />
            <StatBlock value="١١" label="لعبة أطفال" delay={0.3} />
          </div>
        </div>
      </section>

      {/* ═══════════════ DIVIDER ═══════════════ */}
      <div className="h-px launch-line-glow mx-auto max-w-md" />

      {/* ═══════════════ GAMES SHOWCASE ═══════════════ */}
      <section className="py-16 px-4 relative">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2
              className="text-3xl sm:text-4xl font-black text-white mb-3"
              style={{ animation: "launch-rise 0.6s ease-out both" }}
            >
              ألعاب لكل يوم
            </h2>
            <p className="text-[#999] text-sm sm:text-base max-w-md mx-auto">
              مجموعة متنوعة من ألعاب الكلمات العربية. كل لعبة تتجدد يومياً بلغز جديد.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GameShowcase
              icon={<HoroufMini />}
              title="حروف"
              desc="خمّن الكلمة من ٤ أحرف في ٦ محاولات"
              delay={0.1}
            />
            <GameShowcase
              icon={<WaffleMini />}
              title="وافل"
              desc="رتّب الحروف في شبكة الوافل"
              delay={0.2}
            />
            <GameShowcase
              icon={<RawabetMini />}
              title="روابط"
              desc="اكتشف الروابط بين ١٦ كلمة"
              delay={0.3}
            />
            <GameShowcase
              icon={<RubaeiMini />}
              title="رباعي"
              desc="حل ٤ ألغاز كلمات في وقت واحد"
              delay={0.4}
            />
            <GameShowcase
              icon={<CrosswordMini />}
              title="متقاطعة"
              desc="كلمات متقاطعة مصغّرة يومية"
              delay={0.5}
            />
            <GameShowcase
              icon={<KalimatMini />}
              title="Kalimat كلمات"
              desc="١١ لعبة تعليمية ممتعة للأطفال"
              delay={0.6}
            />
          </div>

          {/* +more indicator */}
          <div className="text-center mt-6">
            <span className="text-[#666] text-sm">
              + سلسلة ، اقتباس ، نحلة ، خربشة ، ترتيب
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════════ DIVIDER ═══════════════ */}
      <div className="h-px launch-line-glow mx-auto max-w-md" />

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section className="py-16 px-4 relative">
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-white text-center mb-10">
            كيف تلعب؟
          </h2>

          <div className="space-y-6">
            {[
              {
                step: "١",
                title: "خمّن الكلمة",
                desc: "اكتب كلمة عربية من ٤ أحرف",
                color: "#CCFF00",
              },
              {
                step: "٢",
                title: "اقرأ الألوان",
                desc: "أخضر = صحيح ، برتقالي = مكان خاطئ ، غامق = غير موجود",
                color: "#22A65A",
              },
              {
                step: "٣",
                title: "شارك نتيجتك",
                desc: "انسخ نتيجتك وشاركها مع أصدقائك",
                color: "#F5820A",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4"
                style={{ animation: `launch-rise 0.6s ease-out ${0.1 + i * 0.15}s both` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0"
                  style={{ background: item.color, color: "#0F0C00" }}
                >
                  {item.step}
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{item.title}</h3>
                  <p className="text-[#999] text-sm mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ DIVIDER ═══════════════ */}
      <div className="h-px launch-line-glow mx-auto max-w-md" />

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section className="py-16 px-4 relative">
        <div className="max-w-lg mx-auto grid grid-cols-2 gap-4">
          {[
            { icon: "🔥", title: "سلاسل الانتصار", desc: "حافظ على سلسلتك اليومية" },
            { icon: "📊", title: "إحصائياتك", desc: "تابع تقدمك ونتائجك" },
            { icon: "🛡️", title: "الوضع الصعب", desc: "تحدّ إضافي للمحترفين" },
            { icon: "📦", title: "الأرشيف", desc: "العب ألغاز الأيام السابقة" },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-[#1A1A1A]/60 backdrop-blur-sm rounded-xl p-4 border border-[#2A2A2A]"
              style={{ animation: `launch-rise 0.6s ease-out ${0.1 + i * 0.1}s both` }}
            >
              <span className="text-2xl mb-2 block">{f.icon}</span>
              <h3 className="text-white font-bold text-sm mb-0.5">{f.title}</h3>
              <p className="text-[#999] text-xs">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ FINAL CTA ═══════════════ */}
      <section className="py-20 px-4 relative">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(204,255,0,0.06) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 text-center max-w-md mx-auto">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
            style={{
              background: "linear-gradient(135deg, #CCFF00, #88DD00)",
              boxShadow: "0 0 40px rgba(204,255,0,0.15)",
            }}
          >
            <span className="text-[#0F0C00] font-black text-3xl" style={{ fontFamily: "'Cairo', sans-serif" }}>
              ك
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
            جاهز للتحدي؟
          </h2>
          <p className="text-[#999] text-sm mb-6">
            لغز جديد كل يوم. ابدأ الآن وشارك أصدقاءك.
          </p>
          <Link
            href="/home"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(204,255,0,0.3)] active:scale-95"
            style={{
              background: "linear-gradient(135deg, #CCFF00, #88DD00)",
              color: "#0F0C00",
            }}
          >
            العب الآن
            <span className="text-xl">←</span>
          </Link>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="py-8 px-4 border-t border-[#1A1A1A]">
        <div className="max-w-lg mx-auto flex items-center justify-between text-xs text-[#666]">
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded flex items-center justify-center"
              style={{ background: "#CCFF00" }}
            >
              <span className="text-[#0F0C00] font-bold text-[10px]">ك</span>
            </div>
            <span>kalima.fun</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-[#999] transition-colors">الخصوصية</Link>
            <Link href="/terms" className="hover:text-[#999] transition-colors">الشروط</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
