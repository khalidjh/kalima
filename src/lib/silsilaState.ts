import { getSilsilaPuzzleNumber } from "@/data/silsila";

export interface SilsilaGameState {
  puzzleNumber: number;
  chain: string[]; // player's current chain including start/end
  currentStep: number; // which step they're working on (1-based, 0 is start word)
  currentInput: string[]; // letters being typed for current word
  gameStatus: "playing" | "won";
  startTime: number;
  endTime: number | null;
}

export interface SilsilaStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  lastPlayedPuzzle: number;
  lastWonPuzzle: number;
}

const GAME_STATE_KEY = "kalima_silsila_state";
const STATS_KEY = "kalima_silsila_stats";

export function loadSilsilaGameState(): SilsilaGameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(GAME_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SilsilaGameState;
    if (parsed.puzzleNumber !== getSilsilaPuzzleNumber()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveSilsilaGameState(state: SilsilaGameState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
}

// Archive mode
function archiveSilsilaKey(puzzleNum: number): string {
  return `kalima_archive_silsila_${puzzleNum}`;
}

export function loadArchiveSilsilaGameState(puzzleNum: number): SilsilaGameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(archiveSilsilaKey(puzzleNum));
    if (!raw) return null;
    return JSON.parse(raw) as SilsilaGameState;
  } catch {
    return null;
  }
}

export function saveArchiveSilsilaGameState(state: SilsilaGameState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(archiveSilsilaKey(state.puzzleNumber), JSON.stringify(state));
}

export function loadSilsilaStats(): SilsilaStats {
  if (typeof window === "undefined") return defaultStats();
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return defaultStats();
    return JSON.parse(raw) as SilsilaStats;
  } catch {
    return defaultStats();
  }
}

export function saveSilsilaStats(stats: SilsilaStats): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function defaultStats(): SilsilaStats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    lastPlayedPuzzle: -1,
    lastWonPuzzle: -1,
  };
}

export function updateSilsilaStatsOnWin(): SilsilaStats {
  const puzzleNumber = getSilsilaPuzzleNumber();
  const stats = loadSilsilaStats();
  if (stats.lastPlayedPuzzle === puzzleNumber) return stats;

  const newStreak =
    stats.lastWonPuzzle === puzzleNumber - 1 ? stats.currentStreak + 1 : 1;

  const updated: SilsilaStats = {
    gamesPlayed: stats.gamesPlayed + 1,
    gamesWon: stats.gamesWon + 1,
    currentStreak: newStreak,
    maxStreak: Math.max(stats.maxStreak, newStreak),
    lastPlayedPuzzle: puzzleNumber,
    lastWonPuzzle: puzzleNumber,
  };

  saveSilsilaStats(updated);
  return updated;
}
