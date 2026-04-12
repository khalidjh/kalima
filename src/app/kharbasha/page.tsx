"use client";

import { useState, useEffect, useCallback } from "react";
import { Shuffle, HelpCircle, Share2 } from "lucide-react";
import GameHeader from "@/components/GameHeader";
import HowToPlayKharbasha from "@/components/HowToPlayKharbasha";
import { getDailyKharbashaPuzzle, getKharbashaPuzzleNumber } from "@/data/kharbasha";
import { playTap, playCorrect, playWrong } from "@/lib/sounds";
import {
  loadKharbashaGameState,
  saveKharbashaGameState,
  updateKharbashaStatsOnWin,
  updateKharbashaStatsOnLoss,
  loadKharbashaStats,
  KharbashaStats,
} from "@/lib/kharbashaState";

const MAX_ATTEMPTS = 5;

const ARABIC_NUMERALS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
function toArabicNum(n: number): string {
  return String(n)
    .split("")
    .map((c) => (c >= "0" && c <= "9" ? ARABIC_NUMERALS[parseInt(c)] : c))
    .join("");
}

interface TileData {
  letter: string;
  id: number; // unique id to handle duplicate letters
}

export default function KharbashaPage() {
  const puzzle = getDailyKharbashaPuzzle();
  const puzzleNumber = getKharbashaPuzzleNumber();
  const wordLength = Array.from(puzzle.word).length;

  // Available tiles (not yet placed)
  const [availableTiles, setAvailableTiles] = useState<TileData[]>([]);
  // Placed tiles (in answer area)
  const [placedTiles, setPlacedTiles] = useState<TileData[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing");
  const [showModal, setShowModal] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [bouncing, setBouncing] = useState(false);
  const [stats, setStats] = useState<KharbashaStats>(loadKharbashaStats());

  // Initialize tiles from scrambled word
  useEffect(() => {
    const saved = loadKharbashaGameState();
    if (saved) {
      setAttempts(saved.attempts);
      setGameStatus(saved.gameStatus);
      if (saved.gameStatus !== "playing") {
        // Reconstruct completed state: all tiles placed correctly
        const wordLetters = Array.from(puzzle.word);
        const placed = wordLetters.map((l, i) => ({ letter: l, id: i }));
        setPlacedTiles(placed);
        setAvailableTiles([]);
        setTimeout(() => setShowModal(true), 500);
      } else {
        // Restore in-progress state
        const scrambledLetters = Array.from(puzzle.scrambled);
        const tiles = scrambledLetters.map((l, i) => ({ letter: l, id: i }));
        const placedIds = saved.currentArrangement.map(Number).filter((n) => !isNaN(n));
        const placed = placedIds.map((id) => tiles.find((t) => t.id === id)).filter(Boolean) as TileData[];
        const available = tiles.filter((t) => !placedIds.includes(t.id));
        setPlacedTiles(placed);
        setAvailableTiles(available);
      }
    } else {
      const scrambledLetters = Array.from(puzzle.scrambled);
      const tiles = scrambledLetters.map((l, i) => ({ letter: l, id: i }));
      setAvailableTiles(tiles);
      setPlacedTiles([]);
    }
    setStats(loadKharbashaStats());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save state on changes
  const saveState = useCallback(
    (placed: TileData[], att: number, status: "playing" | "won" | "lost") => {
      saveKharbashaGameState({
        puzzleNumber,
        attempts: att,
        currentArrangement: placed.map((t) => String(t.id)),
        gameStatus: status,
      });
    },
    [puzzleNumber]
  );

  // Tap an available tile to place it
  function handleTapAvailable(tile: TileData) {
    if (gameStatus !== "playing") return;
    if (placedTiles.length >= wordLength) return;
    playTap();

    const newPlaced = [...placedTiles, tile];
    const newAvailable = availableTiles.filter((t) => t.id !== tile.id);
    setPlacedTiles(newPlaced);
    setAvailableTiles(newAvailable);
    saveState(newPlaced, attempts, "playing");
  }

  // Tap a placed tile to return it
  function handleTapPlaced(tile: TileData) {
    if (gameStatus !== "playing") return;
    playTap();

    const newPlaced = placedTiles.filter((t) => t.id !== tile.id);
    const newAvailable = [...availableTiles, tile];
    setPlacedTiles(newPlaced);
    setAvailableTiles(newAvailable);
    saveState(newPlaced, attempts, "playing");
  }

  // Shuffle available tiles
  function handleShuffle() {
    if (gameStatus !== "playing") return;
    playTap();
    setAvailableTiles((prev) => {
      const shuffled = [...prev];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
  }

  // Submit answer
  function handleSubmit() {
    if (gameStatus !== "playing") return;
    if (placedTiles.length !== wordLength) return;

    const guess = placedTiles.map((t) => t.letter).join("");
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (guess === puzzle.word) {
      // Correct!
      playCorrect();
      setBouncing(true);
      setGameStatus("won");
      saveState(placedTiles, newAttempts, "won");
      const newStats = updateKharbashaStatsOnWin(newAttempts);
      setStats(newStats);
      setTimeout(() => {
        setBouncing(false);
        setShowModal(true);
      }, 1200);
    } else if (newAttempts >= MAX_ATTEMPTS) {
      // Out of attempts
      playWrong();
      setShaking(true);
      setTimeout(() => {
        setShaking(false);
        setGameStatus("lost");
        // Show correct word
        const wordLetters = Array.from(puzzle.word);
        const correctTiles = wordLetters.map((l, i) => ({ letter: l, id: 100 + i }));
        setPlacedTiles(correctTiles);
        setAvailableTiles([]);
        saveState(placedTiles, newAttempts, "lost");
        updateKharbashaStatsOnLoss();
        setStats(loadKharbashaStats());
        setTimeout(() => setShowModal(true), 800);
      }, 500);
    } else {
      // Wrong, try again
      playWrong();
      setShaking(true);
      saveState(placedTiles, newAttempts, "playing");
      setTimeout(() => setShaking(false), 500);
    }
  }

  // Clear all placed tiles
  function handleClear() {
    if (gameStatus !== "playing") return;
    playTap();
    const allBack = [...availableTiles, ...placedTiles];
    setAvailableTiles(allBack);
    setPlacedTiles([]);
    saveState([], attempts, "playing");
  }

  // Share result
  function handleShare() {
    const attemptsEmoji = Array.from({ length: MAX_ATTEMPTS }, (_, i) => {
      if (gameStatus === "won") {
        return i < attempts - 1 ? "🟥" : i === attempts - 1 ? "🟩" : "⬛";
      }
      return i < attempts ? "🟥" : "⬛";
    }).join("");

    const num = toArabicNum(puzzleNumber);
    const text = gameStatus === "won"
      ? `خربشة 🔤 #${num}\n${attemptsEmoji}\nحليتها من ${toArabicNum(attempts)} محاولة!\nkalima.fun/kharbasha`
      : `خربشة 🔤 #${num}\n${attemptsEmoji}\nما قدرت احلها 😔\nkalima.fun/kharbasha`;

    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  }

  const attemptsLeft = MAX_ATTEMPTS - attempts;
  const canSubmit = placedTiles.length === wordLength && gameStatus === "playing";

  return (
    <div className="h-full flex flex-col bg-background" dir="rtl">
      <GameHeader
        center={
          <span className="text-sm font-bold text-white">
            خربشة #{toArabicNum(puzzleNumber)}
          </span>
        }
        right={
          <div className="flex items-center gap-2">
            {gameStatus === "playing" && (
              <div className="flex items-center gap-1.5">
                {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      i < attempts ? "bg-present scale-110" : "bg-border"
                    }`}
                  />
                ))}
              </div>
            )}
            <button
              onClick={() => setShowHowToPlay(true)}
              className="text-muted hover:text-white transition-colors p-1"
            >
              <HelpCircle size={20} strokeWidth={1.5} />
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-5">

          {/* Emoji hint */}
          <div className="text-center">
            <div className="text-4xl mb-2">{puzzle.hint.match(/\p{Emoji_Presentation}/u)?.[0] || "🔤"}</div>
            <p className="text-sm text-muted font-medium">{puzzle.hint}</p>
          </div>

          {/* Answer area */}
          <div className="flex justify-center">
            <div
              className={`flex gap-2 ${shaking ? "animate-shake" : ""} ${bouncing ? "animate-bounce-tile" : ""}`}
            >
              {Array.from({ length: wordLength }).map((_, i) => {
                const tile = placedTiles[i];
                return (
                  <button
                    key={i}
                    onClick={() => tile && handleTapPlaced(tile)}
                    disabled={!tile || gameStatus !== "playing"}
                    className={[
                      "w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center font-extrabold text-xl sm:text-2xl transition-all duration-200",
                      tile
                        ? gameStatus === "won"
                          ? "bg-correct/20 border-2 border-correct text-correct"
                          : gameStatus === "lost"
                          ? "bg-present/20 border-2 border-present text-present"
                          : "bg-primary/15 border-2 border-primary text-primary active:scale-90"
                        : "bg-surface border-2 border-border border-dashed text-muted",
                    ].join(" ")}
                    style={bouncing && tile ? { animationDelay: `${i * 80}ms` } : undefined}
                  >
                    {tile?.letter || ""}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Attempt counter */}
          {gameStatus === "playing" && attempts > 0 && (
            <p className="text-center text-sm text-muted">
              {toArabicNum(attemptsLeft)} محاولات متبقية
            </p>
          )}

          {/* Available tiles */}
          {gameStatus === "playing" && (
            <div className="flex flex-wrap justify-center gap-2">
              {availableTiles.map((tile) => (
                <button
                  key={tile.id}
                  onClick={() => handleTapAvailable(tile)}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-surface border-2 border-border font-extrabold text-xl sm:text-2xl text-white hover:border-primary/50 active:scale-90 transition-all duration-150 animate-tile-enter"
                >
                  {tile.letter}
                </button>
              ))}
            </div>
          )}

          {/* Action buttons */}
          {gameStatus === "playing" && (
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleShuffle}
                disabled={availableTiles.length < 2}
                className="px-4 py-2.5 rounded-xl bg-surface border border-border text-muted text-sm font-medium hover:border-primary/50 transition-colors flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Shuffle size={15} />
                خلط
              </button>
              <button
                onClick={handleClear}
                disabled={placedTiles.length === 0}
                className="px-4 py-2.5 rounded-xl bg-surface border border-border text-muted text-sm font-medium hover:border-primary/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                مسح
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="flex-1 py-2.5 rounded-xl bg-primary text-[#0F0C00] font-bold text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#FFD740] flex items-center justify-center gap-1.5"
              >
                تحقق
              </button>
            </div>
          )}

          {/* Show result button after game ends */}
          {gameStatus !== "playing" && (
            <button
              onClick={() => setShowModal(true)}
              className="py-3 rounded-xl bg-primary text-[#0F0C00] font-bold text-sm hover:bg-[#FFD740] transition-colors"
            >
              عرض النتيجة
            </button>
          )}

          {/* Instruction */}
          {gameStatus === "playing" && (
            <p className="text-center text-xs text-muted pb-2">
              اضغط على الحروف بالترتيب الصحيح ثم اضغط &quot;تحقق&quot;
            </p>
          )}
        </div>
      </div>

      {/* Result Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-50 p-4 pb-8">
          <div className="bg-surface border border-border rounded-3xl p-6 w-full max-w-sm flex flex-col gap-5 animate-slide-up">
            {/* Title */}
            <div className="text-center">
              <div className="text-4xl mb-2">
                {gameStatus === "won" ? "🎉" : "😔"}
              </div>
              <h2 className="text-xl font-black text-white">
                {gameStatus === "won" ? "أحسنت!" : "انتهت المحاولات"}
              </h2>
              <p className="text-sm text-muted mt-1">
                {gameStatus === "won"
                  ? `حليتها من ${toArabicNum(attempts)} محاولة`
                  : `الكلمة كانت: ${puzzle.word}`}
              </p>
            </div>

            {/* Word display */}
            <div className="flex items-center justify-center gap-2 bg-background rounded-2xl py-4 px-3">
              <span className="text-3xl font-black text-primary tracking-wider">
                {puzzle.word}
              </span>
              <span className="text-2xl">{puzzle.hint.match(/\p{Emoji_Presentation}/u)?.[0] || ""}</span>
            </div>

            {/* Attempts visualization */}
            <div className="flex justify-center gap-1.5">
              {Array.from({ length: MAX_ATTEMPTS }, (_, i) => {
                if (gameStatus === "won") {
                  return (
                    <div
                      key={i}
                      className={`w-8 h-3 rounded-full ${
                        i < attempts - 1 ? "bg-present" : i === attempts - 1 ? "bg-correct" : "bg-border"
                      }`}
                    />
                  );
                }
                return (
                  <div
                    key={i}
                    className={`w-8 h-3 rounded-full ${i < attempts ? "bg-present" : "bg-border"}`}
                  />
                );
              })}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "لعبت", value: stats.gamesPlayed },
                { label: "فزت", value: stats.gamesWon },
                { label: "السلسلة", value: stats.currentStreak },
                { label: "الأعلى", value: stats.maxStreak },
              ].map(({ label, value }) => (
                <div key={label} className="bg-background rounded-xl py-3 text-center">
                  <div className="text-lg font-black text-primary">{toArabicNum(value)}</div>
                  <div className="text-xs text-muted">{label}</div>
                </div>
              ))}
            </div>

            {/* Share */}
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

      {/* How to Play */}
      {showHowToPlay && (
        <HowToPlayKharbasha onClose={() => setShowHowToPlay(false)} />
      )}
    </div>
  );
}
