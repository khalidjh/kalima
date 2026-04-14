"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HelpCircle, BarChart2, Shield, Archive } from "lucide-react";
import { playCorrect, playWrong } from "@/lib/sounds";
import BackToHome from "@/components/BackToHome";
import GameHeader from "@/components/GameHeader";
import GameBoard from "@/components/GameBoard";
import Keyboard from "@/components/Keyboard";
import HowToPlayModal from "@/components/HowToPlayModal";
import StatsModal from "@/components/StatsModal";
import Toast from "@/components/Toast";
import NotificationPrompt from "@/components/NotificationPrompt";
import {
  loadGameState,
  saveGameState,
  loadArchiveGameState,
  saveArchiveGameState,
  loadStats,
  updateStatsOnWin,
  updateStatsOnLoss,
  getKeyboardLetterStates,
  Stats,
  loadHardMode,
  saveHardMode,
  validateHardMode,
  hardModeViolationMessage,
} from "@/lib/gameState";
import { getDailyWord, isValidGuess, getPuzzleNumber, getWordByPuzzleNumber, WORD_LENGTH } from "@/data/words";
import { track } from "@/lib/analytics";
import { writeStatsToFirestore } from "@/lib/firestoreSync";
import { useAuth } from "@/lib/auth";
import { useIsPro } from "@/lib/subscription";

const ARABIC_LETTERS = new Set([
  "ا", "أ", "إ", "آ", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ",
  "ر", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق",
  "ك", "ل", "م", "ن", "ه", "و", "ي", "ة", "ى", "ئ", "ؤ", "ء",
]);

import { Suspense } from "react";

