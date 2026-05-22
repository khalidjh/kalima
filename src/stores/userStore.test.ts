import { beforeEach, describe, expect, it } from 'vitest';
import { useUserStore } from './userStore';

describe('userStore', () => {
  beforeEach(() => {
    // Persist middleware writes to localStorage — clear so tests don't leak
    localStorage.removeItem('kalima.user');
    useUserStore.getState().reset();
  });

  it('has correct defaults', () => {
    const state = useUserStore.getState();
    expect(state.profile).toBeNull();
    expect(state.learnLang).toBeNull();
    expect(state.uiLang).toBe('ar');
    expect(state.ageGroup).toBeNull();
    expect(state.isPremium).toBe(false);
    expect(state.isGuest).toBe(false);
  });

  it('updates learnLang via setLearnLang', () => {
    useUserStore.getState().setLearnLang('en');
    expect(useUserStore.getState().learnLang).toBe('en');
  });

  it('updates ageGroup via setAgeGroup', () => {
    useUserStore.getState().setAgeGroup('6-8');
    expect(useUserStore.getState().ageGroup).toBe('6-8');
  });

  it('resets via reset()', () => {
    useUserStore.getState().setLearnLang('en');
    useUserStore.getState().setAgeGroup('9-12');
    useUserStore.getState().reset();
    expect(useUserStore.getState().learnLang).toBeNull();
    expect(useUserStore.getState().ageGroup).toBeNull();
  });

  it('starts a guest session with a generated id', () => {
    useUserStore.getState().startGuestSession();
    const s = useUserStore.getState();
    expect(s.isGuest).toBe(true);
    expect(s.profile?.id).toMatch(/^guest-/);
    expect(s.profile?.displayName).toBeNull();
    expect(s.profile?.avatarUrl).toBeNull();
  });

  it('reuses the same guest id on repeated calls', () => {
    useUserStore.getState().startGuestSession();
    const first = useUserStore.getState().profile?.id;
    useUserStore.getState().startGuestSession();
    const second = useUserStore.getState().profile?.id;
    expect(first).toBe(second);
  });

  it('reset() clears isGuest and profile', () => {
    useUserStore.getState().startGuestSession();
    useUserStore.getState().reset();
    expect(useUserStore.getState().isGuest).toBe(false);
    expect(useUserStore.getState().profile).toBeNull();
  });
});
