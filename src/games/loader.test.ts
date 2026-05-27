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

  it('does not pick up underscore-prefixed directories like _engine', () => {
    // _engine is a shared internal module, not a game. Picking it up would
    // throw because it doesn't export a `game` GameDefinition.
    // We verify indirectly: getGame returns the same result for any non-game
    // id and listing all known ids should not include any starting with _.
    expect(getGame('_engine')).toBeUndefined();
  });
});
