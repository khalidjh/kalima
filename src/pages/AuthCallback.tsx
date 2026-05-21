import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '../stores/userStore';
import { isProfileComplete } from '../lib/profile';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const profile = useUserStore((s) => s.profile);
  const learnLang = useUserStore((s) => s.learnLang);
  const ageGroup = useUserStore((s) => s.ageGroup);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (profile) return;
    const handle = setTimeout(() => setTimedOut(true), 10_000);
    return () => clearTimeout(handle);
  }, [profile]);

  useEffect(() => {
    if (!profile) return; // still hydrating
    const complete = isProfileComplete({
      id: profile.id,
      display_name: profile.displayName,
      avatar_url: profile.avatarUrl,
      age_group: ageGroup,
      learn_lang: learnLang,
      ui_lang: 'ar',
      is_premium: false,
    });
    navigate(complete ? '/hub' : '/onboarding', { replace: true });
  }, [profile, learnLang, ageGroup, navigate]);

  if (timedOut && !profile) {
    return (
      <div
        data-testid="auth-callback-error"
        role="alert"
        className="min-h-screen flex flex-col items-center justify-center gap-4"
      >
        <p className="text-ink/80">{t('auth.error_taking_too_long')}</p>
        <Link to="/" className="text-red-600 underline">
          {t('auth.try_again')}
        </Link>
      </div>
    );
  }

  return (
    <div data-testid="auth-callback" className="min-h-screen flex items-center justify-center">
      <p className="text-ink/70">{t('auth.signing_in')}</p>
    </div>
  );
}
