import { describe, expect, it } from 'vitest';
import { WORDS_EN, WORDS_AGE_3_4, WORDS_AGE_5_7, WORDS_AGE_8_10 } from './words-en';

describe('words-en', () => {
  it('age 3-4 list has 8 CVC words', () => {
    expect(WORDS_AGE_3_4).toHaveLength(8);
    for (const w of WORDS_AGE_3_4) {
      expect(w.text).toMatch(/^[A-Z]{3}$/);
    }
  });

  it('age 5-7 list has 20 words of 3-4 letters', () => {
    expect(WORDS_AGE_5_7).toHaveLength(20);
    for (const w of WORDS_AGE_5_7) {
      expect(w.text.length).toBeGreaterThanOrEqual(3);
      expect(w.text.length).toBeLessThanOrEqual(4);
      expect(w.text).toMatch(/^[A-Z]+$/);
    }
  });

  it('age 8-10 list has 20 words of 4-6 letters', () => {
    expect(WORDS_AGE_8_10).toHaveLength(20);
    for (const w of WORDS_AGE_8_10) {
      expect(w.text.length).toBeGreaterThanOrEqual(4);
      expect(w.text.length).toBeLessThanOrEqual(6);
      expect(w.text).toMatch(/^[A-Z]+$/);
    }
  });

  it('combined WORDS_EN is deduped', () => {
    const ids = WORDS_EN.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every word id maps to a unique entry in WORDS_EN', () => {
    for (const w of [...WORDS_AGE_3_4, ...WORDS_AGE_5_7, ...WORDS_AGE_8_10]) {
      expect(WORDS_EN.find((x) => x.id === w.id)).toBeDefined();
    }
  });
});
