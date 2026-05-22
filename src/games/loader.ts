import type { GameDefinition } from '../types/game';

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
