import { renderHook, waitFor, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({
  supabase: { from: mocks.from },
}));

import { useGameProgress } from './useGameProgress';
import { useUserStore } from '../stores/userStore';

const fakeProfile = { id: 'u1', displayName: null, avatarUrl: null };

function mockFetchReturning(rows: { level_index: number; stars: number }[]) {
  mocks.from.mockReturnValue({
    select: () => ({
      eq: () => ({
        eq: () => ({
          eq: () => Promise.resolve({ data: rows, error: null }),
        }),
      }),
    }),
    upsert: vi.fn(() => Promise.resolve({ error: null })),
  });
}

beforeEach(() => {
  mocks.from.mockReset();
  useUserStore.setState({ profile: fakeProfile });
});

afterEach(() => {
  useUserStore.getState().reset();
});

describe('useGameProgress', () => {
  it('fetches rows and builds map keyed by level_index', async () => {
    mockFetchReturning([
      { level_index: 0, stars: 3 },
      { level_index: 1, stars: 2 },
    ]);
    const { result } = renderHook(() => useGameProgress('letter-tap-sound', 'ar'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.progress.get(0)).toBe(3);
    expect(result.current.progress.get(1)).toBe(2);
  });

  it('returns empty map when fetch errors', async () => {
    mocks.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          eq: () => ({
            eq: () => Promise.resolve({ data: null, error: new Error('boom') }),
          }),
        }),
      }),
    });
    const { result } = renderHook(() => useGameProgress('letter-tap-sound', 'ar'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.progress.size).toBe(0);
    expect(result.current.error).toBeTruthy();
  });

  it('upsert writes when stars > existing', async () => {
    const upsertFn = vi.fn(() => Promise.resolve({ error: null }));
    mocks.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          eq: () => ({
            eq: () => Promise.resolve({ data: [{ level_index: 0, stars: 1 }], error: null }),
          }),
        }),
      }),
      upsert: upsertFn,
    });
    const { result } = renderHook(() => useGameProgress('letter-tap-sound', 'ar'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.upsert(0, 3);
    });
    expect(upsertFn).toHaveBeenCalledOnce();
    expect(result.current.progress.get(0)).toBe(3);
  });

  it('upsert no-ops when stars <= existing', async () => {
    const upsertFn = vi.fn(() => Promise.resolve({ error: null }));
    mocks.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          eq: () => ({
            eq: () => Promise.resolve({ data: [{ level_index: 0, stars: 3 }], error: null }),
          }),
        }),
      }),
      upsert: upsertFn,
    });
    const { result } = renderHook(() => useGameProgress('letter-tap-sound', 'ar'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.upsert(0, 1);
    });
    expect(upsertFn).not.toHaveBeenCalled();
    expect(result.current.progress.get(0)).toBe(3);
  });

  it('upsert writes when no existing row', async () => {
    const upsertFn = vi.fn(() => Promise.resolve({ error: null }));
    mocks.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          eq: () => ({
            eq: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
      }),
      upsert: upsertFn,
    });
    const { result } = renderHook(() => useGameProgress('letter-tap-sound', 'ar'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.upsert(5, 2);
    });
    expect(upsertFn).toHaveBeenCalledOnce();
    expect(result.current.progress.get(5)).toBe(2);
  });
});
