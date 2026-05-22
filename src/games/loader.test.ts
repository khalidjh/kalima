import { describe, expect, it } from 'vitest';
import { getGame } from './loader';

describe('getGame', () => {
  it('returns the letter-tap-sound GameDefinition', () => {
    const g = getGame('letter-tap-sound');
    expect(g).toBeDefined();
    expect(g?.id).toBe('letter-tap-sound');
  });

  it('returns undefined for an unknown id', () => {
    expect(getGame('does-not-exist')).toBeUndefined();
  });
});