function HomeInner() {
  const { user } = useAuth();
  const { isPro } = useIsPro(user);
  const router = useRouter();
  const searchParams = useSearchParams();
  const archivePuzzleParam = searchParams.get("puzzle");
  const isArchiveMode = archivePuzzleParam !== null && isPro;
  const archivePuzzleNum = archivePuzzleParam ? parseInt(archivePuzzleParam, 10) : null;

  const [answer, setAnswer] = useState("");
  const [puzzleNumber, setPuzzleNumber] = useState(1);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing");
  const [stats, setStats] = useState<Stats>(() => loadStats());
  const [toast, setToast] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [hardMode, setHardMode] = useState(false);

  // Initialize game
  useEffect(() => {
    let word: string;
    let pNum: number;

    if (isArchiveMode && archivePuzzleNum && archivePuzzleNum > 0) {
      word = getWordByPuzzleNumber(archivePuzzleNum);
      pNum = archivePuzzleNum;
    } else {
      word = getDailyWord();
      pNum = getPuzzleNumber();
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnswer(word);
    setPuzzleNumber(pNum);

    if (isArchiveMode && archivePuzzleNum) {
      const saved = loadArchiveGameState(archivePuzzleNum);
      if (saved) {
        setGuesses(saved.guesses);
        setGameStatus(saved.gameStatus);
        if (saved.gameStatus !== "playing") {
          setTimeout(() => setShowStats(true), 500);
        }
      }
    } else {
      const saved = loadGameState();
      if (saved) {
        setGuesses(saved.guesses);
        setGameStatus(saved.gameStatus);
        if (saved.gameStatus !== "playing") {
          setTimeout(() => setShowStats(true), 500);
        }
      } else {
        // First visit check
        const hasPlayed = localStorage.getItem("kalima_has_played");
        if (!hasPlayed) {
          setShowHowToPlay(true);
          localStorage.setItem("kalima_has_played", "true");
        }
      }
    }

    setStats(loadStats());
    setHardMode(loadHardMode());
    setInitialized(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = useCallback((msg: string, duration = 2000) => {
    setToast(null);
    setTimeout(() => setToast(msg), 10);
    void duration;
  }, []);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  const toggleHardMode = useCallback(() => {
    if (guesses.length > 0) {
      showToast("لا يمكن تغيير الوضع الصعب بعد بدء اللعب");
      return;
    }
    setHardMode((prev) => {
      const next = !prev;
      saveHardMode(next);
      showToast(next ? "تم تفعيل الوضع الصعب 🔴" : "تم إيقاف الوضع الصعب");
      return next;
    });
  }, [guesses.length, showToast]);

  const submitGuess = useCallback(() => {
    if (gameStatus !== "playing") return;
    if (Array.from(currentGuess).length !== WORD_LENGTH) {
      showToast(`الكلمة يجب أن تكون ${WORD_LENGTH} أحرف`);
      triggerShake();
      return;
    }
    // Allow any 4-letter Arabic input, no dictionary validation

    if (hardMode && guesses.length > 0) {
      const violation = validateHardMode(currentGuess, guesses, answer);
      if (violation) {
        showToast(hardModeViolationMessage(violation));
        triggerShake();
        return;
      }
    }

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setCurrentGuess("");

    const won = currentGuess === answer;
    const lost = !won && newGuesses.length >= 6;

    const saveFn = isArchiveMode ? saveArchiveGameState : saveGameState;

    if (won) {
      playCorrect();
      if (!isArchiveMode) {
        const newStats = updateStatsOnWin(newGuesses.length);
        setStats(newStats);
        track("game_won", { puzzle: puzzleNumber, guesses: newGuesses.length, streak: newStats.currentStreak });
        writeStatsToFirestore();
      }
      const messages = ["ممتاز! 🌟", "رائع! 🎉", "أحسنت! 👏", "جيد جداً! 😊", "حسناً 😌", "بالكاد! 😅"];
      showToast(messages[newGuesses.length - 1] ?? "أحسنت!");
      setTimeout(() => {
        setShowStats(true);
      }, 1800);
      saveFn({ puzzleNumber, guesses: newGuesses, gameStatus: "won" });
      setGameStatus("won");
    } else if (lost) {
      playWrong();
      if (!isArchiveMode) {
        const newStats = updateStatsOnLoss();
        setStats(newStats);
        track("game_lost", { puzzle: puzzleNumber });
        writeStatsToFirestore();
      }
      showToast(`الإجابة: ${answer}`, 3000);
      setTimeout(() => setShowStats(true), 2000);
      saveFn({ puzzleNumber, guesses: newGuesses, gameStatus: "lost" });
      setGameStatus("lost");
    } else {
      saveFn({ puzzleNumber, guesses: newGuesses, gameStatus: "playing" });
    }
  }, [gameStatus, currentGuess, guesses, answer, puzzleNumber, showToast, triggerShake, hardMode, isArchiveMode]);

  const handleKey = useCallback(
    (key: string) => {
      if (gameStatus !== "playing") return;
      if (Array.from(currentGuess).length >= WORD_LENGTH) return;
      if (ARABIC_LETTERS.has(key)) {
        setCurrentGuess((prev) => prev + key);
      }
    },
    [gameStatus, currentGuess]
  );

  const handleDelete = useCallback(() => {
    if (gameStatus !== "playing") return;
    setCurrentGuess((prev) => {
      const chars = Array.from(prev);
      chars.pop();
      return chars.join("");
    });
  }, [gameStatus]);

  // Physical keyboard support (for testing)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Enter") {
        submitGuess();
      } else if (e.key === "Backspace") {
        handleDelete();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [submitGuess, handleDelete]);

  // Show notification prompt once after game ends and stats modal opens
  useEffect(() => {
    if (!showStats) return;
    if (gameStatus === "playing") return;
    if (!user) return;
    const asked = localStorage.getItem("kalima_notif_asked");
    if (asked) return;
    const timer = setTimeout(() => setShowNotificationPrompt(true), 2000);
    return () => clearTimeout(timer);
  }, [showStats, gameStatus, user]);

  const keyboardStates = getKeyboardLetterStates(guesses, answer);

  if (!initialized) {
    return (
      <div className="h-full bg-background flex items-center justify-center">
        <div className="text-white text-2xl font-bold">كلمة</div>
      </div>
    );
  }

  return (
    <div className="bg-background flex flex-col overflow-hidden h-full" dir="rtl">
      {/* Game controls header */}
      <GameHeader
        center={
          <div className="flex items-center gap-2">
            {isArchiveMode && (
              <span className="text-xs font-bold text-primary bg-primary/15 px-2 py-0.5 rounded-full border border-primary/30">
                أرشيف
              </span>
            )}
            <span className="text-muted text-sm font-bold">#{puzzleNumber}</span>
            {stats.currentStreak > 0 && (
              <button
                onClick={() => setShowStats(true)}
                className="flex items-center gap-1 text-sm font-bold px-2 py-0.5 rounded-full bg-surface text-primary border border-border hover:border-primary/50 transition-colors"
              >
                <span className="animate-fire-pulse inline-block">🔥</span> {stats.currentStreak}
              </button>
            )}
          </div>
        }
        right={
          <div className="flex items-center gap-1">
            <button
              onClick={toggleHardMode}
              className={`p-1 transition-colors ${
                hardMode ? "text-red-400 hover:text-red-300" : "text-muted hover:text-white"
              }`}
              title={hardMode ? "الوضع الصعب: مفعّل" : "الوضع الصعب: متوقف"}
            >
              <Shield size={18} strokeWidth={1.5} fill={hardMode ? "currentColor" : "none"} />
            </button>
            <button onClick={() => router.push("/archive")} className="text-muted hover:text-white transition-colors p-1">
              <Archive size={16} strokeWidth={1.5} />
            </button>
            <button onClick={() => setShowStats(true)} className="text-muted hover:text-white transition-colors p-1">
              <BarChart2 size={20} strokeWidth={1.5} />
            </button>
            <button onClick={() => setShowHowToPlay(true)} className="text-muted hover:text-white transition-colors p-1">
              <HelpCircle size={20} strokeWidth={1.5} />
            </button>
          </div>
        }
      />

      {/* Game Board */}
      <main className="flex-1 flex flex-col items-center overflow-hidden min-h-0">
        <div className="flex-1 flex items-center justify-center w-full min-h-0">
          <GameBoard
            guesses={guesses}
            currentGuess={currentGuess}
            answer={answer}
            gameOver={gameStatus !== "playing"}
            won={gameStatus === "won"}
            shake={shake}
          />
        </div>

        {/* Keyboard — pinned to bottom */}
        <div className="w-full px-1 pb-1 shrink-0">
          <Keyboard
            letterStates={keyboardStates}
            onKey={handleKey}
            onDelete={handleDelete}
            onEnter={submitGuess}
            disabled={gameStatus !== "playing"}
          />
        </div>
      </main>

      {/* Modals */}
      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}

      {showStats && (
        <StatsModal
          stats={stats}
          onClose={() => setShowStats(false)}
          gameStatus={gameStatus}
          guesses={guesses}
          answer={answer}
          hardMode={hardMode}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast}
          onDismiss={() => setToast(null)}
        />
      )}

      {/* Notification permission prompt */}
      {showNotificationPrompt && user && (
        <NotificationPrompt
          uid={user.uid}
          onClose={() => setShowNotificationPrompt(false)}
          onSuccess={() => setToast("تم تفعيل الإشعارات ✓")}
        />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="h-full bg-background flex items-center justify-center">
        <div className="text-white text-2xl font-bold">كلمة</div>
      </div>
    }>
      <HomeInner />
    </Suspense>
  );
}
