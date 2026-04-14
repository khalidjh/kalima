"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";

// ─── Helpers ────────────────────────────────────────────────────────────────

function toArabic(n: number): string {
  const digits = "٠١٢٣٤٥٦٧٨٩";
  return String(n)
    .split("")
    .map((d) => digits[parseInt(d)])
    .join("");
}

// ─── Tile colors ────────────────────────────────────────────────────────────

const TILE_COLORS: Record<number, { bg: string; text: string }> = {
  2: { bg: "#EDE4DA", text: "#776E65" },
  4: { bg: "#EDE0C8", text: "#776E65" },
  8: { bg: "#F2B179", text: "#FFFFFF" },
  16: { bg: "#F59563", text: "#FFFFFF" },
  32: { bg: "#F67C5F", text: "#FFFFFF" },
  64: { bg: "#F65E3B", text: "#FFFFFF" },
  128: { bg: "#EDCF72", text: "#FFFFFF" },
  256: { bg: "#EDCC61", text: "#FFFFFF" },
  512: { bg: "#EDC850", text: "#FFFFFF" },
  1024: { bg: "#EDC53F", text: "#FFFFFF" },
  2048: { bg: "#EDC22E", text: "#FFFFFF" },
};

function getTileStyle(value: number) {
  return TILE_COLORS[value] || { bg: "#3C3A32", text: "#FFFFFF" };
}

function getTileFontSize(value: number): string {
  if (value >= 1024) return "text-lg";
  if (value >= 128) return "text-xl";
  return "text-2xl";
}

// ─── Game types ─────────────────────────────────────────────────────────────

interface Tile {
  id: number;
  value: number;
  row: number;
  col: number;
  isNew?: boolean;
  isMerged?: boolean;
}

type Grid = (Tile | null)[][];
type Direction = "up" | "down" | "left" | "right";

// ─── Storage ────────────────────────────────────────────────────────────────

const BEST_SCORE_KEY = "kids-2048-best";
const GAME_STATE_KEY = "kids-2048-state";

function loadBestScore(): number {
  try {
    return parseInt(localStorage.getItem(BEST_SCORE_KEY) || "0", 10) || 0;
  } catch {
    return 0;
  }
}

function saveBestScore(score: number) {
  localStorage.setItem(BEST_SCORE_KEY, String(score));
}

// ─── Game logic ─────────────────────────────────────────────────────────────

let nextTileId = 1;

function createEmptyGrid(): Grid {
  return Array.from({ length: 4 }, () => Array(4).fill(null));
}

function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => row.map((tile) => (tile ? { ...tile } : null)));
}

function getEmptyCells(grid: Grid): [number, number][] {
  const cells: [number, number][] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (!grid[r][c]) cells.push([r, c]);
    }
  }
  return cells;
}

function addRandomTile(grid: Grid): Grid {
  const empty = getEmptyCells(grid);
  if (empty.length === 0) return grid;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  const newGrid = cloneGrid(grid);
  newGrid[r][c] = { id: nextTileId++, value, row: r, col: c, isNew: true };
  return newGrid;
}

function initializeGrid(): Grid {
  let grid = createEmptyGrid();
  grid = addRandomTile(grid);
  grid = addRandomTile(grid);
  return grid;
}

interface MoveResult {
  grid: Grid;
  score: number;
  moved: boolean;
}

function move(grid: Grid, direction: Direction): MoveResult {
  const newGrid = createEmptyGrid();
  let scoreGain = 0;
  let moved = false;

  // Clear animation flags
  const cleanGrid = cloneGrid(grid);
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (cleanGrid[r][c]) {
        cleanGrid[r][c]!.isNew = false;
        cleanGrid[r][c]!.isMerged = false;
      }
    }
  }

  const isVertical = direction === "up" || direction === "down";
  const isReverse = direction === "down" || direction === "right";

  for (let i = 0; i < 4; i++) {
    // Collect tiles in this row/column
    const tiles: Tile[] = [];
    for (let j = 0; j < 4; j++) {
      const r = isVertical ? j : i;
      const c = isVertical ? i : j;
      if (cleanGrid[r][c]) tiles.push({ ...cleanGrid[r][c]! });
    }

    if (isReverse) tiles.reverse();

    // Merge logic
    const merged: Tile[] = [];
    let skip = false;
    for (let t = 0; t < tiles.length; t++) {
      if (skip) {
        skip = false;
        continue;
      }
      if (t + 1 < tiles.length && tiles[t].value === tiles[t + 1].value) {
        const newValue = tiles[t].value * 2;
        merged.push({
          id: nextTileId++,
          value: newValue,
          row: 0,
          col: 0,
          isMerged: true,
        });
        scoreGain += newValue;
        skip = true;
      } else {
        merged.push({ ...tiles[t] });
      }
    }

    if (isReverse) merged.reverse();

    // Place tiles
    const startIdx = isReverse ? 3 - merged.length + 1 : 0;
    for (let m = 0; m < merged.length; m++) {
      const pos = isReverse ? 3 - (merged.length - 1 - m) : m;
      const r = isVertical ? pos : i;
      const c = isVertical ? i : pos;
      merged[m].row = r;
      merged[m].col = c;
      newGrid[r][c] = merged[m];
    }
  }

  // Check if anything moved
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const oldVal = cleanGrid[r][c]?.value || 0;
      const newVal = newGrid[r][c]?.value || 0;
      if (oldVal !== newVal) {
        moved = true;
        break;
      }
    }
    if (moved) break;
  }

  return { grid: newGrid, score: scoreGain, moved };
}

