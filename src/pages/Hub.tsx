import { useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUserStore } from '../stores/userStore';
import { useGameProgress } from '../hooks/useGameProgress';
import { LETTERS_AR } from '../games/letter-tap-sound/data/letters-ar';
import { LETTERS_EN } from '../games/letter-tap-sound/data/letters-en';
import {
  StarIcon,
  LetterTileIcon,
  PuzzleIcon,
  LockIcon,
  TrophyIcon,
  GearIcon,
  PlayIcon,
} from '../components/icons';

interface GameTileProps {
  testId?: string;
  icon: ReactNode;
  title: string;
  subtitle: string;
  badge?: { label: string; tone: 'free' | 'soon' | 'locked' };
  bg: string;
  onClick?: () => void;
  disabled?: boolean;
}

function GameTile({
  testId,
  icon,
  title,
  subtitle,
  badge,
  bg,
  onClick,
  disabled = false,
}: GameTileProps) {
  const badgeClasses: Record<NonNullable<GameTileProps['badge']>['tone'], string> = {
    free: 'bg-lime text-ink',
    soon: 'bg-cobalt text-white',
    locked: 'bg-ink/80 text-white',
  };

  return (
    <motion.button
      type="button"
      data-testid={testId}
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { x: 3, y: 3 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      className={[
        'relative text-start w-full rounded-2xl border-4 border-ink p-4',
        bg,
        disabled
          ? 'opacity-70 cursor-not-allowed shadow-pop'
          : 'shadow-pop active:shadow-none transition-shadow',
      ].join(' ')}
    >
      <div aria-hidden="true">{icon}</div>
      <div className="mt-2 font-black text-sm text-ink">{title}</div>
      <div className="text-[11px] font-bold text-ink/70 mt-0.5">{subtitle}</div>
      {badge && (
        <span
          className={[
            'absolute -top-2 -end-2 px-2 py-0.5 rounded-full border-2 border-ink',
            'text-[10px] font-black tracking-wide',
            badgeClasses[badge.tone],
          ].join(' ')}
        >
          {badge.label}
        </span>
      )}
    </motion.button>
  );
}

export default function Hub() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const profile = useUserStore((s) => s.profile);
  const learnLang = useUserStore((s) => s.learnLang) ?? 'ar';
  const ageGroup = useUserStore((s) => s.ageGroup);

  const { progress } = useGameProgress('letter-tap-sound', learnLang);

  const { totalLevels, completed, totalStars, nextLevelIndex } = useMemo(() => {
    const total = learnLang === 'ar' ? LETTERS_AR.length : LETTERS_EN.length;
    let done = 0;
    let stars = 0;
    for (const s of progress.values()) {
      if (s > 0) done += 1;
      stars += s;
    }
    // Find first level the player hasn't earned at least 1 star on.
    let next = 0;
    for (let i = 0; i < total; i += 1) {
      if ((progress.get(i) ?? 0) === 0) {
        next = i;
        break;
      }
    }
    return { totalLevels: total, completed: done, totalStars: stars, nextLevelIndex: next };
  }, [progress, learnLang]);

  const hasStarted = completed > 0;
  const pct = totalLevels === 0 ? 0 : Math.round((completed / totalLevels) * 100);
  const ageLabel = ageGroup ? t('hub.age_label', { range: ageGroup }) : null;

  function openLetterTap() {
    navigate('/game/letter-tap-sound');
  }

  return (
    <section
      data-testid="hub-page"
      className="px-4 sm:px-6 py-6 max-w-md mx-auto pb-24"
    >
      {/* Greeting + stats strip */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1
            data-testid="hub-greeting"
            className="font-display font-black text-2xl sm:text-3xl text-ink leading-tight truncate"
          >
            {profile?.displayName
              ? t('hub.greeting', { name: profile.displayName })
              : t('hub.greeting_fallback')}
          </h1>
          {ageLabel && (
            <div className="mt-1 inline-block bg-white border-2 border-ink rounded-full px-2.5 py-0.5 text-xs font-black text-ink shadow-pop">
              {ageLabel}
            </div>
          )}
        </div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          data-testid="hub-stars"
          className="shrink-0 flex items-center gap-1.5 bg-primary border-4 border-ink rounded-2xl px-3 py-1.5 shadow-pop"
        >
          <span aria-hidden="true" className="leading-none">
            <StarIcon size={20} />
          </span>
          <span className="font-black text-ink text-lg leading-none">{totalStars}</span>
        </motion.div>
      </div>

      {/* Continue / Start hero card */}
      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.25 }}
        data-testid="hub-continue"
        className="mt-5 rounded-3xl border-4 border-ink bg-cobalt text-white shadow-pop-lg overflow-hidden"
      >
        <div className="p-5 flex items-center gap-4">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="shrink-0 w-16 h-16 rounded-2xl bg-sunny border-4 border-ink flex items-center justify-center shadow-pop"
            aria-hidden="true"
          >
            <LetterTileIcon size={40} />
          </motion.div>
          <div className="min-w-0 flex-1">
            <div className="font-black text-lg leading-tight">
              {hasStarted ? t('hub.continue_title') : t('hub.start_title')}
            </div>
            <div className="text-xs font-bold text-white/90 mt-0.5 truncate">
              {hasStarted
                ? t('hub.level_count', { n: nextLevelIndex + 1 })
                : t('hub.start_subtitle')}
            </div>
          </div>
          <motion.button
            type="button"
            onClick={openLetterTap}
            data-testid="hub-continue-cta"
            whileTap={{ x: 3, y: 3 }}
            className="shrink-0 bg-tomato text-white border-4 border-ink rounded-2xl px-4 py-2 font-black text-base shadow-pop active:shadow-none transition-shadow"
          >
            <span className="inline-flex items-center gap-1.5">
              <PlayIcon size={20} />
              {t('hub.play_cta')}
            </span>
          </motion.button>
        </div>

        {/* Progress bar */}
        <div className="px-5 pb-5">
          <div className="flex items-center justify-between text-[11px] font-black mb-1.5">
            <span>{t('hub.progress_label', { done: completed, total: totalLevels })}</span>
            <span>{pct}%</span>
          </div>
          <div
            data-testid="hub-progress-bar"
            className="h-3 w-full bg-white/30 border-2 border-ink rounded-full overflow-hidden"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full bg-lime"
            />
          </div>
        </div>
      </motion.div>

      {/* All games section */}
      <h2 className="mt-7 font-display font-black text-xl text-ink">
        {t('hub.all_games')}
      </h2>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <GameTile
          testId="hub-card-letter-tap-sound"
          icon={<LetterTileIcon size={44} />}
          title={t('landing.card_letter_tap')}
          subtitle={t('landing.card_age_3_5')}
          badge={{ label: t('landing.free_badge'), tone: 'free' }}
          bg="bg-white"
          onClick={openLetterTap}
        />
        <GameTile
          testId="hub-card-word-builder"
          icon={<PuzzleIcon size={44} />}
          title={t('landing.card_word_builder')}
          subtitle={t('landing.card_age_6_8')}
          badge={{ label: t('hub.coming_soon'), tone: 'soon' }}
          bg="bg-cream"
          disabled
        />
        <GameTile
          testId="hub-card-locked-1"
          icon={<LockIcon size={44} />}
          title="???"
          subtitle={t('hub.locked')}
          bg="bg-white"
          disabled
        />
        <GameTile
          testId="hub-card-locked-2"
          icon={<LockIcon size={44} />}
          title="???"
          subtitle={t('hub.locked')}
          bg="bg-white"
          disabled
        />
      </div>

      {/* Menu strip */}
      <div className="mt-7 grid grid-cols-2 gap-3">
        <Link
          to="/trophies"
          data-testid="hub-menu-trophies"
          className="flex items-center justify-center gap-2 bg-accent text-white border-4 border-ink rounded-2xl py-3 font-black shadow-pop active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
        >
          <span aria-hidden="true">
            <TrophyIcon size={24} />
          </span>
          <span>{t('hub.menu_trophies')}</span>
        </Link>
        <Link
          to="/settings"
          data-testid="hub-menu-settings"
          className="flex items-center justify-center gap-2 bg-white text-ink border-4 border-ink rounded-2xl py-3 font-black shadow-pop active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
        >
          <span aria-hidden="true">
            <GearIcon size={24} />
          </span>
          <span>{t('hub.menu_settings')}</span>
        </Link>
      </div>
    </section>
  );
}
