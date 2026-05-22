import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/Button';
import { signInWithGoogle } from '../lib/auth';
import { useUserStore } from '../stores/userStore';

export default function Landing() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const profile = useUserStore((s) => s.profile);
  const learnLang = useUserStore((s) => s.learnLang);
  const ageGroup = useUserStore((s) => s.ageGroup);
  const startGuestSession = useUserStore((s) => s.startGuestSession);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function handleGuest() {
    setError(null);
    startGuestSession();
    navigate('/onboarding');
  }

  useEffect(() => {
    if (profile && learnLang && ageGroup) {
      navigate('/hub', { replace: true });
    }
  }, [profile, learnLang, ageGroup, navigate]);

  async function handleStart() {
    setError(null);
    setPending(true);
    try {
      const { error: oauthError } = await signInWithGoogle();
      if (oauthError) {
        console.error('signInWithGoogle error:', oauthError);
        setError(t('errors.action_failed'));
        setPending(false);
      }
      // success path: browser navigates away to Google
    } catch (err) {
      console.error('signInWithGoogle threw:', err);
      setError(t('errors.action_failed'));
      setPending(false);
    }
  }

  return (
    <section data-testid="landing-page" className="px-5 py-10 max-w-md mx-auto">
      {/* Hero */}
      <div className="text-center">
        {/* Mascot */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="relative mx-auto w-44 h-44 sm:w-52 sm:h-52"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full bg-cobalt border-4 border-ink shadow-pop-lg flex items-center justify-center text-7xl sm:text-8xl"
            aria-hidden="true"
          >
            🐝
          </motion.div>
          <motion.span
            initial={{ rotate: -12, scale: 0 }}
            animate={{ rotate: -12, scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
            className="absolute -top-2 -right-2 sm:-right-4 bg-tomato text-white font-black text-sm px-3 py-1 rounded-full border-2 border-ink shadow-pop"
          >
            {t('landing.fun_badge')}
          </motion.span>
        </motion.div>

        {/* Headline */}
        <h1 className="font-display font-black text-5xl sm:text-6xl text-ink mt-6 leading-[0.95] tracking-tight">
          {t('landing.headline_top')}
          <br />
          <span className="text-cobalt">{t('landing.headline_bottom')}</span>
        </h1>

        <p className="text-ink mt-4 font-bold text-base sm:text-lg">
          {t('landing.tagline')}
        </p>

        {/* CTA */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <Button
            variant="pop"
            size="lg"
            onClick={handleStart}
            disabled={pending}
            data-testid="landing-start-button"
          >
            ▶ {t('landing.cta_start')}
          </Button>
          <button
            type="button"
            onClick={handleGuest}
            data-testid="landing-guest-button"
            className="text-ink font-black text-base underline underline-offset-4 decoration-2 decoration-ink/40 hover:decoration-ink"
          >
            {t('landing.cta_guest')}
          </button>
        </div>

        {error && (
          <p
            data-testid="landing-error"
            role="alert"
            className="mt-3 text-tomato font-bold text-sm"
          >
            {error}
          </p>
        )}
      </div>

      {/* Game preview cards */}
      <div className="mt-10 grid grid-cols-2 gap-4">
        <div className="bg-white border-4 border-ink rounded-2xl p-4 shadow-pop">
          <div className="text-3xl" aria-hidden="true">
            🔤
          </div>
          <div className="font-black text-sm mt-2 text-ink">
            {t('landing.card_letter_tap')}
          </div>
          <div className="text-xs font-bold text-ink/60 mt-0.5">
            {t('landing.card_age_3_5')}
          </div>
          <div className="text-[10px] font-black text-lime mt-1">
            ★ {t('landing.free_badge')}
          </div>
        </div>
        <div className="bg-white border-4 border-ink rounded-2xl p-4 shadow-pop">
          <div className="text-3xl" aria-hidden="true">
            🧩
          </div>
          <div className="font-black text-sm mt-2 text-ink">
            {t('landing.card_word_builder')}
          </div>
          <div className="text-xs font-bold text-ink/60 mt-0.5">
            {t('landing.card_age_6_8')}
          </div>
          <div className="text-[10px] font-black text-lime mt-1">
            ★ {t('landing.free_badge')}
          </div>
        </div>
      </div>
    </section>
  );
}
