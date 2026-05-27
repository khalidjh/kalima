import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mascot } from '../../components/Mascot';
import { useSound } from '../../hooks/useSound';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { STAR_CASCADE_MS, CONFETTI_PARTICLES } from './timings';

interface LevelResultProps {
  stars: number;
  hasNext: boolean;
  onNext: () => void;
  onReplay: () => void;
  onBack: () => void;
}

async function burstConfetti(particleCount: number): Promise<void> {
  try {
    const mod = await import('canvas-confetti');
    mod.default({ particleCount, spread: 70, origin: { y: 0.6 } });
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('canvas-confetti failed to load:', err);
    }
  }
}

export function LevelResult({ stars, hasNext, onNext, onReplay, onBack }: LevelResultProps) {
  const { t } = useTranslation();
  const { play } = useSound();
  const reducedMotion = useReducedMotion();

  // How many stars are currently revealed. Star at index 0 reveals
  // synchronously on first paint; later stars reveal via setTimeout.
  const [revealed, setRevealed] = useState<number>(stars > 0 ? 1 : 0);
  // Whether the mascot should play its bounce animation (gated on climax + motion).
  const [climaxed, setClimaxed] = useState<boolean>(false);

  useEffect(() => {
    const earned = Math.max(0, Math.min(3, stars));
    if (earned === 0) return;

    // The pings/fanfare/confetti tied to star index `i` (0-based).
    // The climax (level_up + confetti + mascot bounce) fires at the LAST earned star.
    const lastIdx = earned - 1;
    const pingKeys: ReadonlyArray<'star_ping_1' | 'star_ping_2' | 'star_ping_3'> = [
      'star_ping_1',
      'star_ping_2',
      'star_ping_3',
    ];

    const fireSlot = (i: number) => {
      play(pingKeys[i]);
      if (i === lastIdx) {
        play('level_up');
        setClimaxed(true);
        if (!reducedMotion) {
          void burstConfetti(CONFETTI_PARTICLES);
        }
      }
    };

    // Slot 0 runs synchronously on mount.
    fireSlot(0);

    const timers: number[] = [];
    for (let i = 1; i < earned; i++) {
      const id = window.setTimeout(() => {
        setRevealed(i + 1);
        fireSlot(i);
      }, STAR_CASCADE_MS[i]);
      timers.push(id);
    }
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
    // Run once per mount per `stars` value. Capturing `play`/`reducedMotion`
    // by reference is fine — they're stable for the lifetime of the screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stars]);

  const earned = Math.max(0, Math.min(3, stars));
  const bounceMascot = climaxed && !reducedMotion;

  return (
    <section data-testid="level-result" className="flex flex-col items-center gap-6 px-6 py-8">
      <Mascot mood={bounceMascot ? 'success' : 'idle'} />
      <h2 className="font-display text-3xl text-ink">{t('game.level_complete')}</h2>
      <div className="flex gap-2 text-4xl" aria-label={t('game.stars_earned', { stars })}>
        {[0, 1, 2].map((i) => {
          const isFilled = i < earned;
          const isRevealed = i < revealed;
          if (isFilled) {
            return (
              <span
                key={i}
                data-testid="star-filled"
                data-revealed={isRevealed ? 'true' : 'false'}
                className={[
                  'inline-block transition-all duration-300',
                  isRevealed ? 'opacity-100' : 'opacity-0',
                  // Default motion: spring scale on reveal
                  !reducedMotion && isRevealed ? 'scale-100' : '',
                  !reducedMotion && !isRevealed ? 'scale-0' : '',
                ].filter(Boolean).join(' ')}
              >
                ⭐
              </span>
            );
          }
          return (
            <span key={i} data-testid="star-empty" className="opacity-60">
              ☆
            </span>
          );
        })}
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
