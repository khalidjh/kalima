import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({ play: vi.fn() }));

vi.mock('howler', () => ({
  Howl: vi.fn(function (this: { play: typeof mocks.play }) {
    this.play = mocks.play;
  }),
}));

import { getSound, playSound, __resetSoundCache, type SoundKey } from './sound';

const REQUIRED_KEYS: SoundKey[] = [
  'correct',
  'wrong',
  'session_complete',
  'button_tap',
  'level_up',
  'streak_milestone',
  'star_ping_1',
  'star_ping_2',
  'star_ping_3',
];

describe('lib/sound registry', () => {
  beforeEach(() => {
    mocks.play.mockClear();
    __resetSoundCache();
  });

  it.each(REQUIRED_KEYS)('has a Howl entry for %s', (key) => {
    const howl = getSound(key);
    expect(howl).toBeDefined();
  });

  it('caches per key (second getSound returns the same instance)', () => {
    const a = getSound('star_ping_1');
    const b = getSound('star_ping_1');
    expect(a).toBe(b);
  });

  it('playSound invokes Howl.play when not muted', () => {
    playSound('star_ping_2', false);
    expect(mocks.play).toHaveBeenCalledTimes(1);
  });

  it('playSound no-ops when muted', () => {
    playSound('star_ping_3', true);
    expect(mocks.play).not.toHaveBeenCalled();
  });
});
