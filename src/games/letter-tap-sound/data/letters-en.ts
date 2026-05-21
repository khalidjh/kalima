import type { Letter } from '../../../types/game';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const LETTERS_EN: Letter[] = Array.from(ALPHABET).map((char) => ({
  char,
  name: char.toLowerCase(),
  audio_key: char.toLowerCase(),
}));
