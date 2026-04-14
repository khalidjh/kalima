import { getPuzzleNumber, WORD_LENGTH } from "@/data/words";

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
const HARD_MODE_KEY = "kalima-hard-mode";

// ── Hard Mode ──

export function loadHardMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(HARD_MODE_KEY) === "true";
}

export function saveHardMode(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(HARD_MODE_KEY, enabled ? "true" : "false");
}

export interface HardModeViolation {
  type: "correct_position" | "present_required" | "absent_used";
  letter: string;
  position?: number; // 1-based, for correct_position
}

/**
 * Validate a guess against hard mode rules based on all previous guesses.
 * Returns null if valid, or a HardModeViolation describing the first rule broken.
 */
export function validateHardMode(
  guess: string,
  previousGuesses: string[],
  answer: string
): HardModeViolation | null {
  const guessChars = Array.from(guess);

  // Build cumulative constraints from all previous guesses
  // correctPositions: position -> letter (must be in that exact spot)
  // requiredLetters: set of letters that must appear somewhere
  // absentLetters: set of letters known to be absent (not in answer at all)
  const correctPositions: Map<number, string> = new Map();
  const requiredLetters: Set<string> = new Set();
  const absentLetters: Set<string> = new Set();

  for (const prev of previousGuesses) {
    const states = evaluateGuess(prev, answer);
    const prevChars = Array.from(prev);
    for (let i = 0; i < prevChars.length; i++) {
      if (states[i] === "correct") {
        correctPositions.set(i, prevChars[i]);
        requiredLetters.add(prevChars[i]);
      } else if (states[i] === "present") {
        requiredLetters.add(prevChars[i]);
      } else if (states[i] === "absent") {
        // Only mark as absent if this letter isn't also correct/present elsewhere
        // (handles duplicate letters where one instance is absent but another is present)
        if (!requiredLetters.has(prevChars[i]) && !correctPositions.has(i)) {
          absentLetters.add(prevChars[i]);
        }
      }
    }
  }

  // Remove letters from absent if they're actually required (duplicates edge case)
  for (const letter of requiredLetters) {
    absentLetters.delete(letter);
  }

  // Check 1: correct positions must be maintained
  for (const [pos, letter] of correctPositions) {
    if (guessChars[pos] !== letter) {
      return { type: "correct_position", letter, position: pos + 1 };
    }
  }

  // Check 2: present letters must appear somewhere
  for (const letter of requiredLetters) {
    if (!guessChars.includes(letter)) {
      return { type: "present_required", letter };
    }
  }

  // Check 3: absent letters should not be used
  for (let i = 0; i < guessChars.length; i++) {
    if (absentLetters.has(guessChars[i])) {
      return { type: "absent_used", letter: guessChars[i] };
    }
  }

  return null;
}

export function hardModeViolationMessage(v: HardModeViolation): string {
  switch (v.type) {
    case "correct_position":
      return `الحرف ${v.letter} يجب أن يكون في الموضع ${v.position}`;
    case "present_required":
      return `يجب استخدام الحرف ${v.letter}`;
    case "absent_used":
      return `الحرف ${v.letter} غير موجود في الكلمة`;
  }
}

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

// ── Archive Mode (separate storage, no stats impact) ──

function archiveGameKey(puzzleNum: number): string {
  return `kalima_archive_game_${puzzleNum}`;
}

export function loadArchiveGameState(puzzleNum: number): GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(archiveGameKey(puzzleNum));
    if (!raw) return null;
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}

export function saveArchiveGameState(state: GameState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(archiveGameKey(state.puzzleNumber), JSON.stringify(state));
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
  const result: LetterState[] = Array(WORD_LENGTH).fill("absent");
  const answerCounts: Record<string, number> = {};

  // First pass: mark correct positions
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessChars[i] === answerChars[i]) {
      result[i] = "correct";
    } else {
      answerCounts[answerChars[i]] = (answerCounts[answerChars[i]] ?? 0) + 1;
    }
  }

  // Second pass: mark present letters
  for (let i = 0; i < WORD_LENGTH; i++) {
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
