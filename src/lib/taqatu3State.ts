import { getTaqatu3PuzzleNumber } from "@/data/taqatu3";

export interface Taqatu3GameState {
  puzzleNumber: number;
  grid: (string | null)[][];
  completedWords: string[]; // e.g. "across-1", "down-3"
  gameStatus: "playing" | "won";
  startTime: number;
  endTime: number | null;
}

export interface Taqatu3Stats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  lastPlayedPuzzle: number;
  lastWonPuzzle: number;
  bestTime: number | null; // ms
}

const GAME_STATE_KEY = "kalima_taqatu3_state";
const STATS_KEY = "kalima_taqatu3_stats";

export function loadTaqatu3GameState(): Taqatu3GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(GAME_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Taqatu3GameState;
    if (parsed.puzzleNumber !== getTaqatu3PuzzleNumber()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveTaqatu3GameState(state: Taqatu3GameState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
}

// ── Archive Mode ──

function archiveKey(puzzleNum: number): string {
  return `kalima_archive_taqatu3_${puzzleNum}`;
}

export function loadArchiveTaqatu3GameState(puzzleNum: number): Taqatu3GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(archiveKey(puzzleNum));
    if (!raw) return null;
    return JSON.parse(raw) as Taqatu3GameState;
  } catch {
    return null;
  }
}

export function saveArchiveTaqatu3GameState(state: Taqatu3GameState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(archiveKey(state.puzzleNumber), JSON.stringify(state));
}

// ── Stats ──

function defaultStats(): Taqatu3Stats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    lastPlayedPuzzle: -1,
    lastWonPuzzle: -1,
    bestTime: null,
  };
}

export function loadTaqatu3Stats(): Taqatu3Stats {
  if (typeof window === "undefined") return defaultStats();
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return defaultStats();
    return JSON.parse(raw) as Taqatu3Stats;
  } catch {
    return defaultStats();
  }
}

export function saveTaqatu3Stats(stats: Taqatu3Stats): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function updateTaqatu3StatsOnWin(solveTimeMs: number): Taqatu3Stats {
  const puzzleNumber = getTaqatu3PuzzleNumber();
  const stats = loadTaqatu3Stats();
  if (stats.lastPlayedPuzzle === puzzleNumber) return stats;

  const newStreak =
    stats.lastWonPuzzle === puzzleNumber - 1 ? stats.currentStreak + 1 : 1;

  const updated: Taqatu3Stats = {
    gamesPlayed: stats.gamesPlayed + 1,
    gamesWon: stats.gamesWon + 1,
    currentStreak: newStreak,
    maxStreak: Math.max(stats.maxStreak, newStreak),
    lastPlayedPuzzle: puzzleNumber,
    lastWonPuzzle: puzzleNumber,
    bestTime:
      stats.bestTime === null
        ? solveTimeMs
        : Math.min(stats.bestTime, solveTimeMs),
  };

  saveTaqatu3Stats(updated);
  return updated;
}
