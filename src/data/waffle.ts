// Waffle puzzle data
// Each puzzle has a 5x5 grid where 3 horizontal and 3 vertical 5-letter words interlock
// Grid positions: rows 0,2,4 are horizontal words; cols 0,2,4 are vertical words
// Corners and intersections are shared letters

export interface WafflePuzzle {
  /** The 5x5 solved grid (row-major). null = empty cell (non-word positions) */
  solution: (string | null)[][];
  /** Puzzle number */
  number: number;
}

// The waffle grid shape (X = letter, . = empty):
// X X X X X   (row 0 = horizontal word 1)
// X . X . X
// X X X X X   (row 2 = horizontal word 2)
// X . X . X
// X X X X X   (row 4 = horizontal word 3)
//
// Vertical words: col 0, col 2, col 4

const WAFFLE_PUZZLES: WafflePuzzle[] = [
  {
    number: 1,
    solution: [
      ["م", "ف", "ت", "ا", "ح"],
      ["ك", null, "و", null, "ل"],
      ["ن", "ا", "ف", "ذ", "ة"],
      ["س", null, "ي", null, "و"],
      ["ة", "ط", "ر", "ا", "ن"],
    ],
  },
  {
    number: 2,
    solution: [
      ["س", "ج", "ا", "د", "ة"],
      ["ت", null, "ل", null, "و"],
      ["ا", "ر", "ع", "ا", "د"],
      ["ر", null, "ب", null, "ا"],
      ["ة", "ح", "ق", "ي", "ر"],
    ],
  },
  {
    number: 3,
    solution: [
      ["ح", "ق", "ي", "ب", "ة"],
      ["ل", null, "ا", null, "ش"],
      ["ا", "م", "ر", "ي", "ك"],
      ["و", null, "ة", null, "ا"],
      ["ة", "ج", "م", "ي", "ل"],
    ],
  },
  {
    number: 4,
    solution: [
      ["ط", "ا", "و", "ل", "ة"],
      ["م", null, "س", null, "ن"],
      ["ا", "ع", "ا", "د", "ا"],
      ["ط", null, "د", null, "ف"],
      ["م", "ش", "ة", "و", "ق"],
    ],
  },
  {
    number: 5,
    solution: [
      ["م", "ل", "ع", "ق", "ة"],
      ["ش", null, "م", null, "ب"],
      ["ر", "و", "ا", "ي", "ة"],
      ["و", null, "ر", null, "ك"],
      ["ب", "ث", "ة", "م", "ن"],
    ],
  },
  {
    number: 6,
    solution: [
      ["ف", "ن", "ج", "ا", "ن"],
      ["ط", null, "م", null, "ا"],
      ["ي", "ر", "ا", "ع", "ف"],
      ["ر", null, "ل", null, "ذ"],
      ["ة", "ك", "ة", "ب", "ة"],
    ],
  },
  {
    number: 7,
    solution: [
      ["ز", "ج", "ا", "ج", "ة"],
      ["ر", null, "ث", null, "م"],
      ["ا", "ع", "ا", "ر", "ض"],
      ["ف", null, "ر", null, "و"],
      ["ة", "م", "ة", "ن", "ع"],
    ],
  },
  {
    number: 8,
    solution: [
      ["ش", "و", "ر", "ب", "ة"],
      ["م", null, "ا", null, "ن"],
      ["ا", "م", "ح", "ا", "ل"],
      ["غ", null, "ة", null, "ا"],
      ["ة", "ف", "ض", "ي", "ل"],
    ],
  },
  {
    number: 9,
    solution: [
      ["ك", "ن", "ا", "ف", "ة"],
      ["ت", null, "م", null, "ق"],
      ["ا", "ب", "ا", "ن", "ة"],
      ["ب", null, "ك", null, "ا"],
      ["ة", "ر", "ن", "ا", "ت"],
    ],
  },
  {
    number: 10,
    solution: [
      ["ب", "ن", "ط", "ا", "ل"],
      ["ي", null, "م", null, "م"],
      ["ض", "ا", "ا", "ن", "ع"],
      ["ا", null, "ع", null, "ب"],
      ["ت", "ج", "ر", "ب", "ة"],
    ],
  },
  {
    number: 11,
    solution: [
      ["ت", "و", "ا", "ب", "ل"],
      ["م", null, "ع", null, "ع"],
      ["ر", "ا", "ي", "ا", "ت"],
      ["ا", null, "ن", null, "ي"],
      ["ت", "م", "ة", "ح", "ل"],
    ],
  },
  {
    number: 12,
    solution: [
      ["ق", "م", "ص", "ا", "ن"],
      ["ط", null, "ي", null, "ا"],
      ["ا", "ر", "ا", "ن", "ب"],
      ["ر", null, "د", null, "ا"],
      ["ة", "خ", "ة", "ض", "ر"],
    ],
  },
  {
    number: 13,
    solution: [
      ["و", "س", "ا", "د", "ة"],
      ["ا", null, "ث", null, "ق"],
      ["ج", "ب", "ا", "ن", "ة"],
      ["ب", null, "ر", null, "ي"],
      ["ة", "ف", "ة", "ك", "ل"],
    ],
  },
  {
    number: 14,
    solution: [
      ["ص", "ا", "ب", "و", "ن"],
      ["ي", null, "ط", null, "ظ"],
      ["ن", "ا", "ا", "ل", "م"],
      ["ي", null, "ل", null, "ي"],
      ["ة", "ه", "ة", "د", "ف"],
    ],
  },
  {
    number: 15,
    solution: [
      ["د", "ج", "ا", "ج", "ة"],
      ["ر", null, "ح", null, "ع"],
      ["ا", "ه", "ا", "ل", "ك"],
      ["س", null, "د", null, "ب"],
      ["ة", "ف", "ة", "ق", "ط"],
    ],
  },
  {
    number: 16,
    solution: [
      ["ف", "ل", "ا", "ف", "ل"],
      ["ا", null, "م", null, "ع"],
      ["ت", "ب", "ا", "ع", "د"],
      ["ح", null, "ر", null, "ي"],
      ["ة", "م", "ة", "ن", "ع"],
    ],
  },
  {
    number: 17,
    solution: [
      ["ه", "ر", "ي", "س", "ة"],
      ["ا", null, "ا", null, "م"],
      ["ت", "ف", "ض", "ي", "ل"],
      ["ف", null, "ة", null, "ب"],
      ["ي", "ق", "ب", "ض", "ة"],
    ],
  },
  {
    number: 18,
    solution: [
      ["ج", "و", "ا", "ر", "ب"],
      ["م", null, "س", null, "ل"],
      ["ا", "ع", "ا", "ل", "م"],
      ["ع", null, "ن", null, "ا"],
      ["ة", "ك", "ي", "د", "ة"],
    ],
  },
  {
    number: 19,
    solution: [
      ["م", "غ", "س", "ل", "ة"],
      ["ق", null, "ا", null, "ك"],
      ["ا", "م", "ب", "ر", "د"],
      ["ل", null, "ر", null, "ا"],
      ["ة", "و", "ة", "ض", "ع"],
    ],
  },
  {
    number: 20,
    solution: [
      ["ح", "ل", "ا", "و", "ة"],
      ["ر", null, "خ", null, "ج"],
      ["ا", "م", "ب", "ا", "ل"],
      ["ر", null, "ا", null, "ا"],
      ["ة", "ن", "ر", "ا", "ت"],
    ],
  },
  {
    number: 21,
    solution: [
      ["ف", "ط", "ي", "ر", "ة"],
      ["ل", null, "ا", null, "ش"],
      ["ا", "ح", "ب", "ا", "ل"],
      ["ف", null, "ر", null, "ا"],
      ["ل", "م", "ة", "ه", "ن"],
    ],
  },
  {
    number: 22,
    solution: [
      ["ط", "م", "ا", "ط", "م"],
      ["ب", null, "ث", null, "ع"],
      ["ا", "خ", "ا", "ل", "ص"],
      ["خ", null, "ر", null, "ا"],
      ["ل", "م", "ة", "ك", "ن"],
    ],
  },
  {
    number: 23,
    solution: [
      ["خ", "ي", "ا", "ر", "ة"],
      ["ب", null, "ف", null, "ق"],
      ["ر", "ا", "ض", "ي", "ة"],
      ["ا", null, "ل", null, "ح"],
      ["ت", "ف", "ة", "ع", "ل"],
    ],
  },
  {
    number: 24,
    solution: [
      ["ن", "ا", "ف", "ذ", "ة"],
      ["ب", null, "ل", null, "غ"],
      ["ا", "ش", "ا", "ر", "ة"],
      ["ت", null, "ف", null, "ي"],
      ["ة", "ق", "ة", "ب", "ل"],
    ],
  },
  {
    number: 25,
    solution: [
      ["م", "ش", "ر", "و", "ب"],
      ["ق", null, "س", null, "ا"],
      ["ا", "ي", "ا", "ل", "ة"],
      ["ل", null, "م", null, "غ"],
      ["ة", "ف", "ة", "ر", "ة"],
    ],
  },
  {
    number: 26,
    solution: [
      ["ع", "ب", "ا", "ء", "ة"],
      ["ر", null, "ع", null, "ج"],
      ["ا", "م", "ا", "ل", "ك"],
      ["ق", null, "د", null, "ب"],
      ["ب", "ث", "ة", "م", "ن"],
    ],
  },
  {
    number: 27,
    solution: [
      ["م", "ك", "ن", "س", "ة"],
      ["ع", null, "ش", null, "ع"],
      ["ا", "ب", "ا", "ر", "ة"],
      ["ل", null, "ط", null, "ت"],
      ["م", "ه", "ة", "ن", "ب"],
    ],
  },
  {
    number: 28,
    solution: [
      ["ث", "ل", "ا", "ج", "ة"],
      ["ق", null, "ث", null, "م"],
      ["ا", "م", "ب", "ا", "ل"],
      ["ف", null, "ت", null, "و"],
      ["ة", "ك", "ة", "ب", "ج"],
    ],
  },
  {
    number: 29,
    solution: [
      ["س", "ت", "ا", "ر", "ة"],
      ["م", null, "خ", null, "ب"],
      ["ا", "ق", "ب", "ا", "ل"],
      ["ع", null, "ا", null, "ا"],
      ["ة", "ط", "ر", "ا", "ن"],
    ],
  },
  {
    number: 30,
    solution: [
      ["ص", "ي", "ن", "ي", "ة"],
      ["د", null, "ا", null, "ب"],
      ["ا", "م", "ف", "ا", "ق"],
      ["ق", null, "ذ", null, "ع"],
      ["ة", "ك", "ة", "ب", "د"],
    ],
  },
];

