import { describe, expect, it } from 'vitest';
import { getGame, listGames } from './registry';

describe('game registry', () => {
  it('listGames returns at least one game', () => {
    expect(listGames().length).toBeGreaterThan(0);
  });

  it('getGame returns letter-tap-sound', () => {
    const g = getGame('letter-tap-sound');
    expect(g).toBeDefined();
    expect(g?.id).toBe('letter-tap-sound');
  });

  it('getGame returns undefined for unknown id', () => {
    expect(getGame('does-not-exist')).toBeUndefined();
  });
});
