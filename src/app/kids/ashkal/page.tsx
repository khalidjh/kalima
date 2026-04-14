"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

/* ─── Shape definitions ─── */
interface Shape {
  id: string;
  name: string;
}

const SHAPES: Shape[] = [
  { id: "circle", name: "دائرة" },
  { id: "square", name: "مربع" },
  { id: "triangle", name: "مثلث" },
  { id: "rectangle", name: "مستطيل" },
  { id: "star", name: "نجمة" },
  { id: "heart", name: "قلب" },
  { id: "diamond", name: "معين" },
  { id: "oval", name: "بيضاوي" },
];

const SHAPE_COLORS = [
  "#FF6B6B",
  "#51CF66",
  "#FFD43B",
  "#CC5DE8",
  "#FF922B",
  "#4A90D9",
  "#F06595",
];

const TOTAL_ROUNDS = 10;

/* ─── Shape renderer ─── */
function ShapeVisual({
  shapeId,
  color,
  size,
}: {
  shapeId: string;
  color: string;
  size: number;
}) {
  switch (shapeId) {
    case "circle":
      return (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            backgroundColor: color,
          }}
        />
      );
    case "square":
      return (
        <div
          style={{
            width: size * 0.85,
            height: size * 0.85,
            borderRadius: size * 0.08,
            backgroundColor: color,
          }}
        />
      );
    case "triangle":
      return (
        <svg width={size} height={size} viewBox="0 0 100 100">
          <polygon points="50,8 95,88 5,88" fill={color} />
        </svg>
      );
    case "rectangle":
      return (
        <div
          style={{
            width: size,
            height: size * 0.6,
            borderRadius: size * 0.06,
            backgroundColor: color,
          }}
        />
      );
    case "star":
      return (
        <svg width={size} height={size} viewBox="0 0 100 100">
          <polygon
            points="50,5 61,35 95,35 68,57 79,90 50,70 21,90 32,57 5,35 39,35"
            fill={color}
          />
        </svg>
      );
    case "heart":
      return (
        <svg width={size} height={size} viewBox="0 0 100 100">
          <path
            d="M50,88 C25,65 5,50 5,30 A22,22,0,0,1,50,25 A22,22,0,0,1,95,30 C95,50 75,65 50,88Z"
            fill={color}
          />
        </svg>
      );
    case "diamond":
      return (
        <div
          style={{
            width: size * 0.65,
            height: size * 0.65,
            backgroundColor: color,
            transform: "rotate(45deg)",
            borderRadius: size * 0.05,
          }}
        />
      );
    case "oval":
      return (
        <div
          style={{
            width: size,
            height: size * 0.6,
            borderRadius: "50%",
            backgroundColor: color,
          }}
        />
      );
    default:
      return null;
  }
}

/* ─── Helpers ─── */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom<T>(arr: T[], count: number, exclude?: T): T[] {
  const filtered = exclude ? arr.filter((x) => x !== exclude) : [...arr];
  return shuffle(filtered).slice(0, count);
}

function randomColor(exclude?: string): string {
  const available = exclude
    ? SHAPE_COLORS.filter((c) => c !== exclude)
    : SHAPE_COLORS;
  return available[Math.floor(Math.random() * available.length)];
}

interface RoundData {
  target: Shape;
  targetColor: string;
  options: { shape: Shape; color: string }[];
}

function generateRound(): RoundData {
  const target = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const targetColor = randomColor();
  const wrongShapes = pickRandom(SHAPES, 3, target);

  // Each option gets a different color, and none match the target color
  const usedColors = new Set<string>([targetColor]);
  const assignColor = () => {
    let c = randomColor();
    let attempts = 0;
    while (usedColors.has(c) && attempts < 20) {
      c = randomColor();
      attempts++;
    }
    usedColors.add(c);
    return c;
  };

  const correctOption = { shape: target, color: assignColor() };
  const wrongOptions = wrongShapes.map((s) => ({
    shape: s,
    color: assignColor(),
  }));

  const options = shuffle([correctOption, ...wrongOptions]);
  return { target, targetColor, options };
}

/* ─── Sparkle component ─── */
function Sparkles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-sparkle"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            animationDelay: `${i * 0.12}s`,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20">
            <polygon
              points="10,0 12,7 20,10 12,13 10,20 8,13 0,10 8,7"
              fill="#FFD43B"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}

/* ─── Celebration screen ─── */
function Celebration({ score, onRestart }: { score: number; onRestart: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4 text-center animate-pop">
      <div className="relative">
        <div className="text-7xl mb-2">🏆</div>
        <Sparkles />
      </div>
      <h2 className="text-3xl font-bold" style={{ color: "#2D3436" }}>
        أحسنت!
      </h2>
      <div className="flex items-center gap-2 text-2xl">
        {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
          <span key={i} style={{ opacity: i < score ? 1 : 0.25 }}>
            ⭐
          </span>
        ))}
      </div>
      <p className="text-xl" style={{ color: "#636E72" }}>
        حصلت على {score} من {TOTAL_ROUNDS}
      </p>
      <div className="flex gap-3 mt-4">
        <button
          onClick={onRestart}
          className="px-8 py-4 rounded-2xl font-bold text-xl text-white transition-transform active:scale-95"
          style={{ background: "linear-gradient(135deg, #51CF66, #4A90D9)" }}
        >
          العب مرة ثانية
        </button>
        <Link
          href="/kids"
          className="px-8 py-4 rounded-2xl font-bold text-xl transition-transform active:scale-95"
          style={{ background: "#F0F0F0", color: "#2D3436" }}
        >
          رجوع
        </Link>
      </div>
    </div>
  );
}

