export interface Word {
  id: string;
  text: string;
}

// Ages 3-4: 8 CVC words, 3 letters each. Mirrors Letter Tap's 8-letter starter pool size.
export const WORDS_AGE_3_4: Word[] = [
  { id: 'cat', text: 'CAT' },
  { id: 'dog', text: 'DOG' },
  { id: 'sun', text: 'SUN' },
  { id: 'bed', text: 'BED' },
  { id: 'hat', text: 'HAT' },
  { id: 'bus', text: 'BUS' },
  { id: 'pig', text: 'PIG' },
  { id: 'cup', text: 'CUP' },
];

// Ages 5-7: 20 words, 3-4 letters, mix of CVC + sight words.
export const WORDS_AGE_5_7: Word[] = [
  { id: 'the', text: 'THE' },
  { id: 'and', text: 'AND' },
  { id: 'big', text: 'BIG' },
  { id: 'run', text: 'RUN' },
  { id: 'red', text: 'RED' },
  { id: 'fox', text: 'FOX' },
  { id: 'book', text: 'BOOK' },
  { id: 'fish', text: 'FISH' },
  { id: 'milk', text: 'MILK' },
  { id: 'tree', text: 'TREE' },
  { id: 'bird', text: 'BIRD' },
  { id: 'moon', text: 'MOON' },
  { id: 'star', text: 'STAR' },
  { id: 'frog', text: 'FROG' },
  { id: 'king', text: 'KING' },
  { id: 'ball', text: 'BALL' },
  { id: 'ship', text: 'SHIP' },
  { id: 'farm', text: 'FARM' },
  { id: 'nest', text: 'NEST' },
  { id: 'rain', text: 'RAIN' },
];

// Ages 8-10: 20 words, 4-6 letters, broader vocab.
export const WORDS_AGE_8_10: Word[] = [
  { id: 'lion', text: 'LION' },
  { id: 'zebra', text: 'ZEBRA' },
  { id: 'tiger', text: 'TIGER' },
  { id: 'horse', text: 'HORSE' },
  { id: 'apple', text: 'APPLE' },
  { id: 'bread', text: 'BREAD' },
  { id: 'green', text: 'GREEN' },
  { id: 'water', text: 'WATER' },
  { id: 'house', text: 'HOUSE' },
  { id: 'mouse', text: 'MOUSE' },
  { id: 'black', text: 'BLACK' },
  { id: 'white', text: 'WHITE' },
  { id: 'night', text: 'NIGHT' },
  { id: 'light', text: 'LIGHT' },
  { id: 'plant', text: 'PLANT' },
  { id: 'cloud', text: 'CLOUD' },
  { id: 'smile', text: 'SMILE' },
  { id: 'music', text: 'MUSIC' },
  { id: 'ocean', text: 'OCEAN' },
  { id: 'train', text: 'TRAIN' },
];

/** Union of all words in the game, deduped, in stable order. */
export const WORDS_EN: Word[] = (() => {
  const seen = new Set<string>();
  const out: Word[] = [];
  for (const w of [...WORDS_AGE_3_4, ...WORDS_AGE_5_7, ...WORDS_AGE_8_10]) {
    if (!seen.has(w.id)) {
      seen.add(w.id);
      out.push(w);
    }
  }
  return out;
})();
