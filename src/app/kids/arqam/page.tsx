"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";

const ARABIC_NUMERALS = ["١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩", "١٠"];
const EMOJIS = ["🍎", "🌟", "🐱", "🦋", "🌸", "🐠", "🎈", "🍕", "🚀", "🌈"];
const TOTAL_ROUNDS = 10;

const OPTION_COLORS = ["#FFE0E0", "#D4F4DD", "#E0E8FF", "#FFF3D4"];
const OPTION_BORDERS = ["#FF6B6B", "#51CF66", "#4A90D9", "#FFD43B"];

function getMaxForRound(round: number): number {
  if (round < 3) return 5;
  if (round < 7) return 7;
  return 10;
}

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

function generateRound(round: number) {
  const max = getMaxForRound(round);
  const target = Math.floor(Math.random() * max) + 1;
  const emoji = pickRandom(EMOJIS);

  const wrongOptions = new Set<number>();
  while (wrongOptions.size < 3) {
    const n = Math.floor(Math.random() * 10) + 1;
    if (n !== target) wrongOptions.add(n);
  }

  const options = shuffle([target, ...Array.from(wrongOptions)]);
  return { target, emoji, options };
}

// Scatter positions for emoji display -- precomputed so they don't jump around
function generateScatterPositions(count: number): { x: number; y: number; rotate: number; scale: number }[] {
  const positions: { x: number; y: number; rotate: number; scale: number }[] = [];
  for (let i = 0; i < count; i++) {
    positions.push({
      x: 10 + Math.random() * 75,
      y: 5 + Math.random() * 75,
      rotate: -20 + Math.random() * 40,
      scale: 0.9 + Math.random() * 0.3,
    });
  }
  return positions;
}

// Simple confetti burst
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
      <style>{`
        @keyframes confetti-pop {
          0% { transform: translate(0, 0) scale(0); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function ArqamPage() {
  const [gameState, setGameState] = useState<"playing" | "correct" | "wrong" | "done">("playing");
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [roundData, setRoundData] = useState(() => generateRound(0));
  const [scatterPositions, setScatterPositions] = useState(() => generateScatterPositions(roundData.target));
  const [showConfetti, setShowConfetti] = useState(false);
  const [shakeWrong, setShakeWrong] = useState<number | null>(null);
  const [animateIn, setAnimateIn] = useState(true);

  const nextRound = useCallback(() => {
    const next = currentRound + 1;
    if (next >= TOTAL_ROUNDS) {
      setGameState("done");
      return;
    }
    setCurrentRound(next);
    const rd = generateRound(next);
    setRoundData(rd);
    setScatterPositions(generateScatterPositions(rd.target));
    setGameState("playing");
    setAnimateIn(true);
  }, [currentRound]);

  const handleOption = useCallback(
    (value: number) => {
      if (gameState !== "playing") return;

      if (value === roundData.target) {
        setScore((s) => s + 1);
        setGameState("correct");
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 900);
        setTimeout(() => {
          setAnimateIn(false);
          nextRound();
        }, 1200);
      } else {
        setShakeWrong(value);
        setGameState("wrong");
        setTimeout(() => {
          setShakeWrong(null);
          setGameState("playing");
        }, 600);
      }
    },
    [gameState, roundData.target, nextRound]
  );

  const restartGame = useCallback(() => {
    setCurrentRound(0);
    setScore(0);
    const rd = generateRound(0);
    setRoundData(rd);
    setScatterPositions(generateScatterPositions(rd.target));
    setGameState("playing");
    setAnimateIn(true);
  }, []);

  // Done screen
  if (gameState === "done") {
    const starCount = score;
    const message =
      starCount >= 9 ? "ممتاز! أنت بطل! 🏆" : starCount >= 7 ? "أحسنت! رائع جداً! 🌟" : starCount >= 5 ? "جيد! استمر! 💪" : "حاول مرة ثانية! 🔄";

    return (
      <div className="min-h-[calc(100dvh-56px)] flex flex-col items-center justify-center px-4 py-8 gap-6">
        <style>{`
          @keyframes celebration-bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.15); }
          }
          @keyframes star-pop {
            0% { transform: scale(0) rotate(-30deg); opacity: 0; }
            60% { transform: scale(1.3) rotate(10deg); opacity: 1; }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
        `}</style>

        <div
          className="text-7xl"
          style={{ animation: "celebration-bounce 1s ease-in-out infinite" }}
        >
          🎉
        </div>

        <h1 className="text-4xl font-black" style={{ color: "#CC5DE8" }}>
          انتهت اللعبة!
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
                animation: i < starCount ? `star-pop 0.4s ${i * 0.1}s ease-out both` : "none",
                opacity: i < starCount ? 1 : 0.2,
              }}
            >
              ⭐
            </span>
          ))}
        </div>

        <p className="text-3xl font-black" style={{ color: "#FF922B" }}>
          {ARABIC_NUMERALS[starCount - 1] ?? "٠"} / {ARABIC_NUMERALS[9]}
        </p>

        <div className="flex gap-4 mt-4">
          <button
            onClick={restartGame}
            className="px-8 py-4 rounded-3xl text-2xl font-bold text-white shadow-lg active:scale-95 transition-transform"
            style={{ background: "linear-gradient(135deg, #51CF66, #4A90D9)" }}
          >
            العب مرة ثانية 🔄
          </button>
          <Link
            href="/kids"
            className="px-8 py-4 rounded-3xl text-2xl font-bold text-white shadow-lg active:scale-95 transition-transform"
            style={{ background: "linear-gradient(135deg, #CC5DE8, #F06595)" }}
          >
            الألعاب ↩
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-56px)] flex flex-col px-4 py-4 gap-3 select-none">
      <style>{`
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
      `}</style>

      {showConfetti && <ConfettiBurst />}

      {/* Top bar: back + progress + stars */}
      <div className="flex items-center justify-between">
        <Link
          href="/kids"
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md active:scale-90 transition-transform"
          style={{ background: "#FFFFFF", border: "2px solid #E0E0E0" }}
        >
          →
        </Link>

        {/* Progress dots */}
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full transition-all duration-300"
              style={{
                background:
                  i < currentRound ? "#51CF66" : i === currentRound ? "#4A90D9" : "#DDD",
                transform: i === currentRound ? "scale(1.3)" : "scale(1)",
              }}
            />
          ))}
        </div>

        {/* Stars */}
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

      {/* Question */}
      <div className="text-center">
        <p className="text-2xl font-bold" style={{ color: "#2D3436" }}>
          كم عدد الـ {roundData.emoji}؟
        </p>
      </div>

      {/* Emoji display area */}
      <div
        className="relative flex-1 min-h-[200px] rounded-3xl shadow-inner overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #FFFFFF 0%, #FFF8F0 100%)",
          border: "3px dashed #E0E0E0",
          animation: animateIn ? "scale-in 0.4s ease-out" : "none",
        }}
      >
        {scatterPositions.map((pos, i) => (
          <div
            key={`${currentRound}-${i}`}
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
            {roundData.emoji}
          </div>
        ))}
      </div>

      {/* Options 2x2 grid */}
      <div className="grid grid-cols-2 gap-3 pb-2">
        {roundData.options.map((opt, i) => {
          const isShaking = shakeWrong === opt;
          const isCorrectHighlight = gameState === "correct" && opt === roundData.target;

          return (
            <button
              key={`${currentRound}-${opt}`}
              onClick={() => handleOption(opt)}
              disabled={gameState === "correct"}
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