/* ─── Main page ─── */
export default function AshkalPage() {
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState<RoundData | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [mounted, setMounted] = useState(false);

  const startRound = useCallback(() => {
    setRound(generateRound());
    setFeedback(null);
    setSelectedIdx(null);
  }, []);

  // Initialize first round
  useEffect(() => {
    setMounted(true);
    startRound();
  }, [startRound]);

  const handleSelect = (idx: number) => {
    if (feedback) return; // already answered
    if (!round) return;

    setSelectedIdx(idx);
    const selected = round.options[idx];

    if (selected.shape.id === round.target.id) {
      setFeedback("correct");
      setScore((s) => s + 1);
      setTimeout(() => {
        if (currentRound + 1 >= TOTAL_ROUNDS) {
          setFinished(true);
        } else {
          setCurrentRound((r) => r + 1);
          startRound();
        }
      }, 1200);
    } else {
      setFeedback("wrong");
      setTimeout(() => {
        setFeedback(null);
        setSelectedIdx(null);
      }, 800);
    }
  };

  const handleRestart = () => {
    setCurrentRound(0);
    setScore(0);
    setFinished(false);
    startRound();
  };

  if (!mounted || !round) return null;

  if (finished) {
    return <Celebration score={score} onRestart={handleRestart} />;
  }

  return (
    <>
      <style jsx global>{`
        @keyframes pop {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes wobble {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        @keyframes sparkle {
          0% { transform: scale(0) rotate(0deg); opacity: 1; }
          50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
          100% { transform: scale(0) rotate(360deg); opacity: 0; }
        }
        @keyframes float-in {
          0% { transform: scale(0.3) rotate(-10deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .animate-pop { animation: pop 0.5s ease-out both; }
        .animate-wobble { animation: wobble 0.5s ease-in-out; }
        .animate-sparkle { animation: sparkle 0.8s ease-out both; }
        .animate-float-in { animation: float-in 0.4s ease-out both; }
      `}</style>

      <div className="flex flex-col items-center px-4 py-6 gap-5 max-w-lg mx-auto">
        {/* Top bar: back + progress */}
        <div className="w-full flex items-center justify-between">
          <Link
            href="/kids"
            className="flex items-center gap-1 text-sm font-bold px-4 py-2 rounded-2xl"
            style={{ background: "#F0F0F0", color: "#636E72" }}
          >
            <span>→</span>
            <span>رجوع</span>
          </Link>
          <div className="flex items-center gap-1.5">
            <span className="text-lg">⭐</span>
            <span className="font-bold text-lg" style={{ color: "#FF922B" }}>
              {score}
            </span>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2">
          {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full transition-all duration-300"
              style={{
                backgroundColor:
                  i < currentRound
                    ? "#51CF66"
                    : i === currentRound
                    ? "#4A90D9"
                    : "#DDD",
                transform: i === currentRound ? "scale(1.3)" : "scale(1)",
              }}
            />
          ))}
        </div>

        {/* Question */}
        <h2
          className="text-2xl font-bold text-center"
          style={{ color: "#2D3436" }}
        >
          أين الـ{round.target.name}؟
        </h2>

        {/* Target shape card */}
        <div
          className="relative flex items-center justify-center rounded-3xl shadow-lg animate-pop"
          style={{
            width: 160,
            height: 160,
            backgroundColor: "#FFFFFF",
            border: "3px solid #E8E8E8",
          }}
          key={`target-${currentRound}`}
        >
          <ShapeVisual
            shapeId={round.target.id}
            color={round.targetColor}
            size={100}
          />
          {feedback === "correct" && <Sparkles />}
        </div>

        {/* Shape name label */}
        <span
          className="text-lg font-bold px-5 py-1.5 rounded-full"
          style={{ backgroundColor: "#F0F0F0", color: "#636E72" }}
        >
          {round.target.name}
        </span>

        {/* Options 2x2 grid */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          {round.options.map((opt, idx) => {
            const isSelected = selectedIdx === idx;
            const isCorrectChoice =
              opt.shape.id === round.target.id && feedback === "correct" && isSelected;
            const isWrongChoice = feedback === "wrong" && isSelected;

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`
                  flex items-center justify-center rounded-3xl shadow-md
                  transition-transform duration-200 active:scale-95
                  animate-float-in
                  ${isCorrectChoice ? "ring-4 ring-green-400" : ""}
                  ${isWrongChoice ? "animate-wobble ring-4 ring-red-300" : ""}
                `}
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  backgroundColor: isCorrectChoice
                    ? "#D4F4DD"
                    : isWrongChoice
                    ? "#FFE0E0"
                    : "#FFFFFF",
                  border: "3px solid #F0F0F0",
                  animationDelay: `${idx * 0.08}s`,
                }}
              >
                <ShapeVisual
                  shapeId={opt.shape.id}
                  color={opt.color}
                  size={80}
                />
              </button>
            );
          })}
        </div>

        {/* Feedback message */}
        <div className="h-10 flex items-center justify-center">
          {feedback === "correct" && (
            <span className="text-xl font-bold animate-pop" style={{ color: "#51CF66" }}>
              ممتاز! ⭐
            </span>
          )}
          {feedback === "wrong" && (
            <span className="text-xl font-bold animate-pop" style={{ color: "#FF6B6B" }}>
              حاول مرة ثانية!
            </span>
          )}
        </div>
      </div>
    </>
  );
}
