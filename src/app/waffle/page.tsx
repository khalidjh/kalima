"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { HelpCircle, Share2, RotateCcw } from "lucide-react";
import {
  getTodayWafflePuzzle,
  getWafflePuzzleNumber,
  isWaffleCell,
  getWaffleCellPositions,
} from "@/data/waffle";
import type { WafflePuzzle } from "@/data/waffle";
import {
  loadWaffleGameState,
  saveWaffleGameState,
  updateWaffleStatsOnWin,
  updateWaffleStatsOnLoss,
  calculateStars,
} from "@/lib/waffleState";
import type { WaffleGameState } from "@/lib/waffleState";
import HowToPlayWaffle from "@/components/HowToPlayWaffle";
import CountdownTimer from "@/components/CountdownTimer";
import { playTap, playSwap, playWin, playWrong } from "@/lib/sounds";

const MAX_SWAPS = 15;

/** Shuffle the letters in the grid (keeping correct-position letters in place sometimes for fairness) */
function shuffleGrid(solution: (string | null)[][]): (string | null)[][] {
  const positions = getWaffleCellPositions();
  const letters: string[] = [];
  const grid: (string | null)[][] = Array.from({ length: 5 }, () => Array(5).fill(null));

  // Collect all letters
  for (const [r, c] of positions) {
    letters.push(solution[r][c]!);
  }

  // Fisher-Yates shuffle
  const shuffled = [...letters];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Make sure it's not already solved
  let isSolved = true;
  for (let idx = 0; idx < positions.length; idx++) {
    const [r, c] = positions[idx];
    if (shuffled[idx] !== solution[r][c]) {
      isSolved = false;
      break;
    }
  }

  // If accidentally solved, swap first two non-matching
  if (isSolved && shuffled.length >= 2) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }

  // Place into grid
  for (let idx = 0; idx < positions.length; idx++) {
    const [r, c] = positions[idx];
    grid[r][c] = shuffled[idx];
  }

  return grid;
}

/** Get the color hint for a cell based on its current letter vs solution */
function getCellColor(
  grid: (string | null)[][],
  solution: (string | null)[][],
  row: number,
  col: number
): "correct" | "present" | "absent" {
  if (!isWaffleCell(row, col)) return "absent";

  const letter = grid[row][col];
  const target = solution[row][col];

  if (letter === target) return "correct";

  // Check if letter belongs in any word that passes through this cell
  // Get the words this cell belongs to
  const wordsLetters: string[] = [];

  // If in a full row (0, 2, 4), collect that row's solution letters
  if (row === 0 || row === 2 || row === 4) {
    for (let c = 0; c < 5; c++) {
      if (solution[row][c]) wordsLetters.push(solution[row][c]!);
    }
  }

  // If in a full column (0, 2, 4), collect that column's solution letters
  if (col === 0 || col === 2 || col === 4) {
    for (let r = 0; r < 5; r++) {
      if (isWaffleCell(r, col) && solution[r][col]) {
        wordsLetters.push(solution[r][col]!);
      }
    }
  }

  if (letter && wordsLetters.includes(letter)) return "present";
  return "absent";
}

/** Check if the grid matches the solution */
function checkSolved(grid: (string | null)[][], solution: (string | null)[][]): boolean {
  const positions = getWaffleCellPositions();
  for (const [r, c] of positions) {
    if (grid[r][c] !== solution[r][c]) return false;
  }
  return true;
}

/** Count minimum swaps needed (approximate) */
function countOptimalSwaps(grid: (string | null)[][], solution: (string | null)[][]): number {
  const positions = getWaffleCellPositions();
  let misplaced = 0;
  for (const [r, c] of positions) {
    if (grid[r][c] !== solution[r][c]) misplaced++;
  }
  // Each swap fixes at most 2 letters
  return Math.ceil(misplaced / 2);
}

