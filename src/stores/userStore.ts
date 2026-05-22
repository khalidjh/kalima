import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Lang = 'ar' | 'en';
export type AgeGroup = '3-5' | '6-8' | '9-12';

export interface Profile {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
}

interface UserState {
  profile: Profile | null;
  learnLang: Lang | null;
  uiLang: Lang;
  ageGroup: AgeGroup | null;
  isPremium: boolean;
  isGuest: boolean;
  setProfile: (p: Profile | null) => void;
  setLearnLang: (l: Lang | null) => void;
  setUiLang: (l: Lang) => void;
  setAgeGroup: (a: AgeGroup | null) => void;
  setPremium: (v: boolean) => void;
  startGuestSession: () => void;
  reset: () => void;
}

const defaults = {
  profile: null,
  learnLang: null,
  uiLang: 'ar' as Lang,
  ageGroup: null,
  isPremium: false,
  isGuest: false,
};

function generateGuestId(): string {
  const fn = (globalThis.crypto as Crypto | undefined)?.randomUUID;
  const uuid = typeof fn === 'function' ? fn.call(globalThis.crypto) : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `guest-${uuid}`;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...defaults,
      setProfile: (profile) => set({ profile }),
      setLearnLang: (learnLang) => set({ learnLang }),
      setUiLang: (uiLang) => set({ uiLang }),
      setAgeGroup: (ageGroup) => set({ ageGroup }),
      setPremium: (isPremium) => set({ isPremium }),
      startGuestSession: () => {
        if (get().isGuest) return;
        set({
          isGuest: true,
          profile: { id: generateGuestId(), displayName: null, avatarUrl: null },
        });
      },
      reset: () => set(defaults),
    }),
    { name: 'kalima.user' },
  ),
);
