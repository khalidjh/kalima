import { describe, expect, it } from 'vitest';
import { starsFor } from './stars';

describe('starsFor', () => {
  it('returns 3 for 0 mistakes', () => {
    expect(starsFor(0)).toBe(3);
  });
  it('returns 2 for 1 mistake', () => {
    expect(starsFor(1)).toBe(2);
  });
  it('returns 1 for 2 mistakes', () => {
    expect(starsFor(2)).toBe(1);
  });
  it('returns 1 for 5 mistakes (floor at 1)', () => {
    expect(starsFor(5)).toBe(1);
  });
});
