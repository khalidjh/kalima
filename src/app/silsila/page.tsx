"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  getDailySilsilaPuzzle,
  getSilsilaPuzzleNumber,
  getSilsilaPuzzleByNumber,
  SilsilaPuzzle,
} from "@/data/silsila";
import {
  loadSilsilaGameState,
  saveSilsilaGameState,
  loadArchiveSilsilaGameState,
  saveArchiveSilsilaGameState,
  updateSilsilaStatsOnWin,
  loadSilsilaStats,
  SilsilaStats,
  SilsilaGameState,
} from "@/lib/silsilaState";
import { isValidGuess } from "@/data/words";
import { useAuth } from "@/lib/auth";
import { useIsPro } from "@/lib/subscription";
import { playTap, playCorrect, playWrong } from "@/lib/sounds";
import GameHeader from "@/components/GameHeader";
import Keyboard from "@/components/Keyboard";
import CountdownTimer from "@/components/CountdownTimer";
import HowToPlaySilsila from "@/components/HowToPlaySilsila";
import { HelpCircle } from "lucide-react";
import { LetterState } from "@/lib/gameState";

interface Toast {
  id: number;
  message: string;
}

let toastCounter = 0;

function diffByOne(a: string, b: string): boolean {
  const aChars = Array.from(a);
  const bChars = Array.from(b);
  if (aChars.length !== bChars.length) return false;
  let diffs = 0;
  for (let i = 0; i < aChars.length; i++) {
    if (aChars[i] !== bChars[i]) diffs++;
  }
  return diffs === 1;
}

function getChangedIndex(prev: string, curr: string): number {
  const pChars = Array.from(prev);
  const cChars = Array.from(curr);
  for (let i = 0; i < pChars.length; i++) {
    if (pChars[i] !== cChars[i]) return i;
  }
  return -1;
}

