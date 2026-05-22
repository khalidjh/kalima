import type { AgeGroup } from '../stores/userStore';
import type { GameDefinition } from '../types/game';

export type GameStatus = 'playable' | 'coming-soon' | 'locked';
export type GameBadgeTone = 'free' | 'soon' | 'locked';

export interface GameMeta {
  id: string;
  testIdSlug: string;
  titleKey: string;
  subtitleKey: string;
  primaryAge: AgeGroup | null;
  alsoGoodFor: AgeGroup[];
  badge?: { labelKey: string; tone: GameBadgeTone };
  bg: string;
  status: GameStatus;
  route?: string;
}

export const GAMES_REGISTRY: GameMeta[] = [
  {
    id: 'letter-tap-sound',
    testIdSlug: 'letter-tap-sound',
    titleKey: 'landing.card_letter_tap',
    subtitleKey: 'landing.card_age_3_4',
    primaryAge: '3-4',
    alsoGoodFor: ['5-7'],
    badge: { labelKey: 'landing.free_badge', tone: 'free' },
    bg: 'bg-white',
    status: 'playable',
    route: '/game/letter-tap-sound',
  },
  {
    id: 'word-builder',
    testIdSlug: 'word-builder',
    titleKey: 'landing.card_word_builder',
    subtitleKey: 'landing.card_age_5_7',
    primaryAge: '5-7',
    alsoGoodFor: ['8-10'],
    badge: { labelKey: 'hub.coming_soon', tone: 'soon' },
    bg: 'bg-cream',
    status: 'coming-soon',
  },
  {
    id: 'locked-1',
    testIdSlug: 'locked-1',
    titleKey: 'hub.locked_title',
    subtitleKey: 'hub.locked',
    primaryAge: null,
    alsoGoodFor: [],
    bg: 'bg-white',
    status: 'locked',
  },
  {
    id: 'locked-2',
    testIdSlug: 'locked-2',
    titleKey: 'hub.locked_title',
    subtitleKey: 'hub.locked',
    primaryAge: null,
    alsoGoodFor: [],
    bg: 'bg-white',
    status: 'locked',
  },
];

export function gamesForAge(age: AgeGroup): GameMeta[] {
  return GAMES_REGISTRY.filter(
    (g) => g.primaryAge === age || g.alsoGoodFor.includes(age),
  );
}

export function otherGames(age: AgeGroup): GameMeta[] {
  const inFocus = new Set(gamesForAge(age).map((g) => g.id));
  return GAMES_REGISTRY.filter((g) => !inFocus.has(g.id));
}

/**
 * Backward compatibility: load game definitions from dynamic modules
 * Used by Game.tsx page routing
 * @deprecated Task 3 will refactor to use GAMES_REGISTRY directly
 */
interface GameModule {
  game: GameDefinition;
}

const modules = import.meta.glob<GameModule>('./*/index.ts', { eager: true });

const GAMES: Record<string, GameDefinition> = {};
for (const mod of Object.values(modules)) {
  GAMES[mod.game.id] = mod.game;
}

export function getGame(id: string): GameDefinition | undefined {
  return GAMES[id];
}
