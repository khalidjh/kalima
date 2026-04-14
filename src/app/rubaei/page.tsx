"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { HelpCircle, Share2, Check } from "lucide-react";
import {
  getTodayRubaeiPuzzle,
  isValidRubaeiGuess,
} from "@/data/rubaei";
import type { RubaeiPuzzle } from "@/data/rubaei";
import {
  loadRubaeiGameState,
  saveRubaeiGameState,
  createInitialRubaeiState,
  evaluateGuess,
  getLetterStatesForBoard,
  mergeLetterStatesForKeyboard,
  updateRubaeiStatsOnWin,
  updateRubaeiStatsOnLoss,
} from "@/lib/rubaeiState";
import type { RubaeiGameState, LetterState } from "@/lib/rubaeiState";
import Keyboard from "@/components/Keyboard";
import GameHeader from "@/components/GameHeader";
import Toast from "@/components/Toast";
import { playTap, playCorrect, playWrong, playWin } from "@/lib/sounds";

const MAX_GUESSES = 9;

const ARABIC_LETTERS = new Set([
  "ا", "أ", "إ", "آ", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ",
  "ر", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق",
  "ك", "ل", "م", "ن", "ه", "و", "ي", "ة", "ى", "ئ", "ؤ", "ء",
]);

function stateToEmoji(state: LetterState): string {
  switch (state) {
    case "correct": return "🟩";
    case "present": return "🟨";
    case "absent": return "⬛";
  }
}

function getCellBg(state: LetterState | null): string {
  switch (state) {
    case "correct": return "bg-correct border-correct/50";
    case "present": return "bg-present border-present/50";
    case "absent": return "bg-absent border-absent/50";
    default: return "bg-tile border-border";
  }
}

// ── Mini Board Component ──

interface MiniBoardProps {
  boardIndex: number;
  answer: string;
  guesses: string[];
  currentGuess: string;
  solved: boolean;
  solvedAtGuess: number | null;
  gameOver: boolean;
}

