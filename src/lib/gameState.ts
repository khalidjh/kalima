import { getPuzzleNumber } from "@/data/words";

export type LetterState = "correct" | "present" | "absent" | "empty" | "tbd";

export interface GuessRow {
  letters: string[];
  states: LetterState[];
}

export interface Stats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: Record<number, number>;
  lastPlayedPuzzle: number;
  lastWonPuzzle: number;
}

export interface GameState {
  puzzleNumber: number;
  guesses: string[];
  gameStatus: "playing" | "won" | "lost";
}

const GAME_STATE_KEY = "kalima_game_state";
const STATS_KEY = "kalima_stats";

export function loadGameState(): GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(GAME_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    // Only return if it matches today's puzzle
    if (parsed.puzzleNumber !== getPuzzleNumber()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveGameState(state: GameState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
}

export function loadStats(): Stats {
  if (typeof window === "undefined") {
    return defaultStats();
  }
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return defaultStats();
    return JSON.parse(raw) as Stats;
  } catch {
    return defaultStats();
  }
}

export function saveStats(stats: Stats): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function defaultStats(): Stats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
    lastPlayedPuzzle: -1,
    lastWonPuzzle: -1,
  };
}

export function updateStatsOnWin(guessCount: number): Stats {
  const puzzleNumber = getPuzzleNumber();
  const stats = loadStats();

  // Avoid double-counting same puzzle
  if (stats.lastPlayedPuzzle === puzzleNumber) return stats;

  const newStreak =
    stats.lastWonPuzzle === puzzleNumber - 1 ? stats.currentStreak + 1 : 1;

  const updated: Stats = {
    gamesPlayed: stats.gamesPlayed + 1,
    gamesWon: stats.gamesWon + 1,
    currentStreak: newStreak,
    maxStreak: Math.max(stats.maxStreak, newStreak),
    guessDistribution: {
      ...stats.guessDistribution,
      [guessCount]: (stats.guessDistribution[guessCount] ?? 0) + 1,
    },
    lastPlayedPuzzle: puzzleNumber,
    lastWonPuzzle: puzzleNumber,
  };

  saveStats(updated);
  return updated;
}

export function updateStatsOnLoss(): Stats {
  const puzzleNumber = getPuzzleNumber();
  const stats = loadStats();

  if (stats.lastPlayedPuzzle === puzzleNumber) return stats;

  const updated: Stats = {
    ...stats,
    gamesPlayed: stats.gamesPlayed + 1,
    currentStreak: 0,
    lastPlayedPuzzle: puzzleNumber,
  };

  saveStats(updated);
  return updated;
}

export function evaluateGuess(
  guess: string,
  answer: string
): LetterState[] {
  const guessChars = Array.from(guess);
  const answerChars = Array.from(answer);
  const result: LetterState[] = Array(5).fill("absent");
  const answerCounts: Record<string, number> = {};

  // First pass: mark correct positions
  for (let i = 0; i < 5; i++) {
    if (guessChars[i] === answerChars[i]) {
      result[i] = "correct";
    } else {
      answerCounts[answerChars[i]] = (answerCounts[answerChars[i]] ?? 0) + 1;
    }
  }

  // Second pass: mark present letters
  for (let i = 0; i < 5; i++) {
    if (result[i] === "correct") continue;
    const letter = guessChars[i];
    if (answerCounts[letter] && answerCounts[letter] > 0) {
      result[i] = "present";
      answerCounts[letter]--;
    }
  }

  return result;
}

export function getKeyboardLetterStates(
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
