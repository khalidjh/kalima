import type { GameDefinition } from '../../types/game';
import { LetterTapSound } from './LetterTapSound';

export const game: GameDefinition = {
  id: 'letter-tap-sound',
  nameKey: 'game.letter_tap_sound.name',
  Component: LetterTapSound,
};
