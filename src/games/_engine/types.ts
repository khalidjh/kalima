import type { Lang, AgeGroup } from '../../stores/userStore';

export type ShellState =
  | { kind: 'select' }
  | { kind: 'playing'; levelIndex: number }
  | { kind: 'result'; levelIndex: number; stars: number };

export interface UseGameShellArgs {
  gameId: string;
  lang: Lang;
  ageGroup: AgeGroup | null;
  /** Returns the indices visible at this age, in level-order. */
  poolForAge: (age: AgeGroup | null) => number[];
}

export interface UseGameShellResult {
  state: ShellState;
  /** Progress map: levelIndex -> stars (1..3). */
  progress: Map<number, number>;
  loading: boolean;
  /** Currently-active pool, in order. */
  levelIndices: number[];
  startLevel: (levelIndex: number) => void;
  /** Call from the play screen when the level is finished. Computes stars, upserts, transitions. */
  completeLevel: (mistakes: number) => void;
  /** From the result screen: go to next level in pool. */
  next: () => void;
  /** From the result screen: replay same level. */
  replay: () => void;
  /** Return to select. */
  goBack: () => void;
  /** Whether a next level exists in the current pool. */
  hasNext: boolean;
}
