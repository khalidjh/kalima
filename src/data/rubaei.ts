// Rubaei (رباعي) - Quordle-style game: 4 Wordle boards at once
// 9 guesses total, shared keyboard

import {
  getPuzzleNumber,
  getDailyWord,
  isValidGuess,
  VALID_ANSWERS,
} from "./words";

export type RubaeiPuzzle = {
  words: [string, string, string, string];
  puzzleNumber: number;
};

export function getRubaeiPuzzleNumber(): number {
  return getPuzzleNumber();
}

/**
 * Simple seeded PRNG (mulberry32).
 * Returns a function that produces floats in [0, 1).
 */
function seededRng(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Returns 4 deterministic words for today's puzzle.
 * Words are guaranteed to be different from each other and
 * different from the daily Huroof word.
 */
export function getDailyRubaeiWords(): [string, string, string, string] {
  const puzzleNum = getRubaeiPuzzleNumber();
  const dailyWord = getDailyWord();
  const rng = seededRng(puzzleNum * 7919);

  // Fisher-Yates shuffle of indices
  const indices = VALID_ANSWERS.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  // Pick first 4 that aren't the daily huroof word
  const words: string[] = [];
  for (const idx of indices) {
    if (words.length >= 4) break;
    const w = VALID_ANSWERS[idx];
    if (w !== dailyWord && !words.includes(w)) {
      words.push(w);
    }
  }

  return words as [string, string, string, string];
}

export function isValidRubaeiGuess(word: string): boolean {
  return isValidGuess(word);
}

export function getTodayRubaeiPuzzle(): RubaeiPuzzle {
  return {
    words: getDailyRubaeiWords(),
    puzzleNumber: getRubaeiPuzzleNumber(),
  };
}
