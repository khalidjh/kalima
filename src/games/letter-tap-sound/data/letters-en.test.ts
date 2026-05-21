import { describe, expect, it } from 'vitest';
import { LETTERS_EN } from './letters-en';

describe('LETTERS_EN', () => {
  it('contains 26 letters', () => {
    expect(LETTERS_EN).toHaveLength(26);
  });

  it('every entry has char, name, audio_key', () => {
    for (const l of LETTERS_EN) {
      expect(l.char).toBeTruthy();
      expect(l.name).toBeTruthy();
      expect(l.audio_key).toBeTruthy();
    }
  });

  it('all chars are unique uppercase A-Z', () => {
    const chars = LETTERS_EN.map((l) => l.char);
    expect(new Set(chars).size).toBe(26);
    for (const c of chars) {
      expect(c).toMatch(/^[A-Z]$/);
    }
  });

  it('all audio_keys are unique', () => {
    const keys = LETTERS_EN.map((l) => l.audio_key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
