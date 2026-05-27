import { useMemo, useState } from 'react';
import { Tile } from '../_engine/Tile';
import type { Word } from './data/words-en';
import type { PlayConfig } from './config';

interface SpellPadProps {
  word: Word;
  config: PlayConfig;
  onComplete: (mistakes: number) => void;
}

interface RackTile {
  /** Stable key per tile slot; allows duplicates of the same letter. */
  id: string;
  letter: string;
  /** Index into word.text this tile is intended to fill (or -1 for pure distractor). */
  intendedSlot: number;
  used: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Build the tile rack. For mode A: exactly the word's letters (one tile per
 * slot), scrambled. Each tile carries `intendedSlot` so we know which slot
 * it fills when tapped — important for words with duplicate letters (e.g. BOOK).
 */
function buildRack(word: Word): RackTile[] {
  const tiles: RackTile[] = word.text.split('').map((letter, idx) => ({
    id: `slot-${idx}`,
    letter,
    intendedSlot: idx,
    used: false,
  }));
  return shuffle(tiles);
}

export function SpellPad({ word, config, onComplete }: SpellPadProps) {
  const initialRack = useMemo(() => buildRack(word), [word]);
  const [rack, setRack] = useState<RackTile[]>(initialRack);
  const [filled, setFilled] = useState<string[]>(() => Array(word.text.length).fill(''));
  const [mistakes, setMistakes] = useState(0);
  const nextSlot = filled.findIndex((s) => s === '');

  const expectedLetter = nextSlot >= 0 ? word.text[nextSlot] : null;

  const handleCorrect = (tile: RackTile) => {
    setRack((prev) => prev.map((t) => (t.id === tile.id ? { ...t, used: true } : t)));
    setFilled((prev) => {
      const next = [...prev];
      next[nextSlot] = tile.letter;
      const allFilled = next.every((s) => s !== '');
      if (allFilled) {
        // Defer onComplete so it runs after this state batch settles.
        queueMicrotask(() => onComplete(mistakes));
      }
      return next;
    });
  };

  const handleWrong = () => {
    setMistakes((m) => m + 1);
  };

  return (
    <div data-testid="spell-pad" className="flex flex-col items-center gap-6 px-4 py-6">
      {config.mode !== 'audio-only-with-distractors' && (
        <div data-testid="spell-word" className="font-display font-black text-4xl text-ink tracking-widest">
          {word.text}
        </div>
      )}
      <div className="flex gap-2">
        {filled.map((ch, i) => (
          <div
            key={i}
            data-testid={`spell-slot-${i}`}
            className="w-16 h-16 border-4 border-ink rounded-2xl flex items-center justify-center font-display font-black text-4xl text-ink bg-white"
          >
            {ch}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-3">
        {rack.map((tile) => {
          // A tile is "correct" if its letter matches the next expected slot's letter.
          // For mode A (no duplicates concern), letter equality is sufficient.
          const isCorrect = expectedLetter !== null && tile.letter === expectedLetter && !tile.used;
          return (
            <Tile
              key={tile.id}
              label={tile.letter}
              ariaLabel={`letter ${tile.letter}`}
              isCorrect={isCorrect}
              disabled={tile.used}
              onCorrect={() => handleCorrect(tile)}
              onWrong={handleWrong}
            />
          );
        })}
      </div>
    </div>
  );
}