function MiniBoard({ boardIndex, answer, guesses, currentGuess, solved, solvedAtGuess, gameOver }: MiniBoardProps) {
  const rows: { letters: string[]; states: (LetterState | null)[] }[] = [];

  // Submitted guesses (only those before this board was solved, or all if not solved)
  const activeGuesses = solvedAtGuess !== null
    ? guesses.slice(0, solvedAtGuess + 1)
    : guesses;

  for (let i = 0; i < activeGuesses.length; i++) {
    const guess = activeGuesses[i];
    const chars = Array.from(guess);
    const states = evaluateGuess(guess, answer);
    rows.push({ letters: chars, states });
  }

  // Current guess row (only if board not solved and game is playing)
  if (!solved && !gameOver) {
    const chars = Array.from(currentGuess);
    const letters = [];
    const states: (LetterState | null)[] = [];
    for (let i = 0; i < 5; i++) {
      letters.push(chars[i] || "");
      states.push(null);
    }
    rows.push({ letters, states });
  }

  // Empty remaining rows
  const totalRows = solved ? activeGuesses.length : MAX_GUESSES;
  while (rows.length < totalRows) {
    rows.push({
      letters: ["", "", "", "", ""],
      states: [null, null, null, null, null],
    });
  }

  return (
    <div className="relative">
      <div className="flex flex-col gap-[2px]">
        {rows.map((row, ri) => (
          <div key={ri} className="flex gap-[2px] justify-center" dir="rtl">
            {row.letters.map((letter, ci) => (
              <div
                key={ci}
                className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-[10px] sm:text-xs font-bold border rounded-sm transition-colors ${getCellBg(row.states[ci])} ${letter && !row.states[ci] ? "text-white border-muted" : "text-white"}`}
              >
                {letter}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Solved overlay */}
      {solved && (
        <div className="absolute inset-0 flex items-center justify-center bg-correct/20 rounded-lg backdrop-blur-[1px]">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-correct/90 flex items-center justify-center">
            <Check size={24} className="text-white" strokeWidth={3} />
          </div>
        </div>
      )}

      {/* Lost overlay - show the answer */}
      {gameOver && !solved && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg backdrop-blur-[1px]">
          <span className="text-white font-bold text-sm bg-black/60 px-3 py-1 rounded-full">{answer}</span>
        </div>
      )}
    </div>
  );
}

// ── Countdown Timer ──

function Countdown() {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    function update() {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return <span className="text-white font-mono text-sm font-bold">{timeLeft}</span>;
}

// ── Result Overlay ──

interface ResultOverlayProps {
  puzzle: RubaeiPuzzle;
  state: RubaeiGameState;
  onClose: () => void;
  onShare: () => void;
}

function ResultOverlay({ puzzle, state, onClose, onShare }: ResultOverlayProps) {
  const won = state.gameStatus === "won";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-surface border border-border rounded-2xl p-6 mx-4 max-w-sm w-full text-center"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <h2 className="text-xl font-bold text-white mb-2">
          {won ? "احسنت! 🎉" : "انتهت المحاولات"}
        </h2>
        <p className="text-muted text-sm mb-4">
          رباعي #{puzzle.puzzleNumber} {won ? `- ${state.guesses.length}/${MAX_GUESSES}` : ""}
        </p>

        {/* Mini emoji grids */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {puzzle.words.map((answer, bi) => {
            const solved = state.solvedBoards[bi];
            const guessesForBoard = solved
              ? state.guesses.slice(0, state.guesses.findIndex(g => g === answer) + 1)
              : state.guesses;

            return (
              <div key={bi} className="flex flex-col items-center gap-[1px]">
                {guessesForBoard.map((guess, gi) => {
                  const states = evaluateGuess(guess, answer);
                  return (
                    <div key={gi} className="flex gap-[1px]" dir="rtl">
                      {states.map((s, ci) => (
                        <span key={ci} className="text-[8px] leading-none">{stateToEmoji(s)}</span>
                      ))}
                    </div>
                  );
                })}
                {!solved && <span className="text-red-400 text-[10px] mt-0.5">✕</span>}
              </div>
            );
          })}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onShare}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-black font-bold py-2.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            <Share2 size={16} />
            مشاركة
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg bg-background border border-border text-muted font-bold hover:text-white transition-colors"
          >
            إغلاق
          </button>
        </div>

        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-muted text-xs mb-1">اللغز القادم</p>
          <Countdown />
        </div>
      </div>
    </div>
  );
}

// ── Help Modal ──

function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-surface border border-border rounded-2xl p-6 mx-4 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <h2 className="text-lg font-bold text-white mb-3">كيف تلعب رباعي؟</h2>
        <div className="text-muted text-sm space-y-2">
          <p>خمّن <strong className="text-white">4 كلمات</strong> في نفس الوقت!</p>
          <p>عندك <strong className="text-white">9 محاولات</strong> لحل الأربعة.</p>
          <p>كل تخمين يُطبّق على جميع الكلمات اللي ما انحلّت.</p>
          <div className="flex items-center gap-2 mt-3">
            <span className="w-6 h-6 rounded bg-correct flex items-center justify-center text-xs font-bold">ك</span>
            <span>الحرف في مكانه الصحيح</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-present flex items-center justify-center text-xs font-bold">ل</span>
            <span>الحرف موجود بمكان ثاني</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-absent flex items-center justify-center text-xs font-bold">م</span>
            <span>الحرف غير موجود</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 rounded-lg bg-primary text-black font-bold hover:opacity-90 transition-opacity"
        >
          فهمت!
        </button>
      </div>
    </div>
  );
}

// ── Main Page ──

export default function RubaeiPage() {
  const [puzzle, setPuzzle] = useState<RubaeiPuzzle | null>(null);
  const [state, setState] = useState<RubaeiGameState | null>(null);
  const [currentGuess, setCurrentGuess] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);

  // Track which guess index solved each board
  const [solvedAtGuess, setSolvedAtGuess] = useState<(number | null)[]>([null, null, null, null]);

  // Initialize
  useEffect(() => {
    const p = getTodayRubaeiPuzzle();
    setPuzzle(p);

    const saved = loadRubaeiGameState();
    if (saved) {
      setState(saved);
      // Reconstruct solvedAtGuess
      const sat: (number | null)[] = [null, null, null, null];
      for (let bi = 0; bi < 4; bi++) {
        if (saved.solvedBoards[bi]) {
          for (let gi = 0; gi < saved.guesses.length; gi++) {
            if (saved.guesses[gi] === p.words[bi]) {
              sat[bi] = gi;
              break;
            }
          }
        }
      }
      setSolvedAtGuess(sat);
      if (saved.gameStatus !== "playing") {
        setTimeout(() => setShowResult(true), 500);
      }
    } else {
      setState(createInitialRubaeiState());
    }
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(null);
    setTimeout(() => setToast(msg), 10);
  }, []);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  // Compute merged keyboard states
  const keyboardStates = useMemo(() => {
    if (!puzzle || !state) return {};
    const boardStates = puzzle.words.map((answer, bi) => {
      const activeGuesses = solvedAtGuess[bi] !== null
        ? state.guesses.slice(0, solvedAtGuess[bi]! + 1)
        : state.guesses;
      return getLetterStatesForBoard(activeGuesses, answer);
    });
    return mergeLetterStatesForKeyboard(boardStates);
  }, [puzzle, state, solvedAtGuess]);

  const submitGuess = useCallback(() => {
    if (!puzzle || !state) return;
    if (state.gameStatus !== "playing") return;

    const guessChars = Array.from(currentGuess);
    if (guessChars.length !== 5) {
      showToast("الكلمة يجب أن تكون 5 أحرف");
      triggerShake();
      return;
    }

    if (!isValidRubaeiGuess(currentGuess)) {
      showToast("الكلمة غير موجودة في القائمة");
      triggerShake();
      return;
    }

    const newGuesses = [...state.guesses, currentGuess];
    const guessIndex = newGuesses.length - 1;
    const newSolved: [boolean, boolean, boolean, boolean] = [...state.solvedBoards];
    const newSolvedAt = [...solvedAtGuess];
    let justSolvedAny = false;

    // Check each unsolved board
    for (let bi = 0; bi < 4; bi++) {
      if (!newSolved[bi] && currentGuess === puzzle.words[bi]) {
        newSolved[bi] = true;
        newSolvedAt[bi] = guessIndex;
        justSolvedAny = true;
      }
    }

    const allSolved = newSolved.every(Boolean);
    const outOfGuesses = newGuesses.length >= MAX_GUESSES;
    let newStatus: "playing" | "won" | "lost" = "playing";

    if (allSolved) {
      newStatus = "won";
    } else if (outOfGuesses) {
      newStatus = "lost";
    }

    const newState: RubaeiGameState = {
      ...state,
      guesses: newGuesses,
      solvedBoards: newSolved,
      gameStatus: newStatus,
    };

    setState(newState);
    setSolvedAtGuess(newSolvedAt);
    setCurrentGuess("");
    saveRubaeiGameState(newState);

    // Sound effects
    if (newStatus === "won") {
      playWin();
      updateRubaeiStatsOnWin(newGuesses.length);
      showToast("ممتاز! حلّيت الأربعة 🎉");
      setTimeout(() => setShowResult(true), 1500);
    } else if (newStatus === "lost") {
      playWrong();
      updateRubaeiStatsOnLoss();
      showToast("انتهت المحاولات");
      setTimeout(() => setShowResult(true), 1500);
    } else if (justSolvedAny) {
      playCorrect();
    } else {
      playTap();
    }
  }, [puzzle, state, currentGuess, solvedAtGuess, showToast, triggerShake]);

  const handleKey = useCallback(
    (key: string) => {
      if (!state || state.gameStatus !== "playing") return;
      if (Array.from(currentGuess).length >= 5) return;
      if (ARABIC_LETTERS.has(key)) {
        setCurrentGuess((prev) => prev + key);
      }
    },
    [state, currentGuess]
  );

  const handleDelete = useCallback(() => {
    if (!state || state.gameStatus !== "playing") return;
    setCurrentGuess((prev) => {
      const chars = Array.from(prev);
      chars.pop();
      return chars.join("");
    });
  }, [state]);

  // Physical keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Enter") {
        submitGuess();
      } else if (e.key === "Backspace") {
        handleDelete();
      } else if (ARABIC_LETTERS.has(e.key)) {
        handleKey(e.key);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [submitGuess, handleDelete, handleKey]);

  // Share text
  const generateShareText = useCallback(() => {
    if (!puzzle || !state) return "";
    const lines: string[] = [];
    lines.push(`رباعي كلمة #${puzzle.puzzleNumber}`);

    const won = state.gameStatus === "won";
    lines.push(won ? `${state.guesses.length}/${MAX_GUESSES} ✅` : `X/${MAX_GUESSES} ❌`);
    lines.push("");

    // 4 mini grids side by side (top two, then bottom two)
    for (let pair = 0; pair < 2; pair++) {
      const b1 = pair * 2;
      const b2 = pair * 2 + 1;
      const answer1 = puzzle.words[b1];
      const answer2 = puzzle.words[b2];

      const guesses1 = solvedAtGuess[b1] !== null
        ? state.guesses.slice(0, solvedAtGuess[b1]! + 1)
        : state.guesses;
      const guesses2 = solvedAtGuess[b2] !== null
        ? state.guesses.slice(0, solvedAtGuess[b2]! + 1)
        : state.guesses;

      const maxRows = Math.max(guesses1.length, guesses2.length);

      for (let r = 0; r < maxRows; r++) {
        let left = "     ";
        let right = "     ";
        if (r < guesses1.length) {
          left = evaluateGuess(guesses1[r], answer1).map(stateToEmoji).join("");
        }
        if (r < guesses2.length) {
          right = evaluateGuess(guesses2[r], answer2).map(stateToEmoji).join("");
        }
        lines.push(`${right} ${left}`);
      }
      if (pair === 0) lines.push("");
    }

    lines.push("");
    lines.push("kalima.fun/rubaei");
    return lines.join("\n");
  }, [puzzle, state, solvedAtGuess]);

  const handleShare = useCallback(async () => {
    const text = generateShareText();
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        showToast("تم النسخ");
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        showToast("تم النسخ");
      } catch {
        showToast("فشل النسخ");
      }
    }
  }, [generateShareText, showToast]);

  // Loading state
  if (!puzzle || !state) {
    return (
      <div className="h-full bg-background flex items-center justify-center">
        <div className="text-white text-2xl font-bold">رباعي</div>
      </div>
    );
  }

  const gameOver = state.gameStatus !== "playing";

  return (
    <div className="bg-background flex flex-col overflow-hidden h-full" dir="rtl">
      {/* Header */}
      <GameHeader
        center={
          <div className="flex items-center gap-2">
            <span className="text-white text-base font-bold">رباعي</span>
            <span className="text-muted text-sm font-bold">#{puzzle.puzzleNumber}</span>
          </div>
        }
        right={
          <div className="flex items-center gap-1">
            {gameOver && (
              <button
                onClick={() => setShowResult(true)}
                className="text-muted hover:text-white transition-colors p-1"
              >
                <Share2 size={18} strokeWidth={1.5} />
              </button>
            )}
            <button
              onClick={() => setShowHelp(true)}
              className="text-muted hover:text-white transition-colors p-1"
            >
              <HelpCircle size={20} strokeWidth={1.5} />
            </button>
          </div>
        }
      />

      {/* Guess counter */}
      <div className="text-center py-1.5 text-muted text-xs font-bold border-b border-border">
        المحاولة {Math.min(state.guesses.length + 1, MAX_GUESSES)} / {MAX_GUESSES}
        {" | "}
        حُلّت {state.solvedBoards.filter(Boolean).length} / 4
      </div>

      {/* 4 Mini Boards */}
      <main className="flex-1 flex flex-col items-center overflow-auto min-h-0">
        <div className={`grid grid-cols-2 gap-2 sm:gap-3 p-2 sm:p-3 w-full max-w-md ${shake ? "animate-shake" : ""}`}>
          {puzzle.words.map((answer, bi) => (
            <div key={bi} className="flex justify-center">
              <MiniBoard
                boardIndex={bi}
                answer={answer}
                guesses={state.guesses}
                currentGuess={currentGuess}
                solved={state.solvedBoards[bi]}
                solvedAtGuess={solvedAtGuess[bi]}
                gameOver={gameOver}
              />
            </div>
          ))}
        </div>
      </main>

      {/* Keyboard */}
      <div className="w-full px-1 pb-1 shrink-0">
        <Keyboard
          letterStates={keyboardStates as Record<string, import("@/lib/gameState").LetterState>}
          onKey={handleKey}
          onDelete={handleDelete}
          onEnter={submitGuess}
          disabled={gameOver}
        />
      </div>

      {/* Help Modal */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {/* Result Overlay */}
      {showResult && (
        <ResultOverlay
          puzzle={puzzle}
          state={state}
          onClose={() => setShowResult(false)}
          onShare={handleShare}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}

      {/* Shake animation */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
