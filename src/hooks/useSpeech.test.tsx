import { renderHook, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSpeech } from './useSpeech';

interface FakeUtterance {
  text: string;
  lang: string;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

let fakeSpeak: ReturnType<typeof vi.fn>;
let lastUtterance: FakeUtterance | null;
const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'speechSynthesis');
const originalUtterance = (globalThis as Record<string, unknown>).SpeechSynthesisUtterance;

beforeEach(() => {
  fakeSpeak = vi.fn((u: FakeUtterance) => {
    lastUtterance = u;
    u.onend?.();
  });
  lastUtterance = null;
  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    value: { speak: fakeSpeak, cancel: vi.fn(), getVoices: () => [] },
  });
  (globalThis as Record<string, unknown>).SpeechSynthesisUtterance = vi.fn(function (
    this: FakeUtterance,
    text: string,
  ) {
    this.text = text;
    this.lang = '';
    this.onend = null;
    this.onerror = null;
  });
});

afterEach(() => {
  if (originalDescriptor) Object.defineProperty(window, 'speechSynthesis', originalDescriptor);
  else delete (window as unknown as Record<string, unknown>).speechSynthesis;
  (globalThis as Record<string, unknown>).SpeechSynthesisUtterance = originalUtterance;
});

describe('useSpeech', () => {
  it('reports supported when API is available', () => {
    const { result } = renderHook(() => useSpeech());
    expect(result.current.supported).toBe(true);
  });

  it('calls speechSynthesis.speak with the requested text and lang', async () => {
    const { result } = renderHook(() => useSpeech());
    await act(async () => {
      await result.current.speak('alif', 'ar');
    });
    expect(fakeSpeak).toHaveBeenCalledOnce();
    expect(lastUtterance?.text).toBe('alif');
    expect(lastUtterance?.lang).toBe('ar-SA');
  });

  it('maps en to en-US', async () => {
    const { result } = renderHook(() => useSpeech());
    await act(async () => {
      await result.current.speak('a', 'en');
    });
    expect(lastUtterance?.lang).toBe('en-US');
  });

  it('resolves the promise when utterance ends', async () => {
    const { result } = renderHook(() => useSpeech());
    fakeSpeak.mockImplementation((u: FakeUtterance) => {
      lastUtterance = u;
      queueMicrotask(() => u.onend?.());
    });
    await expect(result.current.speak('alif', 'ar')).resolves.toBeUndefined();
  });

  it('reports not supported when API missing', () => {
    delete (window as unknown as Record<string, unknown>).speechSynthesis;
    const { result } = renderHook(() => useSpeech());
    expect(result.current.supported).toBe(false);
  });
});
