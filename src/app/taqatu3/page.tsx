"use client";

import { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  getDailyTaqatu3Puzzle,
  getTaqatu3PuzzleNumber,
  getTaqatu3PuzzleByNumber,
  CrosswordClue,
  CrosswordPuzzle,
} from "@/data/taqatu3";
import {
  loadTaqatu3GameState,
  saveTaqatu3GameState,
  loadArchiveTaqatu3GameState,
  saveArchiveTaqatu3GameState,
  updateTaqatu3StatsOnWin,
  loadTaqatu3Stats,
  Taqatu3Stats,
  Taqatu3GameState,
} from "@/lib/taqatu3State";
import { useAuth } from "@/lib/auth";
import { useIsPro } from "@/lib/subscription";
import { playTap, playCorrect, playDelete } from "@/lib/sounds";
import GameHeader from "@/components/GameHeader";
import HowToPlayTaqatu3 from "@/components/HowToPlayTaqatu3";
import CountdownTimer from "@/components/CountdownTimer";
import { HelpCircle, Share2, X } from "lucide-react";

// Arabic keyboard rows
const KB_ROW1 = ["ض", "ص", "ث", "ق", "ف", "غ", "ع", "ه", "خ", "ح", "ج", "د"];
const KB_ROW2 = ["ش", "س", "ي", "ب", "ل", "ا", "ت", "ن", "م", "ك", "ط"];
const KB_ROW3 = ["ذ", "ئ", "ء", "ؤ", "ر", "ى", "ة", "و", "ز", "ظ"];
const KB_ROW4 = ["إ", "أ", "آ"];

type Direction = "across" | "down";

interface CellPos {
  row: number;
  col: number;
}

