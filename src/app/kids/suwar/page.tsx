"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

// ─── Arabic numerals ────────────────────────────────────────────────────────

function toArabicNum(n: number): string {
  const digits = "٠١٢٣٤٥٦٧٨٩";
  return String(n)
    .split("")
    .map((d) => digits[parseInt(d)])
    .join("");
}

// ─── Types ──────────────────────────────────────────────────────────────────

type LevelId = 1 | 2 | 3;

interface LevelProgress {
  unlocked: boolean;
  stars: number;
}

interface Progress {
  levels: Record<LevelId, LevelProgress>;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const STORAGE_KEY = "sparks_suwar_progress";
const THEME = "#E64980";

const LEVEL_CONFIGS: Record<LevelId, { size: number; scrambleMoves: number }> = {
  1: { size: 3, scrambleMoves: 60 },
  2: { size: 4, scrambleMoves: 80 },
  3: { size: 5, scrambleMoves: 100 },
};

// Star thresholds: [3-star max moves, 2-star max moves]
const STAR_THRESHOLDS: Record<LevelId, [number, number]> = {
  1: [20, 35],
  2: [50, 80],
  3: [100, 160],
};

// ─── Puzzle pictures (emoji grids) ──────────────────────────────────────────

interface PuzzlePicture {
  name: string;
  tiles: string[];
}

const PICTURES_3x3: PuzzlePicture[] = [
  {
    name: "أرقام",
    tiles: ["١", "٢", "٣", "٤", "٥", "٦", "٧", "٨"],
  },
  {
    name: "طبيعة",
    tiles: ["🌟", "🌙", "☀️", "🌈", "⭐", "🌸", "🦋", "🐝"],
  },
  {
    name: "فواكه",
    tiles: ["🍎", "🍊", "🍋", "🍇", "🍓", "🍑", "🍌", "🥝"],
  },
];

const PICTURES_4x4: PuzzlePicture[] = [
  {
    name: "أرقام",
    tiles: ["١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩", "١٠", "١١", "١٢", "١٣", "١٤", "١٥"],
  },
  {
    name: "حيوانات",
    tiles: ["🐱", "🐶", "🐰", "🦊", "🐻", "🐼", "🐨", "🦁", "🐯", "🐮", "🐷", "🐸", "🐵", "🐔", "🦋"],
  },
];

const PICTURES_5x5: PuzzlePicture[] = [
  {
    name: "أرقام",
    tiles: [
      "١", "٢", "٣", "٤", "٥",
      "٦", "٧", "٨", "٩", "١٠",
      "١١", "١٢", "١٣", "١٤", "١٥",
      "١٦", "١٧", "١٨", "١٩", "٢٠",
      "٢١", "٢٢", "٢٣", "٢٤",
    ],
  },
];

function getPictures(level: LevelId): PuzzlePicture[] {
  switch (level) {
    case 1: return PICTURES_3x3;
    case 2: return PICTURES_4x4;
    case 3: return PICTURES_5x5;
  }
}

// ─── Tile colors ────────────────────────────────────────────────────────────

const TILE_COLORS = [
  "#FF6B6B", "#51CF66", "#4A90D9", "#FFD43B", "#CC5DE8",
  "#FF922B", "#F06595", "#20C997", "#5C7CFA", "#22B8CF",
  "#E64980", "#7950F2", "#FCC419", "#12B886", "#4C6EF5",
  "#FA5252", "#40C057", "#228BE6", "#FAB005", "#BE4BDB",
  "#FD7E14", "#E64980", "#7048E8", "#15AABF", "#82C91E",
];

function getTileColor(index: number): string {
  return TILE_COLORS[index % TILE_COLORS.length];
}

// ─── Puzzle logic ───────────────────────────────────────────────────────────

function getNeighbors(pos: number, size: number): number[] {
  const row = Math.floor(pos / size);
  const col = pos % size;
  const neighbors: number[] = [];
  if (row > 0) neighbors.push(pos - size);
  if (row < size - 1) neighbors.push(pos + size);
  if (col > 0) neighbors.push(pos - 1);
  if (col < size - 1) neighbors.push(pos + 1);
  return neighbors;
}

function scramblePuzzle(size: number, moves: number): number[] {
  const total = size * size;
  // Start from solved state: [0, 1, 2, ..., total-2, -1]
  // -1 represents the empty space
  const tiles: number[] = [];
  for (let i = 0; i < total - 1; i++) tiles.push(i);
  tiles.push(-1);

  let emptyPos = total - 1;
  let lastEmpty = -1;

  for (let m = 0; m < moves; m++) {
    const neighbors = getNeighbors(emptyPos, size).filter((n) => n !== lastEmpty);
    const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
    lastEmpty = emptyPos;
    tiles[emptyPos] = tiles[pick];
    tiles[pick] = -1;
    emptyPos = pick;
  }

  return tiles;
}

function isSolved(tiles: number[]): boolean {
  for (let i = 0; i < tiles.length - 1; i++) {
    if (tiles[i] !== i) return false;
  }
  return tiles[tiles.length - 1] === -1;
}

// ─── Persistence ────────────────────────────────────────────────────────────

function defaultProgress(): Progress {
  return {
    levels: {
      1: { unlocked: true, stars: 0 },
      2: { unlocked: false, stars: 0 },
      3: { unlocked: false, stars: 0 },
    },
  };
}

function loadProgress(): Progress {
  if (typeof window === "undefined") return defaultProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Progress;
  } catch { /* ignore */ }
  return defaultProgress();
}

