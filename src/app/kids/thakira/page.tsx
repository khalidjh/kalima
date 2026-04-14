"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Card {
  id: number;
  emoji: string;
  pairId: number;
  flipped: boolean;
  matched: boolean;
}

interface LevelConfig {
  cols: number;
  rows: number;
  pairs: number;
  label: string;
}

interface Progress {
  unlocked: number;
  stars: [number, number, number];
}

type Screen = "levels" | "playing" | "celebration";

// ─── Constants ───────────────────────────────────────────────────────────────

const ALL_EMOJI = [
  "🐱", "🐶", "🦁", "🐸", "🦋", "🌺", "🍎", "🚀", "🌟", "⚡",
  "🎈", "🐠", "🍕", "🎸", "🦄", "🌈", "🍦", "🐝", "🎯", "🔮",
];

const LEVELS: LevelConfig[] = [
  { cols: 4, rows: 3, pairs: 6, label: "سهل" },
  { cols: 4, rows: 4, pairs: 8, label: "متوسط" },
  { cols: 5, rows: 4, pairs: 10, label: "صعب" },
];

const STORAGE_KEY = "sparks_thakira_progress";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function loadProgress(): Progress {
  if (typeof window === "undefined") return { unlocked: 1, stars: [0, 0, 0] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { unlocked: 1, stars: [0, 0, 0] };
}

function saveProgress(p: Progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {}
}

function buildDeck(level: LevelConfig): Card[] {
  const emojis = shuffle(ALL_EMOJI).slice(0, level.pairs);
  const cards: Card[] = [];
  emojis.forEach((emoji, i) => {
    cards.push({ id: i * 2, emoji, pairId: i, flipped: false, matched: false });
    cards.push({ id: i * 2 + 1, emoji, pairId: i, flipped: false, matched: false });
  });
  return shuffle(cards);
}

function calcStars(moves: number, pairs: number): number {
  const ratio = moves / pairs;
  if (ratio <= 2) return 3;
  if (ratio <= 3) return 2;
  return 1;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Components ──────────────────────────────────────────────────────────────

function StarDisplay({ count, size = 28 }: { count: number; size?: number }) {
  return (
    <div className="flex gap-1" dir="ltr">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            fontSize: size,
            filter: i < count ? "none" : "grayscale(1) opacity(0.3)",
            transition: "all 0.3s ease",
          }}
        >
          ⭐
        </span>
      ))}
    </div>
  );
}

// ─── Level Select Screen ─────────────────────────────────────────────────────

