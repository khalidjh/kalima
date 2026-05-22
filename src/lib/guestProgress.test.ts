import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadGuestProgress, saveGuestProgress } from './guestProgress';

describe('guestProgress', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns an empty map when no data exists', () => {
    const result = loadGuestProgress('letter-tap-sound', 'ar');
    expect(result.size).toBe(0);
  });

  it('round-trips stars through save then load', () => {
    saveGuestProgress('letter-tap-sound', 'ar', 0, 2);
    saveGuestProgress('letter-tap-sound', 'ar', 3, 3);
    const result = loadGuestProgress('letter-tap-sound', 'ar');
    expect(result.get(0)).toBe(2);
    expect(result.get(3)).toBe(3);
    expect(result.size).toBe(2);
  });

  it('separates progress by game and lang', () => {
    saveGuestProgress('letter-tap-sound', 'ar', 1, 3);
    saveGuestProgress('letter-tap-sound', 'en', 1, 1);
    expect(loadGuestProgress('letter-tap-sound', 'ar').get(1)).toBe(3);
    expect(loadGuestProgress('letter-tap-sound', 'en').get(1)).toBe(1);
  });

  it('overwrites a level when called again with higher stars', () => {
    saveGuestProgress('letter-tap-sound', 'ar', 0, 1);
    saveGuestProgress('letter-tap-sound', 'ar', 0, 3);
    expect(loadGuestProgress('letter-tap-sound', 'ar').get(0)).toBe(3);
  });

  it('returns empty map when localStorage throws', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(loadGuestProgress('letter-tap-sound', 'ar').size).toBe(0);
    spy.mockRestore();
  });
});
