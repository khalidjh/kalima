import { getKharbashaPuzzleNumber } from "@/data/kharbasha";

export interface KharbashaGameState {
  puzzleNumber: number;
  attempts: number;
  currentArrangement: string[]; // letters placed so far
  gameStatus: "playing" | "won" | "lost";
}

export interface KharbashaStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  lastPlayedPuzzle: number;
  lastWonPuzzle: number;
  guessDistribution: Record<number, number>; // attempts -> count
}

const GAME_STATE_KEY = "kalima_kharbasha_state";
const STATS_KEY = "kalima_kharbasha_stats";

export function loadKharbashaGameState(): KharbashaGameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(GAME_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as KharbashaGameState;
    if (parsed.puzzleNumber !== getKharbashaPuzzleNumber()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveKharbashaGameState(state: KharbashaGameState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
}

export function loadKharbashaStats(): KharbashaStats {
  if (typeof window === "undefined") return defaultStats();
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return defaultStats();
    return JSON.parse(raw) as KharbashaStats;
  } catch {
    return defaultStats();
  }
}

export function saveKharbashaStats(stats: KharbashaStats): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function defaultStats(): KharbashaStats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    lastPlayedPuzzle: -1,
    lastWonPuzzle: -1,
    guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };
}

export function updateKharbashaStatsOnWin(attempts: number): KharbashaStats {
  const puzzleNumber = getKharbashaPuzzleNumber();
  const stats = loadKharbashaStats();
  if (stats.lastPlayedPuzzle === puzzleNumber) return stats;

  const newStreak =
    stats.lastWonPuzzle === puzzleNumber - 1 ? stats.currentStreak + 1 : 1;

  const updated: KharbashaStats = {
    gamesPlayed: stats.gamesPlayed + 1,
    gamesWon: stats.gamesWon + 1,
    currentStreak: newStreak,
    maxStreak: Math.max(stats.maxStreak, newStreak),
    lastPlayedPuzzle: puzzleNumber,
    lastWonPuzzle: puzzleNumber,
    guessDistribution: {
      ...stats.guessDistribution,
      [attempts]: (stats.guessDistribution[attempts] ?? 0) + 1,
    },
  };

  saveKharbashaStats(updated);
  return updated;
}

export function updateKharbashaStatsOnLoss(): KharbashaStats {
  const puzzleNumber = getKharbashaPuzzleNumber();
  const stats = loadKharbashaStats();
  if (stats.lastPlayedPuzzle === puzzleNumber) return stats;

  const updated: KharbashaStats = {
    ...stats,
    gamesPlayed: stats.gamesPlayed + 1,
    currentStreak: 0,
    lastPlayedPuzzle: puzzleNumber,
  };

  saveKharbashaStats(updated);
  return updated;
}
