import type { Lang } from '../stores/userStore';
import type { ProgressMap } from '../types/game';

function key(gameId: string, lang: Lang): string {
  return `kalima.guestProgress.${gameId}.${lang}`;
}

export function loadGuestProgress(gameId: string, lang: Lang): ProgressMap {
  try {
    const raw = localStorage.getItem(key(gameId, lang));
    if (!raw) return new Map();
    const entries = JSON.parse(raw) as Array<[number, number]>;
    return new Map(entries);
  } catch (err) {
    console.warn('loadGuestProgress failed:', err);
    return new Map();
  }
}

export function saveGuestProgress(
  gameId: string,
  lang: Lang,
  levelIndex: number,
  stars: number,
): void {
  try {
    const current = loadGuestProgress(gameId, lang);
    current.set(levelIndex, stars);
    const entries = Array.from(current.entries());
    localStorage.setItem(key(gameId, lang), JSON.stringify(entries));
  } catch (err) {
    console.warn('saveGuestProgress failed:', err);
  }
}
