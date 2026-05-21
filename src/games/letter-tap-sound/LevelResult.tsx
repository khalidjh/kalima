import { useTranslation } from 'react-i18next';
import { Mascot } from '../../components/Mascot';

interface LevelResultProps {
  stars: number;
  hasNext: boolean;
  onNext: () => void;
  onReplay: () => void;
  onBack: () => void;
}

export function LevelResult({ stars, hasNext, onNext, onReplay, onBack }: LevelResultProps) {
  const { t } = useTranslation();
  return (
    <section data-testid="level-result" className="flex flex-col items-center gap-6 px-6 py-8">
      <Mascot mood="success" />
      <h2 className="font-display text-3xl text-ink">{t('game.level_complete')}</h2>
      <div className="flex gap-2 text-4xl" aria-label={t('game.stars_earned', { stars })}>
        {[1, 2, 3].map((i) =>
          i <= stars ? (
            <span key={i} data-testid="star-filled">⭐</span>
          ) : (
            <span key={i} data-testid="star-empty">☆</span>
          ),
        )}
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {hasNext && (
          <button
            type="button"
            data-testid="result-next"
            onClick={onNext}
            className="bg-accent text-white rounded-2xl py-3 font-display text-lg"
          >
            {t('game.next_level')}
          </button>
        )}
        <button
          type="button"
          data-testid="result-replay"
          onClick={onReplay}
          className="bg-surface text-ink rounded-2xl py-3 font-display text-lg shadow-card"
        >
          {t('game.replay')}
        </button>
        <button
          type="button"
          data-testid="result-back"
          onClick={onBack}
          className="bg-surface text-ink rounded-2xl py-3 font-display text-lg shadow-card"
        >
          {t('game.back_to_levels')}
        </button>
      </div>
    </section>
  );
}
