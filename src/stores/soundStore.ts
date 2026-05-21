import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SoundState {
  muted: boolean;
  toggle: () => void;
  setMuted: (v: boolean) => void;
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set, get) => ({
      muted: false,
      toggle: () => set({ muted: !get().muted }),
      setMuted: (muted) => set({ muted }),
    }),
    { name: 'kalima.sound' },
  ),
);
