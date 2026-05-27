import type { GameDefinition } from '../../types/game';
import { WordBuilder } from './WordBuilder';

export const game: GameDefinition = {
  id: 'word-builder',
  nameKey: 'game.word_builder.name',
  Component: WordBuilder,
};
