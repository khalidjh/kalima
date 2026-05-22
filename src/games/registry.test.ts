import { describe, expect, it } from 'vitest';
import {
  GAMES_REGISTRY,
  gamesForAge,
  otherGames,
} from './registry';

describe('games registry', () => {
  it('contains exactly four entries in the expected order', () => {
    expect(GAMES_REGISTRY.map((g) => g.id)).toEqual([
      'letter-tap-sound',
      'word-builder',
      'locked-1',
      'locked-2',
    ]);
  });

  it('assigns Letter Tap to 3-4 with 5-7 as also-good-for', () => {
    const lt = GAMES_REGISTRY.find((g) => g.id === 'letter-tap-sound');
    expect(lt?.primaryAge).toBe('3-4');
    expect(lt?.alsoGoodFor).toEqual(['5-7']);
    expect(lt?.status).toBe('playable');
  });

  it('assigns Word Builder to 5-7 with 8-10 as also-good-for', () => {
    const wb = GAMES_REGISTRY.find((g) => g.id === 'word-builder');
    expect(wb?.primaryAge).toBe('5-7');
    expect(wb?.alsoGoodFor).toEqual(['8-10']);
    expect(wb?.status).toBe('coming-soon');
  });

  it('marks locked placeholders with no age and locked status', () => {
    const lockedIds = ['locked-1', 'locked-2'];
    for (const id of lockedIds) {
      const tile = GAMES_REGISTRY.find((g) => g.id === id);
      expect(tile?.primaryAge).toBeNull();
      expect(tile?.alsoGoodFor).toEqual([]);
      expect(tile?.status).toBe('locked');
    }
  });
});

describe('gamesForAge', () => {
  it('returns only Letter Tap for age 3-4', () => {
    expect(gamesForAge('3-4').map((g) => g.id)).toEqual(['letter-tap-sound']);
  });

  it('returns Letter Tap then Word Builder for age 5-7 (registry order preserved)', () => {
    expect(gamesForAge('5-7').map((g) => g.id)).toEqual([
      'letter-tap-sound',
      'word-builder',
    ]);
  });

  it('returns only Word Builder for age 8-10', () => {
    expect(gamesForAge('8-10').map((g) => g.id)).toEqual(['word-builder']);
  });

  it('never includes locked tiles at any age', () => {
    for (const age of ['3-4', '5-7', '8-10'] as const) {
      const ids = gamesForAge(age).map((g) => g.id);
      expect(ids).not.toContain('locked-1');
      expect(ids).not.toContain('locked-2');
    }
  });
});

describe('otherGames', () => {
  it('returns Word Builder + both locked tiles for age 3-4', () => {
    expect(otherGames('3-4').map((g) => g.id)).toEqual([
      'word-builder',
      'locked-1',
      'locked-2',
    ]);
  });

  it('returns only the locked tiles for age 5-7', () => {
    expect(otherGames('5-7').map((g) => g.id)).toEqual([
      'locked-1',
      'locked-2',
    ]);
  });

  it('returns Letter Tap + both locked tiles for age 8-10', () => {
    expect(otherGames('8-10').map((g) => g.id)).toEqual([
      'letter-tap-sound',
      'locked-1',
      'locked-2',
    ]);
  });

  it('is the exact complement of gamesForAge', () => {
    for (const age of ['3-4', '5-7', '8-10'] as const) {
      const focus = new Set(gamesForAge(age).map((g) => g.id));
      const other = new Set(otherGames(age).map((g) => g.id));
      for (const id of focus) expect(other.has(id)).toBe(false);
      expect(focus.size + other.size).toBe(GAMES_REGISTRY.length);
    }
  });
});
