import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tile } from '../_engine/Tile';
import { useSpeech } from '../../hooks/useSpeech';
import type { Word } from './data/words-en';
import type { PlayConfig } from './config';

interface SpellPadProps {
  word: Word;
  config: PlayConfig;
  onComplete: (mistakes: number) => void;
}

interface RackTile {
  id: string;
  letter: string;
  /** -1 if this tile is a distractor that should never match a slot. */
  intendedSlot: number;
  used: boolean;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildRack(word: Word, config: PlayConfig): RackTile[] {
  const letterTiles: RackTile[] = word.text.split('').map((letter, idx) => ({
    id: `slot-${idx}`,
    letter,
    intendedSlot: idx,
    used: false,
  }));

  if (config.extraDistractors <= 0) return shuffle(letterTiles);

  const wordLetterSet = new Set(word.text.split(''));
  const candidates = ALPHABET.split('').filter((ch) => !wordLetterSet.has(ch));
  const chosen = shuffle(candidates).slice(0, config.extraDistractors);
  const distractorTiles: RackTile[] = chosen.map((letter, idx) => ({
    id: `distractor-${idx}-${letter}`,
    letter,
    intendedSlot: -1,
    used: false,
  }));

  return shuffle([...letterTiles, ...distractorTiles]);
}

export function SpellPad({ word, config, onComplete }: SpellPadProps) {
  const { t } = useTranslation();
  const { speak } = useSpeech();
  const initialRack = useMemo(() => buildRack(word, config), [word, config]);
  const [rack, setRack] = useState<RackTile[]>(initialRack);
  const [filled, setFilled] = useState<string[]>(() => Array(word.text.length).fill(''));
  // Tracked in a ref, not state: mistakes is never displayed during play; it's
  // only read once at completion time. Using state introduced a stale-closure
  // race when a wrong tap's feedback window (400ms) overlapped with a correct
  // completing tap's window (300ms) — the microtask fired with the pre-increment
  // value. A ref reads .current at fire time and side-steps the issue.
  const mistakesRef = useRef(0);
  const nextSlot = filled.findIndex((s) => s === '');
  const expectedLetter = nextSlot >= 0 ? word.text[nextSlot] : null;

  const playWordAudio = useCallback(() => {
    void speak(word.text, 'en');
  }, [speak, word]);

  // On mount (and when mode flips into audio-only), speak the word once.
  useEffect(() => {
    if (config.mode === 'audio-only-with-distractors') {
      playWordAudio();
    }
  }, [config.mode, playWordAudio]);

  const handleCorrect = (tile: RackTile) => {
    setRack((prev) => prev.map((t) => (t.id === tile.id ? { ...t, used: true } : t)));
    setFilled((prev) => {
      const next = [...prev];
      next[nextSlot] = tile.letter;
      const allFilled = next.every((s) => s !== '');
      if (allFilled) {
        queueMicrotask(() => onComplete(mistakesRef.current));
      }
      return next;
    });
  };

  const handleWrong = () => {
    mistakesRef.current += 1;
  };

  return (
    <div data-testid="spell-pad" className="flex flex-col items-center gap-6 px-4 py-6">
      {config.mode !== 'audio-only-with-distractors' && (
        <div data-testid="spell-word" className="font-display font-black text-4xl text-ink tracking-widest">
          {word.text}
        </div>
      )}
      {config.mode === 'audio-only-with-distractors' && (
        <button
          type="button"
          data-testid="spell-speaker"
          onClick={playWordAudio}
          aria-label={t('game.tap_speaker')}
          className="text-4xl rounded-full bg-sunny border-4 border-ink shadow-pop w-20 h-20 flex items-center justify-center active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
        >
          🔊
        </button>
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
          const isCorrect =
            expectedLetter !== null && tile.letter === expectedLetter && !tile.used;
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
