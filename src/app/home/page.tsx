"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadStats, loadGameState } from "@/lib/gameState";
import { loadRawabetGameState } from "@/lib/rawabetState";
import { TrendingUp } from "lucide-react";

// حروف icon: 2×3 mini tile grid, Minted / Slate / Saffron pattern
function HoroufIcon() {
  return (
    <div className="grid grid-cols-3 gap-0.5 w-12 h-8 flex-shrink-0">
      <div className="rounded-sm bg-correct opacity-90" />
      <div className="rounded-sm bg-absent opacity-80" />
      <div className="rounded-sm bg-present opacity-90" />
      <div className="rounded-sm bg-correct opacity-90" />
      <div className="rounded-sm bg-correct opacity-90" />
      <div className="rounded-sm bg-absent opacity-80" />
    </div>
  );
}

// ترتيب icon: two bars (higher/lower)
function TarteebIcon() {
  return (
    <div className="flex items-end gap-1 w-12 h-12 flex-shrink-0 pb-1">
      <div className="flex-1 rounded-sm bg-correct opacity-90" style={{ height: "60%" }} />
      <div className="flex-1 rounded-sm bg-primary opacity-90" style={{ height: "100%" }} />
      <TrendingUp size={14} className="text-primary mb-0.5 flex-shrink-0" strokeWidth={2} />
    </div>
  );
}

// روابط icon: 4×4 grid with 4 color groups
function RawabetIcon() {
  const colors = [
    "bg-primary",
    "bg-primary",
    "bg-correct",
    "bg-correct",
    "bg-primary",
    "bg-primary",
    "bg-correct",
    "bg-correct",
    "bg-present",
    "bg-present",
    "bg-accent",
    "bg-accent",
    "bg-present",
    "bg-present",
    "bg-accent",
    "bg-accent",
  ];
  return (
    <div className="grid grid-cols-4 gap-0.5 w-12 h-12 flex-shrink-0">
      {colors.map((c, i) => (
        <div key={i} className={`rounded-sm ${c} opacity-90`} />
      ))}
    </div>
  );
}

export default function HomePage() {
  const [streak, setStreak] = useState(0);
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost" | null>(null);
  const [rawabetStatus, setRawabetStatus] = useState<"playing" | "won" | "lost" | null>(null);

  useEffect(() => {
    const stats = loadStats();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStreak(stats.currentStreak);

    const saved = loadGameState();
    if (saved) {
      setGameStatus(saved.gameStatus);
    }

    const rawabetSaved = loadRawabetGameState();
    if (rawabetSaved) {
      setRawabetStatus(rawabetSaved.gameStatus);
    }

  }, []);

  const gameCompleted = gameStatus === "won" || gameStatus === "lost";
  const rawabetCompleted = rawabetStatus === "won" || rawabetStatus === "lost";

  return (
    <div className="h-full overflow-y-auto bg-background" dir="rtl">
      <div className="max-w-lg mx-auto px-4 pt-5 pb-6">
        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">ألعاب اليوم</h2>
          {streak > 0 && (
            <div className="flex items-center gap-1.5 text-primary bg-primary/20 font-bold text-sm px-2 py-0.5 rounded-full">
              <span>🔥</span>
              <span>{streak}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {/* حروف card — active */}
          <Link href="/" className="block group">
            <div className="bg-surface rounded-2xl p-4 border border-border group-hover:border-primary-light transition-colors">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <HoroufIcon />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-white">حروف</h3>
                    {gameCompleted ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-correct bg-correct/10 px-2.5 py-0.5 rounded-full border border-correct/20 flex-shrink-0">
                        ✓ أنهيت اليوم
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-light bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 flex-shrink-0">
                        جاهزة
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted leading-relaxed">
                    خمّن الكلمة اليومية في ٦ محاولات
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* روابط card — active */}
          <Link href="/rawabet" className="block group">
            <div className="bg-surface rounded-2xl p-4 border border-border group-hover:border-primary-light transition-colors">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <RawabetIcon />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-white">روابط</h3>
                    {rawabetCompleted ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-correct bg-correct/10 px-2.5 py-0.5 rounded-full border border-correct/20 flex-shrink-0">
                        ✓ أنهيت اليوم
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-light bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 flex-shrink-0">
                        العب
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted leading-relaxed">
                    اربط الكلمات المتشابهة في مجموعات
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* نحلة card */}
          <Link href="/nahla" className="block group">
            <div className="bg-surface rounded-2xl p-4 border border-border group-hover:border-primary-light transition-colors">
              <div className="flex items-start gap-4">
                <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
                  <span className="text-3xl">🐝</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-white">نحلة</h3>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-light bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 flex-shrink-0">
                      العب
                    </span>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">
                    كوّن كلمات من ٧ أحرف — النحلة تنتظرك
                  </p>
                </div>
              </div>
            </div>
          </Link>
          {/* خربشة card */}
          <Link href="/kharbasha" className="block group">
            <div className="bg-surface rounded-2xl p-4 border border-border group-hover:border-primary-light transition-colors">
              <div className="flex items-start gap-4">
                <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
                  <span className="text-3xl">🔄</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-white">خربشة</h3>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-light bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 flex-shrink-0">
                      العب
                    </span>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">
                    رتّب الأحرف واكتشف الكلمة المخفية
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* ترتيب card */}
          <Link href="/tarteeb" className="block group">
            <div className="bg-surface rounded-2xl p-4 border border-border group-hover:border-primary-light transition-colors">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <TarteebIcon />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-white">ترتيب</h3>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-light bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 flex-shrink-0">
                      العب
                    </span>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">
                    خمّن أيهما أعلى قيمة في ١٠ جولات
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