export default function WafflePage() {
  const router = useRouter();
  const [puzzle, setPuzzle] = useState<WafflePuzzle | null>(null);
  const [gameState, setGameState] = useState<WaffleGameState | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [shakeCell, setShakeCell] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Initialize
  useEffect(() => {
    const p = getTodayWafflePuzzle();
    if (!p) return;
    setPuzzle(p);

    const saved = loadWaffleGameState();
    if (saved) {
      setGameState(saved);
      if (saved.gameStatus !== "playing") {
        setShowResult(true);
      }
    } else {
      // New game
      const shuffled = shuffleGrid(p.solution);
      const initialOptimal = countOptimalSwaps(shuffled, p.solution);
      const newState: WaffleGameState = {
        puzzleNumber: getWafflePuzzleNumber(),
        grid: shuffled,
        swaps: 0,
        maxSwaps: Math.max(MAX_SWAPS, initialOptimal + 10),
        gameStatus: "playing",
        selected: null,
      };
      setGameState(newState);
      saveWaffleGameState(newState);
      setShowHelp(true); // Show help on first play
    }
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (!gameState || !puzzle || gameState.gameStatus !== "playing") return;
      if (!isWaffleCell(row, col)) return;

      // If cell is already correct, don't allow selecting it
      if (gameState.grid[row][col] === puzzle.solution[row][col]) {
        setShakeCell(`${row}-${col}`);
        setTimeout(() => setShakeCell(null), 300);
        return;
      }

      if (!gameState.selected) {
        // Select first cell
        playTap();
        const updated = { ...gameState, selected: [row, col] as [number, number] };
        setGameState(updated);
        saveWaffleGameState(updated);
      } else {
        const [sr, sc] = gameState.selected;

        // Deselect if same cell
        if (sr === row && sc === col) {
          const updated = { ...gameState, selected: null };
          setGameState(updated);
          saveWaffleGameState(updated);
          return;
        }

        // Don't swap with a correct cell
        if (gameState.grid[sr][sc] === puzzle.solution[sr][sc]) {
          setShakeCell(`${sr}-${sc}`);
          setTimeout(() => setShakeCell(null), 300);
          const updated = { ...gameState, selected: [row, col] as [number, number] };
          setGameState(updated);
          saveWaffleGameState(updated);
          return;
        }

        // Swap!
        playSwap();
        const newGrid = gameState.grid.map((r) => [...r]);
        const temp = newGrid[sr][sc];
        newGrid[sr][sc] = newGrid[row][col];
        newGrid[row][col] = temp;

        const newSwaps = gameState.swaps + 1;
        const solved = checkSolved(newGrid, puzzle.solution);

        let newStatus: "playing" | "won" | "lost" = "playing";
        if (solved) {
          newStatus = "won";
        } else if (newSwaps >= gameState.maxSwaps) {
          newStatus = "lost";
        }

        const updated: WaffleGameState = {
          ...gameState,
          grid: newGrid,
          swaps: newSwaps,
          selected: null,
          gameStatus: newStatus,
        };

        setGameState(updated);
        saveWaffleGameState(updated);

        if (newStatus === "won") {
          playWin();
          const optimal = countOptimalSwaps(shuffleGrid(puzzle.solution), puzzle.solution);
          updateWaffleStatsOnWin(newSwaps, optimal);
          setTimeout(() => setShowResult(true), 500);
        } else if (newStatus === "lost") {
          playWrong();
          updateWaffleStatsOnLoss();
          setTimeout(() => setShowResult(true), 500);
        }
      }
    },
    [gameState, puzzle]
  );

  const stars = useMemo(() => {
    if (!gameState || gameState.gameStatus !== "won") return 0;
    return calculateStars(gameState.swaps, 10);
  }, [gameState]);

  const handleShare = useCallback(() => {
    if (!gameState || !puzzle) return;

    const puzzleNum = getWafflePuzzleNumber();
    const starEmoji = "⭐".repeat(stars);

    let gridEmoji = "";
    for (let r = 0; r < 5; r++) {
      let line = "";
      for (let c = 0; c < 5; c++) {
        if (!isWaffleCell(r, c)) {
          line += "  ";
          continue;
        }
        const color = getCellColor(
          gameState.gameStatus === "won" ? puzzle.solution : gameState.grid,
          puzzle.solution,
          r,
          c
        );
        if (gameState.gameStatus === "won") {
          line += "🟩";
        } else if (color === "correct") {
          line += "🟩";
        } else if (color === "present") {
          line += "🟧";
        } else {
          line += "⬛";
        }
      }
      gridEmoji += line + "\n";
    }

    const text = `وافل كلمة #${puzzleNum}\n${starEmoji} (${gameState.swaps}/${gameState.maxSwaps})\n\n${gridEmoji}\nkalima.fun/waffle`;

    if (navigator.share) {
      navigator.share({ text }).catch(() => {
        navigator.clipboard.writeText(text);
        showToast("تم النسخ!");
      });
    } else {
      navigator.clipboard.writeText(text);
      showToast("تم النسخ!");
    }
  }, [gameState, puzzle, stars, showToast]);

  if (!puzzle || !gameState) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const swapsRemaining = gameState.maxSwaps - gameState.swaps;

  return (
    <div className="h-full overflow-y-auto bg-background" dir="rtl">
      <div className="max-w-lg mx-auto px-4 pt-4 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push("/home")}
            className="text-muted hover:text-white transition-colors text-sm"
          >
            الرئيسية →
          </button>
          <h1 className="text-xl font-bold text-white">وافل</h1>
          <button
            onClick={() => setShowHelp(true)}
            className="text-muted hover:text-white transition-colors"
          >
            <HelpCircle size={20} />
          </button>
        </div>

        {/* Swap counter */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex items-center gap-2 bg-surface border border-border rounded-full px-4 py-2">
            <RotateCcw size={16} className="text-primary" />
            <span className="text-white font-semibold text-sm">
              {swapsRemaining}
            </span>
            <span className="text-muted text-xs">تبديلة متبقية</span>
          </div>
        </div>

        {/* Waffle Grid */}
        <div className="flex justify-center mb-6">
          <div className="grid grid-cols-5 gap-1.5" style={{ direction: "ltr" }}>
            {Array.from({ length: 5 }, (_, r) =>
              Array.from({ length: 5 }, (_, c) => {
                const isCell = isWaffleCell(r, c);
                if (!isCell) {
                  return <div key={`${r}-${c}`} className="w-12 h-12 sm:w-14 sm:h-14" />;
                }

                const letter = gameState.grid[r][c];
                const isSelected =
                  gameState.selected &&
                  gameState.selected[0] === r &&
                  gameState.selected[1] === c;
                const color = getCellColor(gameState.grid, puzzle.solution, r, c);
                const isShaking = shakeCell === `${r}-${c}`;
                const isCorrect = color === "correct";

                let bgClass = "bg-tile border-border";
                if (gameState.gameStatus === "won") {
                  bgClass = "bg-correct border-correct/50";
                } else if (color === "correct") {
                  bgClass = "bg-correct border-correct/50";
                } else if (color === "present") {
                  bgClass = "bg-present border-present/50";
                } else {
                  bgClass = "bg-absent border-absent/50";
                }

                if (isSelected) {
                  bgClass += " ring-2 ring-primary ring-offset-1 ring-offset-background";
                }

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    disabled={gameState.gameStatus !== "playing"}
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg border flex items-center justify-center text-xl font-bold text-white transition-all duration-200 ${bgClass} ${
                      isShaking ? "animate-shake" : ""
                    } ${
                      isCorrect && gameState.gameStatus === "playing"
                        ? "opacity-90"
                        : ""
                    } ${
                      gameState.gameStatus === "playing" && !isCorrect
                        ? "hover:scale-105 active:scale-95 cursor-pointer"
                        : ""
                    }`}
                  >
                    {letter}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Result overlay */}
        {showResult && (
          <div className="bg-surface border border-border rounded-2xl p-6 text-center mb-4">
            {gameState.gameStatus === "won" ? (
              <>
                <div className="text-3xl mb-2">
                  {"⭐".repeat(stars)}
                </div>
                <h2 className="text-xl font-bold text-white mb-1">أحسنت!</h2>
                <p className="text-muted text-sm mb-4">
                  حللت الوافل بـ {gameState.swaps} تبديلة
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-white mb-1">انتهت التبديلات!</h2>
                <p className="text-muted text-sm mb-4">
                  حاول مرة أخرى غدا
                </p>
              </>
            )}

            <div className="flex gap-3 justify-center mb-4">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-text font-bold text-sm hover:opacity-90 transition-opacity"
              >
                <Share2 size={16} />
                مشاركة
              </button>
              <button
                onClick={() => router.push("/home")}
                className="px-5 py-2.5 rounded-xl bg-surface border border-border text-white font-semibold text-sm hover:border-primary/50 transition-colors"
              >
                الرئيسية
              </button>
            </div>

            <CountdownTimer />
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-2 rounded-lg font-semibold text-sm shadow-lg z-50 animate-fade-in">
            {toast}
          </div>
        )}
      </div>

      <HowToPlayWaffle open={showHelp} onClose={() => setShowHelp(false)} />

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
