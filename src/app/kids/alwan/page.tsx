"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface ColorEntry {
  name: string;
  hex: string;
}

const COLORS: ColorEntry[] = [
  { name: "أحمر", hex: "#FF6B6B" },
  { name: "أزرق", hex: "#4A90D9" },
  { name: "أخضر", hex: "#51CF66" },
  { name: "أصفر", hex: "#FFD43B" },
  { name: "برتقالي", hex: "#FF922B" },
  { name: "بنفسجي", hex: "#CC5DE8" },
  { name: "وردي", hex: "#F06595" },
  { name: "بني", hex: "#A0522D" },
  { name: "أسود", hex: "#2D3436" },
  { name: "أبيض", hex: "#F8F9FA" },
];

const TOTAL_ROUNDS = 10;

type GameMode = "nameFromColor" | "colorFromName";
type GamePhase = "playing" | "done";
type AnswerState = "idle" | "correct" | "wrong";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRound(mode: GameMode) {
  const target = COLORS[Math.floor(Math.random() * COLORS.length)];
  const wrong = shuffle(COLORS.filter((c) => c.name !== target.name)).slice(
    0,
    3
  );
  const options = shuffle([target, ...wrong]);
  return { target, options, mode };
}

export default function AlwanPage() {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<GamePhase>("playing");
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [roundPerfect, setRoundPerfect] = useState(true);
  const [puzzle, setPuzzle] = useState(() => pickRound("nameFromColor"));
  const [showEntry, setShowEntry] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [stars, setStars] = useState<boolean[]>([]);
  const [confettiPieces, setConfettiPieces] = useState<
    { id: number; x: number; color: string; delay: number; size: number }[]
  >([]);

  const spawnConfetti = useCallback(() => {
    const pieces = Array.from({ length: 24 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)].hex,
      delay: Math.random() * 0.5,
      size: 8 + Math.random() * 12,
    }));
    setConfettiPieces(pieces);
    setTimeout(() => setConfettiPieces([]), 2000);
  }, []);

  const nextRound = useCallback(() => {
    const next = round + 1;
    if (next >= TOTAL_ROUNDS) {
      setPhase("done");
      return;
    }
    setRound(next);
    const nextMode: GameMode =
      next % 2 === 0 ? "nameFromColor" : "colorFromName";
    setPuzzle(pickRound(nextMode));
    setAnswerState("idle");
    setRoundPerfect(true);
    setSelectedIdx(null);
    setShowEntry(true);
  }, [round]);

  const handleTap = useCallback(
    (option: ColorEntry, idx: number) => {
      if (answerState === "correct") return;

      setSelectedIdx(idx);

      if (option.name === puzzle.target.name) {
        setAnswerState("correct");
        const earned = roundPerfect;
        setScore((s) => s + (earned ? 1 : 0));
        setStars((prev) => [...prev, earned]);
        spawnConfetti();
        setTimeout(() => nextRound(), 1400);
      } else {
        setAnswerState("wrong");
        setRoundPerfect(false);
        setTimeout(() => {
          setAnswerState("idle");
          setSelectedIdx(null);
        }, 600);
      }
    },
    [answerState, puzzle.target.name, roundPerfect, nextRound, spawnConfetti]
  );

  const restart = () => {
    setRound(0);
    setScore(0);
    setPhase("playing");
    setAnswerState("idle");
    setRoundPerfect(true);
    setPuzzle(pickRound("nameFromColor"));
    setShowEntry(true);
    setSelectedIdx(null);
    setStars([]);
    setConfettiPieces([]);
  };

  useEffect(() => {
    if (showEntry) {
      const t = setTimeout(() => setShowEntry(false), 500);
      return () => clearTimeout(t);
    }
  }, [showEntry, round]);

  // ── Celebration screen ──
  if (phase === "done") {
    return (
      <div
        className="flex flex-col items-center justify-center px-4 gap-6 overflow-y-auto"
        dir="rtl"
        style={{ background: "#FFF8F0" }}
      >
        <div className="text-6xl animate-bounce">🎉</div>
        <h1 className="text-4xl font-black" style={{ color: "#CC5DE8" }}>
          أحسنت!
        </h1>

        {/* Color rainbow bar */}
        <div className="flex gap-1 justify-center">
          {COLORS.map((c, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full"
              style={{
                background: c.hex,
                border: c.name === "أبيض" ? "2px solid #DFE6E9" : "none",
              }}
            />
          ))}
        </div>

        <div className="flex gap-1 flex-wrap justify-center">
          {stars.map((earned, i) => (
            <span
              key={i}
              className="text-3xl"
              style={{
                opacity: earned ? 1 : 0.25,
                filter: earned ? "none" : "grayscale(1)",
              }}
            >
              ⭐
            </span>
          ))}
        </div>
        <p className="text-2xl font-bold" style={{ color: "#2D3436" }}>
          حصلت على {score} من {TOTAL_ROUNDS} نجوم
        </p>
        <div className="flex gap-4 mt-4">
          <button
            onClick={restart}
            className="px-8 py-4 rounded-3xl text-white text-xl font-bold shadow-lg active:scale-95 transition-transform"
            style={{ background: "#51CF66" }}
          >
            العب مرة ثانية
          </button>
          <Link
            href="/kids"
            className="px-8 py-4 rounded-3xl text-white text-xl font-bold shadow-lg active:scale-95 transition-transform"
            style={{ background: "#4A90D9" }}
          >
            الرئيسية
          </Link>
        </div>
      </div>
    );
  }

  // ── Playing screen ──
  return (
    <div
      className="flex flex-col items-center px-4 pt-4 pb-8 gap-4 max-w-lg mx-auto relative overflow-y-auto"
      dir="rtl"
      style={{ background: "#FFF8F0" }}
    >
      {/* Confetti layer */}
      {confettiPieces.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none animate-confetti-fall"
          style={{
            left: `${p.x}%`,
            top: -20,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Top bar: back + stars */}
      <div className="w-full flex items-center justify-between z-10">
        <Link
          href="/kids"
          className="flex items-center gap-1 text-lg font-bold px-4 py-2 rounded-2xl"
          style={{ background: "#CC5DE8", color: "#fff" }}
        >
          <span>→</span>
          <span>رجوع</span>
        </Link>
        <div
          className="flex items-center gap-1 px-4 py-2 rounded-2xl text-lg font-bold"
          style={{ background: "#FFD43B", color: "#2D3436" }}
        >
          <span>⭐</span>
          <span>{score}</span>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 justify-center z-10">
        {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
          <div
            key={i}
            className="w-5 h-5 rounded-full transition-all duration-300"
            style={{
              background:
                i < round
                  ? stars[i]
                    ? "#51CF66"
                    : "#FF6B6B"
                  : i === round
                  ? "#CC5DE8"
                  : "#DFE6E9",
              transform: i === round ? "scale(1.3)" : "scale(1)",
            }}
          />
        ))}
      </div>

      {/* Question area */}
      <div className="mt-2 text-center z-10">
        {puzzle.mode === "nameFromColor" ? (
          <>
            <p
              className="text-2xl font-bold mb-4"
              style={{ color: "#636E72" }}
            >
              ما هذا اللون؟
            </p>
            {/* Large colored circle */}
            <div
              className={`w-24 h-24 rounded-full mx-auto shadow-lg transition-transform duration-300 ${
                showEntry ? "scale-0" : "scale-100"
              }`}
              style={{
                background: puzzle.target.hex,
                border:
                  puzzle.target.name === "أبيض"
                    ? "3px solid #DFE6E9"
                    : "none",
              }}
            />
          </>
        ) : (
          <>
            <p
              className="text-2xl font-bold mb-3"
              style={{ color: "#636E72" }}
            >
              أين اللون
            </p>
            <div
              className={`text-5xl font-black leading-none transition-transform duration-300 ${
                showEntry ? "scale-0" : "scale-100"
              }`}
              style={{ color: "#2D3436" }}
            >
              {puzzle.target.name}
            </div>
            <p className="text-2xl font-bold mt-2" style={{ color: "#636E72" }}>
              ؟
            </p>
          </>
        )}
      </div>

      {/* Options 2x2 grid */}
      <div className="grid grid-cols-2 gap-4 w-full mt-2 z-10">
        {puzzle.options.map((option, idx) => {
          const isSelected = selectedIdx === idx;
          const isCorrectAnswer = option.name === puzzle.target.name;

          if (puzzle.mode === "nameFromColor") {
            // Mode A: show text name buttons
            let btnBg = "#FFFFFF";
            let btnBorder = "#DFE6E9";
            let extraClass = "";

            if (answerState === "correct" && isSelected && isCorrectAnswer) {
              btnBg = "#C3FAE8";
              btnBorder = "#51CF66";
              extraClass = "animate-pulse";
            } else if (answerState === "wrong" && isSelected) {
              btnBg = "#FFE0E0";
              btnBorder = "#FF6B6B";
              extraClass = "animate-wiggle";
            }

            return (
              <button
                key={idx}
                onClick={() => handleTap(option, idx)}
                disabled={answerState === "correct"}
                className={`
                  h-24 rounded-3xl flex items-center justify-center
                  shadow-md active:scale-95 transition-all duration-200
                  ${showEntry ? "scale-0" : "scale-100"}
                  ${extraClass}
                `}
                style={{
                  background: btnBg,
                  borderWidth: 3,
                  borderColor: btnBorder,
                  borderStyle: "solid",
                  transitionDelay: showEntry ? "0ms" : `${idx * 80}ms`,
                  minHeight: "96px",
                }}
              >
                <span
                  className="text-2xl font-black"
                  style={{ color: "#2D3436" }}
                >
                  {option.name}
                </span>
              </button>
            );
          } else {
            // Mode B: show colored circles
            let ringColor = "transparent";
            let extraClass = "";

            if (answerState === "correct" && isSelected && isCorrectAnswer) {
              ringColor = "#51CF66";
              extraClass = "animate-pulse";
            } else if (answerState === "wrong" && isSelected) {
              ringColor = "#FF6B6B";
              extraClass = "animate-wiggle";
            }

            return (
              <button
                key={idx}
                onClick={() => handleTap(option, idx)}
                disabled={answerState === "correct"}
                className={`
                  flex items-center justify-center rounded-3xl
                  shadow-md active:scale-95 transition-all duration-200
                  ${showEntry ? "scale-0" : "scale-100"}
                  ${extraClass}
                `}
                style={{
                  padding: 12,
                  borderWidth: 4,
                  borderColor: ringColor,
                  borderStyle: "solid",
                  background: "#FFFFFF",
                  transitionDelay: showEntry ? "0ms" : `${idx * 80}ms`,
                  minHeight: "120px",
                }}
              >
                <div
                  className="w-24 h-24 rounded-full shadow-md"
                  style={{
                    background: option.hex,
                    border:
                      option.name === "أبيض"
                        ? "3px solid #DFE6E9"
                        : "none",
                  }}
                />
              </button>
            );
          }
        })}
      </div>

      {/* Feedback message */}
      <div className="h-12 flex items-center justify-center z-10">
        {answerState === "correct" && (
          <p
            className="text-2xl font-black animate-bounce"
            style={{ color: "#51CF66" }}
          >
            ممتاز! 🌟
          </p>
        )}
        {answerState === "wrong" && (
          <p className="text-xl font-bold" style={{ color: "#FF6B6B" }}>
            حاول مرة ثانية!
          </p>
        )}
      </div>

      {/* Inline keyframes */}
      <style jsx global>{`
        @keyframes wiggle {
          0%,
          100% {
            transform: rotate(0deg);
          }
          15% {
            transform: rotate(-6deg);
          }
          30% {
            transform: rotate(6deg);
          }
          45% {
            transform: rotate(-4deg);
          }
          60% {
            transform: rotate(4deg);
          }
          75% {
            transform: rotate(-2deg);
          }
        }
        .animate-wiggle {
          animation: wiggle 0.5s ease-in-out;
        }

        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti-fall {
          animation: confetti-fall 1.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
