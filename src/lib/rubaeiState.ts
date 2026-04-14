import { getPuzzleNumber } from "@/data/words";

export type LetterState = "correct" | "present" | "absent";

export interface RubaeiGameState {
  puzzleNumber: number;
  guesses: string[];
  solvedBoards: [boolean, boolean, boolean, boolean];
  gameStatus: "playing" | "won" | "lost";
}

export interface RubaeiStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  lastPlayedPuzzle: number;
  lastWonPuzzle: number;
  guessDistribution: Record<number, number>;
}

const GAME_STATE_KEY = "kalima_rubaei_state";
const STATS_KEY = "kalima_rubaei_stats";
const MAX_GUESSES = 9;

export function getRubaeiPuzzleNumber(): number {
  return getPuzzleNumber();
}

// ── Game State ──

export function loadRubaeiGameState(): RubaeiGameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(GAME_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RubaeiGameState;
    if (parsed.puzzleNumber !== getRubaeiPuzzleNumber()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveRubaeiGameState(state: RubaeiGameState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
}

export function createInitialRubaeiState(): RubaeiGameState {
  return {
    puzzleNumber: getRubaeiPuzzleNumber(),
    guesses: [],
    solvedBoards: [false, false, false, false],
    gameStatus: "playing",
  };
}

// ── Stats ──

function defaultStats(): RubaeiStats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    lastPlayedPuzzle: -1,
    lastWonPuzzle: -1,
    guessDistribution: {
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
    },
  };
}

export function loadRubaeiStats(): RubaeiStats {
  if (typeof window === "undefined") return defaultStats();
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return defaultStats();
    return JSON.parse(raw) as RubaeiStats;
  } catch {
    return defaultStats();
  }
}

export function saveRubaeiStats(stats: RubaeiStats): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function updateRubaeiStatsOnWin(guessCount: number): RubaeiStats {
  const puzzleNumber = getRubaeiPuzzleNumber();
  const stats = loadRubaeiStats();

  if (stats.lastPlayedPuzzle === puzzleNumber) return stats;

  const newStreak =
    stats.lastWonPuzzle === puzzleNumber - 1 ? stats.currentStreak + 1 : 1;

  const updated: RubaeiStats = {
    gamesPlayed: stats.gamesPlayed + 1,
    gamesWon: stats.gamesWon + 1,
    currentStreak: newStreak,
    maxStreak: Math.max(stats.maxStreak, newStreak),
    lastPlayedPuzzle: puzzleNumber,
    lastWonPuzzle: puzzleNumber,
    guessDistribution: {
      ...stats.guessDistribution,
      [guessCount]: (stats.guessDistribution[guessCount] ?? 0) + 1,
    },
  };

  saveRubaeiStats(updated);
  return updated;
}

export function updateRubaeiStatsOnLoss(): RubaeiStats {
  const puzzleNumber = getRubaeiPuzzleNumber();
  const stats = loadRubaeiStats();

  if (stats.lastPlayedPuzzle === puzzleNumber) return stats;

  const updated: RubaeiStats = {
    ...stats,
    gamesPlayed: stats.gamesPlayed + 1,
    currentStreak: 0,
    lastPlayedPuzzle: puzzleNumber,
  };

  saveRubaeiStats(updated);
  return updated;
}

// ── Guess Evaluation ──

export function evaluateGuess(
  guess: string,
  answer: string
): LetterState[] {
  const guessChars = Array.from(guess);
  const answerChars = Array.from(answer);
  const len = guessChars.length;
  const result: LetterState[] = Array(len).fill("absent");
  const answerCounts: Record<string, number> = {};

  // First pass: mark correct positions
  for (let i = 0; i < len; i++) {
    if (guessChars[i] === answerChars[i]) {
      result[i] = "correct";
    } else {
      answerCounts[answerChars[i]] = (answerCounts[answerChars[i]] ?? 0) + 1;
    }
  }

  // Second pass: mark present letters
  for (let i = 0; i < len; i++) {
    if (result[i] === "correct") continue;
    const letter = guessChars[i];
    if (answerCounts[letter] && answerCounts[letter] > 0) {
      result[i] = "present";
      answerCounts[letter]--;
    }
  }

  return result;
}

export function getLetterStatesForBoard(
  guesses: string[],
  answer: string
): Record<string, LetterState> {
  const states: Record<string, LetterState> = {};

  for (const guess of guesses) {
    const evaluation = evaluateGuess(guess, answer);
    const guessChars = Array.from(guess);
    for (let i = 0; i < guessChars.length; i++) {
      const letter = guessChars[i];
      const current = states[letter];
      const next = evaluation[i];
      // Priority: correct > present > absent
      if (current === "correct") continue;
      if (next === "correct") {
        states[letter] = "correct";
      } else if (next === "present") {
        states[letter] = "present";
      } else if (!current) {
        states[letter] = "absent";
      }
    }
  }

  return states;
}

/**
 * Merge letter states from all 4 boards for the keyboard display.
 * Priority: correct > present > absent (best state wins across boards).
 */
export function mergeLetterStatesForKeyboard(
  boardStates: Record<string, LetterState>[]
): Record<string, LetterState> {
  const merged: Record<string, LetterState> = {};

  for (const board of boardStates) {
    for (const [letter, state] of Object.entries(board)) {
      const current = merged[letter];
      if (current === "correct") continue;
      if (state === "correct") {
        merged[letter] = "correct";
      } else if (state === "present") {
        merged[letter] = "present";
      } else if (!current) {
        merged[letter] = "absent";
      }
    }
  }

  return merged;
}