function Taqatu3PageInner() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { isPro } = useIsPro(user);
  const archivePuzzleParam = searchParams.get("puzzle");
  const isArchiveMode = archivePuzzleParam !== null && isPro;
  const archivePuzzleNum = archivePuzzleParam ? parseInt(archivePuzzleParam, 10) : null;

  const puzzle: CrosswordPuzzle = useMemo(() => {
    if (isArchiveMode && archivePuzzleNum) return getTaqatu3PuzzleByNumber(archivePuzzleNum);
    return getDailyTaqatu3Puzzle();
  }, [isArchiveMode, archivePuzzleNum]);

  const puzzleNumber = isArchiveMode && archivePuzzleNum
    ? archivePuzzleNum
    : getTaqatu3PuzzleNumber();

  // Player grid: null = blocked, "" = empty, string = letter
  const [playerGrid, setPlayerGrid] = useState<(string | null)[][]>(() =>
    puzzle.grid.map(row => row.map(cell => (cell === null ? null : "")))
  );
  const [selectedCell, setSelectedCell] = useState<CellPos | null>(null);
  const [direction, setDirection] = useState<Direction>("across");
  const [completedWords, setCompletedWords] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState<"playing" | "won">("playing");
  const [startTime] = useState(() => Date.now());
  const [endTime, setEndTime] = useState<number | null>(null);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [stats, setStats] = useState<Taqatu3Stats>(loadTaqatu3Stats());
  const [copied, setCopied] = useState(false);

  // All clues combined for number lookup
  const allClues = useMemo(() => [...puzzle.acrossClues, ...puzzle.downClues], [puzzle]);

  // Build a map of cell -> clue number (for display in grid)
  const cellNumbers = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of allClues) {
      const key = `${c.row},${c.col}`;
      if (!map[key]) map[key] = c.number;
    }
    return map;
  }, [allClues]);

  // Find which clue a cell belongs to for current direction
  const getClueForCell = useCallback(
    (row: number, col: number, dir: Direction): CrosswordClue | null => {
      const clues = dir === "across" ? puzzle.acrossClues : puzzle.downClues;
      for (const clue of clues) {
        if (dir === "across") {
          if (row === clue.row && col >= clue.col && col < clue.col + clue.length) return clue;
        } else {
          if (col === clue.col && row >= clue.row && row < clue.row + clue.length) return clue;
        }
      }
      return null;
    },
    [puzzle]
  );

  // Get cells belonging to the current word
  const getCurrentWordCells = useCallback(
    (row: number, col: number, dir: Direction): CellPos[] => {
      const clue = getClueForCell(row, col, dir);
      if (!clue) return [];
      const cells: CellPos[] = [];
      for (let i = 0; i < clue.length; i++) {
        if (dir === "across") cells.push({ row: clue.row, col: clue.col + i });
        else cells.push({ row: clue.row + i, col: clue.col });
      }
      return cells;
    },
    [getClueForCell]
  );

  // Check if a word is complete and correct
  const checkWord = useCallback(
    (clue: CrosswordClue, dir: Direction, grid: (string | null)[][]): boolean => {
      let word = "";
      for (let i = 0; i < clue.length; i++) {
        const r = dir === "across" ? clue.row : clue.row + i;
        const c = dir === "across" ? clue.col + i : clue.col;
        const letter = grid[r][c];
        if (!letter) return false;
        word += letter;
      }
      return word === clue.answer;
    },
    []
  );

  // Save helper
  const saveFn = useCallback(
    (state: Taqatu3GameState) => {
      if (isArchiveMode) saveArchiveTaqatu3GameState(state);
      else saveTaqatu3GameState(state);
    },
    [isArchiveMode]
  );

  // Load saved state
  useEffect(() => {
    const saved = isArchiveMode && archivePuzzleNum
      ? loadArchiveTaqatu3GameState(archivePuzzleNum)
      : loadTaqatu3GameState();
    if (saved) {
      setPlayerGrid(saved.grid);
      setCompletedWords(saved.completedWords);
      setGameStatus(saved.gameStatus);
      if (saved.endTime) setEndTime(saved.endTime);
      if (saved.gameStatus === "won") {
        setTimeout(() => setShowResult(true), 500);
      }
    }
    setStats(loadTaqatu3Stats());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check all words after grid changes
  const recheckWords = useCallback(
    (grid: (string | null)[][]) => {
      const completed: string[] = [];
      for (const clue of puzzle.acrossClues) {
        if (checkWord(clue, "across", grid)) completed.push(`across-${clue.number}`);
      }
      for (const clue of puzzle.downClues) {
        if (checkWord(clue, "down", grid)) completed.push(`down-${clue.number}`);
      }
      return completed;
    },
    [puzzle, checkWord]
  );

  // Handle cell tap
  function handleCellTap(row: number, col: number) {
    if (gameStatus !== "playing") return;
    if (puzzle.grid[row][col] === null) return;
    playTap();

    if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
      // Toggle direction
      const newDir = direction === "across" ? "down" : "across";
      // Only toggle if the cell belongs to a word in the new direction
      const clue = getClueForCell(row, col, newDir);
      if (clue) setDirection(newDir);
    } else {
      setSelectedCell({ row, col });
      // Auto-pick direction: prefer current, but if cell only belongs to one direction, use that
      const ac = getClueForCell(row, col, "across");
      const dc = getClueForCell(row, col, "down");
      if (ac && !dc) setDirection("across");
      else if (!ac && dc) setDirection("down");
      // else keep current direction
    }
  }

  // Handle clue tap
  function handleClueTap(clue: CrosswordClue, dir: Direction) {
    if (gameStatus !== "playing") return;
    playTap();
    setDirection(dir);
    setSelectedCell({ row: clue.row, col: clue.col });
  }

  // Move to next cell in current direction
  function moveToNextCell(row: number, col: number, dir: Direction) {
    const clue = getClueForCell(row, col, dir);
    if (!clue) return;

    if (dir === "across") {
      const nextCol = col + 1;
      if (nextCol < clue.col + clue.length) {
        setSelectedCell({ row, col: nextCol });
      }
    } else {
      const nextRow = row + 1;
      if (nextRow < clue.row + clue.length) {
        setSelectedCell({ row: nextRow, col });
      }
    }
  }

  // Handle letter input
  function handleKey(letter: string) {
    if (gameStatus !== "playing" || !selectedCell) return;
    const { row, col } = selectedCell;
    if (puzzle.grid[row][col] === null) return;

    // Check if this cell is part of a completed word - don't allow editing
    const wordId = `across-${getClueForCell(row, col, "across")?.number}`;
    const wordIdD = `down-${getClueForCell(row, col, "down")?.number}`;
    if (completedWords.includes(wordId) && completedWords.includes(wordIdD)) return;

    const newGrid = playerGrid.map(r => [...r]);
    newGrid[row][col] = letter;
    setPlayerGrid(newGrid);

    // Check completed words
    const newCompleted = recheckWords(newGrid);
    const justCompleted = newCompleted.filter(w => !completedWords.includes(w));
    if (justCompleted.length > 0) playCorrect();
    setCompletedWords(newCompleted);

    // Check win
    const totalWords = puzzle.acrossClues.length + puzzle.downClues.length;
    if (newCompleted.length === totalWords) {
      const now = Date.now();
      setGameStatus("won");
      setEndTime(now);
      if (!isArchiveMode) {
        const newStats = updateTaqatu3StatsOnWin(now - startTime);
        setStats(newStats);
      }
      saveFn({
        puzzleNumber,
        grid: newGrid,
        completedWords: newCompleted,
        gameStatus: "won",
        startTime,
        endTime: now,
      });
      setTimeout(() => setShowResult(true), 800);
    } else {
      saveFn({
        puzzleNumber,
        grid: newGrid,
        completedWords: newCompleted,
        gameStatus: "playing",
        startTime,
        endTime: null,
      });
      moveToNextCell(row, col, direction);
    }
  }

  // Handle delete
  function handleDelete() {
    if (gameStatus !== "playing" || !selectedCell) return;
    const { row, col } = selectedCell;
    if (puzzle.grid[row][col] === null) return;
    playDelete();

    const newGrid = playerGrid.map(r => [...r]);
    if (newGrid[row][col] === "") {
      // Move back
      const clue = getClueForCell(row, col, direction);
      if (clue) {
        if (direction === "across" && col > clue.col) {
          setSelectedCell({ row, col: col - 1 });
          newGrid[row][col - 1] = "";
        } else if (direction === "down" && row > clue.row) {
          setSelectedCell({ row: row - 1, col });
          newGrid[row - 1][col] = "";
        }
      }
    } else {
      newGrid[row][col] = "";
    }
    setPlayerGrid(newGrid);
    const newCompleted = recheckWords(newGrid);
    setCompletedWords(newCompleted);
    saveFn({
      puzzleNumber,
      grid: newGrid,
      completedWords: newCompleted,
      gameStatus: "playing",
      startTime,
      endTime: null,
    });
  }

  // Current word cells for highlighting
  const currentWordCells = useMemo(() => {
    if (!selectedCell) return [];
    return getCurrentWordCells(selectedCell.row, selectedCell.col, direction);
  }, [selectedCell, direction, getCurrentWordCells]);

  const currentWordCellSet = useMemo(() => {
    return new Set(currentWordCells.map(c => `${c.row},${c.col}`));
  }, [currentWordCells]);

  // Current active clue
  const activeClue = useMemo(() => {
    if (!selectedCell) return null;
    return getClueForCell(selectedCell.row, selectedCell.col, direction);
  }, [selectedCell, direction, getClueForCell]);

  // Format solve time
  function formatTime(ms: number): string {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  // Share result
  function handleShare() {
    const solveTime = endTime ? formatTime(endTime - startTime) : "--:--";
    const lines: string[] = [];
    lines.push(`كلمات متقاطعة #${puzzleNumber}`);
    lines.push(`الوقت: ${solveTime}`);
    lines.push("");

    // Emoji grid
    for (let r = 0; r < 5; r++) {
      let row = "";
      for (let c = 0; c < 5; c++) {
        if (puzzle.grid[r][c] === null) row += "⬛";
        else row += "🟩";
      }
      lines.push(row);
    }
    lines.push("");
    lines.push("kalima.fun/taqatu3");

    const text = lines.join("\n");
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
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
            <span className="text-sm font-bold text-white">#{puzzleNumber}</span>
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

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-4 flex flex-col gap-4">

          {/* Active clue display */}
          <div className="bg-surface border border-border rounded-xl px-4 py-2.5 min-h-[44px] flex items-center">
            {activeClue ? (
              <p className="text-sm text-white">
                <span className="text-primary font-bold ml-2">
                  {activeClue.number} {direction === "across" ? "أفقي" : "عمودي"}
                </span>
                {activeClue.clue}
              </p>
            ) : (
              <p className="text-sm text-muted">اضغط على خلية للبدء</p>
            )}
          </div>

          {/* 5x5 Grid */}
          <div className="flex justify-center">
            <div className="grid grid-cols-5 gap-[2px] w-full max-w-[300px] aspect-square">
              {puzzle.grid.map((row, r) =>
                row.map((cell, c) => {
                  if (cell === null) {
                    return (
                      <div
                        key={`${r}-${c}`}
                        className="bg-[#1a1a1a] rounded-sm"
                      />
                    );
                  }

                  const isSelected = selectedCell?.row === r && selectedCell?.col === c;
                  const isInWord = currentWordCellSet.has(`${r},${c}`);
                  const cellNum = cellNumbers[`${r},${c}`];
                  const playerLetter = playerGrid[r][c] || "";

                  // Check if this cell is part of any completed word
                  const acrossClue = getClueForCell(r, c, "across");
                  const downClue = getClueForCell(r, c, "down");
                  const isAcrossComplete = acrossClue && completedWords.includes(`across-${acrossClue.number}`);
                  const isDownComplete = downClue && completedWords.includes(`down-${downClue.number}`);
                  const isComplete = isAcrossComplete && isDownComplete;
                  const isPartialComplete = isAcrossComplete || isDownComplete;

                  let bgClass = "bg-surface border border-border";
                  if (isComplete) {
                    bgClass = "bg-correct/30 border border-correct/50";
                  } else if (isPartialComplete) {
                    bgClass = "bg-correct/15 border border-correct/30";
                  } else if (isSelected) {
                    bgClass = "bg-primary/25 border-2 border-primary";
                  } else if (isInWord) {
                    bgClass = "bg-primary/10 border border-primary/30";
                  }

                  return (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => handleCellTap(r, c)}
                      className={`${bgClass} rounded-sm relative flex items-center justify-center transition-colors`}
                    >
                      {cellNum && (
                        <span className="absolute top-0.5 right-1 text-[8px] text-muted font-bold leading-none">
                          {cellNum}
                        </span>
                      )}
                      <span className={`text-lg font-bold ${isComplete ? "text-correct" : "text-white"}`}>
                        {playerLetter}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Clue lists */}
          <div className="grid grid-cols-2 gap-3">
            {/* Across */}
            <div>
              <h3 className="text-xs font-bold text-primary mb-2">أفقي</h3>
              <div className="space-y-1">
                {puzzle.acrossClues.map((clue) => {
                  const isDone = completedWords.includes(`across-${clue.number}`);
                  const isActive = activeClue?.number === clue.number && direction === "across";
                  return (
                    <button
                      key={`a-${clue.number}`}
                      onClick={() => handleClueTap(clue, "across")}
                      className={`w-full text-right px-2 py-1.5 rounded-lg text-xs transition-colors ${
                        isDone
                          ? "text-correct/70 line-through"
                          : isActive
                          ? "bg-primary/15 text-white"
                          : "text-muted hover:text-white"
                      }`}
                    >
                      <span className="font-bold ml-1">{clue.number}.</span>
                      {clue.clue}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Down */}
            <div>
              <h3 className="text-xs font-bold text-primary mb-2">عمودي</h3>
              <div className="space-y-1">
                {puzzle.downClues.map((clue) => {
                  const isDone = completedWords.includes(`down-${clue.number}`);
                  const isActive = activeClue?.number === clue.number && direction === "down";
                  return (
                    <button
                      key={`d-${clue.number}`}
                      onClick={() => handleClueTap(clue, "down")}
                      className={`w-full text-right px-2 py-1.5 rounded-lg text-xs transition-colors ${
                        isDone
                          ? "text-correct/70 line-through"
                          : isActive
                          ? "bg-primary/15 text-white"
                          : "text-muted hover:text-white"
                      }`}
                    >
                      <span className="font-bold ml-1">{clue.number}.</span>
                      {clue.clue}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Show result button if game won */}
          {gameStatus === "won" && (
            <button
              onClick={() => setShowResult(true)}
              className="py-3 rounded-xl bg-primary text-[#0F0C00] font-bold text-sm hover:bg-[#FFD740] transition-colors"
            >
              عرض النتيجة
            </button>
          )}
        </div>
      </div>

      {/* Keyboard - fixed at bottom */}
      {gameStatus === "playing" && (
        <div className="flex-shrink-0 border-t border-border bg-background px-1 pt-1 pb-safe">
          <div className="max-w-[480px] mx-auto" dir="rtl">
            {/* Row 1 */}
            <div className="grid gap-[3px] mb-[3px]" style={{ gridTemplateColumns: `repeat(${KB_ROW1.length}, 1fr)` }}>
              {KB_ROW1.map((l) => (
                <button
                  key={l}
                  onPointerDown={(e) => { e.preventDefault(); handleKey(l); }}
                  className="h-10 sm:h-12 w-full rounded bg-surface text-[#FFF8DC] text-sm font-bold select-none touch-manipulation"
                >
                  {l}
                </button>
              ))}
            </div>
            {/* Row 2 */}
            <div className="grid gap-[3px] mb-[3px] px-[2%]" style={{ gridTemplateColumns: `repeat(${KB_ROW2.length}, 1fr)` }}>
              {KB_ROW2.map((l) => (
                <button
                  key={l}
                  onPointerDown={(e) => { e.preventDefault(); handleKey(l); }}
                  className="h-10 sm:h-12 w-full rounded bg-surface text-[#FFF8DC] text-sm font-bold select-none touch-manipulation"
                >
                  {l}
                </button>
              ))}
            </div>
            {/* Row 3 with delete */}
            <div className="grid gap-[3px] mb-[3px]" style={{ gridTemplateColumns: `repeat(${KB_ROW3.length}, 1fr) 1.4fr` }}>
              {KB_ROW3.map((l) => (
                <button
                  key={l}
                  onPointerDown={(e) => { e.preventDefault(); handleKey(l); }}
                  className="h-10 sm:h-12 w-full rounded bg-surface text-[#FFF8DC] text-sm font-bold select-none touch-manipulation"
                >
                  {l}
                </button>
              ))}
              <button
                onPointerDown={(e) => { e.preventDefault(); handleDelete(); }}
                className="h-10 sm:h-12 rounded bg-surface border border-border text-muted text-xs font-bold select-none touch-manipulation hover:text-white hover:border-white/30 transition-colors"
              >
                ⌫
              </button>
            </div>
            {/* Row 4 */}
            <div className="grid gap-[3px] px-[30%]" style={{ gridTemplateColumns: `repeat(${KB_ROW4.length}, 1fr)` }}>
              {KB_ROW4.map((l) => (
                <button
                  key={l}
                  onPointerDown={(e) => { e.preventDefault(); handleKey(l); }}
                  className="h-10 sm:h-12 w-full rounded bg-surface text-[#FFF8DC] text-sm font-bold select-none touch-manipulation"
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResult && gameStatus === "won" && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center"
          onClick={() => setShowResult(false)}
        >
          <div
            className="bg-surface rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 text-white relative"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <button
              onClick={() => setShowResult(false)}
              className="absolute top-4 left-4 text-muted hover:text-white transition-colors"
            >
              <X size={22} strokeWidth={1.5} />
            </button>

            <h2 className="text-xl font-extrabold text-center mb-2">احسنت!</h2>
            <p className="text-sm text-muted text-center mb-6">
              حللت كلمات متقاطعة #{puzzleNumber}
            </p>

            {/* Solve time */}
            {endTime && (
              <div className="bg-background rounded-xl p-4 mb-4 text-center">
                <p className="text-xs text-muted mb-1">الوقت</p>
                <p className="text-2xl font-bold text-primary tabular-nums" dir="ltr">
                  {formatTime(endTime - startTime)}
                </p>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-background rounded-xl p-3 text-center">
                <p className="text-lg font-extrabold text-white">{stats.gamesWon}</p>
                <p className="text-[10px] text-muted">انتصارات</p>
              </div>
              <div className="bg-background rounded-xl p-3 text-center">
                <p className="text-lg font-extrabold text-white">{stats.currentStreak}</p>
                <p className="text-[10px] text-muted">سلسلة حالية</p>
              </div>
              <div className="bg-background rounded-xl p-3 text-center">
                <p className="text-lg font-extrabold text-white">
                  {stats.bestTime ? formatTime(stats.bestTime) : "--"}
                </p>
                <p className="text-[10px] text-muted">أفضل وقت</p>
              </div>
            </div>

            {/* Countdown */}
            {!isArchiveMode && <CountdownTimer className="mb-6" />}

            {/* Share button */}
            <button
              onClick={handleShare}
              className="w-full py-3 rounded-xl bg-primary text-[#0A0A0A] font-extrabold text-base flex items-center justify-center gap-2"
            >
              <Share2 size={18} />
              {copied ? "تم النسخ!" : "مشاركة النتيجة"}
            </button>
          </div>
        </div>
      )}

      {showHowToPlay && (
        <HowToPlayTaqatu3 onClose={() => setShowHowToPlay(false)} />
      )}
    </div>
  );
}

export default function Taqatu3Page() {
  return (
    <Suspense
      fallback={
        <div className="h-full bg-background flex items-center justify-center">
          <div className="text-white text-2xl font-bold">كلمات متقاطعة</div>
        </div>
      }
    >
      <Taqatu3PageInner />
    </Suspense>
  );
}
