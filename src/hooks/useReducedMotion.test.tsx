import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { useReducedMotion } from './useReducedMotion';

type Listener = (e: { matches: boolean }) => void;

interface MockMQL {
  matches: boolean;
  media: string;
  addEventListener: (type: 'change', cb: Listener) => void;
  removeEventListener: (type: 'change', cb: Listener) => void;
}

let mql: MockMQL;
let listeners: Set<Listener>;

beforeEach(() => {
  listeners = new Set();
  mql = {
    matches: false,
    media: '(prefers-reduced-motion: reduce)',
    addEventListener: (_type, cb) => listeners.add(cb),
    removeEventListener: (_type, cb) => listeners.delete(cb),
  };
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => mql),
  );
  // jsdom doesn't attach matchMedia by default; stub on window too.
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn(() => mql),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useReducedMotion', () => {
  it('returns false when the media query does not match', () => {
    mql.matches = false;
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it('returns true when the media query matches at mount', () => {
    mql.matches = true;
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it('updates when the media query changes', () => {
    mql.matches = false;
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
    act(() => {
      mql.matches = true;
      listeners.forEach((cb) => cb({ matches: true }));
    });
    expect(result.current).toBe(true);
  });

  it('removes its listener on unmount', () => {
    mql.matches = false;
    const { unmount } = renderHook(() => useReducedMotion());
    expect(listeners.size).toBe(1);
    unmount();
    expect(listeners.size).toBe(0);
  });
});
