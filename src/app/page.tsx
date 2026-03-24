"use client";

import { useEffect, useState, useCallback } from "react";
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

const ARABIC_LETTERS = new Set([
  "ا", "أ", "إ", "آ", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ",
  "ر", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق",
  "ك", "ل", "م", "ن", "ه", "و", "ي", "ة", "ى", "ئ", "ؤ", "ء",
]);

export default function Home() {
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
    if (!isValidGuess(currentGuess)) {
      showToast("الكلمة غير موجودة في القائمة");
      triggerShake();
      return;
    }

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setCurrentGuess("");

    const won = currentGuess === answer;
    const lost = !won && newGuesses.length >= 6;

    if (won) {
      const newStats = updateStatsOnWin(newGuesses.length);
      setStats(newStats);
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white text-2xl font-bold">كلمة</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      {/* Header */}
      <header className="w-full border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          {/* How to play */}
          <button
            onClick={() => setShowHowToPlay(true)}
            className="text-white hover:text-gray-300 transition-colors p-1"
            aria-label="كيف تلعب"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24"
              viewBox="0 0 24 24"
              width="24"
              fill="currentColor"
            >
              <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" />
            </svg>
          </button>

          {/* Title */}
          <h1 className="text-2xl font-black tracking-wider text-white">
            كلمة
          </h1>

          {/* Stats */}
          <button
            onClick={() => setShowStats(true)}
            className="text-white hover:text-gray-300 transition-colors p-1"
            aria-label="الإحصائيات"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24"
              viewBox="0 0 24 24"
              width="24"
              fill="currentColor"
            >
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Puzzle number */}
      <div className="text-center text-gray-500 text-xs mt-2">
        #{puzzleNumber}
      </div>

      {/* Game Board */}
      <main className="flex-1 flex flex-col items-center justify-between pb-4 pt-2">
        <GameBoard
          guesses={guesses}
          currentGuess={currentGuess}
          answer={answer}
          gameOver={gameStatus !== "playing"}
          shake={shake}
        />

        {/* Keyboard */}
        <div className="w-full px-2 mt-auto">
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
