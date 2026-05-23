import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { dispatchSpeak } from './audio/speak';
import { useSpeech } from '../../hooks/useSpeech';
import { useSound } from '../../hooks/useSound';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { TAP_FEEDBACK_MS } from './timings';
import type { Letter } from '../../types/game';
import type { Lang } from '../../stores/userStore';

interface QuizProps {
  target: Letter;
  choices: Letter[];
  lang: Lang;
  onCorrect: () => void;
  onWrong: () => void;
}

type Feedback = { char: string; kind: 'correct' | 'wrong' } | null;

export function Quiz({ target, choices, lang, onCorrect, onWrong }: QuizProps) {
  const { t } = useTranslation();
  const { speak } = useSpeech();
  const { play } = useSound();
  const reducedMotion = useReducedMotion();

  const [feedback, setFeedback] = useState<Feedback>(null);
  const timerRef = useRef<number | null>(null);
  const lockedRef = useRef(false);

  const playPrompt = useCallback(() => {
    void dispatchSpeak(target.audio_key, lang, speak);
  }, [target, lang, speak]);

  useEffect(() => {
    playPrompt();
  }, [playPrompt]);

  // Cancel any pending feedback-completion timer on unmount.
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const handleTileClick = (c: Letter) => {
    if (lockedRef.current) return;
    lockedRef.current = true;
    const kind: 'correct' | 'wrong' = c.char === target.char ? 'correct' : 'wrong';
    setFeedback({ char: c.char, kind });
    play(kind);
    const delay = TAP_FEEDBACK_MS[kind];
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      lockedRef.current = false;
      setFeedback(null);
      if (kind === 'correct') onCorrect();
      else onWrong();
    }, delay);
  };

  return (
    <div data-testid="quiz" className="flex flex-col items-center gap-6 px-4 py-6">
      <button
        type="button"
        data-testid="quiz-speaker"
        onClick={playPrompt}
        aria-label={t('game.tap_speaker')}
        className="text-4xl rounded-full bg-sunny border-4 border-ink shadow-pop w-20 h-20 flex items-center justify-center active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
      >
        🔊
      </button>
      <div className="grid grid-cols-2 gap-4">
        {choices.map((c) => {
          const isThisTile = feedback?.char === c.char;
          const dataFeedback = isThisTile ? feedback.kind : undefined;
          return (
            <button
              key={c.char}
              type="button"
              data-testid="quiz-tile"
              data-feedback={dataFeedback}
              data-reduced-motion={isThisTile && reducedMotion ? 'true' : undefined}
              aria-label={c.name}
              className={[
                'font-display font-black text-5xl text-ink bg-white border-4 border-ink rounded-2xl shadow-pop w-24 h-24 flex items-center justify-center transition-all',
                // Default (motion-on) feedback styles — use `success` brand green for correct.
                'data-[feedback=correct]:scale-110 data-[feedback=correct]:border-success',
                'data-[feedback=wrong]:animate-shake data-[feedback=wrong]:border-tomato',
                // Reduced-motion overrides
                'data-[reduced-motion=true]:scale-100 data-[reduced-motion=true]:animate-none',
                'data-[reduced-motion=true]:data-[feedback=correct]:bg-success/40',
                'data-[reduced-motion=true]:data-[feedback=wrong]:bg-tomato/40',
                // Press effect when idle
                'active:translate-x-1 active:translate-y-1 active:shadow-none',
              ].join(' ')}
              onClick={() => handleTileClick(c)}
            >
              {c.char}
            </button>
          );
        })}
      </div>
    </div>
  );
}
