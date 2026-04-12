import { getRawabetPuzzleNumber } from "@/data/rawabet";

export interface RawabetGameState {
  puzzleNumber: number;
  selectedWords: string[];
  foundCategories: string[]; // category names found
  mistakes: number;
  gameStatus: "playing" | "won" | "lost";
}

export interface RawabetStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  lastPlayedPuzzle: number;
  lastWonPuzzle: number;
}

const GAME_STATE_KEY = "kalima_rawabet_state";
const STATS_KEY = "kalima_rawabet_stats";

export function loadRawabetGameState(): RawabetGameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(GAME_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RawabetGameState;
    if (parsed.puzzleNumber !== getRawabetPuzzleNumber()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveRawabetGameState(state: RawabetGameState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
}

// ── Archive Mode (separate storage, no stats impact) ──

function archiveRawabetKey(puzzleNum: number): string {
  return `kalima_archive_rawabet_${puzzleNum}`;
}

export function loadArchiveRawabetGameState(puzzleNum: number): RawabetGameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(archiveRawabetKey(puzzleNum));
    if (!raw) return null;
    return JSON.parse(raw) as RawabetGameState;
  } catch {
    return null;
  }
}

export function saveArchiveRawabetGameState(state: RawabetGameState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(archiveRawabetKey(state.puzzleNumber), JSON.stringify(state));
}

export function loadRawabetStats(): RawabetStats {
  if (typeof window === "undefined") return defaultStats();
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return defaultStats();
    return JSON.parse(raw) as RawabetStats;
  } catch {
    return defaultStats();
  }
}

export function saveRawabetStats(stats: RawabetStats): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function defaultStats(): RawabetStats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    lastPlayedPuzzle: -1,
    lastWonPuzzle: -1,
  };
}

export function updateRawabetStatsOnWin(): RawabetStats {
  const puzzleNumber = getRawabetPuzzleNumber();
  const stats = loadRawabetStats();
  if (stats.lastPlayedPuzzle === puzzleNumber) return stats;

  const newStreak =
    stats.lastWonPuzzle === puzzleNumber - 1 ? stats.currentStreak + 1 : 1;

  const updated: RawabetStats = {
    gamesPlayed: stats.gamesPlayed + 1,
    gamesWon: stats.gamesWon + 1,
    currentStreak: newStreak,
    maxStreak: Math.max(stats.maxStreak, newStreak),
    lastPlayedPuzzle: puzzleNumber,
    lastWonPuzzle: puzzleNumber,
  };

  saveRawabetStats(updated);
  return updated;
}

export function updateRawabetStatsOnLoss(): RawabetStats {
  const puzzleNumber = getRawabetPuzzleNumber();
  const stats = loadRawabetStats();
  if (stats.lastPlayedPuzzle === puzzleNumber) return stats;

  const updated: RawabetStats = {
    ...stats,
    gamesPlayed: stats.gamesPlayed + 1,
    currentStreak: 0,
    lastPlayedPuzzle: puzzleNumber,
  };

  saveRawabetStats(updated);
  return updated;
}
