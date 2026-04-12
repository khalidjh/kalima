import { getTarteebPuzzleNumber } from "@/data/tarteeb";

export interface TarteebGameState {
  puzzleNumber: number;
  currentRound: number;
  score: number;
  results: boolean[];
  gameStatus: "playing" | "won" | "lost";
}

export interface TarteebStats {
  gamesPlayed: number;
  gamesWon: number;
  perfectGames: number;
  currentStreak: number;
  maxStreak: number;
  totalScore: number;
  lastPlayedPuzzle: number;
  lastWonPuzzle: number;
}

const GAME_STATE_KEY = "kalima_tarteeb_state";
const STATS_KEY = "kalima_tarteeb_stats";

export function loadTarteebGameState(): TarteebGameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(GAME_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TarteebGameState;
    if (parsed.puzzleNumber !== getTarteebPuzzleNumber()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveTarteebGameState(state: TarteebGameState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
}

export function loadTarteebStats(): TarteebStats {
  if (typeof window === "undefined") return defaultStats();
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return defaultStats();
    return JSON.parse(raw) as TarteebStats;
  } catch {
    return defaultStats();
  }
}

export function saveTarteebStats(stats: TarteebStats): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function defaultStats(): TarteebStats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    perfectGames: 0,
    currentStreak: 0,
    maxStreak: 0,
    totalScore: 0,
    lastPlayedPuzzle: -1,
    lastWonPuzzle: -1,
  };
}

export function updateTarteebStatsOnFinish(score: number, totalRounds: number): TarteebStats {
  const puzzleNumber = getTarteebPuzzleNumber();
  const stats = loadTarteebStats();
  if (stats.lastPlayedPuzzle === puzzleNumber) return stats;

  const won = score === totalRounds;
  const newStreak = won
    ? stats.lastWonPuzzle === puzzleNumber - 1
      ? stats.currentStreak + 1
      : 1
    : 0;

  const updated: TarteebStats = {
    gamesPlayed: stats.gamesPlayed + 1,
    gamesWon: won ? stats.gamesWon + 1 : stats.gamesWon,
    perfectGames: score === totalRounds ? stats.perfectGames + 1 : stats.perfectGames,
    currentStreak: newStreak,
    maxStreak: Math.max(stats.maxStreak, newStreak),
    totalScore: stats.totalScore + score,
    lastPlayedPuzzle: puzzleNumber,
    lastWonPuzzle: won ? puzzleNumber : stats.lastWonPuzzle,
  };

  saveTarteebStats(updated);
  return updated;
}

export function getAverageScore(): number {
  const stats = loadTarteebStats();
  if (stats.gamesPlayed === 0) return 0;
  return Math.round((stats.totalScore / stats.gamesPlayed) * 10) / 10;
}