function LevelSelect({
  progress,
  onSelect,
}: {
  progress: Progress;
  onSelect: (level: number) => void;
}) {
  return (
    <div className="max-w-md mx-auto px-5 pt-6 pb-12">
      <div className="text-center mb-8" style={{ animation: "bounce-in 0.4s ease-out both" }}>
        <div
          className="inline-block text-5xl mb-2"
          style={{ animation: "wiggle 2s ease-in-out infinite" }}
        >
          🧠
        </div>
        <h1 className="text-3xl font-black mb-1" style={{ color: "#2D3436" }}>
          ذاكرة
        </h1>
        <p className="text-base font-semibold" style={{ color: "#636E72" }}>
          اقلب البطاقات وجد الأزواج المتشابهة
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {LEVELS.map((lvl, i) => {
          const locked = i + 1 > progress.unlocked;
          const stars = progress.stars[i] || 0;
          return (
            <button
              key={i}
              onClick={() => !locked && onSelect(i)}
              disabled={locked}
              className="relative rounded-3xl overflow-hidden transition-all duration-200 text-right"
              style={{
                background: locked
                  ? "linear-gradient(135deg, #F0F0F0 0%, #E8E8E8 100%)"
                  : "linear-gradient(135deg, #E8FFF3 0%, #D0F5E0 100%)",
                boxShadow: locked
                  ? "0 2px 8px rgba(0,0,0,0.06)"
                  : "0 4px 20px rgba(32,201,151,0.15), 0 1px 4px rgba(0,0,0,0.06)",
                opacity: locked ? 0.6 : 1,
                animation: `bounce-in 0.5s ease-out ${i * 0.1}s both`,
              }}
            >
              <div
                className="absolute top-0 right-0 w-1.5 h-full rounded-r-3xl"
                style={{ background: locked ? "#CCC" : "#20C997" }}
              />
              <div className="flex items-center gap-4 p-5 pr-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{
                    background: locked ? "rgba(0,0,0,0.05)" : "rgba(32,201,151,0.12)",
                    border: locked ? "2px solid rgba(0,0,0,0.08)" : "2px solid rgba(32,201,151,0.25)",
                  }}
                >
                  {locked ? "🔒" : "🃏"}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-black mb-0.5" style={{ color: locked ? "#AAA" : "#2D3436" }}>
                    المرحلة {i + 1}
                  </h2>
                  <p className="text-sm font-medium mb-1.5" style={{ color: locked ? "#CCC" : "#636E72" }}>
                    {lvl.label} - {lvl.cols}×{lvl.rows} ({lvl.pairs} أزواج)
                  </p>
                  <StarDisplay count={stars} size={20} />
                </div>
                {!locked && (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(32,201,151,0.12)", color: "#20C997" }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/kids"
          className="inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-full transition-all hover:scale-105"
          style={{ background: "rgba(32,201,151,0.12)", color: "#20C997" }}
        >
          <span>←</span>
          <span>رجوع</span>
        </Link>
      </div>
    </div>
  );
}

// ─── Celebration Screen ──────────────────────────────────────────────────────

function Celebration({
  stars,
  moves,
  time,
  levelIndex,
  onNext,
  onReplay,
  onHome,
}: {
  stars: number;
  moves: number;
  time: number;
  levelIndex: number;
  onNext: () => void;
  onReplay: () => void;
  onHome: () => void;
}) {
  const hasNext = levelIndex < LEVELS.length - 1;

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100dvh-120px)] px-6">
      <div className="text-center" style={{ animation: "bounce-in 0.5s ease-out both" }}>
        <div
          className="text-7xl mb-4"
          style={{ animation: "wiggle 1.5s ease-in-out infinite" }}
        >
          🎉
        </div>

        <h1 className="text-3xl font-black mb-2" style={{ color: "#2D3436" }}>
          أحسنت!
        </h1>
        <p className="text-lg font-semibold mb-6" style={{ color: "#636E72" }}>
          أكملت المرحلة {levelIndex + 1}
        </p>

        <div className="mb-6" style={{ animation: "bounce-in 0.6s ease-out 0.2s both" }}>
          <StarDisplay count={stars} size={40} />
        </div>

        <div
          className="flex items-center justify-center gap-6 mb-8"
          style={{ animation: "bounce-in 0.6s ease-out 0.3s both" }}
        >
          <div className="text-center">
            <div className="text-2xl font-black" style={{ color: "#20C997" }}>
              {moves}
            </div>
            <div className="text-xs font-semibold" style={{ color: "#636E72" }}>
              محاولة
            </div>
          </div>
          <div
            className="w-px h-8"
            style={{ background: "rgba(0,0,0,0.1)" }}
          />
          <div className="text-center">
            <div className="text-2xl font-black font-mono" style={{ color: "#4A90D9" }}>
              {formatTime(time)}
            </div>
            <div className="text-xs font-semibold" style={{ color: "#636E72" }}>
              الوقت
            </div>
          </div>
        </div>

        <div
          className="flex flex-col gap-3 w-full max-w-xs mx-auto"
          style={{ animation: "bounce-in 0.6s ease-out 0.4s both" }}
        >
          {hasNext && (
            <button
              onClick={onNext}
              className="w-full py-3.5 rounded-2xl text-white font-black text-lg transition-transform hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #20C997 0%, #12B886 100%)",
                boxShadow: "0 4px 16px rgba(32,201,151,0.35)",
              }}
            >
              المرحلة التالية ←
            </button>
          )}
          <button
            onClick={onReplay}
            className="w-full py-3 rounded-2xl font-bold text-base transition-transform hover:scale-105 active:scale-95"
            style={{
              background: "rgba(32,201,151,0.12)",
              color: "#20C997",
            }}
          >
            إعادة اللعب 🔄
          </button>
          <button
            onClick={onHome}
            className="w-full py-3 rounded-2xl font-bold text-base transition-transform hover:scale-105 active:scale-95"
            style={{
              background: "rgba(0,0,0,0.04)",
              color: "#636E72",
            }}
          >
            القائمة الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ThakiraPage() {
  const [screen, setScreen] = useState<Screen>("levels");
  const [currentLevel, setCurrentLevel] = useState(0);
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [completionData, setCompletionData] = useState<{
    stars: number;
    moves: number;
    time: number;
  } | null>(null);
  const movesRef = useRef(0);
  const timeRef = useRef(0);

  const handleSelectLevel = useCallback((level: number) => {
    setCurrentLevel(level);
    setScreen("playing");
  }, []);

  const handleComplete = useCallback(
    (stars: number) => {
      setCompletionData({ stars, moves: movesRef.current, time: timeRef.current });

      setProgress((prev) => {
        const newStars = [...prev.stars] as [number, number, number];
        newStars[currentLevel] = Math.max(newStars[currentLevel], stars);
        const newUnlocked = Math.max(prev.unlocked, currentLevel + 2);
        const updated = {
          unlocked: Math.min(newUnlocked, LEVELS.length),
          stars: newStars,
        };
        saveProgress(updated);
        return updated;
      });

      setScreen("celebration");
    },
    [currentLevel]
  );

  const handleNext = useCallback(() => {
    const next = currentLevel + 1;
    if (next < LEVELS.length) {
      setCurrentLevel(next);
      setScreen("playing");
    }
  }, [currentLevel]);

  const handleReplay = useCallback(() => {
    setScreen("playing");
  }, []);

  const handleHome = useCallback(() => {
    setScreen("levels");
  }, []);

  return (
    <div dir="rtl">
      {screen === "levels" && (
        <LevelSelect progress={progress} onSelect={handleSelectLevel} />
      )}
      {screen === "playing" && (
        <GameBoardWrapper
          key={`${currentLevel}-${Date.now()}`}
          levelIndex={currentLevel}
          onComplete={handleComplete}
          onBack={handleHome}
          movesRef={movesRef}
          timeRef={timeRef}
        />
      )}
      {screen === "celebration" && completionData && (
        <Celebration
          stars={completionData.stars}
          moves={completionData.moves}
          time={completionData.time}
          levelIndex={currentLevel}
          onNext={handleNext}
          onReplay={handleReplay}
          onHome={handleHome}
        />
      )}
    </div>
  );
}

// Wrapper to capture moves/time before completion
function GameBoardWrapper({
  levelIndex,
  onComplete,
  onBack,
  movesRef,
  timeRef,
}: {
  levelIndex: number;
  onComplete: (stars: number) => void;
  onBack: () => void;
  movesRef: React.MutableRefObject<number>;
  timeRef: React.MutableRefObject<number>;
}) {
  const level = LEVELS[levelIndex];
  const [cards, setCards] = useState<Card[]>(() => buildDeck(level));
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [checking, setChecking] = useState(false);
  const [recentMatch, setRecentMatch] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedRef = useRef(false);

  // Keep refs in sync
  useEffect(() => {
    movesRef.current = moves;
  }, [moves, movesRef]);

  useEffect(() => {
    timeRef.current = elapsed;
  }, [elapsed, timeRef]);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Check for win
  useEffect(() => {
    if (matchedCount === level.pairs && matchedCount > 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      const stars = calcStars(moves, level.pairs);
      setTimeout(() => onComplete(stars), 600);
    }
  }, [matchedCount, level.pairs, moves, onComplete]);

  const handleFlip = useCallback(
    (cardId: number) => {
      if (checking) return;

      const card = cards.find((c) => c.id === cardId);
      if (!card || card.flipped || card.matched) return;

      if (!startedRef.current) {
        startedRef.current = true;
        timerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000);
      }

      const newCards = cards.map((c) =>
        c.id === cardId ? { ...c, flipped: true } : c
      );
      setCards(newCards);

      const newFlipped = [...flippedIds, cardId];
      setFlippedIds(newFlipped);

      if (newFlipped.length === 2) {
        setMoves((m) => m + 1);
        setChecking(true);

        const first = newCards.find((c) => c.id === newFlipped[0])!;
        const second = newCards.find((c) => c.id === newFlipped[1])!;

        if (first.pairId === second.pairId) {
          setRecentMatch(first.pairId);
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.pairId === first.pairId ? { ...c, matched: true } : c
              )
            );
            setMatchedCount((m) => m + 1);
            setFlippedIds([]);
            setChecking(false);
            setTimeout(() => setRecentMatch(null), 500);
          }, 400);
        } else {
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                newFlipped.includes(c.id) ? { ...c, flipped: false } : c
              )
            );
            setFlippedIds([]);
            setChecking(false);
          }, 800);
        }
      }
    },
    [cards, flippedIds, checking]
  );

  const resetGame = useCallback(() => {
    setCards(buildDeck(level));
    setFlippedIds([]);
    setMoves(0);
    setElapsed(0);
    setMatchedCount(0);
    setChecking(false);
    setRecentMatch(null);
    startedRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
  }, [level]);

  return (
    <div className="flex flex-col h-[calc(100dvh-120px)]">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full"
          style={{ background: "rgba(32,201,151,0.12)", color: "#20C997" }}
        >
          <span>←</span>
          <span>رجوع</span>
        </button>

        <div className="flex items-center gap-4 text-sm font-bold" style={{ color: "#2D3436" }}>
          <div className="flex items-center gap-1.5">
            <span style={{ color: "#636E72" }}>المحاولات</span>
            <span
              className="px-2 py-0.5 rounded-lg text-white"
              style={{ background: "#20C997" }}
            >
              {moves}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span style={{ color: "#636E72" }}>الوقت</span>
            <span
              className="px-2 py-0.5 rounded-lg text-white font-mono"
              style={{ background: "#4A90D9" }}
            >
              {formatTime(elapsed)}
            </span>
          </div>
        </div>

        <button
          onClick={resetGame}
          className="text-xl px-2 py-1 rounded-xl transition-transform hover:scale-110 active:scale-95"
          title="إعادة"
        >
          🔄
        </button>
      </div>

      {/* Grid area */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-4">
        <div
          className="grid w-full h-full"
          style={{
            gridTemplateColumns: `repeat(${level.cols}, 1fr)`,
            gridTemplateRows: `repeat(${level.rows}, 1fr)`,
            gap: "8px",
            maxWidth: `min(100%, ${level.cols * 100}px)`,
            maxHeight: "100%",
            aspectRatio: `${level.cols} / ${level.rows}`,
          }}
        >
          {cards.map((card) => {
            const isFlipped = card.flipped || card.matched;
            const isMatched = card.matched;
            const isRecentMatch = recentMatch === card.pairId;

            return (
              <button
                key={card.id}
                onClick={() => handleFlip(card.id)}
                className="relative w-full h-full"
                style={{
                  perspective: "800px",
                  minHeight: "60px",
                  minWidth: "60px",
                }}
                disabled={isMatched}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    transition: "transform 0.4s ease",
                  }}
                >
                  {/* Card Back */}
                  <div
                    className="absolute inset-0 rounded-2xl flex items-center justify-center"
                    style={{
                      backfaceVisibility: "hidden",
                      background: "linear-gradient(135deg, #20C997 0%, #12B886 50%, #0CA678 100%)",
                      boxShadow: "0 3px 12px rgba(32,201,151,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
                      border: "2px solid rgba(255,255,255,0.15)",
                    }}
                  >
                    <span className="text-3xl" style={{ filter: "brightness(1.3)" }}>
                      ⚡
                    </span>
                  </div>

                  {/* Card Front */}
                  <div
                    className="absolute inset-0 rounded-2xl flex items-center justify-center"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                      background: "#FFFFFF",
                      boxShadow: isRecentMatch
                        ? "0 0 20px rgba(81,207,102,0.6), 0 3px 12px rgba(0,0,0,0.08)"
                        : isMatched
                        ? "0 0 12px rgba(81,207,102,0.3), 0 2px 8px rgba(0,0,0,0.06)"
                        : "0 3px 12px rgba(0,0,0,0.08)",
                      border: isMatched
                        ? "2.5px solid #51CF66"
                        : "2px solid rgba(0,0,0,0.06)",
                      transition: "box-shadow 0.3s ease, border-color 0.3s ease",
                    }}
                  >
                    <span
                      className="select-none"
                      style={{
                        fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
                        animation: isRecentMatch ? "wiggle 0.5s ease-in-out" : "none",
                      }}
                    >
                      {card.emoji}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Level indicator */}
      <div className="text-center py-2 flex-shrink-0">
        <span
          className="text-xs font-bold px-3 py-1 rounded-full"
          style={{ background: "rgba(32,201,151,0.1)", color: "#20C997" }}
        >
          المرحلة {levelIndex + 1} - {level.label}
        </span>
      </div>
    </div>
  );
}
