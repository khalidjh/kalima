import type { AgeGroup } from '../../stores/userStore';
import {
  WORDS_EN,
  WORDS_AGE_3_4,
  WORDS_AGE_5_7,
  WORDS_AGE_8_10,
  type Word,
} from './data/words-en';

export type Mode =
  | 'word-shown-no-distractors'
  | 'word-shown-with-distractors'
  | 'audio-only-with-distractors';

export interface PlayConfig {
  mode: Mode;
  extraDistractors: number;
}

export const PLAY_CONFIG_FOR_AGE: Record<AgeGroup, PlayConfig> = {
  '3-4': { mode: 'word-shown-no-distractors', extraDistractors: 0 },
  '5-7': { mode: 'word-shown-with-distractors', extraDistractors: 2 },
  '8-10': { mode: 'audio-only-with-distractors', extraDistractors: 2 },
};

export const DEFAULT_PLAY_CONFIG: PlayConfig = {
  mode: 'word-shown-with-distractors',
  extraDistractors: 2,
};

export function getPlayConfigForAge(age: AgeGroup | null): PlayConfig {
  return age === null ? DEFAULT_PLAY_CONFIG : PLAY_CONFIG_FOR_AGE[age];
}

/** Returns the words visible at this age, in WORDS_EN-index order (== level order). */
export function getWordsForAge(age: AgeGroup | null): Word[] {
  if (age === null) return WORDS_EN;
  switch (age) {
    case '3-4':
      return WORDS_AGE_3_4;
    case '5-7':
      return WORDS_AGE_5_7;
    case '8-10':
      return WORDS_AGE_8_10;
  }
}

/** Indices into WORDS_EN for the visible pool at this age. */
export function getLevelIndicesForAge(age: AgeGroup | null): number[] {
  const visible = getWordsForAge(age);
  return visible.map((w) => WORDS_EN.findIndex((x) => x.id === w.id));
}
