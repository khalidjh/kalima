"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const ARABIC_LETTERS = [
  "ا", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر",
  "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف",
  "ق", "ك", "ل", "م", "ن", "ه", "و", "ي",
];

const OPTION_COLORS = [
  { bg: "#E8F4FD", border: "#4A90D9" },
  { bg: "#FFF0F0", border: "#FF6B6B" },
  { bg: "#F0FFF4", border: "#51CF66" },
  { bg: "#FDF0FF", border: "#CC5DE8" },
];

const TOTAL_ROUNDS = 10;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRound(exclude?: string) {
  const target =
    ARABIC_LETTERS[Math.floor(Math.random() * ARABIC_LETTERS.length)];
  const wrong = shuffle(ARABIC_LETTERS.filter((l) => l !== target)).slice(0, 3);
  const options = shuffle([target, ...wrong]);
  return { target, options };
}

type GamePhase = "playing" | "done";
type AnswerState = "idle" | "correct" | "wrong";

export default function HoroufPage() {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<GamePhase>("playing");
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [roundPerfect, setRoundPerfect] = useState(true);
  const [puzzle, setPuzzle] = useState(() => pickRound());
  const [showEntry, setShowEntry] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [stars, setStars] = useState<boolean[]>([]);

  const nextRound = useCallback(() => {
    const next = round + 1;
    if (next >= TOTAL_ROUNDS) {
      setPhase("done");
      return;
    }
    setRound(next);
    setPuzzle(pickRound());
    setAnswerState("idle");
    setRoundPerfect(true);
    setSelectedIdx(null);
    setShowEntry(true);
  }, [round]);

  const handleTap = useCallback(
    (letter: string, idx: number) => {
      if (answerState === "correct") return;

      setSelectedIdx(idx);

      if (letter === puzzle.target) {
        setAnswerState("correct");
        const earned = roundPerfect;
        setScore((s) => s + (earned ? 1 : 0));
        setStars((prev) => [...prev, earned]);
        setTimeout(() => nextRound(), 1200);
      } else {
        setAnswerState("wrong");
        setRoundPerfect(false);
        setTimeout(() => {
          setAnswerState("idle");
          setSelectedIdx(null);
        }, 600);
      }
    },
    [answerState, puzzle.target, roundPerfect, nextRound]
  );

  const restart = () => {
    setRound(0);
    setScore(0);
    setPhase("playing");
    setAnswerState("idle");
    setRoundPerfect(true);
    setPuzzle(pickRound());
    setShowEntry(true);
    setSelectedIdx(null);
    setStars([]);
  };

  // Entry bounce
  useEffect(() => {
    if (showEntry) {
      const t = setTimeout(() => setShowEntry(false), 500);
      return () => clearTimeout(t);
    }
  }, [showEntry, round]);

  // ── Celebration screen ──
  if (phase === "done") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 gap-6">
        {/* Confetti-like stars */}
        <div className="text-6xl animate-bounce">🎉</div>
        <h1 className="text-4xl font-black" style={{ color: "#4A90D9" }}>
          أحسنت!
        </h1>
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
    <div className="flex flex-col items-center px-4 pt-4 pb-8 gap-5 max-w-lg mx-auto">
      {/* Top bar: back + stars */}
      <div className="w-full flex items-center justify-between">
        <Link
          href="/kids"
          className="flex items-center gap-1 text-lg font-bold px-4 py-2 rounded-2xl"
          style={{ background: "#4A90D9", color: "#fff" }}
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
      <div className="flex gap-2 justify-center">
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
                  ? "#4A90D9"
                  : "#DFE6E9",
              transform: i === round ? "scale(1.3)" : "scale(1)",
            }}
          />
        ))}
      </div>

      {/* Question */}
      <div className="mt-2 text-center">
        <p className="text-2xl font-bold mb-2" style={{ color: "#636E72" }}>
          أين حرف
        </p>
        <div
          className={`text-8xl font-black leading-none transition-transform duration-300 ${
            showEntry ? "scale-0" : "scale-100"
          }`}
          style={{ color: "#4A90D9" }}
        >
          {puzzle.target}
        </div>
        <p className="text-2xl font-bold mt-2" style={{ color: "#636E72" }}>
          ؟
        </p>
      </div>

      {/* Options 2x2 grid */}
      <div className="grid grid-cols-2 gap-4 w-full mt-2">
        {puzzle.options.map((letter, idx) => {
          const color = OPTION_COLORS[idx];
          const isSelected = selectedIdx === idx;
          const isCorrectAnswer = letter === puzzle.target;

          let cardStyle: React.CSSProperties = {
            background: color.bg,
            borderColor: color.border,
            borderWidth: 3,
          };
          let extraClass = "";

          if (answerState === "correct" && isSelected && isCorrectAnswer) {
            cardStyle.background = "#C3FAE8";
            cardStyle.borderColor = "#51CF66";
            extraClass = "animate-pulse";
          } else if (answerState === "wrong" && isSelected) {
            cardStyle.background = "#FFE0E0";
            cardStyle.borderColor = "#FF6B6B";
            extraClass = "animate-wiggle";
          }

          return (
            <button
              key={idx}
              onClick={() => handleTap(letter, idx)}
              disabled={answerState === "correct"}
              className={`
                h-32 rounded-3xl flex items-center justify-center
                shadow-md active:scale-95 transition-all duration-200
                ${showEntry ? "scale-0" : "scale-100"}
                ${extraClass}
              `}
              style={{
                ...cardStyle,
                transitionDelay: showEntry ? "0ms" : `${idx * 80}ms`,
                minHeight: "6rem",
                minWidth: "6rem",
              }}
            >
              <span className="text-6xl font-black" style={{ color: "#2D3436" }}>
                {letter}
              </span>
            </button>
          );
        })}
      </div>

      {/* Feedback message */}
      <div className="h-12 flex items-center justify-center">
        {answerState === "correct" && (
          <p
            className="text-2xl font-black animate-bounce"
            style={{ color: "#51CF66" }}
          >
            أحسنت! 🌟
          </p>
        )}
        {answerState === "wrong" && (
          <p className="text-xl font-bold" style={{ color: "#FF6B6B" }}>
            حاول مرة ثانية!
          </p>
        )}
      </div>

      {/* Inline keyframes for wiggle */}
      <style jsx global>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(-6deg); }
          30% { transform: rotate(6deg); }
          45% { transform: rotate(-4deg); }
          60% { transform: rotate(4deg); }
          75% { transform: rotate(-2deg); }
        }
        .animate-wiggle {
          animation: wiggle 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
