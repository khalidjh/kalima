"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";

// ─── Constants ───────────────────────────────────────────────────────────────

const ARABIC_NUMS: Record<number, string> = {
  0: "٠", 1: "١", 2: "٢", 3: "٣", 4: "٤", 5: "٥",
  6: "٦", 7: "٧", 8: "٨", 9: "٩", 10: "١٠",
  11: "١١", 12: "١٢", 13: "١٣", 14: "١٤", 15: "١٥",
  16: "١٦", 17: "١٧", 18: "١٨", 19: "١٩", 20: "٢٠",
  21: "٢١", 22: "٢٢", 23: "٢٣", 24: "٢٤", 25: "٢٥",
  26: "٢٦", 27: "٢٧", 28: "٢٨", 29: "٢٩", 30: "٣٠",
  35: "٣٥", 36: "٣٦", 40: "٤٠", 42: "٤٢", 45: "٤٥",
  48: "٤٨", 49: "٤٩", 50: "٥٠", 54: "٥٤", 56: "٥٦",
  60: "٦٠", 63: "٦٣", 64: "٦٤", 70: "٧٠", 72: "٧٢",
  80: "٨٠", 81: "٨١", 90: "٩٠", 100: "١٠٠",
};

function toArabicNum(n: number): string {
  if (ARABIC_NUMS[n]) return ARABIC_NUMS[n];
  // Build digit by digit
  const digits = String(n).split("");
  return digits.map(d => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]).join("");
}

const COUNTING_EMOJIS = ["🍎", "🌟", "🐱", "🦋", "🎈", "🐠", "🍕", "🚀", "🌸", "⚽", "🍊", "🐝"];
const TOTAL_ROUNDS = 8;
const STORAGE_KEY = "kalima_kids_arqam_v2_progress";

const OPTION_COLORS = ["#FFE0E0", "#D4F4DD", "#E0E8FF", "#FFF3D4"];
const OPTION_BORDERS = ["#FF6B6B", "#51CF66", "#4A90D9", "#FFD43B"];

// ─── Types ───────────────────────────────────────────────────────────────────

type LevelId = 1 | 2 | 3 | 4 | 5;

interface LevelProgress {
  unlocked: boolean;
  stars: number;
}

interface Progress {
  levels: Record<LevelId, LevelProgress>;
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

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeDistractors(correct: number, min: number, max: number, count: number): number[] {
  const set = new Set<number>();
  let attempts = 0;
  while (set.size < count && attempts < 100) {
    const n = randInt(min, max);
    if (n !== correct) set.add(n);
    attempts++;
  }
  return Array.from(set);
}

function generateScatterPositions(count: number) {
  const positions: { x: number; y: number; rotate: number; scale: number }[] = [];
  // Grid-based scatter to avoid overlap
  const cols = Math.ceil(Math.sqrt(count * 1.5));
  const rows = Math.ceil(count / cols);
  const cellW = 80 / cols;
  const cellH = 80 / rows;
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    positions.push({
      x: 8 + col * cellW + Math.random() * cellW * 0.5,
      y: 5 + row * cellH + Math.random() * cellH * 0.4,
      rotate: -15 + Math.random() * 30,
      scale: 0.85 + Math.random() * 0.2,
    });
  }
  return positions;
}