function SilsilaPageInner() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { isPro } = useIsPro(user);
  const archivePuzzleParam = searchParams.get("puzzle");
  const isArchiveMode = archivePuzzleParam !== null && isPro;
  const archivePuzzleNum = archivePuzzleParam
    ? parseInt(archivePuzzleParam, 10)
    : null;

  const puzzle: SilsilaPuzzle =
    isArchiveMode && archivePuzzleNum
      ? getSilsilaPuzzleByNumber(archivePuzzleNum)
      : getDailySilsilaPuzzle();
  const puzzleNumber =
    isArchiveMode && archivePuzzleNum
      ? archivePuzzleNum
      : getSilsilaPuzzleNumber();

  const totalSlots = puzzle.steps + 1; // start + intermediate steps + end = steps + 1 total words

  const [chain, setChain] = useState<string[]>(() => {
    const arr = new Array(totalSlots).fill("");
    arr[0] = puzzle.startWord;
    arr[totalSlots - 1] = puzzle.endWord;
    return arr;
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [currentInput, setCurrentInput] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState<"playing" | "won">("playing");
  const [startTime] = useState(() => Date.now());
  const [endTime, setEndTime] = useState<number | null>(null);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [shakeRow, setShakeRow] = useState(-1);
  const [popRow, setPopRow] = useState(-1);
  const [stats, setStats] = useState<SilsilaStats>(loadSilsilaStats());

  const saveFn = isArchiveMode
    ? saveArchiveSilsilaGameState
    : saveSilsilaGameState;

  // Load saved state
  useEffect(() => {
    const saved =
      isArchiveMode && archivePuzzleNum
        ? loadArchiveSilsilaGameState(archivePuzzleNum)
        : loadSilsilaGameState();
    if (saved) {
      setChain(saved.chain);
      setCurrentStep(saved.currentStep);
      setCurrentInput(saved.currentInput);
      setGameStatus(saved.gameStatus);
      if (saved.endTime) setEndTime(saved.endTime);
      if (saved.gameStatus === "won") {
        setTimeout(() => setShowResult(true), 800);
      }
    }
    setStats(loadSilsilaStats());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function showToast(message: string, duration = 1800) {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }

  const handleKey = useCallback(
    (key: string) => {
      if (gameStatus !== "playing") return;
      playTap();
      setCurrentInput((prev) => {
        if (prev.length >= 5) return prev;
        return [...prev, key];
      });
    },
    [gameStatus]
  );

  const handleDelete = useCallback(() => {
    if (gameStatus !== "playing") return;
    setCurrentInput((prev) => prev.slice(0, -1));
  }, [gameStatus]);

  const handleEnter = useCallback(() => {
    if (gameStatus !== "playing") return;
    if (currentInput.length !== 5) {
      showToast("أكمل الكلمة");
      return;
    }

    const word = currentInput.join("");

    // Check if valid word
    if (!isValidGuess(word)) {
      playWrong();
      setShakeRow(currentStep);
      setTimeout(() => setShakeRow(-1), 500);
      showToast("كلمة غير موجودة");
      return;
    }

    // Check differs by exactly 1 letter from previous word
    const prevWord = chain[currentStep - 1];
    if (!diffByOne(prevWord, word)) {
      playWrong();
      setShakeRow(currentStep);
      setTimeout(() => setShakeRow(-1), 500);
      showToast("غيّر حرفاً واحداً فقط");
      return;
    }

    // Valid step
    playCorrect();
    setPopRow(currentStep);
    setTimeout(() => setPopRow(-1), 400);

    const newChain = [...chain];
    newChain[currentStep] = word;
    setChain(newChain);

    // Check if this connects to the end
    const nextStep = currentStep + 1;

    if (nextStep >= totalSlots) {
      // This was the last slot before end -- but wait, end is already set
      // Actually the last slot IS the end word
      // So if currentStep is totalSlots - 2, and next is totalSlots - 1 (end word),
      // we need to check if the word we just entered differs by 1 from end word
      // But the end word is already in place, so we just check if we've filled everything

      // Check: is this the slot right before the end word?
      // If so, also verify it differs by 1 from end word
      if (currentStep === totalSlots - 2) {
        if (!diffByOne(word, puzzle.endWord)) {
          // Oops -- valid word, differs from prev, but doesn't connect to end
          // Still lock it in but user needs to fix the path
          // Actually let's not lock it in
          playWrong();
          setPopRow(-1);
          setShakeRow(currentStep);
          setTimeout(() => setShakeRow(-1), 500);
          showToast("هذه الكلمة لا تصل للكلمة الأخيرة");
          return;
        }
      }

      // Won!
      const now = Date.now();
      setEndTime(now);
      setGameStatus("won");
      setCurrentInput([]);
      setCurrentStep(nextStep);
      if (!isArchiveMode) {
        const newStats = updateSilsilaStatsOnWin();
        setStats(newStats);
      }
      saveFn({
        puzzleNumber,
        chain: newChain,
        currentStep: nextStep,
        currentInput: [],
        gameStatus: "won",
        startTime,
        endTime: now,
      });
      setTimeout(() => setShowResult(true), 1500);
      return;
    }

    // If there's only one more step and it's the end word slot, we're done
    if (nextStep === totalSlots - 1) {
      // Check if current word differs by 1 from end word
      if (diffByOne(word, puzzle.endWord)) {
        // Won!
        const now = Date.now();
        setEndTime(now);
        setGameStatus("won");
        setCurrentInput([]);
        setCurrentStep(totalSlots);
        if (!isArchiveMode) {
          const newStats = updateSilsilaStatsOnWin();
          setStats(newStats);
        }
        saveFn({
          puzzleNumber,
          chain: newChain,
          currentStep: totalSlots,
          currentInput: [],
          gameStatus: "won",
          startTime,
          endTime: now,
        });
        setTimeout(() => setShowResult(true), 1500);
        return;
      } else {
        // Need to undo -- this word doesn't connect to end
        playWrong();
        setPopRow(-1);
        setShakeRow(currentStep);
        setTimeout(() => setShakeRow(-1), 500);
        showToast("هذه الكلمة لا تصل للكلمة الأخيرة");
        return;
      }
    }

    // Move to next step
    setCurrentStep(nextStep);
    setCurrentInput([]);
    saveFn({
      puzzleNumber,
      chain: newChain,
      currentStep: nextStep,
      currentInput: [],
      gameStatus: "playing",
      startTime,
      endTime: null,
    });
  }, [
    gameStatus,
    currentInput,
    chain,
    currentStep,
    totalSlots,
    puzzle.endWord,
    puzzleNumber,
    isArchiveMode,
    saveFn,
    startTime,
  ]);

  // Keyboard letter states (empty for this game -- no color coding on keyboard)
  const letterStates: Record<string, LetterState> = {};

  // Build share text
  function buildShareText(): string {
    const lines: string[] = [];
    lines.push(`سلسلة #${puzzleNumber}`);
    lines.push(`${puzzle.steps} خطوات`);
    // Show chain as emojis
    const chainEmojis = chain
      .filter((w) => w !== "")
      .map(() => "🟢")
      .join("—");
    lines.push(chainEmojis);
    lines.push("kalima.fun/silsila");
    return lines.join("\n");
  }

  const [copied, setCopied] = useState(false);
  async function handleShare() {
    const text = buildShareText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  return (
    <div className="h-full flex flex-col bg-background" dir="rtl">
      <GameHeader
        center={
          <div className="flex items-center gap-2">
            {isArchiveMode && (
              <span className="text-xs font-bold text-primary bg-primary/15 px-2 py-0.5 rounded-full border border-primary/30">
                أرشيف
              </span>
            )}
            <span className="text-sm font-bold text-white">
              سلسلة #{puzzleNumber}
            </span>
          </div>
        }
        right={
          <button
            onClick={() => setShowHowToPlay(true)}
            className="text-muted hover:text-white transition-colors p-1"
          >
            <HelpCircle size={20} strokeWidth={1.5} />
          </button>
        }
      />

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-3">
          {/* Chain rows */}
          {Array.from({ length: totalSlots }).map((_, rowIndex) => {
            const isStart = rowIndex === 0;
            const isEnd = rowIndex === totalSlots - 1;
            const isLocked = isStart || isEnd || (chain[rowIndex] !== "");
            const isActive =
              rowIndex === currentStep && gameStatus === "playing";
            const word = isActive
              ? currentInput.join("")
              : chain[rowIndex] || "";
            const wordChars = isActive
              ? [...currentInput, ...Array(5 - currentInput.length).fill("")]
              : Array.from(word).length === 5
              ? Array.from(word)
              : Array(5).fill("");

            // Find changed letter index (compare to previous row)
            let changedIdx = -1;
            if (
              !isStart &&
              chain[rowIndex] !== "" &&
              chain[rowIndex - 1] !== ""
            ) {
              changedIdx = getChangedIndex(
                chain[rowIndex - 1],
                chain[rowIndex]
              );
            }

            const isShaking = shakeRow === rowIndex;
            const isPopping = popRow === rowIndex;

            return (
              <div key={rowIndex} className="flex flex-col items-center gap-1">
                {/* Row label */}
                {isStart && (
                  <span className="text-xs text-muted mb-1">البداية</span>
                )}
                {isEnd && (
                  <span className="text-xs text-muted mb-1">النهاية</span>
                )}
                {!isStart && !isEnd && isActive && (
                  <span className="text-xs text-primary mb-1">
                    الخطوة {rowIndex}
                  </span>
                )}

                {/* Letter tiles */}
                <div
                  className={`flex gap-1.5 justify-center transition-transform ${
                    isShaking ? "animate-shake" : ""
                  } ${isPopping ? "animate-pop" : ""}`}
                >
                  {wordChars.map((letter, charIdx) => {
                    let bg = "bg-surface border border-border";

                    if (isStart || isEnd) {
                      bg = "bg-correct border border-correct";
                    } else if (chain[rowIndex] !== "" && !isActive) {
                      // Locked intermediate step
                      if (charIdx === changedIdx) {
                        bg = "bg-present border border-present";
                      } else {
                        bg = "bg-surface border border-primary/30";
                      }
                    } else if (isActive) {
                      bg =
                        letter !== ""
                          ? "bg-surface border-2 border-primary"
                          : "bg-surface border border-border";
                    }

                    return (
                      <div
                        key={charIdx}
                        className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-lg text-lg sm:text-xl font-bold text-white ${bg} transition-all duration-200`}
                      >
                        {letter}
                      </div>
                    );
                  })}
                </div>

                {/* Arrow between rows (except after last) */}
                {rowIndex < totalSlots - 1 && (
                  <div className="text-muted text-sm my-0.5">↓</div>
                )}
              </div>
            );
          })}

          {/* Show result button if game ended */}
          {gameStatus === "won" && !showResult && (
            <button
              onClick={() => setShowResult(true)}
              className="py-3 rounded-xl bg-primary text-[#0F0C00] font-bold text-sm hover:bg-[#FFD740] transition-colors mt-2"
            >
              عرض النتيجة
            </button>
          )}
        </div>
      </div>

      {/* Keyboard */}
      {gameStatus === "playing" && (
        <div className="flex-shrink-0 pb-2">
          <Keyboard
            letterStates={letterStates}
            onKey={handleKey}
            onDelete={handleDelete}
            onEnter={handleEnter}
            disabled={gameStatus !== "playing"}
          />
        </div>
      )}

      {/* Toasts */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-40 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-toast bg-surface border border-border text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-lg whitespace-nowrap"
          >
            {t.message}
          </div>
        ))}
      </div>

      {/* Result overlay */}
      {showResult && gameStatus === "won" && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          dir="rtl"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowResult(false)}
          />
          <div className="relative w-full max-w-sm mx-4 mb-4 sm:mb-0 bg-surface rounded-2xl border border-border overflow-hidden shadow-2xl animate-slide-up">
            {/* Header */}
            <div className="px-5 pt-5 pb-3 text-center">
              <div className="text-3xl mb-1">🎉</div>
              <h2 className="text-xl font-bold text-white">أحسنت!</h2>
              <p className="text-sm text-[#8A7A3A] mt-1">
                سلسلة #{puzzleNumber}
              </p>
            </div>

            {/* Chain summary */}
            <div className="px-5 pb-3">
              <div className="flex flex-col gap-1.5 items-center">
                {chain
                  .filter((w) => w !== "")
                  .map((word, idx) => (
                    <div key={idx} className="flex gap-1 justify-center">
                      {Array.from(word).map((letter, li) => {
                        const prevWord =
                          idx > 0
                            ? chain.filter((w) => w !== "")[idx - 1]
                            : null;
                        const isChanged =
                          prevWord &&
                          Array.from(prevWord)[li] !== letter;
                        return (
                          <span
                            key={li}
                            className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold text-white ${
                              idx === 0 ||
                              idx ===
                                chain.filter((w) => w !== "").length - 1
                                ? "bg-correct"
                                : isChanged
                                ? "bg-present"
                                : "bg-surface border border-border"
                            }`}
                          >
                            {letter}
                          </span>
                        );
                      })}
                    </div>
                  ))}
              </div>
            </div>

            {/* Stats */}
            <div className="mx-5 mb-3 grid grid-cols-3 gap-2 bg-background rounded-xl p-3">
              {[
                { label: "العبت", value: stats.gamesPlayed },
                { label: "ربحت", value: stats.gamesWon },
                { label: "أطول سلسلة", value: stats.maxStreak },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col items-center gap-0.5">
                  <span className="text-xl font-bold text-white">{value}</span>
                  <span className="text-[10px] text-[#8A7A3A] text-center leading-tight">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Streak */}
            {stats.currentStreak > 0 && (
              <div className="mx-5 mb-3 flex items-center justify-center gap-2 bg-primary/10 rounded-xl p-2.5 border border-primary/20">
                <span className="text-sm font-semibold text-primary-light">
                  سلسلة {stats.currentStreak} أيام
                </span>
              </div>
            )}

            {/* Countdown */}
            <div className="px-5 pb-3">
              <CountdownTimer />
            </div>

            {/* Actions */}
            <div className="px-5 pb-5 flex gap-2">
              <button
                onClick={handleShare}
                className="flex-1 bg-primary hover:bg-primary-dark text-[#0A0A0A] font-bold py-3 rounded-xl transition-colors text-sm"
              >
                {copied ? "تم النسخ!" : "مشاركة النتيجة"}
              </button>
              <button
                onClick={() => setShowResult(false)}
                className="px-4 py-3 rounded-xl bg-background border border-border text-muted text-sm font-medium hover:text-white transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {showHowToPlay && (
        <HowToPlaySilsila onClose={() => setShowHowToPlay(false)} />
      )}
    </div>
  );
}

export default function SilsilaPage() {
  return (
    <Suspense
      fallback={
        <div className="h-full bg-background flex items-center justify-center">
          <div className="text-white text-2xl font-bold">سلسلة</div>
        </div>
      }
    >
      <SilsilaPageInner />
    </Suspense>
  );
}