function saveProgress(p: Progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch { /* ignore */ }
}

function starsFromMoves(moves: number, level: LevelId): number {
  const [three, two] = STAR_THRESHOLDS[level];
  if (moves <= three) return 3;
  if (moves <= two) return 2;
  return 1;
}

// ─── Shared styles ──────────────────────────────────────────────────────────

const SHARED_STYLES = `
  @keyframes confetti-pop {
    0% { transform: translate(0, 0) scale(0); opacity: 1; }
    100% { transform: translate(var(--tx), var(--ty)) scale(1); opacity: 0; }
  }
  @keyframes card-pop {
    0% { transform: scale(0.3); opacity: 0; }
    70% { transform: scale(1.08); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes celebration-bounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.15); }
  }
  @keyframes star-pop {
    0% { transform: scale(0) rotate(-30deg); opacity: 0; }
    60% { transform: scale(1.3) rotate(10deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  @keyframes tile-place {
    0% { transform: scale(0.8); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes preview-fade {
    0% { opacity: 1; }
    80% { opacity: 1; }
    100% { opacity: 0; }
  }
  @keyframes pulse-hint {
    0%, 100% { box-shadow: 0 0 0 0 rgba(230, 73, 128, 0.4); }
    50% { box-shadow: 0 0 0 8px rgba(230, 73, 128, 0); }
  }
`;

// ─── GameContainer ──────────────────────────────────────────────────────────

function GameContainer({ children, scroll }: { children: React.ReactNode; scroll?: boolean }) {
  return (
    <div
      className={`h-[calc(100dvh-96px)] flex flex-col ${scroll ? "overflow-y-auto" : "overflow-hidden"}`}
    >
      <style>{SHARED_STYLES}</style>
      {children}
    </div>
  );
}

// ─── Confetti ───────────────────────────────────────────────────────────────

