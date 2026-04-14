"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import Link from "next/link";

// ─── Constants ───────────────────────────────────────────────────────────────

const ARABIC_NUMERALS = ["١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩", "١٠"];
const COUNTING_EMOJIS = ["🍎", "🌟", "🐱", "🦋", "🎈", "🐠", "🍕", "🚀", "🌈", "🌸"];
const ADDITION_EMOJIS = ["🍎", "🌟", "🐱", "🦋", "🎈"];
const TOTAL_ROUNDS = 8;
const STORAGE_KEY = "kalima_kids_arqam_progress";

const OPTION_COLORS = ["#FFE0E0", "#D4F4DD", "#E0E8FF", "#FFF3D4"];
const OPTION_BORDERS = ["#FF6B6B", "#51CF66", "#4A90D9", "#FFD43B"];

// ─── Types ───────────────────────────────────────────────────────────────────

type LevelId = 1 | 2 | 3;

interface LevelProgress {
  unlocked: boolean;
  stars: number; // 0-3
}

interface Progress {
  levels: Record<LevelId, LevelProgress>;
}

interface CountingRound {
  target: number;
  emoji: string;
  options: number[];
}

interface OrderRound {
  numbers: number[];
  sorted: number[];
}

interface AdditionRound {
  a: number;
  b: number;
  emoji: string;
  answer: number;
  options: number[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateScatterPositions(count: number) {
  const positions: { x: number; y: number; rotate: number; scale: number }[] = [];
  for (let i = 0; i < count; i++) {
    positions.push({
      x: 8 + Math.random() * 78,
      y: 5 + Math.random() * 75,
      rotate: -20 + Math.random() * 40,
      scale: 0.9 + Math.random() * 0.3,
    });
  }
  return positions;
}

function makeDistractors(correct: number, max: number, count: number): number[] {
  const set = new Set<number>();
  while (set.size < count) {
    const n = Math.floor(Math.random() * max) + 1;
    if (n !== correct) set.add(n);
  }
  return Array.from(set);
}

function generateCountingRound(): CountingRound {
  const target = Math.floor(Math.random() * 5) + 1; // 1-5
  const emoji = pickRandom(COUNTING_EMOJIS);
  const wrong = makeDistractors(target, 5, 3);
  return { target, emoji, options: shuffle([target, ...wrong]) };
}

function generateOrderRound(): OrderRound {
  const pool = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const picked = pool.slice(0, 4);
  const sorted = [...picked].sort((a, b) => a - b);
  return { numbers: shuffle(picked), sorted };
}

function generateAdditionRound(): AdditionRound {
  const a = Math.floor(Math.random() * 5) + 1; // 1-5
  const maxB = Math.min(10 - a, 5);
  const b = Math.floor(Math.random() * maxB) + 1; // 1 to maxB
  const answer = a + b;
  const emoji = pickRandom(ADDITION_EMOJIS);
  const wrong = makeDistractors(answer, 10, 3);
  return { a, b, emoji, answer, options: shuffle([answer, ...wrong]) };
}

function loadProgress(): Progress {
  if (typeof window === "undefined") {
    return defaultProgress();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Progress;
  } catch { /* ignore */ }
  return defaultProgress();
}

function defaultProgress(): Progress {
  return {
    levels: {
      1: { unlocked: true, stars: 0 },
      2: { unlocked: false, stars: 0 },
      3: { unlocked: false, stars: 0 },
    },
  };
}

function saveProgress(p: Progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch { /* ignore */ }
}

function starsFromScore(score: number): number {
  if (score >= 7) return 3;
  if (score >= 5) return 2;
  if (score >= 3) return 1;
  return 0;
}

// ─── Confetti ────────────────────────────────────────────────────────────────

function ConfettiBurst() {
  const pieces = useRef(
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: 45 + Math.random() * 10,
      color: pickRandom(["#FF6B6B", "#51CF66", "#FFD43B", "#4A90D9", "#CC5DE8", "#FF922B", "#F06595"]),
      angle: (i / 24) * 360 + Math.random() * 15,
      distance: 60 + Math.random() * 100,
      size: 6 + Math.random() * 6,
    }))
  ).current;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const tx = Math.cos(rad) * p.distance;
        const ty = Math.sin(rad) * p.distance;
        return (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: "40%",
              width: p.size,
              height: p.size,
              background: p.color,
              animation: "confetti-pop 0.8s ease-out forwards",
              // @ts-expect-error CSS custom properties
              "--tx": `${tx}px`,
              "--ty": `${ty}px`,
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Shared Styles ───────────────────────────────────────────────────────────

const SHARED_STYLES = `
  @keyframes confetti-pop {
    0% { transform: translate(0, 0) scale(0); opacity: 1; }
    100% { transform: translate(var(--tx), var(--ty)) scale(1); opacity: 0; }
  }
  @keyframes scale-in {
    0% { transform: scale(0.5); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes emoji-float {
    0% { transform: translate(0, 0) rotate(var(--rot)); }
    50% { transform: translate(0, -6px) rotate(var(--rot)); }
    100% { transform: translate(0, 0) rotate(var(--rot)); }
  }
  @keyframes shake-wrong {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-6px); }
    80% { transform: translateX(6px); }
  }
  @keyframes correct-pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.08); }
    100% { transform: scale(1); }
  }
  @keyframes celebration-bounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.15); }
  }
  @keyframes star-pop {
    0% { transform: scale(0) rotate(-30deg); opacity: 0; }
    60% { transform: scale(1.3) rotate(10deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  @keyframes card-pop {
    0% { transform: scale(0.3); opacity: 0; }
    70% { transform: scale(1.08); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
`;

// ─── Level Select Screen ─────────────────────────────────────────────────────

const LEVEL_META: { id: LevelId; title: string; desc: string; icon: string; color: string }[] = [
  { id: 1, title: "العد", desc: "عد الأشكال واختر الرقم", icon: "🔢", color: "#51CF66" },
  { id: 2, title: "الترتيب", desc: "رتب الأرقام من الأصغر للأكبر", icon: "📊", color: "#4A90D9" },
  { id: 3, title: "الجمع", desc: "اجمع الأرقام واختر الناتج", icon: "➕", color: "#CC5DE8" },
];

function LevelSelect({
  progress,
  onSelect,
}: {
  progress: Progress;
  onSelect: (level: LevelId) => void;
}) {
  return (
    <div className="min-h-[calc(100dvh-56px)] flex flex-col items-center px-4 py-8 gap-6">
      <style>{SHARED_STYLES}</style>

      <h1 className="text-4xl font-black" style={{ color: "#2D3436" }}>
        الأرقام العربية
      </h1>
      <p className="text-lg" style={{ color: "#636E72" }}>
        اختر المستوى
      </p>

      <div className="flex flex-col gap-5 w-full max-w-sm mt-2">
        {LEVEL_META.map((lm, idx) => {
          const lp = progress.levels[lm.id];
          const locked = !lp.unlocked;

          return (
            <button
              key={lm.id}
              disabled={locked}
              onClick={() => onSelect(lm.id)}
              className="relative rounded-3xl shadow-lg p-6 flex items-center gap-4 transition-transform active:scale-95"
              style={{
                background: locked ? "#E8E8E8" : "#FFFFFF",
                border: `3px solid ${locked ? "#CCC" : lm.color}`,
                opacity: locked ? 0.6 : 1,
                animation: `card-pop 0.4s ${idx * 0.12}s ease-out both`,
              }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                style={{ background: locked ? "#DDD" : `${lm.color}22` }}
              >
                {locked ? "🔒" : lm.icon}
              </div>
              <div className="flex-1 text-right">
                <div className="text-2xl font-black" style={{ color: locked ? "#AAA" : "#2D3436" }}>
                  المستوى {ARABIC_NUMERALS[lm.id - 1]} - {lm.title}
                </div>
                <div className="text-sm mt-1" style={{ color: locked ? "#BBB" : "#636E72" }}>
                  {lm.desc}
                </div>
                {/* Stars */}
                <div className="flex gap-1 mt-2 justify-end">
                  {[0, 1, 2].map((s) => (
                    <span
                      key={s}
                      className="text-2xl"
                      style={{ opacity: s < lp.stars ? 1 : 0.2 }}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Link
        href="/kids"
        className="mt-4 px-8 py-4 rounded-3xl text-xl font-bold text-white shadow-lg active:scale-95 transition-transform"
        style={{ background: "linear-gradient(135deg, #CC5DE8, #F06595)" }}
      >
        الألعاب ↩
      </Link>
    </div>
  );
}

// ─── Done Screen ─────────────────────────────────────────────────────────────

function DoneScreen({
  score,
  stars,
  levelId,
  onRestart,
  onLevels,
}: {
  score: number;
  stars: number;
  levelId: LevelId;
  onRestart: () => void;
  onLevels: () => void;
}) {
  const message =
    stars >= 3
      ? "ممتاز! أنت بطل! 🏆"
      : stars >= 2
      ? "أحسنت! رائع جدا! 🌟"
      : stars >= 1
      ? "جيد! استمر! 💪"
      : "حاول مرة ثانية! 🔄";

  return (
    <div className="min-h-[calc(100dvh-56px)] flex flex-col items-center justify-center px-4 py-8 gap-6">
      <style>{SHARED_STYLES}</style>

      <div className="text-7xl" style={{ animation: "celebration-bounce 1s ease-in-out infinite" }}>
        🎉
      </div>

      <h1 className="text-4xl font-black" style={{ color: "#CC5DE8" }}>
        انتهى المستوى {ARABIC_NUMERALS[levelId - 1]}!
      </h1>

      <p className="text-2xl font-bold" style={{ color: "#2D3436" }}>
        {message}
      </p>

      <div className="flex gap-2 flex-wrap justify-center my-2">
        {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
          <span
            key={i}
            className="text-4xl"
            style={{
              animation: i < score ? `star-pop 0.4s ${i * 0.1}s ease-out both` : "none",
              opacity: i < score ? 1 : 0.2,
            }}
          >
            ⭐
          </span>
        ))}
      </div>

      <p className="text-3xl font-black" style={{ color: "#FF922B" }}>
        {ARABIC_NUMERALS[score - 1] ?? "٠"} / {ARABIC_NUMERALS[TOTAL_ROUNDS - 1]}
      </p>

      <div className="flex gap-4 mt-4 flex-wrap justify-center">
        <button
          onClick={onRestart}
          className="px-8 py-4 rounded-3xl text-2xl font-bold text-white shadow-lg active:scale-95 transition-transform"
          style={{ background: "linear-gradient(135deg, #51CF66, #4A90D9)" }}
        >
          أعد المستوى 🔄
        </button>
        <button
          onClick={onLevels}
          className="px-8 py-4 rounded-3xl text-2xl font-bold text-white shadow-lg active:scale-95 transition-transform"
          style={{ background: "linear-gradient(135deg, #CC5DE8, #F06595)" }}
        >
          المستويات ↩
        </button>
      </div>
    </div>
  );
}

// ─── Top Bar ─────────────────────────────────────────────────────────────────

function TopBar({
  currentRound,
  score,
  onBack,
}: {
  currentRound: number;
  score: number;
  onBack: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <button
        onClick={onBack}
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md active:scale-90 transition-transform"
        style={{ background: "#FFFFFF", border: "2px solid #E0E0E0" }}
      >
        →
      </button>

      <div className="flex gap-1.5">
        {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full transition-all duration-300"
            style={{
              background: i < currentRound ? "#51CF66" : i === currentRound ? "#4A90D9" : "#DDD",
              transform: i === currentRound ? "scale(1.3)" : "scale(1)",
            }}
          />
        ))}
      </div>

      <div
        className="flex items-center gap-1 px-3 py-1.5 rounded-2xl shadow-md"
        style={{ background: "#FFFFFF", border: "2px solid #FFD43B" }}
      >
        <span className="text-xl">⭐</span>
        <span className="text-lg font-bold" style={{ color: "#FF922B" }}>
          {ARABIC_NUMERALS[score - 1] ?? "٠"}
        </span>
      </div>
    </div>
  );
}

// ─── Level 1: Counting ──────────────────────────────────────────────────────

function Level1Counting({ onFinish }: { onFinish: (score: number) => void }) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [data, setData] = useState(() => generateCountingRound());
  const [scatter, setScatter] = useState(() => generateScatterPositions(data.target));
  const [state, setState] = useState<"playing" | "correct" | "wrong">("playing");
  const [showConfetti, setShowConfetti] = useState(false);
  const [shakeWrong, setShakeWrong] = useState<number | null>(null);
  const [animateIn, setAnimateIn] = useState(true);

  const advance = useCallback(() => {
    const next = round + 1;
    if (next >= TOTAL_ROUNDS) {
      // score already updated via setState callback; read from ref
      return true;
    }
    const rd = generateCountingRound();
    setRound(next);
    setData(rd);
    setScatter(generateScatterPositions(rd.target));
    setState("playing");
    setAnimateIn(true);
    return false;
  }, [round]);

  const handleOption = useCallback(
    (value: number) => {
      if (state !== "playing") return;

      if (value === data.target) {
        const newScore = score + 1;
        setScore(newScore);
        setState("correct");
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 900);
        setTimeout(() => {
          setAnimateIn(false);
          const next = round + 1;
          if (next >= TOTAL_ROUNDS) {
            onFinish(newScore);
            return;
          }
          const rd = generateCountingRound();
          setRound(next);
          setData(rd);
          setScatter(generateScatterPositions(rd.target));
          setState("playing");
          setAnimateIn(true);
        }, 1200);
      } else {
        setShakeWrong(value);
        setState("wrong");
        setTimeout(() => {
          setShakeWrong(null);
          setState("playing");
        }, 600);
      }
    },
    [state, data.target, score, round, onFinish]
  );

  return (
    <div className="min-h-[calc(100dvh-56px)] flex flex-col px-4 py-4 gap-3 select-none">
      <style>{SHARED_STYLES}</style>
      {showConfetti && <ConfettiBurst />}

      <TopBar currentRound={round} score={score} onBack={() => onFinish(-1)} />

      <div className="text-center">
        <p className="text-2xl font-bold" style={{ color: "#2D3436" }}>
          كم عدد الـ {data.emoji}؟
        </p>
      </div>

      <div
        className="relative flex-1 min-h-[200px] rounded-3xl shadow-inner overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #FFFFFF 0%, #FFF8F0 100%)",
          border: "3px dashed #E0E0E0",
          animation: animateIn ? "scale-in 0.4s ease-out" : "none",
        }}
      >
        {scatter.map((pos, i) => (
          <div
            key={`${round}-${i}`}
            className="absolute"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: `rotate(${pos.rotate}deg) scale(${pos.scale})`,
              fontSize: "clamp(2rem, 8vw, 3.5rem)",
              animation: `scale-in 0.3s ${i * 0.05}s ease-out both, emoji-float 3s ${i * 0.2}s ease-in-out infinite`,
              // @ts-expect-error CSS custom properties
              "--rot": `${pos.rotate}deg`,
            }}
          >
            {data.emoji}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 pb-2">
        {data.options.map((opt, i) => {
          const isShaking = shakeWrong === opt;
          const isCorrectHighlight = state === "correct" && opt === data.target;

          return (
            <button
              key={`${round}-${opt}`}
              onClick={() => handleOption(opt)}
              disabled={state === "correct"}
              className="rounded-3xl shadow-lg active:scale-95 transition-transform flex items-center justify-center"
              style={{
                background: isCorrectHighlight ? "#51CF66" : OPTION_COLORS[i],
                border: `3px solid ${isCorrectHighlight ? "#2B9348" : OPTION_BORDERS[i]}`,
                height: "clamp(80px, 15vw, 110px)",
                animation: isShaking
                  ? "shake-wrong 0.4s ease-in-out"
                  : isCorrectHighlight
                  ? "correct-pulse 0.4s ease-in-out"
                  : animateIn
                  ? `scale-in 0.3s ${0.2 + i * 0.08}s ease-out both`
                  : "none",
              }}
            >
              <span
                className="font-black"
                style={{
                  fontSize: "clamp(2.5rem, 10vw, 4rem)",
                  color: isCorrectHighlight ? "#FFFFFF" : "#2D3436",
                }}
              >
                {ARABIC_NUMERALS[opt - 1]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Level 2: Number Order ──────────────────────────────────────────────────

function Level2Order({ onFinish }: { onFinish: (score: number) => void }) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [data, setData] = useState(() => generateOrderRound());
  const [tappedIndex, setTappedIndex] = useState(0); // how many tapped correctly so far
  const [confirmed, setConfirmed] = useState<number[]>([]); // numbers confirmed in order
  const [shakeNum, setShakeNum] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [animateIn, setAnimateIn] = useState(true);
  const [roundDone, setRoundDone] = useState(false);

  const handleTap = useCallback(
    (num: number) => {
      if (roundDone) return;
      if (confirmed.includes(num)) return; // already tapped

      const expected = data.sorted[tappedIndex];
      if (num === expected) {
        const newConfirmed = [...confirmed, num];
        setConfirmed(newConfirmed);
        const nextIdx = tappedIndex + 1;
        setTappedIndex(nextIdx);

        if (nextIdx === data.sorted.length) {
          // round complete
          const newScore = score + 1;
          setScore(newScore);
          setRoundDone(true);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 900);
          setTimeout(() => {
            const next = round + 1;
            if (next >= TOTAL_ROUNDS) {
              onFinish(newScore);
              return;
            }
            const rd = generateOrderRound();
            setRound(next);
            setData(rd);
            setTappedIndex(0);
            setConfirmed([]);
            setRoundDone(false);
            setAnimateIn(true);
          }, 1200);
        }
      } else {
        setShakeNum(num);
        setTimeout(() => setShakeNum(null), 500);
      }
    },
    [roundDone, confirmed, data.sorted, tappedIndex, score, round, onFinish]
  );

  return (
    <div className="min-h-[calc(100dvh-56px)] flex flex-col px-4 py-4 gap-4 select-none">
      <style>{SHARED_STYLES}</style>
      {showConfetti && <ConfettiBurst />}

      <TopBar currentRound={round} score={score} onBack={() => onFinish(-1)} />

      <div className="text-center">
        <p className="text-2xl font-bold" style={{ color: "#2D3436" }}>
          رتب الأرقام من الأصغر للأكبر
        </p>
        <p className="text-base mt-1" style={{ color: "#636E72" }}>
          اضغط على الأصغر أولا
        </p>
      </div>

      {/* Sorted display - shows what's been picked */}
      <div className="flex gap-3 justify-center items-center min-h-[80px]">
        {data.sorted.map((num, i) => (
          <div
            key={`slot-${round}-${i}`}
            className="w-16 h-16 rounded-2xl flex items-center justify-center border-2 border-dashed"
            style={{
              background: confirmed.includes(num) ? "#51CF66" : "#F0F0F0",
              borderColor: confirmed.includes(num) ? "#2B9348" : "#CCC",
              animation: confirmed.includes(num) ? "correct-pulse 0.3s ease-out" : "none",
            }}
          >
            <span
              className="text-3xl font-black"
              style={{ color: confirmed.includes(num) ? "#FFFFFF" : "transparent" }}
            >
              {ARABIC_NUMERALS[num - 1]}
            </span>
          </div>
        ))}
      </div>

      {/* Tappable number cards */}
      <div
        className="flex-1 flex items-center justify-center"
        style={{ animation: animateIn ? "scale-in 0.4s ease-out" : "none" }}
      >
        <div className="flex gap-4 flex-wrap justify-center">
          {data.numbers.map((num, i) => {
            const done = confirmed.includes(num);
            const isShaking = shakeNum === num;

            return (
              <button
                key={`num-${round}-${num}`}
                onClick={() => handleTap(num)}
                disabled={done}
                className="rounded-3xl shadow-lg flex items-center justify-center transition-all"
                style={{
                  width: "clamp(80px, 20vw, 100px)",
                  height: "clamp(80px, 20vw, 100px)",
                  background: done ? "#E8E8E8" : OPTION_COLORS[i],
                  border: `3px solid ${done ? "#CCC" : OPTION_BORDERS[i]}`,
                  opacity: done ? 0.4 : 1,
                  animation: isShaking
                    ? "shake-wrong 0.4s ease-in-out"
                    : animateIn
                    ? `scale-in 0.3s ${0.1 + i * 0.08}s ease-out both`
                    : "none",
                }}
              >
                <span
                  className="font-black"
                  style={{
                    fontSize: "clamp(2.5rem, 10vw, 4rem)",
                    color: done ? "#CCC" : "#2D3436",
                  }}
                >
                  {ARABIC_NUMERALS[num - 1]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Level 3: Addition ──────────────────────────────────────────────────────

function Level3Addition({ onFinish }: { onFinish: (score: number) => void }) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [data, setData] = useState(() => generateAdditionRound());
  const [state, setState] = useState<"playing" | "correct" | "wrong">("playing");
  const [showConfetti, setShowConfetti] = useState(false);
  const [shakeWrong, setShakeWrong] = useState<number | null>(null);
  const [animateIn, setAnimateIn] = useState(true);

  const handleOption = useCallback(
    (value: number) => {
      if (state !== "playing") return;

      if (value === data.answer) {
        const newScore = score + 1;
        setScore(newScore);
        setState("correct");
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 900);
        setTimeout(() => {
          const next = round + 1;
          if (next >= TOTAL_ROUNDS) {
            onFinish(newScore);
            return;
          }
          const rd = generateAdditionRound();
          setRound(next);
          setData(rd);
          setState("playing");
          setAnimateIn(true);
        }, 1200);
      } else {
        setShakeWrong(value);
        setState("wrong");
        setTimeout(() => {
          setShakeWrong(null);
          setState("playing");
        }, 600);
      }
    },
    [state, data.answer, score, round, onFinish]
  );

  return (
    <div className="min-h-[calc(100dvh-56px)] flex flex-col px-4 py-4 gap-3 select-none">
      <style>{SHARED_STYLES}</style>
      {showConfetti && <ConfettiBurst />}

      <TopBar currentRound={round} score={score} onBack={() => onFinish(-1)} />

      <div className="text-center">
        <p className="text-2xl font-bold" style={{ color: "#2D3436" }}>
          كم الناتج؟
        </p>
      </div>

      {/* Visual equation */}
      <div
        className="flex-1 min-h-[180px] rounded-3xl shadow-inner overflow-hidden flex flex-col items-center justify-center gap-4 px-4"
        style={{
          background: "linear-gradient(180deg, #FFFFFF 0%, #FFF8F0 100%)",
          border: "3px dashed #E0E0E0",
          animation: animateIn ? "scale-in 0.4s ease-out" : "none",
        }}
      >
        {/* Emoji groups row */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {/* Group A */}
          <div className="flex gap-1 flex-wrap justify-center">
            {Array.from({ length: data.a }).map((_, i) => (
              <span
                key={`a-${round}-${i}`}
                className="text-4xl"
                style={{ animation: `scale-in 0.3s ${i * 0.06}s ease-out both` }}
              >
                {data.emoji}
              </span>
            ))}
          </div>

          {/* Plus sign */}
          <span className="text-5xl font-black" style={{ color: "#51CF66" }}>
            +
          </span>

          {/* Group B */}
          <div className="flex gap-1 flex-wrap justify-center">
            {Array.from({ length: data.b }).map((_, i) => (
              <span
                key={`b-${round}-${i}`}
                className="text-4xl"
                style={{ animation: `scale-in 0.3s ${(data.a + i) * 0.06}s ease-out both` }}
              >
                {data.emoji}
              </span>
            ))}
          </div>

          {/* Equals */}
          <span className="text-5xl font-black" style={{ color: "#4A90D9" }}>
            =
          </span>

          {/* Question mark */}
          <span className="text-6xl font-black" style={{ color: "#FF922B" }}>
            ؟
          </span>
        </div>

        {/* Numeric equation */}
        <div className="flex items-center gap-3 text-4xl font-black" style={{ color: "#2D3436" }}>
          <span>{ARABIC_NUMERALS[data.a - 1]}</span>
          <span style={{ color: "#51CF66" }}>+</span>
          <span>{ARABIC_NUMERALS[data.b - 1]}</span>
          <span style={{ color: "#4A90D9" }}>=</span>
          <span style={{ color: "#FF922B" }}>؟</span>
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3 pb-2">
        {data.options.map((opt, i) => {
          const isShaking = shakeWrong === opt;
          const isCorrectHighlight = state === "correct" && opt === data.answer;

          return (
            <button
              key={`${round}-${opt}`}
              onClick={() => handleOption(opt)}
              disabled={state === "correct"}
              className="rounded-3xl shadow-lg active:scale-95 transition-transform flex items-center justify-center"
              style={{
                background: isCorrectHighlight ? "#51CF66" : OPTION_COLORS[i],
                border: `3px solid ${isCorrectHighlight ? "#2B9348" : OPTION_BORDERS[i]}`,
                height: "clamp(80px, 15vw, 110px)",
                animation: isShaking
                  ? "shake-wrong 0.4s ease-in-out"
                  : isCorrectHighlight
                  ? "correct-pulse 0.4s ease-in-out"
                  : animateIn
                  ? `scale-in 0.3s ${0.2 + i * 0.08}s ease-out both`
                  : "none",
              }}
            >
              <span
                className="font-black"
                style={{
                  fontSize: "clamp(2.5rem, 10vw, 4rem)",
                  color: isCorrectHighlight ? "#FFFFFF" : "#2D3436",
                }}
              >
                {ARABIC_NUMERALS[opt - 1]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function ArqamPage() {
  const [progress, setProgress] = useState<Progress>(defaultProgress);
  const [screen, setScreen] = useState<"levels" | "playing" | "done">("levels");
  const [activeLevel, setActiveLevel] = useState<LevelId>(1);
  const [lastScore, setLastScore] = useState(0);

  // Load progress from localStorage on mount
  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const handleSelectLevel = useCallback((level: LevelId) => {
    setActiveLevel(level);
    setScreen("playing");
  }, []);

  const handleFinish = useCallback(
    (score: number) => {
      // score of -1 means user backed out
      if (score < 0) {
        setScreen("levels");
        return;
      }

      setLastScore(score);
      const stars = starsFromScore(score);

      setProgress((prev) => {
        const updated: Progress = {
          levels: { ...prev.levels },
        };

        // Update stars for current level (keep best)
        const current = updated.levels[activeLevel];
        updated.levels[activeLevel] = {
          ...current,
          stars: Math.max(current.stars, stars),
        };

        // Unlock next level if scored at least 1 star
        if (stars >= 1 && activeLevel < 3) {
          const nextId = (activeLevel + 1) as LevelId;
          updated.levels[nextId] = {
            ...updated.levels[nextId],
            unlocked: true,
          };
        }

        saveProgress(updated);
        return updated;
      });

      setScreen("done");
    },
    [activeLevel]
  );

  const handleRestart = useCallback(() => {
    setScreen("playing");
  }, []);

  const handleBackToLevels = useCallback(() => {
    setScreen("levels");
  }, []);

  if (screen === "levels") {
    return <LevelSelect progress={progress} onSelect={handleSelectLevel} />;
  }

  if (screen === "done") {
    return (
      <DoneScreen
        score={lastScore}
        stars={starsFromScore(lastScore)}
        levelId={activeLevel}
        onRestart={handleRestart}
        onLevels={handleBackToLevels}
      />
    );
  }

  // Playing screen - render active level
  // Use key to force fresh mount on restart
  if (activeLevel === 1) {
    return <Level1Counting key={`l1-${Date.now()}`} onFinish={handleFinish} />;
  }
  if (activeLevel === 2) {
    return <Level2Order key={`l2-${Date.now()}`} onFinish={handleFinish} />;
  }
  return <Level3Addition key={`l3-${Date.now()}`} onFinish={handleFinish} />;
}
