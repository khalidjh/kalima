"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { HelpCircle, BarChart2, Lock } from "lucide-react";
import BackToHome from "@/components/BackToHome";
import GameHeader from "@/components/GameHeader";
import GameBoard from "@/components/GameBoard";
import Keyboard from "@/components/Keyboard";
import HowToPlayModal from "@/components/HowToPlayModal";
import StatsModal from "@/components/StatsModal";
import Toast from "@/components/Toast";
import {
  loadGameState,
  saveGameState,
  loadStats,
  updateStatsOnWin,
  updateStatsOnLoss,
  getKeyboardLetterStates,
  Stats,
} from "@/lib/gameState";
import { getDailyWord, isValidGuess, getPuzzleNumber } from "@/data/words";
import { track } from "@/lib/analytics";
import { writeStatsToFirestore } from "@/lib/firestoreSync";
import { useAuth } from "@/lib/auth";
import { useIsPro } from "@/lib/subscription";

const ARABIC_LETTERS = new Set([
  "ا", "أ", "إ", "آ", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ",
  "ر", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق",
  "ك", "ل", "م", "ن", "ه", "و", "ي", "ة", "ى", "ئ", "ؤ", "ء",
]);

export default function Home() {
  const { user } = useAuth();
  const { isPro } = useIsPro(user);
  const router = useRouter();
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
  const [showArchiveModal, setShowArchiveModal] = useState(false);

  // Initialize game
  useEffect(() => {
    const word = getDailyWord();
    const pNum = getPuzzleNumber();
    setAnswer(word);
    setPuzzleNumber(pNum);

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

    setStats(loadStats());
    setInitialized(true);
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

  const submitGuess = useCallback(() => {
    if (gameStatus !== "playing") return;
    if (Array.from(currentGuess).length !== 5) {
      showToast("الكلمة يجب أن تكون 5 أحرف");
      triggerShake();
      return;
    }
    // Word list validation removed — accept any 5 Arabic letters
    void isValidGuess;

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setCurrentGuess("");

    const won = currentGuess === answer;
    const lost = !won && newGuesses.length >= 6;

    if (won) {
      const newStats = updateStatsOnWin(newGuesses.length);
      setStats(newStats);
      track("game_won", { puzzle: puzzleNumber, guesses: newGuesses.length, streak: newStats.currentStreak });
      writeStatsToFirestore();
      const messages = ["ممتاز! 🌟", "رائع! 🎉", "أحسنت! 👏", "جيد جداً! 😊", "حسناً 😌", "بالكاد! 😅"];
      showToast(messages[newGuesses.length - 1] ?? "أحسنت!");
      setTimeout(() => {
        setShowStats(true);
      }, 1800);
      saveGameState({ puzzleNumber, guesses: newGuesses, gameStatus: "won" });
      setGameStatus("won");
    } else if (lost) {
      const newStats = updateStatsOnLoss();
      setStats(newStats);
      track("game_lost", { puzzle: puzzleNumber });
      writeStatsToFirestore();
      showToast(`الإجابة: ${answer}`, 3000);
      setTimeout(() => setShowStats(true), 2000);
      saveGameState({ puzzleNumber, guesses: newGuesses, gameStatus: "lost" });
      setGameStatus("lost");
    } else {
      saveGameState({ puzzleNumber, guesses: newGuesses, gameStatus: "playing" });
    }
  }, [gameStatus, currentGuess, guesses, answer, puzzleNumber, showToast, triggerShake]);

  const handleKey = useCallback(
    (key: string) => {
      if (gameStatus !== "playing") return;
      if (Array.from(currentGuess).length >= 5) return;
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
            <button onClick={() => isPro ? setShowArchiveModal(true) : router.push("/pro")} className="text-muted hover:text-white transition-colors p-1">
              <Lock size={16} strokeWidth={1.5} />
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
        />
      )}

      {/* Archive Modal (Pro stub) */}
      {showArchiveModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
          onClick={() => setShowArchiveModal(false)}
          dir="rtl"
          style={{ fontFamily: "'Cairo', sans-serif" }}
        >
          <div
            className="bg-surface border border-border rounded-2xl p-8 max-w-xs w-full text-center shadow-xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-4xl mb-4">📅</div>
            <h2 className="text-xl font-bold text-white mb-2">أرشيف الألغاز</h2>
            <p className="text-muted text-sm mb-6">قريباً — العب أي لغز من الأيام السابقة</p>
            <button
              onClick={() => setShowArchiveModal(false)}
              className="w-full h-10 rounded-lg bg-primary text-[#0A0A0A] font-bold text-sm hover:opacity-90 transition-opacity"
            >
              حسناً
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
