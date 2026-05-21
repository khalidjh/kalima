import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { dispatchSpeak } from './audio/speak';
import { useSpeech } from '../../hooks/useSpeech';
import type { Letter } from '../../types/game';
import type { Lang } from '../../stores/userStore';

interface QuizProps {
  target: Letter;
  choices: Letter[];
  lang: Lang;
  onCorrect: () => void;
  onWrong: () => void;
}

export function Quiz({ target, choices, lang, onCorrect, onWrong }: QuizProps) {
  const { t } = useTranslation();
  const { speak } = useSpeech();

  const play = useCallback(() => {
    void dispatchSpeak(target.audio_key, lang, speak);
  }, [target, lang, speak]);

  useEffect(() => {
    play();
  }, [play]);

  return (
    <div data-testid="quiz" className="flex flex-col items-center gap-6">
      <button
        type="button"
        data-testid="quiz-speaker"
        onClick={play}
        aria-label={t('game.tap_speaker')}
        className="text-5xl rounded-full bg-surface shadow-card w-20 h-20"
      >
        🔊
      </button>
      <div className="grid grid-cols-2 gap-4">
        {choices.map((c) => (
          <button
            key={c.char}
            type="button"
            data-testid="quiz-tile"
            aria-label={c.name}
            className="font-display text-5xl bg-surface rounded-2xl shadow-card w-24 h-24 flex items-center justify-center"
            onClick={() => (c.char === target.char ? onCorrect() : onWrong())}
          >
            {c.char}
          </button>
        ))}
      </div>
    </div>
  );
}
