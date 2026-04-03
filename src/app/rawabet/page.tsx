"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getDailyRawabetPuzzle,
  getRawabetPuzzleNumber,
  RawabetCategory,
  CategoryColor,
} from "@/data/rawabet";
import {
  loadRawabetGameState,
  saveRawabetGameState,
  updateRawabetStatsOnWin,
  updateRawabetStatsOnLoss,
  loadRawabetStats,
  RawabetStats,
} from "@/lib/rawabetState";
import RawabetResultModal from "@/components/RawabetResultModal";
import { writeStatsToFirestore } from "@/lib/firestoreSync";
import { Shuffle, CheckCircle2, HelpCircle } from "lucide-react";
import BackToHome from "@/components/BackToHome";
import GameHeader from "@/components/GameHeader";
import HowToPlayRawabet from "@/components/HowToPlayRawabet";

const MAX_MISTAKES = 4;

const COLOR_BG: Record<CategoryColor, string> = {
  yellow: "bg-[#F5C842]",
  green: "bg-[#4ADE80]",
  blue: "bg-[#60A5FA]",
  red: "bg-[#F5820A]",
};

const COLOR_BORDER_RIGHT: Record<CategoryColor, string> = {
  yellow: "border-r-[#F5C842]",
  green: "border-r-[#4ADE80]",
  blue: "border-r-[#60A5FA]",
  red: "border-r-[#F5820A]",
};

interface Toast {
  id: number;
  message: string;
}

let toastCounter = 0;