export function getWafflePuzzleNumber(): number {
  const riyadhOffset = 3 * 60;
  const now = new Date();
  const utcNow = now.getTime() + now.getTimezoneOffset() * 60000;
  const riyadhNow = new Date(utcNow + riyadhOffset * 60000);

  const launch = new Date("2026-01-01T00:00:00");
  const diffMs = riyadhNow.getTime() - launch.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1);
}

export function getWafflePuzzleByNumber(num: number): WafflePuzzle | null {
  const idx = ((num - 1) % WAFFLE_PUZZLES.length);
  return WAFFLE_PUZZLES[idx] ?? null;
}

export function getTodayWafflePuzzle(): WafflePuzzle | null {
  return getWafflePuzzleByNumber(getWafflePuzzleNumber());
}

/** Returns true if (row, col) is a letter cell in the waffle grid */
export function isWaffleCell(row: number, col: number): boolean {
  // Row 0, 2, 4 = full rows
  if (row === 0 || row === 2 || row === 4) return true;
  // Row 1, 3 = only cols 0, 2, 4
  if ((row === 1 || row === 3) && (col === 0 || col === 2 || col === 4)) return true;
  return false;
}

/** Get all valid cell positions */
export function getWaffleCellPositions(): [number, number][] {
  const positions: [number, number][] = [];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (isWaffleCell(r, c)) positions.push([r, c]);
    }
  }
  return positions;
}
