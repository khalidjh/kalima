"use client";

import { useEffect, useState } from "react";
import { RawabetCategory, CategoryColor } from "@/data/rawabet";
import { RawabetStats } from "@/lib/rawabetState";

const COLOR_EMOJI: Record<CategoryColor, string> = {
  yellow: "🟡",
  green: "🟢",
  blue: "🔵",
  red: "🟠",
};

const COLOR_LABEL: Record<CategoryColor, string> = {
  yellow: "سهل",
  green: "متوسط",
  blue: "صعب",
  red: "صعب جداً",
};

const COLOR_BG: Record<CategoryColor, string> = {
  yellow: "bg-[#F5C842]",
  green: "bg-[#4ADE80]",
  blue: "bg-[#60A5FA]",
  red: "bg-[#F5820A]",
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  gameStatus: "won" | "lost";
  foundCategories: RawabetCategory[];
  allCategories: RawabetCategory[];
  mistakes: number;
  puzzleNumber: number;
  stats: RawabetStats;
}

function getCountdown(): string {
  const riyadhOffset = 3 * 60;
  const now = new Date();
  const utcNow = now.getTime() + now.getTimezoneOffset() * 60000;
  const riyadhNow = new Date(utcNow + riyadhOffset * 60000);

  const nextMidnight = new Date(riyadhNow);
  nextMidnight.setHours(24, 0, 0, 0);
  const diff = nextMidnight.getTime() - riyadhNow.getTime();

  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function RawabetResultModal({
  isOpen,
  onClose,
  gameStatus,
  foundCategories,
  allCategories,
  mistakes,
  puzzleNumber,
  stats,
}: Props) {
  const [countdown, setCountdown] = useState(getCountdown());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => setCountdown(getCountdown()), 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  function buildShareText(): string {
    const lines: string[] = [];
    lines.push(`روابط #${puzzleNumber}`);

    // Show order in which categories were found (by the foundCategories array)
    // Then show not-found as X
    const orderedColors = foundCategories.map((c) => COLOR_EMOJI[c.color]);
    const notFoundCount = 4 - foundCategories.length;
    for (let i = 0; i < notFoundCount; i++) orderedColors.push("❌");

    lines.push(orderedColors.join(" "));
    lines.push(`الأخطاء: ${mistakes}/4`);
    lines.push("🔗 kalima.fun/rawabet");
    return lines.join("\n");
  }

  async function handleShare() {
    const text = buildShareText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  const categoriesToShow =
    foundCategories.length === 4 ? foundCategories : allCategories;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      dir="rtl"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm mx-4 mb-4 sm:mb-0 bg-surface rounded-2xl border border-border overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 text-center">
          <div className="text-3xl mb-1">{gameStatus === "won" ? "🎉" : "😞"}</div>
          <h2 className="text-xl font-bold text-white">
            {gameStatus === "won" ? "أحسنت!" : "انتهت المحاولات"}
          </h2>
          <p className="text-sm text-[#8A7A3A] mt-1">روابط #{puzzleNumber}</p>
        </div>

        {/* Category rows */}
        <div className="px-5 pb-3 flex flex-col gap-2">
          {categoriesToShow.map((cat) => (
            <div
              key={cat.name}
              className={`${COLOR_BG[cat.color]} rounded-xl px-4 py-2.5 flex items-center justify-between`}
            >
              <span className="font-bold text-black text-sm">{cat.name}</span>
              <span className="text-black/70 text-xs">{cat.words.join(" · ")}</span>
            </div>
          ))}
          {/* Show unfound categories if lost */}
          {gameStatus === "lost" &&
            allCategories
              .filter((c) => !foundCategories.find((f) => f.name === c.name))
              .map((cat) => (
                <div
                  key={cat.name + "-missed"}
                  className={`${COLOR_BG[cat.color]} rounded-xl px-4 py-2.5 flex items-center justify-between opacity-60`}
                >
                  <span className="font-bold text-black text-sm">{cat.name}</span>
                  <span className="text-black/70 text-xs">{cat.words.join(" · ")}</span>
                </div>
              ))}
        </div>

        {/* Mistakes */}
        <div className="px-5 pb-3 flex items-center justify-center gap-2">
          <span className="text-xs text-[#8A7A3A]">الأخطاء:</span>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${i < mistakes ? "bg-[#F5820A]" : "bg-border"}`}
            />
          ))}
        </div>

        {/* Stats */}
        <div className="mx-5 mb-3 grid grid-cols-3 gap-2 bg-background rounded-xl p-3">
          {[
            { label: "العبت", value: stats.gamesPlayed },
            { label: "ربحت", value: stats.gamesWon },
            { label: "أطول سلسلة", value: stats.maxStreak },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center gap-0.5">
              <span className="text-xl font-bold text-white">{value}</span>
              <span className="text-[10px] text-[#8A7A3A] text-center leading-tight">{label}</span>
            </div>
          ))}
        </div>

        {/* Streak */}
        {stats.currentStreak > 0 && (
          <div className="mx-5 mb-3 flex items-center justify-center gap-2 bg-primary/10 rounded-xl p-2.5 border border-primary/20">
            <span className="text-lg">🔥</span>
            <span className="text-sm font-semibold text-primary-light">
              سلسلة {stats.currentStreak} أيام
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="px-5 pb-5 flex gap-2">
          <button
            onClick={handleShare}
            className="flex-1 bg-primary hover:bg-primary-dark text-[#0A0A0A] font-bold py-3 rounded-xl transition-colors text-sm"
          >
            {copied ? "✓ تم النسخ!" : "مشاركة النتيجة"}
          </button>
          <div className="flex flex-col items-center justify-center bg-background rounded-xl px-3 py-2 min-w-[72px]">
            <span className="text-[10px] text-[#8A7A3A]">اللغز القادم</span>
            <span className="text-sm font-mono font-bold text-white">{countdown}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
