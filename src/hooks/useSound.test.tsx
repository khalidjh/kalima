import { renderHook } from '@testing-library/react';
import { vi, beforeEach } from 'vitest';
import { useSoundStore } from '../stores/soundStore';
import { __resetSoundCache } from '../lib/sound';
import { useSound } from './useSound';

const mocks = vi.hoisted(() => ({ play: vi.fn() }));

vi.mock('howler', () => ({
  Howl: vi.fn(function (this: { play: typeof mocks.play }) {
    this.play = mocks.play;
  }),
}));

describe('useSound', () => {
  beforeEach(() => {
    mocks.play.mockClear();
    useSoundStore.setState({ muted: false });
    __resetSoundCache();
  });

  it('plays sound when unmuted', () => {
    const { result } = renderHook(() => useSound());
    result.current.play('button_tap');
    expect(mocks.play).toHaveBeenCalledTimes(1);
  });

  it('does not play when muted', () => {
    useSoundStore.setState({ muted: true });
    const { result } = renderHook(() => useSound());
    result.current.play('button_tap');
    expect(mocks.play).not.toHaveBeenCalled();
  });
});
