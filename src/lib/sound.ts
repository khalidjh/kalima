import { Howl } from 'howler';

export type SoundKey =
  | 'correct'
  | 'wrong'
  | 'session_complete'
  | 'button_tap'
  | 'level_up'
  | 'streak_milestone'
  | 'star_ping_1'
  | 'star_ping_2'
  | 'star_ping_3';

// Asset paths are placeholders — actual files will be added in Phase 3
// (the game engine phase). The keys defined here are the contract.
const SOURCES: Record<SoundKey, string[]> = {
  correct: ['/sounds/correct.mp3'],
  wrong: ['/sounds/wrong.mp3'],
  session_complete: ['/sounds/session_complete.mp3'],
  button_tap: ['/sounds/button_tap.mp3'],
  level_up: ['/sounds/level_up.mp3'],
  streak_milestone: ['/sounds/streak_milestone.mp3'],
  star_ping_1: ['/sounds/star_ping_1.mp3'],
  star_ping_2: ['/sounds/star_ping_2.mp3'],
  star_ping_3: ['/sounds/star_ping_3.mp3'],
};

const cache = new Map<SoundKey, Howl>();

export function getSound(key: SoundKey): Howl {
  let howl = cache.get(key);
  if (!howl) {
    howl = new Howl({ src: SOURCES[key], preload: false, volume: 0.6 });
    cache.set(key, howl);
  }
  return howl;
}

export function playSound(key: SoundKey, muted: boolean): void {
  if (muted) return;
  getSound(key).play();
}

// Test helper — clears the memoized Howl instances.
export function __resetSoundCache(): void {
  cache.clear();
}
