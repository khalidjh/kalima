"use client";

import { useState, useEffect, useCallback } from "react";
import { TrendingUp, TrendingDown, Share2, HelpCircle } from "lucide-react";
import BackToHome from "@/components/BackToHome";
import GameHeader from "@/components/GameHeader";
import HowToPlayTarteeb from "@/components/HowToPlayTarteeb";
import { playCorrect, playWrong } from "@/lib/sounds";
import {
  getDailyTarteebPairs,
  getTarteebPuzzleNumber,
  TarteebPair,
  isHigherCorrect,
} from "@/data/tarteeb";
import {
  loadTarteebGameState,
  saveTarteebGameState,
  updateTarteebStatsOnFinish,
  TarteebGameState,
} from "@/lib/tarteebState";

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

function getResultMessage(score: number, total: number): { emoji: string; title: string; subtitle: string } {
  if (score === total) {
    return { emoji: "🎉", title: "أحسنت! نتيجة مثالية!", subtitle: "أجبت على جميع الأسئلة بشكل صحيح" };
  }
  if (score >= 8) {
    return { emoji: "🌟", title: "ممتاز!", subtitle: `أجبت صحيح على ${toArabicNumerals(score)} من ${toArabicNumerals(total)}` };
  }
  if (score >= 6) {
    return { emoji: "👍", title: "جيد!", subtitle: `أجبت صحيح على ${toArabicNumerals(score)} من ${toArabicNumerals(total)}` };
  }
  if (score >= 4) {
    return { emoji: "😐", title: "لا بأس", subtitle: `أجبت صحيح على ${toArabicNumerals(score)} من ${toArabicNumerals(total)}` };
  }
  return { emoji: "😔", title: "حاول مرة أخرى", subtitle: `أجبت صحيح على ${toArabicNumerals(score)} من ${toArabicNumerals(total)}` };
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
  const [showHelp, setShowHelp] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Guard: if pairs are empty or malformed, show error
  if (!pairs || pairs.length === 0) {
    return (
      <div className="h-full flex flex-col bg-background" dir="rtl">
        <GameHeader
          center={<span className="text-sm font-bold text-white">ترتيب</span>}
        />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-2xl mb-2">⚠️</p>
            <p className="text-white font-bold mb-1">لا يوجد لغز متاح</p>
            <p className="text-sm text-muted">حدث خطأ في تحميل بيانات اللعبة</p>
          </div>
        </div>
      </div>
    );
  }

  // Load saved state on mount
  useEffect(() => {
    const saved = loadTarteebGameState();
    if (saved && saved.puzzleNumber === puzzleNumber) {
      setCurrentRound(saved.currentRound);
      setScore(saved.score);
      setResults(saved.results);
      setGameStatus(saved.gameStatus);
    }
    setLoaded(true);
  }, [puzzleNumber]);

  // Save state whenever game progresses
  const saveState = useCallback(
    (round: number, sc: number, res: boolean[], status: GameStatus) => {
      const state: TarteebGameState = {
        puzzleNumber,
        currentRound: round,
        score: sc,
        results: res,
        gameStatus: status,
      };
      saveTarteebGameState(state);
    },
    [puzzleNumber]
  );

  useEffect(() => {
    if (gameStatus !== "playing" && loaded) {
      const t = setTimeout(() => setShowModal(true), 800);
      return () => clearTimeout(t);
    }
  }, [gameStatus, loaded]);

  const pair: TarteebPair | undefined = pairs[currentRound];
  const higherIsCorrect = pair ? isHigherCorrect(pair) : false;

  function handleGuess(guessHigher: boolean) {
    if (gameStatus !== "playing" || flash !== null || !pair) return;

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
          saveState(nextRound, newScore, newResults, "won");
          updateTarteebStatsOnFinish(newScore, pairs.length);
        } else {
          setCurrentRound(nextRound);
          saveState(nextRound, newScore, newResults, "playing");
        }
      }, 1200);
    } else {
      playWrong();
      setFlash("wrong");
      setShowValues(true);

      setTimeout(() => {
        setFlash(null);
        setShowValues(false);
        const newResults = [...results, false];
        setResults(newResults);
        setGameStatus("lost");
        saveState(currentRound, score, newResults, "lost");
        updateTarteebStatsOnFinish(score, pairs.length);
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

  // Don't render game content until state is loaded (prevents flash of fresh state)
  if (!loaded) {
    return (
      <div className="h-full flex flex-col bg-background" dir="rtl">
        <GameHeader
          center={<span className="text-sm font-bold text-white">ترتيب #{toArabicNumerals(puzzleNumber)}</span>}
        />
        <div className="flex-1" />
      </div>
    );
  }

  const roundLabel = `الجولة ${toArabicNumerals(currentRound + 1)}/${toArabicNumerals(pairs.length)}`;
  const resultMsg = getResultMessage(score, pairs.length);

  return (
    <div className="h-full flex flex-col bg-background" dir="rtl">
      <GameHeader
        center={<span className="text-sm font-bold text-white">ترتيب #{toArabicNumerals(puzzleNumber)}</span>}
        right={
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted font-medium">
              {gameStatus === "playing" ? roundLabel : `${toArabicNumerals(score)}/${toArabicNumerals(pairs.length)}`}
            </span>
            <button
              onClick={() => setShowHelp(true)}
              className="text-muted hover:text-white transition-colors"
            >
              <HelpCircle size={20} strokeWidth={1.5} />
            </button>
          </div>
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
          {pair && (
            <div className="text-center">
              <span className="text-xs text-muted font-medium bg-surface border border-border px-3 py-1 rounded-full">
                {pair.category}
              </span>
            </div>
          )}

          {/* Comparison cards */}
          {pair && (
            <div className="flex gap-3">
              {/* Card A */}
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

              {/* Card B */}
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
          )}

          {/* Instruction */}
          {gameStatus === "playing" && !showValues && pair && (
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
                {resultMsg.emoji}
              </div>
              <h2 className="text-xl font-black text-white">
                {resultMsg.title}
              </h2>
              <p className="text-sm text-muted mt-1">
                {resultMsg.subtitle}
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

      {/* How to Play Modal */}
      {showHelp && <HowToPlayTarteeb onClose={() => setShowHelp(false)} />}
    </div>
  );
}
