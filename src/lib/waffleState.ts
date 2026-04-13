import { getWafflePuzzleNumber } from "@/data/waffle";

export interface WaffleGameState {
  puzzleNumber: number;
  /** Current grid state (row-major), null for empty cells */
  grid: (string | null)[][];
  /** Number of swaps made */
  swaps: number;
  /** Max allowed swaps (15) */
  maxSwaps: number;
  gameStatus: "playing" | "won" | "lost";
  /** Selected cell [row, col] or null */
  selected: [number, number] | null;
}

export interface WaffleStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  lastPlayedPuzzle: number;
  lastWonPuzzle: number;
  /** Star distribution: [5stars, 4stars, 3stars, 2stars, 1star, 0stars] */
  starDistribution: number[];
}

const GAME_STATE_KEY = "kalima_waffle_state";
const STATS_KEY = "kalima_waffle_stats";

export function loadWaffleGameState(): WaffleGameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(GAME_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WaffleGameState;
    if (parsed.puzzleNumber !== getWafflePuzzleNumber()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveWaffleGameState(state: WaffleGameState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
}

export function loadWaffleStats(): WaffleStats {
  if (typeof window === "undefined") return defaultStats();
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return defaultStats();
    return JSON.parse(raw) as WaffleStats;
  } catch {
    return defaultStats();
  }
}

export function saveWaffleStats(stats: WaffleStats): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function defaultStats(): WaffleStats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    lastPlayedPuzzle: -1,
    lastWonPuzzle: -1,
    starDistribution: [0, 0, 0, 0, 0, 0],
  };
}

/** Calculate stars: 5 stars = 0 extra swaps, lose 1 star per 3 extra swaps */
export function calculateStars(swapsUsed: number, optimalSwaps: number): number {
  const extra = Math.max(0, swapsUsed - optimalSwaps);
  const stars = Math.max(0, 5 - Math.floor(extra / 3));
  return stars;
}

export function updateWaffleStatsOnWin(swaps: number, optimalSwaps: number): WaffleStats {
  const puzzleNumber = getWafflePuzzleNumber();
  const stats = loadWaffleStats();
  if (stats.lastPlayedPuzzle === puzzleNumber) return stats;

  const stars = calculateStars(swaps, optimalSwaps);
  const newStreak =
    stats.lastWonPuzzle === puzzleNumber - 1 ? stats.currentStreak + 1 : 1;

  const dist = [...stats.starDistribution];
  if (stars >= 0 && stars <= 5) dist[5 - stars]++;

  const updated: WaffleStats = {
    gamesPlayed: stats.gamesPlayed + 1,
    gamesWon: stats.gamesWon + 1,
    currentStreak: newStreak,
    maxStreak: Math.max(stats.maxStreak, newStreak),
    lastPlayedPuzzle: puzzleNumber,
    lastWonPuzzle: puzzleNumber,
    starDistribution: dist,
  };

  saveWaffleStats(updated);
  return updated;
}

export function updateWaffleStatsOnLoss(): WaffleStats {
  const puzzleNumber = getWafflePuzzleNumber();
  const stats = loadWaffleStats();
  if (stats.lastPlayedPuzzle === puzzleNumber) return stats;

  const updated: WaffleStats = {
    ...stats,
    gamesPlayed: stats.gamesPlayed + 1,
    currentStreak: 0,
    lastPlayedPuzzle: puzzleNumber,
  };

  saveWaffleStats(updated);
  return updated;
}