function canMove(grid: Grid): boolean {
  // Check for empty cells
  if (getEmptyCells(grid).length > 0) return true;
  // Check for adjacent matches
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const val = grid[r][c]?.value;
      if (r < 3 && grid[r + 1][c]?.value === val) return true;
      if (c < 3 && grid[r][c + 1]?.value === val) return true;
    }
  }
  return false;
}

function hasWon(grid: Grid): boolean {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c]?.value === 2048) return true;
    }
  }
  return false;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function Game2048Page() {
  const [grid, setGrid] = useState<Grid>(() => createEmptyGrid());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [wonAcknowledged, setWonAcknowledged] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Initialize
  useEffect(() => {
    setBestScore(loadBestScore());
    setGrid(initializeGrid());
    setInitialized(true);
  }, []);

  const handleMove = useCallback(
    (direction: Direction) => {
      if (gameOver || (won && !wonAcknowledged)) return;

      setGrid((prevGrid) => {
        const result = move(prevGrid, direction);
        if (!result.moved) return prevGrid;

        const newScore = score + result.score;
        setScore(newScore);

        if (newScore > bestScore) {
          setBestScore(newScore);
          saveBestScore(newScore);
        }

        const gridWithNew = addRandomTile(result.grid);

        if (hasWon(gridWithNew) && !won) {
          setWon(true);
        }

        if (!canMove(gridWithNew)) {
          setGameOver(true);
          // Save stars for homepage
          const stars = newScore >= 5000 ? 3 : newScore >= 2000 ? 2 : newScore >= 500 ? 1 : 0;
          localStorage.setItem("kids-2048-stars", String(stars));
        }

        return gridWithNew;
      });
    },
    [gameOver, won, wonAcknowledged, score, bestScore]
  );

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const map: Record<string, Direction> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "right", // RTL: left arrow moves right
        ArrowRight: "left", // RTL: right arrow moves left
      };
      const dir = map[e.key];
      if (dir) {
        e.preventDefault();
        handleMove(dir);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleMove]);

  // Touch/swipe controls
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      touchStartRef.current = null;

      const minSwipe = 30;
      if (Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe) return;

      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swipe (RTL adjusted)
        handleMove(dx > 0 ? "right" : "left");
      } else {
        handleMove(dy > 0 ? "down" : "up");
      }
    },
    [handleMove]
  );

  const newGame = useCallback(() => {
    nextTileId = 1;
    setGrid(initializeGrid());
    setScore(0);
    setGameOver(false);
    setWon(false);
    setWonAcknowledged(false);
  }, []);

  if (!initialized) return null;

  return (
    <div className="h-[calc(100dvh-96px)] flex flex-col items-center px-4" dir="rtl">
      {/* Header */}
      <div className="w-full max-w-[400px] flex items-center justify-between pt-3 pb-2">
        <Link
          href="/kids"
          className="flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full"
          style={{ background: "#FFE0E0", color: "#C92A2A", border: "2px solid #FF6B6B" }}
        >
          <span>←</span>
          <span>رجوع</span>
        </Link>
        <h1 className="text-2xl font-black" style={{ color: "#2D3436" }}>
          ٢٠٤٨ عربي
        </h1>
      </div>

      {/* Scores */}
      <div className="w-full max-w-[400px] flex gap-3 mb-3">
        <div
          className="flex-1 text-center py-2 rounded-xl"
          style={{ background: "#BBADA0", color: "white" }}
        >
          <div className="text-xs font-medium opacity-80">النقاط</div>
          <div className="text-lg font-black">{toArabic(score)}</div>
        </div>
        <div
          className="flex-1 text-center py-2 rounded-xl"
          style={{ background: "#BBADA0", color: "white" }}
        >
          <div className="text-xs font-medium opacity-80">الأفضل</div>
          <div className="text-lg font-black">{toArabic(bestScore)}</div>
        </div>
        <button
          onClick={newGame}
          className="px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95"
          style={{ background: "#FF6B6B", color: "white", border: "2px solid #C92A2A" }}
        >
          لعبة جديدة
        </button>
      </div>

      {/* Grid */}
      <div
        ref={gridRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="w-full max-w-[400px] aspect-square rounded-xl p-2 relative select-none"
        style={{ background: "#BBADA0" }}
      >
        {/* Empty cells background */}
        <div className="grid grid-cols-4 gap-2 w-full h-full">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg"
              style={{ background: "#CDC1B4" }}
            />
          ))}
        </div>

        {/* Tiles overlay */}
        <div className="absolute inset-2">
          {grid.flat().map((tile) => {
            if (!tile) return null;
            const style = getTileStyle(tile.value);
            const cellSize = 25; // percentage
            const gapAdjust = 0.5; // percentage for gaps

            return (
              <div
                key={tile.id}
                className={`absolute flex items-center justify-center rounded-lg font-black transition-all duration-150 ${getTileFontSize(tile.value)}`}
                style={{
                  width: `calc(${cellSize}% - 4px)`,
                  height: `calc(${cellSize}% - 4px)`,
                  top: `calc(${tile.row * cellSize}% + 2px + ${tile.row * gapAdjust}%)`,
                  left: `calc(${tile.col * cellSize}% + 2px + ${tile.col * gapAdjust}%)`,
                  background: style.bg,
                  color: style.text,
                  zIndex: tile.isMerged ? 2 : 1,
                  animation: tile.isNew
                    ? "tile-pop 0.2s ease-out"
                    : tile.isMerged
                    ? "tile-merge 0.2s ease-out"
                    : undefined,
                }}
              >
                {toArabic(tile.value)}
              </div>
            );
          })}
        </div>

        {/* Win overlay */}
        {won && !wonAcknowledged && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-xl z-10"
            style={{ background: "rgba(237,194,46,0.85)" }}
          >
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-3xl font-black text-white mb-2">وصلت ٢٠٤٨!</h2>
            <p className="text-white/90 text-sm mb-4">ممتاز! تقدر تكمل اللعب</p>
            <button
              onClick={() => setWonAcknowledged(true)}
              className="px-6 py-2 rounded-full font-bold text-sm transition-all active:scale-95"
              style={{ background: "white", color: "#E67700" }}
            >
              أكمل اللعب
            </button>
          </div>
        )}

        {/* Game over overlay */}
        {gameOver && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-xl z-10"
            style={{ background: "rgba(238,228,218,0.9)" }}
          >
            <h2 className="text-3xl font-black mb-2" style={{ color: "#776E65" }}>
              انتهت اللعبة!
            </h2>
            <p className="text-lg font-bold mb-4" style={{ color: "#776E65" }}>
              {toArabic(score)} نقطة
            </p>
            <button
              onClick={newGame}
              className="px-6 py-2 rounded-full font-bold text-sm transition-all active:scale-95"
              style={{ background: "#FF6B6B", color: "white" }}
            >
              حاول مرة أخرى
            </button>
          </div>
        )}
      </div>

      {/* Arrow buttons */}
      <div className="mt-4 flex flex-col items-center gap-2">
        <button
          onClick={() => handleMove("up")}
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all active:scale-90"
          style={{ background: "#BBADA0", color: "white" }}
        >
          ▲
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => handleMove("right")}
            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all active:scale-90"
            style={{ background: "#BBADA0", color: "white" }}
          >
            ▶
          </button>
          <button
            onClick={() => handleMove("down")}
            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all active:scale-90"
            style={{ background: "#BBADA0", color: "white" }}
          >
            ▼
          </button>
          <button
            onClick={() => handleMove("left")}
            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all active:scale-90"
            style={{ background: "#BBADA0", color: "white" }}
          >
            ◀
          </button>
        </div>
      </div>

      {/* Tile animations */}
      <style>{`
        @keyframes tile-pop {
          0% { transform: scale(0); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        @keyframes tile-merge {
          0% { transform: scale(1); }
          30% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
