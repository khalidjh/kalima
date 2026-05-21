import { useCallback } from 'react';
import { playSound, type SoundKey } from '../lib/sound';
import { useSoundStore } from '../stores/soundStore';

export function useSound() {
  const muted = useSoundStore((s) => s.muted);
  const play = useCallback((key: SoundKey) => playSound(key, muted), [muted]);
  return { play, muted };
}
