import { renderHook, waitFor, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  unsubscribe: vi.fn(),
  from: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mocks.getSession,
      onAuthStateChange: mocks.onAuthStateChange,
    },
    from: mocks.from,
  },
}));

import { useAuth } from './useAuth';
import { useUserStore } from '../stores/userStore';

const fakeUser = {
  id: 'u1',
  user_metadata: { full_name: 'Khalid', avatar_url: 'http://x/a.png' },
};

const completeRow = {
  id: 'u1',
  display_name: 'Khalid',
  avatar_url: 'http://x/a.png',
  age_group: '6-8',
  learn_lang: 'ar',
  ui_lang: 'ar',
  is_premium: false,
};

beforeEach(() => {
  useUserStore.getState().reset();
  mocks.getSession.mockReset();
  mocks.onAuthStateChange.mockReset();
  mocks.from.mockReset();
  mocks.onAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: mocks.unsubscribe } },
  });
});

afterEach(() => useUserStore.getState().reset());

function mockProfileSelect(row: unknown) {
  mocks.from.mockReturnValue({
    select: () => ({
      eq: () => ({
        maybeSingle: () => Promise.resolve({ data: row, error: null }),
      }),
    }),
  });
}

describe('useAuth', () => {
  it('hydrates store from an existing profile on session restore', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: { user: fakeUser } } });
    mockProfileSelect(completeRow);

    renderHook(() => useAuth());

    await waitFor(() => {
      expect(useUserStore.getState().profile?.id).toBe('u1');
      expect(useUserStore.getState().learnLang).toBe('ar');
      expect(useUserStore.getState().ageGroup).toBe('6-8');
    });
  });

  it('resets store when session is null', async () => {
    useUserStore.getState().setProfile({ id: 'old', displayName: null, avatarUrl: null });
    mocks.getSession.mockResolvedValue({ data: { session: null } });

    renderHook(() => useAuth());

    await waitFor(() => {
      expect(useUserStore.getState().profile).toBeNull();
    });
  });

  it('unsubscribes on unmount', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: null } });
    const { unmount } = renderHook(() => useAuth());
    await act(async () => {}); // flush
    unmount();
    expect(mocks.unsubscribe).toHaveBeenCalled();
  });
});
