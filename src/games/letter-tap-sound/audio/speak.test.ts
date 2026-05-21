import { describe, expect, it, vi } from 'vitest';
import { dispatchSpeak, FALLBACK_KEYS, playMp3 } from './speak';

describe('FALLBACK_KEYS', () => {
  it('starts empty', () => {
    expect(FALLBACK_KEYS.size).toBe(0);
  });
});

describe('dispatchSpeak', () => {
  it('uses synth when key is not in fallback set', async () => {
    const synth = vi.fn().mockResolvedValue(undefined);
    const mp3 = vi.fn().mockResolvedValue(undefined);
    await dispatchSpeak('alif', 'ar', synth, mp3);
    expect(synth).toHaveBeenCalledWith('alif', 'ar');
    expect(mp3).not.toHaveBeenCalled();
  });

  it('uses mp3 when compound key is in fallback set', async () => {
    const synth = vi.fn().mockResolvedValue(undefined);
    const mp3 = vi.fn().mockResolvedValue(undefined);
    FALLBACK_KEYS.add('ar-ayn');
    try {
      await dispatchSpeak('ayn', 'ar', synth, mp3);
      expect(mp3).toHaveBeenCalledWith('/audio/fallbacks/ar-ayn.mp3');
      expect(synth).not.toHaveBeenCalled();
    } finally {
      FALLBACK_KEYS.delete('ar-ayn');
    }
  });

  it('falls back to synth if mp3 throws', async () => {
    const synth = vi.fn().mockResolvedValue(undefined);
    const mp3 = vi.fn().mockRejectedValue(new Error('404'));
    FALLBACK_KEYS.add('ar-ayn');
    try {
      await dispatchSpeak('ayn', 'ar', synth, mp3);
      expect(synth).toHaveBeenCalledWith('ayn', 'ar');
    } finally {
      FALLBACK_KEYS.delete('ar-ayn');
    }
  });
});

describe('playMp3', () => {
  it('returns a promise', () => {
    // Cannot actually play in jsdom; just confirm it returns a thenable.
    const result = playMp3('/audio/fallbacks/missing.mp3');
    expect(typeof result.then).toBe('function');
    result.catch(() => undefined);
  });
});
