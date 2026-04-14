import { getIqtibasPuzzleNumber } from "@/data/iqtibas";

export interface IqtibasGameState {
  puzzleNumber: number;
  mappings: Record<string, string>; // encrypted letter -> player's guess
  hintsUsed: number;
  gameStatus: "playing" | "won";
  startTime: number;
  endTime: number | null;
}

export interface IqtibasStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  lastPlayedPuzzle: number;
  lastWonPuzzle: number;
}

const GAME_STATE_KEY = "kalima_iqtibas_state";
const STATS_KEY = "kalima_iqtibas_stats";

export function loadIqtibasGameState(): IqtibasGameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(GAME_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as IqtibasGameState;
    if (parsed.puzzleNumber !== getIqtibasPuzzleNumber()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveIqtibasGameState(state: IqtibasGameState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
}

// Archive mode
function archiveIqtibasKey(puzzleNum: number): string {
  return `kalima_archive_iqtibas_${puzzleNum}`;
}

export function loadArchiveIqtibasGameState(puzzleNum: number): IqtibasGameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(archiveIqtibasKey(puzzleNum));
    if (!raw) return null;
    return JSON.parse(raw) as IqtibasGameState;
  } catch {
    return null;
  }
}

export function saveArchiveIqtibasGameState(state: IqtibasGameState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(archiveIqtibasKey(state.puzzleNumber), JSON.stringify(state));
}

export function loadIqtibasStats(): IqtibasStats {
  if (typeof window === "undefined") return defaultStats();
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return defaultStats();
    return JSON.parse(raw) as IqtibasStats;
  } catch {
    return defaultStats();
  }
}

export function saveIqtibasStats(stats: IqtibasStats): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function defaultStats(): IqtibasStats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    lastPlayedPuzzle: -1,
    lastWonPuzzle: -1,
  };
}

export function updateIqtibasStatsOnWin(): IqtibasStats {
  const puzzleNumber = getIqtibasPuzzleNumber();
  const stats = loadIqtibasStats();
  if (stats.lastPlayedPuzzle === puzzleNumber) return stats;

  const newStreak =
    stats.lastWonPuzzle === puzzleNumber - 1 ? stats.currentStreak + 1 : 1;

  const updated: IqtibasStats = {
    gamesPlayed: stats.gamesPlayed + 1,
    gamesWon: stats.gamesWon + 1,
    currentStreak: newStreak,
    maxStreak: Math.max(stats.maxStreak, newStreak),
    lastPlayedPuzzle: puzzleNumber,
    lastWonPuzzle: puzzleNumber,
  };

  saveIqtibasStats(updated);
  return updated;
}
