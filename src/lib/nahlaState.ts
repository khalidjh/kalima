import { getNahlaPuzzleNumber } from "@/data/nahla";

export interface NahlaStats {
  gamesPlayed: number;
  totalScore: number;
  bestScore: number;
  currentStreak: number;
  maxStreak: number;
  lastPlayedPuzzle: number;
}

const STATS_KEY = "kalima_nahla_stats";

export function loadNahlaStats(): NahlaStats {
  if (typeof window === "undefined") return defaultStats();
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return defaultStats();
    return JSON.parse(raw) as NahlaStats;
  } catch {
    return defaultStats();
  }
}

export function saveNahlaStats(stats: NahlaStats): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function defaultStats(): NahlaStats {
  return {
    gamesPlayed: 0,
    totalScore: 0,
    bestScore: 0,
    currentStreak: 0,
    maxStreak: 0,
    lastPlayedPuzzle: -1,
  };
}

export function updateNahlaStats(finalScore: number): NahlaStats {
  const puzzleNumber = getNahlaPuzzleNumber();
  const stats = loadNahlaStats();
  if (stats.lastPlayedPuzzle === puzzleNumber) return stats;

  const newStreak =
    stats.lastPlayedPuzzle === puzzleNumber - 1 ? stats.currentStreak + 1 : 1;

  const updated: NahlaStats = {
    gamesPlayed: stats.gamesPlayed + 1,
    totalScore: stats.totalScore + finalScore,
    bestScore: Math.max(stats.bestScore, finalScore),
    currentStreak: newStreak,
    maxStreak: Math.max(stats.maxStreak, newStreak),
    lastPlayedPuzzle: puzzleNumber,
  };

  saveNahlaStats(updated);
  return updated;
}
