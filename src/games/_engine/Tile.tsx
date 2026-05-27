import { useEffect, useRef, useState, type MutableRefObject, type ReactNode } from 'react';
import { useSound } from '../../hooks/useSound';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { TAP_FEEDBACK_MS } from './timings';

interface TileProps {
  label: ReactNode;       // what the child sees on the tile face (letter, etc.)
  ariaLabel: string;      // screen-reader label
  isCorrect: boolean;     // does this tile, if tapped, count as correct?
  onCorrect: () => void;  // fired after the correct-feedback window
  onWrong: () => void;    // fired after the wrong-feedback window
  disabled?: boolean;     // tap is a no-op (e.g., this letter already placed)
  className?: string;     // extra classes for per-game styling (size, etc.)
  /** Optional shared lock so sibling tiles can't all register taps during one feedback window. */
  lockRef?: MutableRefObject<boolean>;
}

type Feedback = 'correct' | 'wrong' | null;

export function Tile({ label, ariaLabel, isCorrect, onCorrect, onWrong, disabled, className, lockRef }: TileProps) {
  const { play } = useSound();
  const reducedMotion = useReducedMotion();

  const [feedback, setFeedback] = useState<Feedback>(null);
  const timerRef = useRef<number | null>(null);
  const internalLockRef = useRef(false);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // The branching avoids `(lockRef ?? internalLockRef).current = v`, which the
  // React Compiler ESLint rule treats as mutation through a possibly-aliased
  // prop ref. Keep the helpers — don't "simplify" them back to `??`.
  const setLocked = (v: boolean) => {
    if (lockRef) lockRef.current = v;
    else internalLockRef.current = v;
  };
  const isLocked = () => (lockRef ? lockRef.current : internalLockRef.current);

  const handleClick = () => {
    if (disabled || isLocked()) return;
    setLocked(true);
    const kind: 'correct' | 'wrong' = isCorrect ? 'correct' : 'wrong';
    setFeedback(kind);
    play(kind);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      setLocked(false);
      setFeedback(null);
      if (kind === 'correct') onCorrect();
      else onWrong();
    }, TAP_FEEDBACK_MS[kind]);
  };

  return (
    <button
      type="button"
      data-testid="engine-tile"
      data-feedback={feedback ?? undefined}
      data-reduced-motion={feedback && reducedMotion ? 'true' : undefined}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={handleClick}
      className={[
        'font-display font-black text-5xl text-ink bg-white border-4 border-ink rounded-2xl shadow-pop w-24 h-24 flex items-center justify-center transition-all',
        'data-[feedback=correct]:scale-110 data-[feedback=correct]:border-success',
        'data-[feedback=wrong]:animate-shake data-[feedback=wrong]:border-tomato',
        'data-[reduced-motion=true]:scale-100 data-[reduced-motion=true]:animate-none',
        'data-[reduced-motion=true]:data-[feedback=correct]:bg-success/40',
        'data-[reduced-motion=true]:data-[feedback=wrong]:bg-tomato/40',
        'active:translate-x-1 active:translate-y-1 active:shadow-none',
        'disabled:opacity-40 disabled:active:translate-x-0 disabled:active:translate-y-0',
        className ?? '',
      ].join(' ')}
    >
      {label}
    </button>
  );
}
