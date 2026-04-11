"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Share2 } from "lucide-react";
import BackToHome from "@/components/BackToHome";
import GameHeader from "@/components/GameHeader";
import { playCorrect, playWrong } from "@/lib/sounds";
import {
  getDailyTarteebPairs,
  getTarteebPuzzleNumber,
  TarteebPair,
  isHigherCorrect,
} from "@/data/tarteeb";

type GameStatus = "playing" | "won" | "lost";

const ARABIC_NUMERALS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
function toArabicNumerals(n: number): string {
  return String(n)
    .split("")
    .map((c) => (c >= "0" && c <= "9" ? ARABIC_NUMERALS[parseInt(c)] : c))
    .join("");
}

function formatValue(v: number): string {
  if (v >= 1000) return v.toLocaleString("ar-SA");
  return v % 1 === 0 ? String(v) : v.toFixed(1);
}

export default function TarteebPage() {
  const pairs = getDailyTarteebPairs();
  const puzzleNumber = getTarteebPuzzleNumber();

  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  const [results, setResults] = useState<boolean[]>([]);
  const [flash, setFlash] = useState<"correct" | "wrong" | null>(null);
  const [showValues, setShowValues] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const pair: TarteebPair = pairs[currentRound];
  const higherIsCorrect = isHigherCorrect(pair);

  useEffect(() => {
    if (gameStatus !== "playing") {
      const t = setTimeout(() => setShowModal(true), 800);
      return () => clearTimeout(t);
    }
  }, [gameStatus]);

  function handleGuess(guessHigher: boolean) {
    if (gameStatus !== "playing" || flash !== null) return;

    const correct = guessHigher === higherIsCorrect;

    if (correct) {
      playCorrect();
      setFlash("correct");
      setShowValues(true);

      setTimeout(() => {
        setFlash(null);
        setShowValues(false);
        const newScore = score + 1;
        const newResults = [...results, true];
        setScore(newScore);
        setResults(newResults);

        const nextRound = currentRound + 1;
        if (nextRound >= pairs.length) {
          setGameStatus("won");
        } else {
          setCurrentRound(nextRound);
        }
      }, 1200);
    } else {
      playWrong();
      setFlash("wrong");
      setShowValues(true);

      setTimeout(() => {
        setFlash(null);
        setShowValues(false);
        setResults([...results, false]);
        setGameStatus("lost");
      }, 1200);
    }
  }

  function buildShareText(): string {
    const emoji = results.map((r) => (r ? "✅" : "❌")).join("");
    const num = toArabicNumerals(puzzleNumber);
    return `ترتيب 📊 #${num}\n${emoji}\nkalima.fun/tarteeb`;
  }

  function handleShare() {
    const text = buildShareText();
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  }

  const roundLabel = `الجولة ${toArabicNumerals(currentRound + 1)}/${toArabicNumerals(pairs.length)}`;

  return (
    <div className="h-full flex flex-col bg-background" dir="rtl">
      <GameHeader
        center={<span className="text-sm font-bold text-white">ترتيب #{toArabicNumerals(puzzleNumber)}</span>}
        right={
          <span className="text-xs text-muted font-medium">
            {gameStatus === "playing" ? roundLabel : `${toArabicNumerals(score)}/${toArabicNumerals(pairs.length)}`}
          </span>
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-6">

          {/* Round progress dots */}
          <div className="flex items-center justify-center gap-1.5">
            {pairs.map((_, i) => {
              let color = "bg-border";
              if (i < results.length) {
                color = results[i] ? "bg-correct" : "bg-present";
              } else if (i === currentRound && gameStatus === "playing") {
                color = "bg-primary";
              }
              return <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${color}`} />;
            })}
          </div>

          {/* Category label */}
          <div className="text-center">
            <span className="text-xs text-muted font-medium bg-surface border border-border px-3 py-1 rounded-full">
              {pair.category}
            </span>
          </div>

          {/* Comparison cards */}
          <div className="flex gap-3">
            {/* Card A — always shows value */}
            <div
              className={[
                "flex-1 rounded-2xl border-2 p-4 flex flex-col items-center justify-center text-center transition-all duration-300",
                flash === "correct"
                  ? "border-correct bg-correct/10"
                  : flash === "wrong"
                  ? "border-present bg-present/10"
                  : "border-border bg-surface",
              ].join(" ")}
            >
              <span className="text-sm text-muted mb-2 font-medium">{pair.itemA}</span>
              <span className="text-3xl font-black text-white">{formatValue(pair.valueA)}</span>
              <span className="text-xs text-muted mt-1">{pair.unit}</span>
            </div>

            {/* VS divider */}
            <div className="flex items-center justify-center flex-shrink-0">
              <span className="text-xs text-muted font-bold">VS</span>
            </div>

            {/* Card B — shows ? or value after guess */}
            <div
              className={[
                "flex-1 rounded-2xl border-2 p-4 flex flex-col items-center justify-center text-center transition-all duration-300",
                flash === "correct"
                  ? "border-correct bg-correct/10"
                  : flash === "wrong"
                  ? "border-present bg-present/10"
                  : "border-primary/40 bg-surface",
              ].join(" ")}
            >
              <span className="text-sm text-muted mb-2 font-medium">{pair.itemB}</span>
              {showValues ? (
                <span
                  className={`text-3xl font-black transition-all duration-300 ${
                    pair.valueB > pair.valueA ? "text-correct" : "text-present"
                  }`}
                >
                  {formatValue(pair.valueB)}
                </span>
              ) : (
                <span className="text-4xl font-black text-primary">?</span>
              )}
              <span className="text-xs text-muted mt-1">{pair.unit}</span>
            </div>
          </div>

          {/* Instruction */}
          {gameStatus === "playing" && !showValues && (
            <p className="text-center text-sm text-muted">
              هل قيمة <span className="text-white font-bold">{pair.itemB}</span> أعلى أم أدنى؟
            </p>
          )}

          {/* Guess buttons */}
          {gameStatus === "playing" && (
            <div className="flex gap-3">
              <button
                onClick={() => handleGuess(true)}
                disabled={flash !== null}
                className="flex-1 py-4 rounded-2xl bg-primary text-[#0F0C00] font-black text-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#FFD740] active:scale-95 transition-all duration-150 flex items-center justify-center gap-2"
              >
                <TrendingUp size={22} strokeWidth={2} />
                أعلى
              </button>
              <button
                onClick={() => handleGuess(false)}
                disabled={flash !== null}
                className="flex-1 py-4 rounded-2xl bg-surface border-2 border-border text-white font-black text-lg disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/60 active:scale-95 transition-all duration-150 flex items-center justify-center gap-2"
              >
                <TrendingDown size={22} strokeWidth={2} />
                أدنى
              </button>
            </div>
          )}

          {/* Score display during play */}
          {gameStatus === "playing" && (
            <div className="text-center text-sm text-muted">
              النقاط:{" "}
              <span className="text-primary font-bold">
                {toArabicNumerals(score)}
              </span>
            </div>
          )}

          {/* View result button after game ends */}
          {gameStatus !== "playing" && (
            <button
              onClick={() => setShowModal(true)}
              className="py-3 rounded-2xl bg-primary text-[#0F0C00] font-bold hover:bg-[#FFD740] transition-colors"
            >
              عرض النتيجة
            </button>
          )}
        </div>
      </div>

      {/* Result Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-50 p-4 pb-8">
          <div className="bg-surface border border-border rounded-3xl p-6 w-full max-w-sm flex flex-col gap-5">
            {/* Title */}
            <div className="text-center">
              <div className="text-4xl mb-2">
                {gameStatus === "won" ? "🎉" : "😔"}
              </div>
              <h2 className="text-xl font-black text-white">
                {gameStatus === "won" ? "أحسنت! نتيجة مثالية!" : "انتهت اللعبة"}
              </h2>
              <p className="text-sm text-muted mt-1">
                {gameStatus === "won"
                  ? "أجبت على جميع الأسئلة بشكل صحيح"
                  : `أجبت صحيح على ${toArabicNumerals(score)} من ${toArabicNumerals(pairs.length)}`}
              </p>
            </div>

            {/* Score */}
            <div className="flex items-center justify-center gap-2 bg-background rounded-2xl py-4">
              <span className="text-5xl font-black text-primary">{toArabicNumerals(score)}</span>
              <span className="text-2xl text-muted font-bold">/ {toArabicNumerals(pairs.length)}</span>
            </div>

            {/* Result emoji grid */}
            <div className="flex flex-wrap justify-center gap-1">
              {results.map((r, i) => (
                <span key={i} className="text-xl">{r ? "✅" : "❌"}</span>
              ))}
            </div>

            {/* Share button */}
            <button
              onClick={handleShare}
              className="py-3 rounded-2xl bg-primary text-[#0F0C00] font-bold flex items-center justify-center gap-2 hover:bg-[#FFD740] transition-colors"
            >
              <Share2 size={18} strokeWidth={1.5} />
              مشاركة النتيجة
            </button>

            <button
              onClick={() => setShowModal(false)}
              className="py-2.5 rounded-2xl border border-border text-muted text-sm font-medium hover:text-white hover:border-primary/50 transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