export default function RawabetPage() {
  const router = useRouter();
  const puzzle = getDailyRawabetPuzzle();
  const puzzleNumber = getRawabetPuzzleNumber();

  // All words flattened, shuffled for display
  const allWords = puzzle.categories.flatMap((c) => c.words);

  const [tiles, setTiles] = useState<string[]>(() => shuffle([...allWords]));
  const [selected, setSelected] = useState<string[]>([]);
  const [foundCategories, setFoundCategories] = useState<RawabetCategory[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing");
  const [shakingTiles, setShakingTiles] = useState<string[]>([]);
  const [flippingTiles, setFlippingTiles] = useState<string[]>([]);
  const [flashWrongTiles, setFlashWrongTiles] = useState<string[]>([]);
  const [bounceCorrectTiles, setBounceCorrectTiles] = useState<string[]>([]);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState<RawabetStats>(loadRawabetStats());
  const [isChecking, setIsChecking] = useState(false);

  // Load saved state
  useEffect(() => {
    const saved = loadRawabetGameState();
    if (saved) {
      setMistakes(saved.mistakes);
      setGameStatus(saved.gameStatus);

      const found = puzzle.categories.filter((c) =>
        saved.foundCategories.includes(c.name)
      );
      setFoundCategories(found);

      const foundWords = found.flatMap((c) => [...c.words]);
      const remaining = allWords.filter((w) => !foundWords.includes(w));
      setTiles(shuffle(remaining));

      if (saved.gameStatus !== "playing") {
        setTimeout(() => setShowModal(true), 800);
      }
    }
    setStats(loadRawabetStats());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function showToast(message: string, duration = 1800) {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }

  function toggleTile(word: string) {
    if (gameStatus !== "playing" || isChecking) return;
    if (flippingTiles.includes(word)) return;

    setSelected((prev) => {
      if (prev.includes(word)) return prev.filter((w) => w !== word);
      if (prev.length >= 4) return prev;
      return [...prev, word];
    });
  }

  function handleShuffle() {
    if (gameStatus !== "playing") return;
    setTiles((prev) => shuffle([...prev]));
  }

  const handleCheck = useCallback(() => {
    if (selected.length !== 4 || gameStatus !== "playing" || isChecking) return;

    setIsChecking(true);

    // Find which category matches
    const matched = puzzle.categories.find(
      (cat) =>
        !foundCategories.find((f) => f.name === cat.name) &&
        cat.words.every((w) => selected.includes(w)) &&
        selected.every((w) => cat.words.includes(w))
    );

    if (matched) {
      // Step 1: bounce up
      setBounceCorrectTiles([...selected]);
      setTimeout(() => {
        setBounceCorrectTiles([]);
        // Step 2: flip to reveal
      setFlippingTiles([...selected]);
      setTimeout(() => {
        const newFound = [...foundCategories, matched];
        setFoundCategories(newFound);
        setFlippingTiles([]);
        setSelected([]);
        setTiles((prev) => prev.filter((w) => !matched.words.includes(w)));

        if (newFound.length === 4) {
          const newStats = updateRawabetStatsOnWin();
          setStats(newStats);
          writeStatsToFirestore();
          setGameStatus("won");
          saveRawabetGameState({
            puzzleNumber,
            selectedWords: [],
            foundCategories: newFound.map((c) => c.name),
            mistakes,
            gameStatus: "won",
          });
          setTimeout(() => setShowModal(true), 1500);
        } else {
          saveRawabetGameState({
            puzzleNumber,
            selectedWords: [],
            foundCategories: newFound.map((c) => c.name),
            mistakes,
            gameStatus: "playing",
          });
        }
        setIsChecking(false);
      }, 500);
      }, 300);
    } else {
      // Check if one away
      const oneAway = puzzle.categories.some((cat) => {
        if (foundCategories.find((f) => f.name === cat.name)) return false;
        const overlap = cat.words.filter((w) => selected.includes(w)).length;
        return overlap === 3;
      });

      if (oneAway) showToast("واحد قريب! 🤏");

      // Flash red + shake
      setFlashWrongTiles([...selected]);
      setShakingTiles([...selected]);
      setTimeout(() => {
        setShakingTiles([]);
        setFlashWrongTiles([]);
        const newMistakes = mistakes + 1;
        setMistakes(newMistakes);
        setSelected([]);

        if (newMistakes >= MAX_MISTAKES) {
          const newStats = updateRawabetStatsOnLoss();
          setStats(newStats);
          writeStatsToFirestore();
          setGameStatus("lost");
          saveRawabetGameState({
            puzzleNumber,
            selectedWords: [],
            foundCategories: foundCategories.map((c) => c.name),
            mistakes: newMistakes,
            gameStatus: "lost",
          });
          setTimeout(() => setShowModal(true), 1500);
        } else {
          if (!oneAway) showToast("خطأ! حاول مجدداً");
          saveRawabetGameState({
            puzzleNumber,
            selectedWords: [],
            foundCategories: foundCategories.map((c) => c.name),
            mistakes: newMistakes,
            gameStatus: "playing",
          });
        }
        setIsChecking(false);
      }, 500);
    }
  }, [selected, gameStatus, isChecking, puzzle, foundCategories, mistakes, puzzleNumber]);

  const remainingTiles = tiles;

  return (
    <div className="h-full flex flex-col bg-background" dir="rtl">
      {/* Header — flush to top, outside scroll area */}
      <GameHeader
          center={<span className="text-sm font-bold text-white">#{puzzleNumber}</span>}
          right={
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                {Array.from({ length: MAX_MISTAKES }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      i < mistakes ? "bg-present scale-110" : "bg-border"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => setShowHowToPlay(true)}
                className="text-muted hover:text-white transition-colors p-1"
              >
                <HelpCircle size={20} strokeWidth={1.5} />
              </button>
            </div>
          }
        />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 py-4 flex flex-col gap-4">

        {/* Found category rows */}
        {foundCategories.map((cat) => (
          <div
            key={cat.name}
            className={`${COLOR_BG[cat.color]} ${COLOR_BORDER_RIGHT[cat.color]} border-r-4 rounded-xl px-4 py-3 flex flex-col gap-0.5`}
          >
            <span className="font-bold text-black text-sm">{cat.name}</span>
            <span className="text-black/70 text-xs">{cat.words.join(" · ")}</span>
          </div>
        ))}

        {/* Lost — show unfound categories */}
        {gameStatus === "lost" &&
          puzzle.categories
            .filter((c) => !foundCategories.find((f) => f.name === c.name))
            .map((cat) => (
              <div
                key={cat.name + "-missed"}
                className={`${COLOR_BG[cat.color]} ${COLOR_BORDER_RIGHT[cat.color]} border-r-4 rounded-xl px-4 py-3 flex flex-col gap-0.5 opacity-60`}
              >
                <span className="font-bold text-black text-sm">{cat.name}</span>
                <span className="text-black/70 text-xs">{cat.words.join(" · ")}</span>
              </div>
            ))}

        {/* 4×4 grid */}
        {gameStatus === "playing" && remainingTiles.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {remainingTiles.map((word, index) => {
              const isSelected = selected.includes(word);
              const isShaking = shakingTiles.includes(word);
              const isFlipping = flippingTiles.includes(word);
              const isFlashWrong = flashWrongTiles.includes(word);
              const isBounceCorrect = bounceCorrectTiles.includes(word);

              return (
                <button
                  key={word}
                  onClick={() => toggleTile(word)}
                  style={{ animationDelay: `${index * 40}ms` }}
                  className={[
                    "rounded-xl py-3 px-1 text-center font-bold text-white transition-all duration-150",
                    "text-sm leading-tight min-h-[60px] flex items-center justify-center",
                    "animate-tile-enter",
                    isSelected
                      ? "bg-primary/20 border-2 border-primary shadow-[0_0_14px_rgba(204,255,0,0.3)] scale-[1.04] text-white"
                      : "bg-surface border-2 border-border hover:border-primary/40",
                    isShaking ? "animate-rawabet-shake" : "",
                    isFlipping ? "animate-tile-flip" : "",
                    isFlashWrong ? "animate-flash-wrong" : "",
                    isBounceCorrect ? "animate-bounce-correct" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {word}
                </button>
              );
            })}
          </div>
        )}

        {/* Actions */}
        {gameStatus === "playing" && (
          <div className="flex gap-2 justify-center">
            <button
              onClick={handleShuffle}
              className="px-4 py-2.5 rounded-xl bg-surface border border-border text-muted text-sm font-medium hover:border-primary/50 transition-colors flex items-center gap-1.5"
            >
              <Shuffle size={15} />
              خلط
            </button>
            <button
              onClick={() => setSelected([])}
              disabled={selected.length === 0}
              className="px-4 py-2.5 rounded-xl bg-surface border border-border text-muted text-sm font-medium hover:border-primary/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              إلغاء التحديد
            </button>
            <button
              onClick={handleCheck}
              disabled={selected.length !== 4}
              className="flex-1 py-2.5 rounded-xl bg-primary text-[#0F0C00] font-bold text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#FFD740] flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 size={16} />
              تحقق
            </button>
          </div>
        )}

        {/* Show result button if game ended */}
        {gameStatus !== "playing" && (
          <button
            onClick={() => setShowModal(true)}
            className="py-3 rounded-xl bg-primary text-[#0F0C00] font-bold text-sm hover:bg-[#FFD740] transition-colors"
          >
            عرض النتيجة
          </button>
        )}

        {/* How to play */}
        <div className="text-center text-xs text-muted pb-2">
          اختر ٤ كلمات لها رابط مشترك واضغط &quot;تحقق&quot;
        </div>
      </div>

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
      </div>

      {/* Result modal */}
      <RawabetResultModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        gameStatus={gameStatus === "playing" ? "lost" : gameStatus}
        foundCategories={foundCategories}
        allCategories={puzzle.categories}
        mistakes={mistakes}
        puzzleNumber={puzzleNumber}
        stats={stats}
      />

      {showHowToPlay && (
        <HowToPlayRawabet onClose={() => setShowHowToPlay(false)} />
      )}
    </div>
  );
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