function ConfettiBurst() {
  const pieces = useRef(
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: 45 + Math.random() * 10,
      color: ["#FF6B6B", "#51CF66", "#FFD43B", "#4A90D9", "#CC5DE8", "#FF922B", "#F06595"][
        Math.floor(Math.random() * 7)
      ],
      angle: (i / 24) * 360 + Math.random() * 15,
      distance: 60 + Math.random() * 100,
      size: 6 + Math.random() * 6,
    }))
  ).current;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const tx = Math.cos(rad) * p.distance;
        const ty = Math.sin(rad) * p.distance;
        return (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: "40%",
              width: p.size,
              height: p.size,
              background: p.color,
              animation: "confetti-pop 0.8s ease-out forwards",
              // @ts-expect-error CSS custom properties
              "--tx": `${tx}px`,
              "--ty": `${ty}px`,
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Level Select ───────────────────────────────────────────────────────────

const LEVEL_META: { id: LevelId; title: string; desc: string; icon: string; color: string }[] = [
  { id: 1, title: "٣×٣", desc: "٨ قطع - سهل", icon: "🧩", color: "#51CF66" },
  { id: 2, title: "٤×٤", desc: "١٥ قطعة - متوسط", icon: "🧩", color: "#4A90D9" },
  { id: 3, title: "٥×٥", desc: "٢٤ قطعة - صعب", icon: "🧩", color: "#CC5DE8" },
];

function LevelSelect({
  progress,
  onSelect,
}: {
  progress: Progress;
  onSelect: (level: LevelId) => void;
}) {
  return (
    <GameContainer scroll>
      <div className="flex flex-col items-center px-4 py-6 gap-4">
        <h1 className="text-3xl font-black" style={{ color: "#2D3436" }}>
          ترتيب الصور
        </h1>
        <p className="text-base" style={{ color: "#636E72" }}>
          اختر المستوى
        </p>

        <div className="flex flex-col gap-4 w-full max-w-sm">
          {LEVEL_META.map((lm, idx) => {
            const lp = progress.levels[lm.id];
            const locked = !lp.unlocked;

            return (
              <button
                key={lm.id}
                disabled={locked}
                onClick={() => onSelect(lm.id)}
                className="relative rounded-2xl shadow-lg p-4 flex items-center gap-3 transition-transform active:scale-95"
                style={{
                  background: locked ? "#E8E8E8" : "#FFFFFF",
                  border: `3px solid ${locked ? "#CCC" : lm.color}`,
                  opacity: locked ? 0.6 : 1,
                  animation: `card-pop 0.4s ${idx * 0.1}s ease-out both`,
                }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{ background: locked ? "#DDD" : `${lm.color}22` }}
                >
                  {locked ? "🔒" : lm.icon}
                </div>
                <div className="flex-1 text-right">
                  <div className="text-lg font-black" style={{ color: locked ? "#AAA" : "#2D3436" }}>
                    المستوى {toArabicNum(lm.id)} - {lm.title}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: locked ? "#BBB" : "#636E72" }}>
                    {lm.desc}
                  </div>
                  <div className="flex gap-1 mt-1 justify-end">
                    {[0, 1, 2].map((s) => (
                      <span key={s} className="text-lg" style={{ opacity: s < lp.stars ? 1 : 0.2 }}>
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <Link
          href="/kids"
          className="mt-2 px-6 py-3 rounded-2xl text-lg font-bold text-white shadow-lg active:scale-95 transition-transform"
          style={{ background: `linear-gradient(135deg, ${THEME}, #F06595)` }}
        >
          الألعاب ↩
        </Link>
      </div>
    </GameContainer>
  );
}

// ─── Done Screen ────────────────────────────────────────────────────────────

function DoneScreen({
  moves,
  time,
  stars,
  levelId,
  onRestart,
  onLevels,
}: {
  moves: number;
  time: number;
  stars: number;
  levelId: LevelId;
  onRestart: () => void;
  onLevels: () => void;
}) {
  const message =
    stars >= 3
      ? "ممتاز! أنت بطل! 🏆"
      : stars >= 2
      ? "أحسنت! رائع جدا! 🌟"
      : "جيد! حاول بحركات أقل! 💪";

  const mins = Math.floor(time / 60);
  const secs = time % 60;
  const timeStr = mins > 0 ? `${toArabicNum(mins)}:${toArabicNum(secs).padStart(2, "٠")}` : `${toArabicNum(secs)} ثانية`;

  return (
    <GameContainer scroll>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 gap-4">
        <ConfettiBurst />

        <div className="text-6xl" style={{ animation: "celebration-bounce 1s ease-in-out infinite" }}>
          🎉
        </div>

        <h1 className="text-3xl font-black" style={{ color: THEME }}>
          انتهى المستوى {toArabicNum(levelId)}!
        </h1>

        <p className="text-xl font-bold" style={{ color: "#2D3436" }}>
          {message}
        </p>

        <div className="flex gap-2 justify-center">
          {[0, 1, 2].map((s) => (
            <span
              key={s}
              className="text-4xl"
              style={{
                animation: s < stars ? `star-pop 0.4s ${s * 0.15}s ease-out both` : "none",
                opacity: s < stars ? 1 : 0.2,
              }}
            >
              ⭐
            </span>
          ))}
        </div>

        <div className="flex gap-6 text-center">
          <div>
            <div className="text-2xl font-black" style={{ color: "#FF922B" }}>
              {toArabicNum(moves)}
            </div>
            <div className="text-sm" style={{ color: "#636E72" }}>
              حركة
            </div>
          </div>
          <div>
            <div className="text-2xl font-black" style={{ color: "#4A90D9" }}>
              {timeStr}
            </div>
            <div className="text-sm" style={{ color: "#636E72" }}>
              الوقت
            </div>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={onRestart}
            className="px-6 py-3 rounded-2xl text-lg font-bold text-white shadow-lg active:scale-95 transition-transform"
            style={{ background: "linear-gradient(135deg, #51CF66, #4A90D9)" }}
          >
            أعد المستوى 🔄
          </button>
          <button
            onClick={onLevels}
            className="px-6 py-3 rounded-2xl text-lg font-bold text-white shadow-lg active:scale-95 transition-transform"
            style={{ background: `linear-gradient(135deg, ${THEME}, #F06595)` }}
          >
            المستويات ↩
          </button>
        </div>
      </div>
    </GameContainer>
  );
}

// ─── Preview overlay ────────────────────────────────────────────────────────

function PreviewOverlay({
  picture,
  size,
  tileSize,
}: {
  picture: PuzzlePicture;
  size: number;
  tileSize: number;
}) {
  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl"
      style={{
        background: "rgba(255,255,255,0.95)",
        animation: "preview-fade 2.5s ease-in-out forwards",
      }}
    >
      <div className="flex flex-col items-center gap-3">
        <p className="text-lg font-bold" style={{ color: "#636E72" }}>
          احفظ الصورة...
        </p>
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${size}, ${tileSize}px)`,
            gridTemplateRows: `repeat(${size}, ${tileSize}px)`,
          }}
        >
          {picture.tiles.map((tile, i) => (
            <div
              key={i}
              className="flex items-center justify-center rounded-lg font-black"
              style={{
                width: tileSize,
                height: tileSize,
                background: getTileColor(i),
                color: "#FFF",
                fontSize: tileSize * 0.4,
                textShadow: "0 1px 2px rgba(0,0,0,0.2)",
              }}
            >
              {tile}
            </div>
          ))}
          {/* Empty space in preview */}
          <div
            className="rounded-lg"
            style={{
              width: tileSize,
              height: tileSize,
              border: "2px dashed #CCC",
              background: "#F8F8F8",
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function SuwarPage() {
  const [progress, setProgress] = useState<Progress>(defaultProgress);
  const [screen, setScreen] = useState<"levels" | "playing" | "done">("levels");
  const [activeLevel, setActiveLevel] = useState<LevelId>(1);
  const [lastMoves, setLastMoves] = useState(0);
  const [lastTime, setLastTime] = useState(0);
  const [playKey, setPlayKey] = useState(0);
  const timeRef = useRef(0);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const handleSelectLevel = useCallback((level: LevelId) => {
    setActiveLevel(level);
    setPlayKey((k) => k + 1);
    timeRef.current = 0;
    setScreen("playing");
  }, []);

  const handleFinish = useCallback(
    (moves: number) => {
      if (moves < 0) {
        // Back button pressed
        setScreen("levels");
        return;
      }

      setLastMoves(moves);
      const stars = starsFromMoves(moves, activeLevel);

      setProgress((prev) => {
        const updated: Progress = {
          levels: { ...prev.levels },
        };

        const current = updated.levels[activeLevel];
        updated.levels[activeLevel] = {
          ...current,
          stars: Math.max(current.stars, stars),
        };

        if (stars >= 1 && activeLevel < 3) {
          const nextId = (activeLevel + 1) as LevelId;
          updated.levels[nextId] = {
            ...updated.levels[nextId],
            unlocked: true,
          };
        }

        saveProgress(updated);
        return updated;
      });

      setScreen("done");
    },
    [activeLevel]
  );

  const handleRestart = useCallback(() => {
    setPlayKey((k) => k + 1);
    setScreen("playing");
  }, []);

  const handleBackToLevels = useCallback(() => {
    setScreen("levels");
  }, []);

  if (screen === "levels") {
    return <LevelSelect progress={progress} onSelect={handleSelectLevel} />;
  }

  if (screen === "done") {
    return (
      <DoneScreen
        moves={lastMoves}
        time={lastTime}
        stars={starsFromMoves(lastMoves, activeLevel)}
        levelId={activeLevel}
        onRestart={handleRestart}
        onLevels={handleBackToLevels}
      />
    );
  }

  return (
    <PuzzleGameWithTime
      key={`level-${activeLevel}-${playKey}`}
      levelId={activeLevel}
      onFinish={handleFinish}
      onTimeUpdate={(t) => { timeRef.current = t; setLastTime(t); }}
    />
  );
}

// ─── Wrapper to track time for done screen ──────────────────────────────────

function PuzzleGameWithTime({
  levelId,
  onFinish,
  onTimeUpdate,
}: {
  levelId: LevelId;
  onFinish: (moves: number) => void;
  onTimeUpdate: (time: number) => void;
}) {
  const config = LEVEL_CONFIGS[levelId];
  const { size } = config;

  const [picture] = useState<PuzzlePicture>(() => {
    const pics = getPictures(levelId);
    return pics[Math.floor(Math.random() * pics.length)];
  });

  const [tiles, setTiles] = useState<number[]>(() =>
    scramblePuzzle(size, config.scrambleMoves)
  );
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [showPreview, setShowPreview] = useState(true);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [showingHint, setShowingHint] = useState(false);
  const [solved, setSolved] = useState(false);
  const [started, setStarted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; idx: number } | null>(null);

  // Timer
  useEffect(() => {
    if (started && !solved) {
      timerRef.current = setInterval(() => {
        setElapsed((e) => {
          const next = e + 1;
          onTimeUpdate(next);
          return next;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [started, solved, onTimeUpdate]);

  // Hide preview after 2.5s
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPreview(false);
      setStarted(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Check solved
  useEffect(() => {
    if (started && !solved && isSolved(tiles)) {
      setSolved(true);
      if (timerRef.current) clearInterval(timerRef.current);
      setTimeout(() => {
        onFinish(moves);
      }, 600);
    }
  }, [tiles, started, solved, moves, onFinish]);

  const emptyIdx = tiles.indexOf(-1);

  const canMove = useCallback(
    (idx: number): boolean => {
      if (solved || showPreview) return false;
      return getNeighbors(emptyIdx, size).includes(idx);
    },
    [emptyIdx, size, solved, showPreview]
  );

  const moveTile = useCallback(
    (idx: number) => {
      if (!canMove(idx)) return;
      setTiles((prev) => {
        const next = [...prev];
        const empty = next.indexOf(-1);
        next[empty] = next[idx];
        next[idx] = -1;
        return next;
      });
      setMoves((m) => m + 1);
    },
    [canMove]
  );

  const handleTouchStart = useCallback(
    (idx: number, e: React.TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY, idx };
    },
    []
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;
      const touch = e.changedTouches[0];
      const start = touchStartRef.current;
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (Math.max(absDx, absDy) < 15) {
        moveTile(start.idx);
        touchStartRef.current = null;
        return;
      }

      const tileRow = Math.floor(start.idx / size);
      const tileCol = start.idx % size;
      const emptyRow = Math.floor(emptyIdx / size);
      const emptyCol = emptyIdx % size;

      if (absDx > absDy) {
        if (dx > 0 && emptyCol === tileCol + 1 && emptyRow === tileRow) {
          moveTile(start.idx);
        } else if (dx < 0 && emptyCol === tileCol - 1 && emptyRow === tileRow) {
          moveTile(start.idx);
        }
      } else {
        if (dy > 0 && emptyRow === tileRow + 1 && emptyCol === tileCol) {
          moveTile(start.idx);
        } else if (dy < 0 && emptyRow === tileRow - 1 && emptyCol === tileCol) {
          moveTile(start.idx);
        }
      }

      touchStartRef.current = null;
    },
    [emptyIdx, size, moveTile]
  );

  const handleHint = useCallback(() => {
    if (hintsLeft <= 0 || showingHint) return;
    setHintsLeft((h) => h - 1);
    setShowingHint(true);
    setTimeout(() => setShowingHint(false), 2000);
  }, [hintsLeft, showingHint]);

  const maxGridPx = 340;
  const gap = 3;
  const tileSize = Math.floor((maxGridPx - gap * (size - 1)) / size);
  const gridPx = tileSize * size + gap * (size - 1);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const timeDisplay =
    mins > 0
      ? `${toArabicNum(mins)}:${String(secs).padStart(2, "0").split("").map((d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]).join("")}`
      : `${toArabicNum(secs)}`;

  return (
    <GameContainer>
      <div className="flex-1 flex flex-col items-center px-4 py-3 gap-3">
        {/* Stats bar */}
        <div className="flex items-center justify-between w-full max-w-sm">
          <button
            onClick={() => onFinish(-1)}
            className="text-sm font-bold px-3 py-1.5 rounded-xl active:scale-95 transition-transform"
            style={{ background: "#F0F0F0", color: "#636E72" }}
          >
            ← رجوع
          </button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-sm" style={{ color: "#636E72" }}>
                ⏱
              </span>
              <span className="text-lg font-black tabular-nums" style={{ color: "#4A90D9" }}>
                {timeDisplay}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm" style={{ color: "#636E72" }}>
                👆
              </span>
              <span className="text-lg font-black" style={{ color: "#FF922B" }}>
                {toArabicNum(moves)}
              </span>
            </div>
          </div>
        </div>

        {/* Picture name */}
        <div
          className="text-base font-bold px-4 py-1 rounded-full"
          style={{ background: `${THEME}15`, color: THEME }}
        >
          {picture.name}
        </div>

        {/* Grid */}
        <div className="relative flex items-center justify-center flex-1 min-h-0">
          <div
            className="relative grid"
            style={{
              gridTemplateColumns: `repeat(${size}, ${tileSize}px)`,
              gridTemplateRows: `repeat(${size}, ${tileSize}px)`,
              gap: `${gap}px`,
              width: gridPx,
              height: gridPx,
            }}
          >
            {tiles.map((tileValue, idx) => {
              if (tileValue === -1) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="rounded-xl"
                    style={{
                      width: tileSize,
                      height: tileSize,
                      border: "2px dashed #DDD",
                      background: "#FAFAFA",
                    }}
                  />
                );
              }

              const isMovable = canMove(idx);

              return (
                <div
                  key={`tile-${tileValue}`}
                  onClick={() => moveTile(idx)}
                  onTouchStart={(e) => handleTouchStart(idx, e)}
                  onTouchEnd={handleTouchEnd}
                  className="rounded-xl flex items-center justify-center cursor-pointer select-none"
                  style={{
                    width: tileSize,
                    height: tileSize,
                    background: getTileColor(tileValue),
                    color: "#FFF",
                    fontSize: tileSize * 0.38,
                    fontWeight: 900,
                    textShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    boxShadow: isMovable
                      ? "0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)"
                      : "0 1px 3px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.15)",
                    transition: "transform 0.18s ease, box-shadow 0.18s ease",
                    transform: isMovable ? "scale(1.02)" : "scale(1)",
                    animation: solved ? `tile-place 0.3s ${tileValue * 0.03}s ease-out both` : undefined,
                  }}
                >
                  {picture.tiles[tileValue]}
                </div>
              );
            })}

            {/* Preview overlay */}
            {showPreview && (
              <PreviewOverlay picture={picture} size={size} tileSize={tileSize} />
            )}

            {/* Hint overlay */}
            {showingHint && (
              <div
                className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl"
                style={{ background: "rgba(255,255,255,0.92)" }}
              >
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: `repeat(${size}, ${tileSize}px)`,
                    gridTemplateRows: `repeat(${size}, ${tileSize}px)`,
                    gap: `${gap}px`,
                  }}
                >
                  {picture.tiles.map((tile, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-center rounded-lg font-black"
                      style={{
                        width: tileSize,
                        height: tileSize,
                        background: getTileColor(i),
                        color: "#FFF",
                        fontSize: tileSize * 0.38,
                        textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                      }}
                    >
                      {tile}
                    </div>
                  ))}
                  <div
                    className="rounded-lg"
                    style={{
                      width: tileSize,
                      height: tileSize,
                      border: "2px dashed #CCC",
                      background: "#F8F8F8",
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hint button */}
        <button
          onClick={handleHint}
          disabled={hintsLeft <= 0 || showingHint}
          className="px-5 py-2 rounded-2xl text-sm font-bold active:scale-95 transition-transform"
          style={{
            background: hintsLeft > 0 ? `${THEME}15` : "#F0F0F0",
            color: hintsLeft > 0 ? THEME : "#AAA",
            border: `2px solid ${hintsLeft > 0 ? THEME : "#DDD"}`,
          }}
        >
          👁 الصورة الأصلية ({toArabicNum(hintsLeft)})
        </button>
      </div>
    </GameContainer>
  );
}
