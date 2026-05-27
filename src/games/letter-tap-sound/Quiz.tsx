import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { dispatchSpeak } from './audio/speak';
import { useSpeech } from '../../hooks/useSpeech';
import { Tile } from '../_engine/Tile';
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
  const lockRef = useRef(false);

  const playPrompt = useCallback(() => {
    void dispatchSpeak(target.audio_key, lang, speak);
  }, [target, lang, speak]);

  useEffect(() => {
    playPrompt();
  }, [playPrompt]);

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
        {choices.map((c) => (
          <Tile
            key={c.char}
            label={c.char}
            ariaLabel={c.name}
            isCorrect={c.char === target.char}
            onCorrect={onCorrect}
            onWrong={onWrong}
            lockRef={lockRef}
          />
        ))}
      </div>
    </div>
  );
}