function loadProgress(): Progress {
  if (typeof window === "undefined") return defaultProgress();
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
      4: { unlocked: false, stars: 0 },
      5: { unlocked: false, stars: 0 },
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

// ─── Game Container - fits within both headers ──────────────────────────────

function GameContainer({ children, scroll }: { children: React.ReactNode; scroll?: boolean }) {
  return (
    <div
      className={`h-[calc(100dvh-120px)] flex flex-col ${scroll ? "overflow-y-auto" : "overflow-hidden"}`}
    >
      <style>{SHARED_STYLES}</style>
      {children}
    </div>
  );
}

// ─── Level Select Screen ─────────────────────────────────────────────────────

const LEVEL_META: { id: LevelId; title: string; desc: string; icon: string; color: string }[] = [
  { id: 1, title: "العد", desc: "عد الأشكال واختر الرقم (١-٢٠)", icon: "🔢", color: "#51CF66" },
  { id: 2, title: "العمليات", desc: "جمع وطرح أرقام حتى ٢٠", icon: "➕", color: "#4A90D9" },
  { id: 3, title: "الضرب", desc: "جدول الضرب من ١ إلى ١٠", icon: "✖️", color: "#CC5DE8" },
  { id: 4, title: "الأنماط", desc: "اكتشف الرقم المفقود في التسلسل", icon: "🔍", color: "#FF922B" },
  { id: 5, title: "مسائل", desc: "حل مسائل كلامية بالعربية", icon: "📝", color: "#F06595" },
];

function LevelSelect({
  progress,
  onSelect,
}: {
  progress: Progress;
  onSelect: (level: LevelId) => void;
}) {
  return (
    <GameContainer scroll>
      <div className="flex flex-col items-center px-4 py-6 gap-4">
        <h1 className="text-3xl font-black" style={{ color: "#2D3436" }}>
          أرقامي
        </h1>
        <p className="text-base" style={{ color: "#636E72" }}>
          اختر المستوى
        </p>

        <div className="flex flex-col gap-4 w-full max-w-sm">
          {LEVEL_META.map((lm, idx) => {
            const lp = progress.levels[lm.id];
            const locked = !lp.unlocked;

            return (
              <button
                key={lm.id}
                disabled={locked}
                onClick={() => onSelect(lm.id)}
                className="relative rounded-2xl shadow-lg p-4 flex items-center gap-3 transition-transform active:scale-95"
                style={{
                  background: locked ? "#E8E8E8" : "#FFFFFF",
                  border: `3px solid ${locked ? "#CCC" : lm.color}`,
                  opacity: locked ? 0.6 : 1,
                  animation: `card-pop 0.4s ${idx * 0.1}s ease-out both`,
                }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{ background: locked ? "#DDD" : `${lm.color}22` }}
                >
                  {locked ? "🔒" : lm.icon}
                </div>
                <div className="flex-1 text-right">
                  <div className="text-lg font-black" style={{ color: locked ? "#AAA" : "#2D3436" }}>
                    المستوى {toArabicNum(lm.id)} - {lm.title}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: locked ? "#BBB" : "#636E72" }}>
                    {lm.desc}
                  </div>
                  <div className="flex gap-1 mt-1 justify-end">
                    {[0, 1, 2].map((s) => (
                      <span key={s} className="text-lg" style={{ opacity: s < lp.stars ? 1 : 0.2 }}>
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
          className="mt-2 px-6 py-3 rounded-2xl text-lg font-bold text-white shadow-lg active:scale-95 transition-transform"
          style={{ background: "linear-gradient(135deg, #CC5DE8, #F06595)" }}
        >
          الألعاب ↩
        </Link>
      </div>
    </GameContainer>
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
    stars >= 3 ? "ممتاز! أنت بطل! 🏆"
    : stars >= 2 ? "أحسنت! رائع جدا! 🌟"
    : stars >= 1 ? "جيد! استمر! 💪"
    : "حاول مرة ثانية! 🔄";

  return (
    <GameContainer scroll>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 gap-4">
        <div className="text-6xl" style={{ animation: "celebration-bounce 1s ease-in-out infinite" }}>
          🎉
        </div>

        <h1 className="text-3xl font-black" style={{ color: "#CC5DE8" }}>
          انتهى المستوى {toArabicNum(levelId)}!
        </h1>

        <p className="text-xl font-bold" style={{ color: "#2D3436" }}>
          {message}
        </p>

        <div className="flex gap-1.5 flex-wrap justify-center">
          {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
            <span
              key={i}
              className="text-3xl"
              style={{
                animation: i < score ? `star-pop 0.4s ${i * 0.1}s ease-out both` : "none",
                opacity: i < score ? 1 : 0.2,
              }}
            >
              ⭐
            </span>
          ))}
        </div>

        <p className="text-2xl font-black" style={{ color: "#FF922B" }}>
          {toArabicNum(score)} / {toArabicNum(TOTAL_ROUNDS)}
        </p>

        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={onRestart}
            className="px-6 py-3 rounded-2xl text-lg font-bold text-white shadow-lg active:scale-95 transition-transform"
            style={{ background: "linear-gradient(135deg, #51CF66, #4A90D9)" }}
          >
            أعد المستوى 🔄
          </button>
          <button
            onClick={onLevels}
            className="px-6 py-3 rounded-2xl text-lg font-bold text-white shadow-lg active:scale-95 transition-transform"
            style={{ background: "linear-gradient(135deg, #CC5DE8, #F06595)" }}
          >
            المستويات ↩
          </button>
        </div>
      </div>
    </GameContainer>
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
    <div className="flex items-center justify-between shrink-0 px-4 pt-3 pb-1">
      <button
        onClick={onBack}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md active:scale-90 transition-transform"
        style={{ background: "#FFFFFF", border: "2px solid #E0E0E0" }}
      >
        →
      </button>

      <div className="flex gap-1.5">
        {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full transition-all duration-300"
            style={{
              background: i < currentRound ? "#51CF66" : i === currentRound ? "#4A90D9" : "#DDD",
              transform: i === currentRound ? "scale(1.3)" : "scale(1)",
            }}
          />
        ))}
      </div>

      <div
        className="flex items-center gap-1 px-2.5 py-1 rounded-xl shadow-md"
        style={{ background: "#FFFFFF", border: "2px solid #FFD43B" }}
      >
        <span className="text-lg">⭐</span>
        <span className="text-base font-bold" style={{ color: "#FF922B" }}>
          {toArabicNum(score)}
        </span>
      </div>
    </div>
  );
}

// ─── Option Button Grid ─────────────────────────────────────────────────────

function OptionGrid({
  options,
  round,
  state,
  correctAnswer,
  shakeWrong,
  animateIn,
  onSelect,
  large,
}: {
  options: number[];
  round: number;
  state: "playing" | "correct" | "wrong";
  correctAnswer: number;
  shakeWrong: number | null;
  animateIn: boolean;
  onSelect: (v: number) => void;
  large?: boolean;
}) {
  return (
    <div className={`grid grid-cols-2 gap-2.5 shrink-0 px-4 pb-3`}>
      {options.map((opt, i) => {
        const isShaking = shakeWrong === opt;
        const isCorrectHighlight = state === "correct" && opt === correctAnswer;

        return (
          <button
            key={`${round}-${opt}-${i}`}
            onClick={() => onSelect(opt)}
            disabled={state === "correct"}
            className="rounded-2xl shadow-lg active:scale-95 transition-transform flex items-center justify-center"
            style={{
              background: isCorrectHighlight ? "#51CF66" : OPTION_COLORS[i],
              border: `3px solid ${isCorrectHighlight ? "#2B9348" : OPTION_BORDERS[i]}`,
              height: large ? "clamp(70px, 14vw, 90px)" : "clamp(60px, 12vw, 80px)",
              animation: isShaking
                ? "shake-wrong 0.4s ease-in-out"
                : isCorrectHighlight
                ? "correct-pulse 0.4s ease-in-out"
                : animateIn
                ? `scale-in 0.3s ${0.2 + i * 0.06}s ease-out both`
                : "none",
            }}
          >
            <span
              className="font-black"
              style={{
                fontSize: large ? "clamp(2rem, 8vw, 3.5rem)" : "clamp(1.8rem, 7vw, 3rem)",
                color: isCorrectHighlight ? "#FFFFFF" : "#2D3436",
              }}
            >
              {toArabicNum(opt)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Common answer handler hook ─────────────────────────────────────────────

function useAnswerHandler(onFinish: (score: number) => void) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [state, setState] = useState<"playing" | "correct" | "wrong">("playing");
  const [showConfetti, setShowConfetti] = useState(false);
  const [shakeWrong, setShakeWrong] = useState<number | null>(null);
  const [animateIn, setAnimateIn] = useState(true);

  const handleAnswer = useCallback(
    (value: number, correctAnswer: number, generateNext: () => void) => {
      if (state !== "playing") return;

      if (value === correctAnswer) {
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
          setRound(next);
          generateNext();
          setState("playing");
          setAnimateIn(true);
        }, 1000);
      } else {
        setShakeWrong(value);
        setState("wrong");
        setTimeout(() => {
          setShakeWrong(null);
          setState("playing");
        }, 500);
      }
    },
    [state, score, round, onFinish]
  );

  return { round, score, state, showConfetti, shakeWrong, animateIn, handleAnswer, setAnimateIn };
}

// ─── Level 1: Counting (1-20) ──────────────────────────────────────────────

function generateCountingRound() {
  const target = randInt(1, 20);
  const emoji = pickRandom(COUNTING_EMOJIS);
  const wrong = makeDistractors(target, 1, 20, 3);
  return { target, emoji, options: shuffle([target, ...wrong]) };
}

function Level1Counting({ onFinish }: { onFinish: (score: number) => void }) {
  const { round, score, state, showConfetti, shakeWrong, animateIn, handleAnswer } =
    useAnswerHandler(onFinish);
  const [data, setData] = useState(() => generateCountingRound());
  const [scatter, setScatter] = useState(() => generateScatterPositions(data.target));

  const handleOption = useCallback(
    (value: number) => {
      handleAnswer(value, data.target, () => {
        const rd = generateCountingRound();
        setData(rd);
        setScatter(generateScatterPositions(rd.target));
      });
    },
    [handleAnswer, data.target]
  );

  // Regenerate scatter when data changes
  useEffect(() => {
    setScatter(generateScatterPositions(data.target));
  }, [data.target]);

  return (
    <GameContainer>
      {showConfetti && <ConfettiBurst />}
      <TopBar currentRound={round} score={score} onBack={() => onFinish(-1)} />

      <div className="text-center shrink-0 py-1">
        <p className="text-xl font-bold" style={{ color: "#2D3436" }}>
          كم عدد الـ {data.emoji}؟
        </p>
      </div>

      {/* Emoji scatter area */}
      <div
        className="relative flex-1 mx-4 rounded-2xl shadow-inner overflow-hidden"
        style={{
          maxHeight: "40vh",
          background: "linear-gradient(180deg, #FFFFFF 0%, #FFF8F0 100%)",
          border: "3px dashed #E0E0E0",
          animation: animateIn ? "scale-in 0.3s ease-out" : "none",
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
              fontSize: data.target > 12 ? "clamp(1.2rem, 4vw, 1.8rem)" : "clamp(1.5rem, 6vw, 2.5rem)",
              animation: `scale-in 0.2s ${i * 0.03}s ease-out both`,
              // @ts-expect-error CSS custom properties
              "--rot": `${pos.rotate}deg`,
            }}
          >
            {data.emoji}
          </div>
        ))}
      </div>

      <div className="h-2 shrink-0" />
      <OptionGrid
        options={data.options}
        round={round}
        state={state}
        correctAnswer={data.target}
        shakeWrong={shakeWrong}
        animateIn={animateIn}
        onSelect={handleOption}
        large
      />
    </GameContainer>
  );
}

// ─── Level 2: Operations (Add & Subtract up to 20) ─────────────────────────

interface OperationRound {
  a: number;
  b: number;
  op: "+" | "-";
  answer: number;
  options: number[];
}

function generateOperationRound(): OperationRound {
  const op = Math.random() < 0.5 ? "+" : "-";
  let a: number, b: number, answer: number;

  if (op === "+") {
    a = randInt(3, 15);
    b = randInt(2, 20 - a);
    answer = a + b;
  } else {
    a = randInt(6, 20);
    b = randInt(2, a - 1);
    answer = a - b;
  }

  const wrong = makeDistractors(answer, Math.max(1, answer - 5), answer + 5, 3);
  return { a, b, op, answer, options: shuffle([answer, ...wrong]) };
}

function Level2Operations({ onFinish }: { onFinish: (score: number) => void }) {
  const { round, score, state, showConfetti, shakeWrong, animateIn, handleAnswer } =
    useAnswerHandler(onFinish);
  const [data, setData] = useState(() => generateOperationRound());

  const handleOption = useCallback(
    (value: number) => {
      handleAnswer(value, data.answer, () => {
        setData(generateOperationRound());
      });
    },
    [handleAnswer, data.answer]
  );

  const opSymbol = data.op === "+" ? "+" : "−";
  const opColor = data.op === "+" ? "#51CF66" : "#FF6B6B";

  return (
    <GameContainer>
      {showConfetti && <ConfettiBurst />}
      <TopBar currentRound={round} score={score} onBack={() => onFinish(-1)} />

      <div className="text-center shrink-0 py-1">
        <p className="text-xl font-bold" style={{ color: "#2D3436" }}>
          كم الناتج؟
        </p>
      </div>

      {/* Equation display */}
      <div
        className="flex-1 mx-4 rounded-2xl shadow-inner flex items-center justify-center"
        style={{
          maxHeight: "35vh",
          background: "linear-gradient(180deg, #FFFFFF 0%, #FFF8F0 100%)",
          border: "3px dashed #E0E0E0",
          animation: animateIn ? "scale-in 0.3s ease-out" : "none",
        }}
      >
        <div className="flex items-center gap-3 text-5xl font-black" style={{ color: "#2D3436" }}>
          <span>{toArabicNum(data.a)}</span>
          <span style={{ color: opColor }}>{opSymbol}</span>
          <span>{toArabicNum(data.b)}</span>
          <span style={{ color: "#4A90D9" }}>=</span>
          <span style={{ color: "#FF922B" }}>؟</span>
        </div>
      </div>

      <div className="h-2 shrink-0" />
      <OptionGrid
        options={data.options}
        round={round}
        state={state}
        correctAnswer={data.answer}
        shakeWrong={shakeWrong}
        animateIn={animateIn}
        onSelect={handleOption}
        large
      />
    </GameContainer>
  );
}

// ─── Level 3: Multiplication Tables ─────────────────────────────────────────

interface MultiplyRound {
  a: number;
  b: number;
  answer: number;
  options: number[];
}

function generateMultiplyRound(): MultiplyRound {
  const a = randInt(2, 10);
  const b = randInt(2, 10);
  const answer = a * b;
  const wrong = makeDistractors(answer, Math.max(2, answer - 10), answer + 10, 3);
  return { a, b, answer, options: shuffle([answer, ...wrong]) };
}

function Level3Multiply({ onFinish }: { onFinish: (score: number) => void }) {
  const { round, score, state, showConfetti, shakeWrong, animateIn, handleAnswer } =
    useAnswerHandler(onFinish);
  const [data, setData] = useState(() => generateMultiplyRound());

  const handleOption = useCallback(
    (value: number) => {
      handleAnswer(value, data.answer, () => {
        setData(generateMultiplyRound());
      });
    },
    [handleAnswer, data.answer]
  );

  return (
    <GameContainer>
      {showConfetti && <ConfettiBurst />}
      <TopBar currentRound={round} score={score} onBack={() => onFinish(-1)} />

      <div className="text-center shrink-0 py-1">
        <p className="text-xl font-bold" style={{ color: "#2D3436" }}>
          كم الناتج؟
        </p>
      </div>

      {/* Equation display */}
      <div
        className="flex-1 mx-4 rounded-2xl shadow-inner flex items-center justify-center"
        style={{
          maxHeight: "35vh",
          background: "linear-gradient(180deg, #FFFFFF 0%, #FFF8F0 100%)",
          border: "3px dashed #E0E0E0",
          animation: animateIn ? "scale-in 0.3s ease-out" : "none",
        }}
      >
        <div className="flex items-center gap-3 text-5xl font-black" style={{ color: "#2D3436" }}>
          <span>{toArabicNum(data.a)}</span>
          <span style={{ color: "#CC5DE8" }}>×</span>
          <span>{toArabicNum(data.b)}</span>
          <span style={{ color: "#4A90D9" }}>=</span>
          <span style={{ color: "#FF922B" }}>؟</span>
        </div>
      </div>

      <div className="h-2 shrink-0" />
      <OptionGrid
        options={data.options}
        round={round}
        state={state}
        correctAnswer={data.answer}
        shakeWrong={shakeWrong}
        animateIn={animateIn}
        onSelect={handleOption}
        large
      />
    </GameContainer>
  );
}

// ─── Level 4: Number Patterns ───────────────────────────────────────────────

interface PatternRound {
  sequence: (number | null)[];
  answer: number;
  options: number[];
}

function generatePatternRound(): PatternRound {
  const patternTypes = [
    // Count by 2s
    () => {
      const start = randInt(1, 10) * 2;
      const seq = Array.from({ length: 5 }, (_, i) => start + i * 2);
      return { seq, step: 2 };
    },
    // Count by 3s
    () => {
      const start = randInt(1, 6) * 3;
      const seq = Array.from({ length: 5 }, (_, i) => start + i * 3);
      return { seq, step: 3 };
    },
    // Count by 5s
    () => {
      const start = randInt(1, 8) * 5;
      const seq = Array.from({ length: 5 }, (_, i) => start + i * 5);
      return { seq, step: 5 };
    },
    // Count by 4s
    () => {
      const start = randInt(1, 5) * 4;
      const seq = Array.from({ length: 5 }, (_, i) => start + i * 4);
      return { seq, step: 4 };
    },
    // Descending by 2s
    () => {
      const start = randInt(12, 20);
      const seq = Array.from({ length: 5 }, (_, i) => start - i * 2);
      return { seq, step: -2 };
    },
    // Descending by 3s
    () => {
      const start = randInt(18, 30);
      const seq = Array.from({ length: 5 }, (_, i) => start - i * 3);
      return { seq, step: -3 };
    },
  ];

  const gen = pickRandom(patternTypes)();
  // Pick a random position (not first or last) to blank out
  const blankIdx = randInt(1, 3);
  const answer = gen.seq[blankIdx];
  const display: (number | null)[] = gen.seq.map((n, i) => (i === blankIdx ? null : n));

  const wrong = makeDistractors(answer, Math.max(1, answer - 8), answer + 8, 3);
  return { sequence: display, answer, options: shuffle([answer, ...wrong]) };
}

function Level4Patterns({ onFinish }: { onFinish: (score: number) => void }) {
  const { round, score, state, showConfetti, shakeWrong, animateIn, handleAnswer } =
    useAnswerHandler(onFinish);
  const [data, setData] = useState(() => generatePatternRound());

  const handleOption = useCallback(
    (value: number) => {
      handleAnswer(value, data.answer, () => {
        setData(generatePatternRound());
      });
    },
    [handleAnswer, data.answer]
  );

  return (
    <GameContainer>
      {showConfetti && <ConfettiBurst />}
      <TopBar currentRound={round} score={score} onBack={() => onFinish(-1)} />

      <div className="text-center shrink-0 py-1">
        <p className="text-xl font-bold" style={{ color: "#2D3436" }}>
          ما الرقم المفقود؟
        </p>
      </div>

      {/* Pattern display */}
      <div
        className="flex-1 mx-4 rounded-2xl shadow-inner flex items-center justify-center"
        style={{
          maxHeight: "35vh",
          background: "linear-gradient(180deg, #FFFFFF 0%, #FFF8F0 100%)",
          border: "3px dashed #E0E0E0",
          animation: animateIn ? "scale-in 0.3s ease-out" : "none",
        }}
      >
        <div className="flex items-center gap-2 flex-wrap justify-center px-3">
          {data.sequence.map((num, i) => (
            <div key={`${round}-${i}`} className="flex items-center gap-2">
              {num === null ? (
                <div
                  className="w-14 h-14 rounded-xl border-3 border-dashed flex items-center justify-center"
                  style={{ borderColor: "#FF922B", background: "#FFF3D4" }}
                >
                  <span className="text-3xl font-black" style={{ color: "#FF922B" }}>؟</span>
                </div>
              ) : (
                <span className="text-3xl font-black" style={{ color: "#2D3436" }}>
                  {toArabicNum(num)}
                </span>
              )}
              {i < data.sequence.length - 1 && (
                <span className="text-xl" style={{ color: "#CCC" }}>،</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="h-2 shrink-0" />
      <OptionGrid
        options={data.options}
        round={round}
        state={state}
        correctAnswer={data.answer}
        shakeWrong={shakeWrong}
        animateIn={animateIn}
        onSelect={handleOption}
        large
      />
    </GameContainer>
  );
}

// ─── Level 5: Word Problems ─────────────────────────────────────────────────

interface WordProblem {
  text: string;
  answer: number;
  options: number[];
}

function generateWordProblem(): WordProblem {
  const templates = [
    () => {
      const a = randInt(3, 12);
      const b = randInt(2, 8);
      return {
        text: `عند أحمد ${toArabicNum(a)} تفاحات، أعطاه صديقه ${toArabicNum(b)} تفاحات أخرى. كم أصبح عنده؟`,
        answer: a + b,
      };
    },
    () => {
      const a = randInt(10, 20);
      const b = randInt(2, a - 2);
      return {
        text: `كان عند سارة ${toArabicNum(a)} قلما، أعطت صديقتها ${toArabicNum(b)} أقلام. كم بقي عندها؟`,
        answer: a - b,
      };
    },
    () => {
      const a = randInt(2, 5);
      const b = randInt(3, 6);
      return {
        text: `في كل صف ${toArabicNum(a)} كراسي، وعدد الصفوف ${toArabicNum(b)}. كم كرسيا في المجموع؟`,
        answer: a * b,
      };
    },
    () => {
      const a = randInt(5, 15);
      const b = randInt(3, 8);
      return {
        text: `اشترى خالد ${toArabicNum(a)} حلويات ثم اشترى ${toArabicNum(b)} أخرى. كم حلوى عنده الآن؟`,
        answer: a + b,
      };
    },
    () => {
      const total = randInt(10, 20);
      const eaten = randInt(2, total - 2);
      return {
        text: `كان في الصحن ${toArabicNum(total)} بسكويتات، أكل منها ${toArabicNum(eaten)}. كم بقي؟`,
        answer: total - eaten,
      };
    },
    () => {
      const groups = randInt(3, 6);
      const per = randInt(2, 5);
      return {
        text: `وزّعت المعلمة ${toArabicNum(groups)} مجموعات، في كل مجموعة ${toArabicNum(per)} طلاب. كم طالبا في الفصل؟`,
        answer: groups * per,
      };
    },
    () => {
      const a = randInt(6, 12);
      const b = randInt(4, 10);
      return {
        text: `في الحديقة ${toArabicNum(a)} شجرات زيتون و${toArabicNum(b)} شجرات برتقال. كم شجرة في المجموع؟`,
        answer: a + b,
      };
    },
    () => {
      const total = randInt(12, 20);
      const gave = randInt(3, total - 3);
      return {
        text: `جمع ياسر ${toArabicNum(total)} صدفة من الشاطئ، وأعطى أخاه ${toArabicNum(gave)} صدفات. كم بقي معه؟`,
        answer: total - gave,
      };
    },
  ];

  const gen = pickRandom(templates)();
  const wrong = makeDistractors(gen.answer, Math.max(1, gen.answer - 5), gen.answer + 5, 3);
  return { text: gen.text, answer: gen.answer, options: shuffle([gen.answer, ...wrong]) };
}

function Level5WordProblems({ onFinish }: { onFinish: (score: number) => void }) {
  const { round, score, state, showConfetti, shakeWrong, animateIn, handleAnswer } =
    useAnswerHandler(onFinish);
  const [data, setData] = useState(() => generateWordProblem());

  const handleOption = useCallback(
    (value: number) => {
      handleAnswer(value, data.answer, () => {
        setData(generateWordProblem());
      });
    },
    [handleAnswer, data.answer]
  );

  return (
    <GameContainer>
      {showConfetti && <ConfettiBurst />}
      <TopBar currentRound={round} score={score} onBack={() => onFinish(-1)} />

      <div className="text-center shrink-0 py-1">
        <p className="text-xl font-bold" style={{ color: "#2D3436" }}>
          حل المسألة
        </p>
      </div>

      {/* Word problem display */}
      <div
        className="flex-1 mx-4 rounded-2xl shadow-inner flex items-center justify-center overflow-y-auto"
        style={{
          maxHeight: "40vh",
          background: "linear-gradient(180deg, #FFFFFF 0%, #FFF8F0 100%)",
          border: "3px dashed #E0E0E0",
          animation: animateIn ? "scale-in 0.3s ease-out" : "none",
        }}
      >
        <p
          className="text-xl font-bold leading-relaxed text-center px-5 py-4"
          style={{ color: "#2D3436" }}
        >
          {data.text}
        </p>
      </div>

      <div className="h-2 shrink-0" />
      <OptionGrid
        options={data.options}
        round={round}
        state={state}
        correctAnswer={data.answer}
        shakeWrong={shakeWrong}
        animateIn={animateIn}
        onSelect={handleOption}
        large
      />
    </GameContainer>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function ArqamPage() {
  const [progress, setProgress] = useState<Progress>(defaultProgress);
  const [screen, setScreen] = useState<"levels" | "playing" | "done">("levels");
  const [activeLevel, setActiveLevel] = useState<LevelId>(1);
  const [lastScore, setLastScore] = useState(0);
  const [playKey, setPlayKey] = useState(0);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const handleSelectLevel = useCallback((level: LevelId) => {
    setActiveLevel(level);
    setPlayKey((k) => k + 1);
    setScreen("playing");
  }, []);

  const handleFinish = useCallback(
    (score: number) => {
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

        const current = updated.levels[activeLevel];
        updated.levels[activeLevel] = {
          ...current,
          stars: Math.max(current.stars, stars),
        };

        if (stars >= 1 && activeLevel < 5) {
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
    setPlayKey((k) => k + 1);
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

  // Playing screen
  const key = `level-${activeLevel}-${playKey}`;
  switch (activeLevel) {
    case 1:
      return <Level1Counting key={key} onFinish={handleFinish} />;
    case 2:
      return <Level2Operations key={key} onFinish={handleFinish} />;
    case 3:
      return <Level3Multiply key={key} onFinish={handleFinish} />;
    case 4:
      return <Level4Patterns key={key} onFinish={handleFinish} />;
    case 5:
      return <Level5WordProblems key={key} onFinish={handleFinish} />;
    default:
      return <Level1Counting key={key} onFinish={handleFinish} />;
  }
}
