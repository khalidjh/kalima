"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

/* ─── Types ─── */
interface Cell {
  [key: string]: boolean;
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
  visited: boolean;
}

interface LevelConfig {
  label: string;
  size: number;
  stars: number;
  unlocked: boolean;
}

interface GameState {
  maze: Cell[][];
  playerRow: number;
  playerCol: number;
  moves: number;
  startTime: number;
  elapsed: number;
  won: boolean;
  trail: Set<string>;
  optimalLength: number;
}

const STORAGE_KEY = "sparks_mataha_progress";

const LEVEL_CONFIGS: { label: string; size: number }[] = [
  { label: "سهل", size: 5 },
  { label: "متوسط", size: 7 },
  { label: "صعب", size: 9 },
  { label: "خبير", size: 11 },
];

/* ─── Maze generation (recursive backtracking) ─── */
function generateMaze(rows: number, cols: number): { maze: Cell[][]; optimalLength: number } {
  const maze: Cell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      top: true,
      right: true,
      bottom: true,
      left: true,
      visited: false,
    }))
  );

  const stack: [number, number][] = [];
  const directions: [number, number, string, string][] = [
    [-1, 0, "top", "bottom"],
    [0, 1, "right", "left"],
    [1, 0, "bottom", "top"],
    [0, -1, "left", "right"],
  ];

  function carve(r: number, c: number) {
    maze[r][c].visited = true;
    stack.push([r, c]);

    while (stack.length > 0) {
      const [cr, cc] = stack[stack.length - 1];
      const neighbors: [number, number, string, string][] = [];

      for (const [dr, dc, wall, opposite] of directions) {
        const nr = cr + dr;
        const nc = cc + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !maze[nr][nc].visited) {
          neighbors.push([nr, nc, wall, opposite]);
        }
      }

      if (neighbors.length === 0) {
        stack.pop();
      } else {
        const [nr, nc, wall, opposite] = neighbors[Math.floor(Math.random() * neighbors.length)];
        (maze[cr][cc] as Record<string, boolean>)[wall] = false;
        (maze[nr][nc] as Record<string, boolean>)[opposite] = false;
        maze[nr][nc].visited = true;
        stack.push([nr, nc]);
      }
    }
  }

  carve(0, 0);

  // Reset visited flags
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      maze[r][c].visited = false;
    }
  }

  // BFS to find optimal path length
  const optimalLength = bfs(maze, rows, cols);

  return { maze, optimalLength };
}

function bfs(maze: Cell[][], rows: number, cols: number): number {
  const queue: [number, number, number][] = [[0, 0, 0]];
  const visited = new Set<string>();
  visited.add("0,0");

  const moves: [number, number, keyof Cell][] = [
    [-1, 0, "top"],
    [0, 1, "right"],
    [1, 0, "bottom"],
    [0, -1, "left"],
  ];

  while (queue.length > 0) {
    const [r, c, dist] = queue.shift()!;
    if (r === rows - 1 && c === cols - 1) return dist;

    for (const [dr, dc, wall] of moves) {
      const nr = r + dr;
      const nc = c + dc;
      const key = `${nr},${nc}`;
      if (
        nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
        !visited.has(key) &&
        !maze[r][c][wall]
      ) {
        visited.add(key);
        queue.push([nr, nc, dist + 1]);
      }
    }
  }

  return rows * cols; // fallback
}

/* ─── Stars calculation ─── */
function calcStars(moves: number, optimal: number): number {
  const ratio = moves / optimal;
  if (ratio <= 1.2) return 3;
  if (ratio <= 1.8) return 2;
  return 1;
}

function formatTime(ms: number): string {
  const secs = Math.floor(ms / 1000);
  const mins = Math.floor(secs / 60);
  const s = secs % 60;
  return `${mins}:${s.toString().padStart(2, "0")}`;
}

