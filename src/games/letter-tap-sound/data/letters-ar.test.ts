import { describe, expect, it } from 'vitest';
import { LETTERS_AR } from './letters-ar';

describe('LETTERS_AR', () => {
  it('contains 28 letters', () => {
    expect(LETTERS_AR).toHaveLength(28);
  });

  it('every entry has char, name, audio_key', () => {
    for (const l of LETTERS_AR) {
      expect(l.char).toBeTruthy();
      expect(l.name).toBeTruthy();
      expect(l.audio_key).toBeTruthy();
    }
  });

  it('all chars are unique', () => {
    const chars = LETTERS_AR.map((l) => l.char);
    expect(new Set(chars).size).toBe(chars.length);
  });

  it('all audio_keys are unique', () => {
    const keys = LETTERS_AR.map((l) => l.audio_key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
