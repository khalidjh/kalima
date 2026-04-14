"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface GameConfig {
  title: string;
  href: string;
  icon: string;
  borderColor: string;
  bgColor: string;
}

const learnGames: GameConfig[] = [
  {
    title: "حروفي",
    href: "/kalimat/horouf",
    icon: "🔤",
    borderColor: "#FF6B6B",
    bgColor: "#FFF0F0",
  },
  {
    title: "أرقامي",
    href: "/kalimat/arqam",
    icon: "🔢",
    borderColor: "#51CF66",
    bgColor: "#F0FFF4",
  },
  {
    title: "هجّائي",
    href: "/kalimat/hijaai",
    icon: "✏️",
    borderColor: "#FF922B",
    bgColor: "#FFF8F0",
  },
  {
    title: "أشكالي",
    href: "/kalimat/ashkal",
    icon: "🔷",
    borderColor: "#4A90D9",
    bgColor: "#F0F4FF",
  },
  {
    title: "ألواني",
    href: "/kalimat/alwan",
    icon: "🎨",
    borderColor: "#CC5DE8",
    bgColor: "#F8F0FF",
  },
];

const playGames: GameConfig[] = [
  {
    title: "ذاكرة",
    href: "/kalimat/thakira",
    icon: "🃏",
    borderColor: "#20C997",
    bgColor: "#E6FCF5",
  },
  {
    title: "متاهة",
    href: "/kalimat/mataha",
    icon: "🏰",
    borderColor: "#5C7CFA",
    bgColor: "#EDF2FF",
  },
  {
    title: "فقاعات",
    href: "/kalimat/fuqaat",
    icon: "🫧",
    borderColor: "#22B8CF",
    bgColor: "#E3FAFC",
  },
  {
    title: "صور",
    href: "/kalimat/suwar",
    icon: "🧩",
    borderColor: "#E64980",
    bgColor: "#FFF0F6",
  },
  {
    title: "سرعة",
    href: "/kalimat/suraa",
    icon: "⚡",
    borderColor: "#FCC419",
    bgColor: "#FFF9DB",
  },
  {
    title: "٢٠٤٨",
    href: "/kalimat/2048",
    icon: "🔢",
    borderColor: "#FF6B6B",
    bgColor: "#FFF0F0",
  },
];

const storageKeys = [
  "kids-horouf-level",
  "kids-arqam-level",
  "kids-hijaai-level",
  "kids-ashkal-level",
  "kids-alwan-level",
  "kids-horouf-stars",
  "kids-arqam-stars",
  "kids-hijaai-stars",
  "kids-ashkal-stars",
  "kids-alwan-stars",
  "kids-memory-stars",
  "kids-maze-stars",
  "kids-bubbles-stars",
  "kids-jigsaw-stars",
  "kids-speed-stars",
  "kids-2048-stars",
];

function GameCard({ game, index }: { game: GameConfig; index: number }) {
  return (
    <Link href={game.href} className="block group">
      <div
        className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-200 group-hover:shadow-lg group-hover:-translate-y-1 group-active:scale-95"
        style={{
          background: game.bgColor,
          border: `3px solid ${game.borderColor}`,
          boxShadow: `0 4px 12px ${game.borderColor}20`,
          animation: `bounce-in 0.5s ease-out ${index * 0.08}s both`,
        }}
      >
        <span className="text-4xl">{game.icon}</span>
        <span
          className="text-sm font-bold"
          style={{ color: "#2D3436" }}
        >
          {game.title}
        </span>
      </div>
    </Link>
  );
}

function toArabicNumeral(n: number): string {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return n
    .toString()
    .split("")
    .map((d) => arabicDigits[parseInt(d)] ?? d)
    .join("");
}

export default function KidsHomePage() {
  const [totalStars, setTotalStars] = useState(0);

  useEffect(() => {
    let sum = 0;
    storageKeys.forEach((key) => {
      const val = localStorage.getItem(key);
      if (val) {
        const parsed = parseInt(val, 10);
        if (!isNaN(parsed)) sum += parsed;
      }
    });
    setTotalStars(sum);
  }, []);

  return (
    <div className="max-w-lg mx-auto px-5 pt-4 pb-12">
      {/* Logo + star counter */}
      <div
        className="flex items-center justify-between mb-5"
        style={{ animation: "bounce-in 0.4s ease-out both" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #FF922B, #FF6B6B)",
              boxShadow: "0 4px 16px rgba(255,107,107,0.3)",
            }}
          >
            <span className="text-[#FFF8F0] font-black text-2xl leading-none" style={{ fontFamily: "'Cairo', sans-serif" }}>ك</span>
          </div>
          <div>
            <span className="text-base font-black block leading-tight" style={{ color: "#2D3436" }}>Kalimat</span>
            <span className="text-[10px] font-medium" style={{ color: "#636E72" }}>كلمات</span>
          </div>
        </div>
        {totalStars > 0 && (
          <div
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold"
            style={{
              background: "#FFF8E1",
              border: "2px solid #FFD43B",
              color: "#E67700",
            }}
          >
            <span>⭐</span>
            <span>{toArabicNumeral(totalStars)}</span>
          </div>
        )}
      </div>

      {/* Section 1: Play */}
      <div className="mb-6">
        <h2
          className="text-lg font-bold mb-3"
          style={{ color: "#2D3436" }}
        >
          🎮 العب
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {playGames.map((game, i) => (
            <GameCard key={game.href} game={game} index={i} />
          ))}
        </div>
      </div>

      {/* Section 2: Learn */}
      <div className="mb-6">
        <h2
          className="text-lg font-bold mb-3"
          style={{ color: "#2D3436" }}
        >
          🧠 تعلّم
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {learnGames.map((game, i) => (
            <GameCard key={game.href} game={game} index={i + playGames.length} />
          ))}
        </div>
      </div>

      {/* Subscription promo */}
      <Link href="/kalimat/pro" className="block group">
        <div
          className="rounded-2xl p-4 text-center transition-all duration-200 group-hover:shadow-lg group-active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #FF922B 0%, #FF6B6B 50%, #E64980 100%)",
            boxShadow: "0 4px 20px rgba(255,105,135,0.3)",
            animation: "bounce-in 0.5s ease-out 0.8s both",
          }}
        >
          <div className="text-2xl mb-1">✨</div>
          <h3 className="text-white font-black text-lg mb-1">Kalimat Plus</h3>
          <p className="text-white/80 text-xs">افتح كل الألعاب وميزات إضافية</p>
        </div>
      </Link>

      {/* Back to Kalima */}
      <div className="text-center mt-6 mb-4">
        <Link
          href="/home"
          className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full transition-colors"
          style={{ color: "#636E72", background: "rgba(0,0,0,0.05)" }}
        >
          <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold" style={{ background: "#2D3436", color: "#CCFF00" }}>ك</span>
          كلمة - ألعاب الكبار
        </Link>
      </div>
    </div>
  );
}