/* ─── Level Select Screen ─── */
function LevelSelect({
  progress,
  onSelect,
}: {
  progress: { level: number; stars: number[] };
  onSelect: (level: number) => void;
}) {
  const levels: LevelConfig[] = LEVEL_CONFIGS.map((cfg, i) => ({
    ...cfg,
    stars: progress.stars[i] || 0,
    unlocked: i === 0 || (progress.stars[i - 1] || 0) > 0,
  }));

  return (
    <div className="max-w-lg mx-auto px-5 pt-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/kalimat"
          className="flex items-center gap-1.5 text-sm font-bold px-3 py-2 rounded-xl transition-all hover:scale-105"
          style={{ color: "#FF922B", background: "#FF922B18" }}
        >
          <span>←</span>
          <span>رجوع</span>
        </Link>
        <h1 className="text-2xl font-black" style={{ color: "#2D3436" }}>
          متاهة 🏰
        </h1>
      </div>

      {/* Description */}
      <p className="text-center text-sm font-medium mb-8" style={{ color: "#636E72" }}>
        اوصل من البداية للنهاية عبر المتاهة!
      </p>

      {/* Level cards */}
      <div className="flex flex-col gap-4">
        {levels.map((level, i) => (
          <button
            key={i}
            onClick={() => level.unlocked && onSelect(i)}
            disabled={!level.unlocked}
            className="relative rounded-3xl overflow-hidden transition-all duration-200 text-right"
            style={{
              background: level.unlocked
                ? "linear-gradient(135deg, #FFF8F0 0%, #FFE8D0 100%)"
                : "#F0F0F0",
              boxShadow: level.unlocked
                ? "0 4px 20px rgba(255,146,43,0.15), 0 1px 4px rgba(0,0,0,0.06)"
                : "none",
              opacity: level.unlocked ? 1 : 0.5,
              animation: `bounce-in 0.5s ease-out ${i * 0.1}s both`,
            }}
          >
            {/* Accent stripe */}
            <div
              className="absolute top-0 right-0 w-1.5 h-full rounded-r-3xl"
              style={{ background: level.unlocked ? "#FF922B" : "#CCC" }}
            />

            <div className="flex items-center gap-4 p-5 pr-6">
              {/* Level number */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black flex-shrink-0"
                style={{
                  background: level.unlocked ? "#FF922B18" : "#E0E0E0",
                  border: level.unlocked ? "2px solid #FF922B30" : "2px solid #CCC",
                  color: level.unlocked ? "#FF922B" : "#999",
                }}
              >
                {level.unlocked ? (
                  <span>{LEVEL_CONFIGS[i].size}x{LEVEL_CONFIGS[i].size}</span>
                ) : (
                  <span className="text-3xl">🔒</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h2 className="text-xl font-black mb-1" style={{ color: level.unlocked ? "#2D3436" : "#999" }}>
                  المستوى {i + 1}
                </h2>
                <p className="text-sm font-medium" style={{ color: level.unlocked ? "#636E72" : "#BBB" }}>
                  {level.label}
                </p>
                {/* Stars display */}
                <div className="flex gap-1 mt-2" dir="ltr">
                  {[1, 2, 3].map((s) => (
                    <span
                      key={s}
                      className="text-lg"
                      style={{ opacity: s <= (progress.stars[i] || 0) ? 1 : 0.2 }}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              </div>

              {/* Play arrow */}
              {level.unlocked && (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "#FF922B15", color: "#FF922B" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Win Screen ─── */
function WinScreen({
  moves,
  elapsed,
  stars,
  level,
  onNext,
  onReplay,
  onHome,
  hasNext,
}: {
  moves: number;
  elapsed: number;
  stars: number;
  level: number;
  onNext: () => void;
  onReplay: () => void;
  onHome: () => void;
  hasNext: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div
        className="bg-white rounded-3xl p-8 mx-6 max-w-sm w-full text-center"
        style={{ animation: "bounce-in 0.4s ease-out both" }}
      >
        <div className="text-5xl mb-3" style={{ animation: "wiggle 2s ease-in-out infinite" }}>
          🎉
        </div>
        <h2 className="text-2xl font-black mb-2" style={{ color: "#2D3436" }}>
          أحسنت!
        </h2>
        <p className="text-sm font-medium mb-4" style={{ color: "#636E72" }}>
          وصلت للنهاية!
        </p>

        {/* Stars */}
        <div className="flex justify-center gap-2 mb-4" dir="ltr">
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              className="text-3xl"
              style={{
                opacity: s <= stars ? 1 : 0.2,
                animation: s <= stars ? `bounce-in 0.4s ease-out ${s * 0.15}s both` : "none",
              }}
            >
              ⭐
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-6 mb-6">
          <div>
            <div className="text-2xl font-black" style={{ color: "#FF922B" }}>{moves}</div>
            <div className="text-xs font-medium" style={{ color: "#636E72" }}>خطوة</div>
          </div>
          <div>
            <div className="text-2xl font-black" style={{ color: "#4A90D9" }}>{formatTime(elapsed)}</div>
            <div className="text-xs font-medium" style={{ color: "#636E72" }}>الوقت</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          {hasNext && (
            <button
              onClick={onNext}
              className="w-full py-3 rounded-2xl text-white font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #FF922B, #FF6B6B)" }}
            >
              المستوى التالي
            </button>
          )}
          <button
            onClick={onReplay}
            className="w-full py-3 rounded-2xl font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "#FF922B18", color: "#FF922B" }}
          >
            أعد المحاولة
          </button>
          <button
            onClick={onHome}
            className="w-full py-2 rounded-2xl font-bold text-sm transition-all"
            style={{ color: "#636E72" }}
          >
            القائمة
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── D-Pad ─── */
function DPad({ onMove }: { onMove: (dir: "up" | "down" | "left" | "right") => void }) {
  const btnStyle = (dir: string) => ({
    width: 56,
    height: 56,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#FF922B",
    color: "#FFF",
    fontSize: 22,
    fontWeight: 900 as const,
    boxShadow: "0 3px 10px rgba(255,146,43,0.35)",
    border: "none",
    cursor: "pointer",
    transition: "transform 0.1s",
    WebkitTapHighlightColor: "transparent",
    touchAction: "manipulation" as const,
  });

  return (
    <div className="flex flex-col items-center gap-1 select-none" style={{ touchAction: "none" }}>
      <button
        onPointerDown={(e) => { e.preventDefault(); onMove("up"); }}
        style={btnStyle("up")}
        aria-label="up"
      >
        ↑
      </button>
      <div className="flex gap-10">
        <button
          onPointerDown={(e) => { e.preventDefault(); onMove("right"); }}
          style={btnStyle("right")}
          aria-label="right"
        >
          →
        </button>
        <button
          onPointerDown={(e) => { e.preventDefault(); onMove("left"); }}
          style={btnStyle("left")}
          aria-label="left"
        >
          ←
        </button>
      </div>
      <button
        onPointerDown={(e) => { e.preventDefault(); onMove("down"); }}
        style={btnStyle("down")}
        aria-label="down"
      >
        ↓
      </button>
    </div>
  );
}

/* ─── Page Component ─── */
export default function MatahaPage() {
  const [screen, setScreen] = useState<"select" | "game">("select");
  const [currentLevel, setCurrentLevel] = useState(0);
  const [progress, setProgress] = useState<{ level: number; stars: number[] }>({
    level: 0,
    stars: [],
  });

  // Load progress
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setProgress(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  // Save progress
  const saveProgress = useCallback((newProgress: { level: number; stars: number[] }) => {
    setProgress(newProgress);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
    } catch {
      // ignore
    }
  }, []);

  const handleSelectLevel = (level: number) => {
    setCurrentLevel(level);
    setScreen("game");
  };

  const handleWin = useCallback(
    (stars: number) => {
      const newStars = [...progress.stars];
      // Only update if better
      if (!newStars[currentLevel] || stars > newStars[currentLevel]) {
        newStars[currentLevel] = stars;
      }
      const newLevel = Math.max(progress.level, currentLevel + 1);
      saveProgress({ level: newLevel, stars: newStars });
    },
    [currentLevel, progress, saveProgress]
  );

  const handleNextLevel = useCallback(() => {
    if (currentLevel < LEVEL_CONFIGS.length - 1) {
      setCurrentLevel(currentLevel + 1);
      setScreen("game");
    }
  }, [currentLevel]);

  if (screen === "game") {
    return (
      <MazeGameWrapper
        key={`${currentLevel}-${Date.now()}`}
        level={currentLevel}
        onWin={handleWin}
        onBack={() => setScreen("select")}
        onNext={handleNextLevel}
        hasNext={currentLevel < LEVEL_CONFIGS.length - 1}
      />
    );
  }

  return <LevelSelect progress={progress} onSelect={handleSelectLevel} />;
}

/* Wrapper to connect next level from win screen */
function MazeGameWrapper({
  level,
  onWin,
  onBack,
  onNext,
  hasNext,
}: {
  level: number;
  onWin: (stars: number) => void;
  onBack: () => void;
  onNext: () => void;
  hasNext: boolean;
}) {
  const [winData, setWinData] = useState<{ moves: number; elapsed: number; stars: number } | null>(null);
  const config = LEVEL_CONFIGS[level];
  const size = config.size;

  const [game, setGame] = useState<GameState | null>(null);
  const [showWin, setShowWin] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const initMaze = useCallback(() => {
    const { maze, optimalLength } = generateMaze(size, size);
    const trail = new Set<string>();
    trail.add("0,0");
    setGame({
      maze,
      playerRow: 0,
      playerCol: 0,
      moves: 0,
      startTime: Date.now(),
      elapsed: 0,
      won: false,
      trail,
      optimalLength,
    });
    setShowWin(false);
    setWinData(null);
  }, [size]);

  useEffect(() => {
    initMaze();
  }, [initMaze]);

  // Timer
  useEffect(() => {
    if (game && !game.won) {
      timerRef.current = setInterval(() => {
        setGame((prev) => (prev ? { ...prev, elapsed: Date.now() - prev.startTime } : prev));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [game?.won, game?.startTime]);

  const movePlayer = useCallback(
    (dir: "up" | "down" | "left" | "right") => {
      setGame((prev) => {
        if (!prev || prev.won) return prev;

        const { maze, playerRow: r, playerCol: c } = prev;
        let nr = r;
        let nc = c;
        let wall: keyof Cell;

        switch (dir) {
          case "up":    nr = r - 1; wall = "top"; break;
          case "down":  nr = r + 1; wall = "bottom"; break;
          case "left":  nr = r; nc = c - 1; wall = "left"; break;
          case "right": nr = r; nc = c + 1; wall = "right"; break;
        }

        if (nr < 0 || nr >= size || nc < 0 || nc >= size) return prev;
        if (maze[r][c][wall!]) return prev;

        const newTrail = new Set(prev.trail);
        newTrail.add(`${nr},${nc}`);
        const newMoves = prev.moves + 1;
        const won = nr === size - 1 && nc === size - 1;
        const newElapsed = Date.now() - prev.startTime;

        if (won) {
          const stars = calcStars(newMoves, prev.optimalLength);
          setWinData({ moves: newMoves, elapsed: newElapsed, stars });
          setTimeout(() => {
            setShowWin(true);
            onWin(stars);
          }, 300);
        }

        return {
          ...prev,
          playerRow: nr,
          playerCol: nc,
          moves: newMoves,
          trail: newTrail,
          won,
          elapsed: newElapsed,
        };
      });
    },
    [size, onWin]
  );

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":    e.preventDefault(); movePlayer("up"); break;
        case "ArrowDown":  e.preventDefault(); movePlayer("down"); break;
        case "ArrowLeft":  e.preventDefault(); movePlayer("left"); break;
        case "ArrowRight": e.preventDefault(); movePlayer("right"); break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [movePlayer]);

  // Swipe
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
      const minSwipe = 30;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > minSwipe) movePlayer(dx > 0 ? "right" : "left");
      } else {
        if (Math.abs(dy) > minSwipe) movePlayer(dy > 0 ? "down" : "up");
      }
      touchStartRef.current = null;
    },
    [movePlayer]
  );

  if (!game) return null;

  const { maze, playerRow, playerCol, moves, elapsed, trail } = game;
  const WALL_WIDTH = 3;

  return (
    <div className="flex flex-col h-[calc(100dvh-96px)]" ref={containerRef}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-bold px-3 py-2 rounded-xl transition-all hover:scale-105"
          style={{ color: "#FF922B", background: "#FF922B18" }}
        >
          <span>←</span>
          <span>رجوع</span>
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold" style={{ color: "#FF922B" }}>{moves}</span>
            <span className="text-xs font-medium" style={{ color: "#636E72" }}>خطوة</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold" style={{ color: "#4A90D9" }}>{formatTime(elapsed)}</span>
            <span className="text-xs font-medium" style={{ color: "#636E72" }}>الوقت</span>
          </div>
        </div>
        <span className="text-sm font-bold" style={{ color: "#636E72" }}>
          {config.size}x{config.size}
        </span>
      </div>

      {/* Maze */}
      <div
        className="flex-1 flex items-center justify-center px-3 min-h-0"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: "none" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${size}, 1fr)`,
            width: "min(85vw, 400px)",
            height: "min(85vw, 400px)",
            maxWidth: "100%",
            maxHeight: "100%",
            aspectRatio: "1",
            background: "#FAFAFA",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            border: `${WALL_WIDTH}px solid #2D3436`,
          }}
        >
          {maze.map((row, r) =>
            row.map((cell, c) => {
              const isPlayer = r === playerRow && c === playerCol;
              const isGoal = r === size - 1 && c === size - 1;
              const isStart = r === 0 && c === 0;
              const isTrail = trail.has(`${r},${c}`) && !isPlayer;

              return (
                <div
                  key={`${r}-${c}`}
                  style={{
                    position: "relative",
                    borderTop: cell.top ? `${WALL_WIDTH}px solid #2D3436` : `${WALL_WIDTH}px solid transparent`,
                    borderRight: cell.right ? `${WALL_WIDTH}px solid #2D3436` : `${WALL_WIDTH}px solid transparent`,
                    borderBottom: cell.bottom ? `${WALL_WIDTH}px solid #2D3436` : `${WALL_WIDTH}px solid transparent`,
                    borderLeft: cell.left ? `${WALL_WIDTH}px solid #2D3436` : `${WALL_WIDTH}px solid transparent`,
                    background: isStart ? "#51CF6620" : isGoal ? "#FFD43B20" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isPlayer && (
                    <div
                      style={{
                        width: "60%",
                        height: "60%",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #FF922B, #FF6B6B)",
                        boxShadow: "0 2px 8px rgba(255,146,43,0.5)",
                        transition: "all 0.15s ease-out",
                        zIndex: 10,
                      }}
                    />
                  )}
                  {isGoal && !isPlayer && (
                    <span
                      style={{
                        fontSize: "clamp(10px, 3vw, 20px)",
                        animation: "pulse-glow 2s ease-in-out infinite",
                      }}
                    >
                      ⭐
                    </span>
                  )}
                  {isTrail && !isGoal && (
                    <div
                      style={{
                        width: "25%",
                        height: "25%",
                        borderRadius: "50%",
                        background: "#4A90D940",
                      }}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* D-Pad */}
      <div className="flex-shrink-0 py-3 flex justify-center">
        <DPad onMove={movePlayer} />
      </div>

      {/* Win screen */}
      {showWin && winData && (
        <WinScreen
          moves={winData.moves}
          elapsed={winData.elapsed}
          stars={winData.stars}
          level={level}
          hasNext={hasNext}
          onNext={onNext}
          onReplay={initMaze}
          onHome={onBack}
        />
      )}
    </div>
  );
}
