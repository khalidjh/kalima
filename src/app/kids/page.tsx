"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface GameConfig {
  title: string;
  tagline: string;
  href: string;
  icon: string;
  accentColor: string;
  bgColor: string;
  bgGradient: string;
  totalLevels: number;
  storageKey: string;
}

const games: GameConfig[] = [
  {
    title: "حروفي",
    tagline: "تعرّف على الحروف العربية",
    href: "/kids/horouf",
    icon: "🔤",
    accentColor: "#FF6B6B",
    bgColor: "#FFF0F0",
    bgGradient: "linear-gradient(135deg, #FFF0F0 0%, #FFE0E0 100%)",
    totalLevels: 5,
    storageKey: "kids-horouf-level",
  },
  {
    title: "أرقامي",
    tagline: "عدّ واكتشف الأرقام",
    href: "/kids/arqam",
    icon: "🔢",
    accentColor: "#51CF66",
    bgColor: "#F0FFF4",
    bgGradient: "linear-gradient(135deg, #F0FFF4 0%, #D4F4DD 100%)",
    totalLevels: 5,
    storageKey: "kids-arqam-level",
  },
  {
    title: "أشكالي",
    tagline: "اكتشف الأشكال الهندسية",
    href: "/kids/ashkal",
    icon: "🔷",
    accentColor: "#4A90D9",
    bgColor: "#F0F4FF",
    bgGradient: "linear-gradient(135deg, #F0F4FF 0%, #E0E8FF 100%)",
    totalLevels: 5,
    storageKey: "kids-ashkal-level",
  },
  {
    title: "ألواني",
    tagline: "تعلّم ألوان قوس القزح",
    href: "/kids/alwan",
    icon: "🎨",
    accentColor: "#CC5DE8",
    bgColor: "#F8F0FF",
    bgGradient: "linear-gradient(135deg, #F8F0FF 0%, #F3E0FF 100%)",
    totalLevels: 5,
    storageKey: "kids-alwan-level",
  },
  {
    title: "هجّائي",
    tagline: "رتّب الحروف وكوّن الكلمة",
    href: "/kids/hijaai",
    icon: "✏️",
    accentColor: "#FF922B",
    bgColor: "#FFF8F0",
    bgGradient: "linear-gradient(135deg, #FFF8F0 0%, #FFE8D0 100%)",
    totalLevels: 5,
    storageKey: "kids-hijaai-level",
  },
];

function LevelDots({ current, total, color }: { current: number; total: number; color: string }) {
  return (
    <div className="flex gap-1.5 items-center" dir="ltr">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i < current ? "10px" : "8px",
            height: i < current ? "10px" : "8px",
            background: i < current ? color : "#E0E0E0",
            boxShadow: i < current ? `0 0 6px ${color}50` : "none",
          }}
        />
      ))}
      <span className="text-xs font-bold mr-1.5" style={{ color }}>
        {current}/{total}
      </span>
    </div>
  );
}

function GameCard({ game, index, level }: { game: GameConfig; index: number; level: number }) {
  return (
    <Link href={game.href} className="block group">
      <div
        className="relative rounded-3xl overflow-hidden transition-all duration-200 group-hover:scale-[1.02] group-active:scale-[0.97]"
        style={{
          background: game.bgGradient,
          boxShadow: `0 4px 20px ${game.accentColor}20, 0 1px 4px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)`,
          animation: `bounce-in 0.5s ease-out ${index * 0.1}s both`,
        }}
      >
        {/* Accent stripe on the right */}
        <div
          className="absolute top-0 right-0 w-1.5 h-full rounded-r-3xl"
          style={{ background: game.accentColor }}
        />

        <div className="flex items-center gap-4 p-5 pr-6">
          {/* Icon container */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
            style={{
              background: `${game.accentColor}18`,
              border: `2px solid ${game.accentColor}30`,
              animation: `float 4s ease-in-out ${index * 0.5}s infinite`,
            }}
          >
            {game.icon}
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0">
            <h2
              className="text-xl font-black mb-0.5"
              style={{ color: "#2D3436" }}
            >
              {game.title}
            </h2>
            <p
              className="text-sm font-medium mb-2"
              style={{ color: "#636E72" }}
            >
              {game.tagline}
            </p>
            <LevelDots current={level} total={game.totalLevels} color={game.accentColor} />
          </div>

          {/* Arrow indicator */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:-translate-x-1"
            style={{
              background: `${game.accentColor}15`,
              color: game.accentColor,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function KidsHomePage() {
  const [levels, setLevels] = useState<Record<string, number>>({});

  useEffect(() => {
    const stored: Record<string, number> = {};
    games.forEach((g) => {
      const val = localStorage.getItem(g.storageKey);
      stored[g.storageKey] = val ? parseInt(val, 10) : 0;
    });
    setLevels(stored);
  }, []);

  return (
    <div className="max-w-lg mx-auto px-5 pt-4 pb-12">
      {/* Greeting */}
      <div
        className="text-center mb-8"
        style={{ animation: "bounce-in 0.4s ease-out both" }}
      >
        <div
          className="inline-block text-5xl mb-2"
          style={{ animation: "wiggle 2s ease-in-out infinite" }}
        >
          🌟
        </div>
        <h1
          className="text-3xl font-black mb-1"
          style={{ color: "#2D3436" }}
        >
          أهلاً وسهلاً!
        </h1>
        <p
          className="text-lg font-semibold"
          style={{ color: "#636E72" }}
        >
          يلّا نلعب ونتعلّم
        </p>
      </div>

      {/* Game cards - stacked list */}
      <div className="flex flex-col gap-4">
        {games.map((game, i) => (
          <GameCard
            key={game.href}
            game={game}
            index={i}
            level={levels[game.storageKey] ?? 0}
          />
        ))}
      </div>
    </div>
  );
}
