import { describe, expect, it } from 'vitest';
import {
  CHOICES_FOR_AGE,
  DEFAULT_CHOICE_COUNT,
  LEVEL_INDICES_FOR_AGE,
  getChoiceCountForAge,
  getLevelIndicesForAge,
} from './config';
import { LETTERS_AR } from './data/letters-ar';
import { LETTERS_EN } from './data/letters-en';
import type { AgeGroup } from '../../stores/userStore';

const AGES: AgeGroup[] = ['3-4', '5-7', '8-10'];

describe('LEVEL_INDICES_FOR_AGE', () => {
  it('Arabic 3-4 pool maps to ا ب ت د س ل م ن', () => {
    const chars = LEVEL_INDICES_FOR_AGE.ar['3-4'].map((i) => LETTERS_AR[i].char);
    expect(chars).toEqual(['ا', 'ب', 'ت', 'د', 'س', 'ل', 'م', 'ن']);
  });

  it('English 3-4 pool maps to A D I M N P S T', () => {
    const chars = LEVEL_INDICES_FOR_AGE.en['3-4'].map((i) => LETTERS_EN[i].char);
    expect(chars).toEqual(['A', 'D', 'I', 'M', 'N', 'P', 'S', 'T']);
  });

  it('Arabic 5-7 and 8-10 are the full 28-letter alphabet', () => {
    const full = Array.from({ length: 28 }, (_, i) => i);
    expect(LEVEL_INDICES_FOR_AGE.ar['5-7']).toEqual(full);
    expect(LEVEL_INDICES_FOR_AGE.ar['8-10']).toEqual(full);
  });

  it('English 5-7 and 8-10 are the full 26-letter alphabet', () => {
    const full = Array.from({ length: 26 }, (_, i) => i);
    expect(LEVEL_INDICES_FOR_AGE.en['5-7']).toEqual(full);
    expect(LEVEL_INDICES_FOR_AGE.en['8-10']).toEqual(full);
  });

  it('every (lang, age) index list contains no duplicates and stays in range', () => {
    for (const lang of ['ar', 'en'] as const) {
      const maxIdx = lang === 'ar' ? 28 : 26;
      for (const age of AGES) {
        const indices = LEVEL_INDICES_FOR_AGE[lang][age];
        expect(new Set(indices).size).toBe(indices.length);
        for (const i of indices) {
          expect(i).toBeGreaterThanOrEqual(0);
          expect(i).toBeLessThan(maxIdx);
        }
      }
    }
  });
});

describe('CHOICES_FOR_AGE', () => {
  it('scales 2 / 4 / 6 across the three buckets', () => {
    expect(CHOICES_FOR_AGE['3-4']).toBe(2);
    expect(CHOICES_FOR_AGE['5-7']).toBe(4);
    expect(CHOICES_FOR_AGE['8-10']).toBe(6);
  });

  it('default fallback is 4 (current shipped behavior)', () => {
    expect(DEFAULT_CHOICE_COUNT).toBe(4);
  });
});

describe('getLevelIndicesForAge', () => {
  it('returns the bucket-specific list for known ages', () => {
    expect(getLevelIndicesForAge('ar', '3-4')).toEqual([0, 1, 2, 7, 11, 22, 23, 24]);
    expect(getLevelIndicesForAge('en', '3-4')).toEqual([0, 3, 8, 12, 13, 15, 18, 19]);
  });

  it('returns the full alphabet when age is null', () => {
    expect(getLevelIndicesForAge('ar', null)).toHaveLength(28);
    expect(getLevelIndicesForAge('en', null)).toHaveLength(26);
    expect(getLevelIndicesForAge('ar', null)).toEqual(Array.from({ length: 28 }, (_, i) => i));
  });
});

describe('getChoiceCountForAge', () => {
  it('returns 2 / 4 / 6 for known ages', () => {
    expect(getChoiceCountForAge('3-4')).toBe(2);
    expect(getChoiceCountForAge('5-7')).toBe(4);
    expect(getChoiceCountForAge('8-10')).toBe(6);
  });

  it('returns DEFAULT_CHOICE_COUNT when age is null', () => {
    expect(getChoiceCountForAge(null)).toBe(4);
  });
});

describe('pool/choice invariant', () => {
  it('every (lang, age) pool has more letters than its choice count', () => {
    for (const lang of ['ar', 'en'] as const) {
      for (const age of AGES) {
        const pool = LEVEL_INDICES_FOR_AGE[lang][age];
        const choices = CHOICES_FOR_AGE[age];
        // Need at least `choices` letters total (target + distractors) — strictly,
        // pool.length must be >= choices so distractor selection never starves.
        expect(pool.length).toBeGreaterThanOrEqual(choices);
      }
    }
  });
});
