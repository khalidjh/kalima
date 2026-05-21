import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '../stores/userStore';
import { isProfileComplete } from '../lib/profile';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const profile = useUserStore((s) => s.profile);
  const learnLang = useUserStore((s) => s.learnLang);
  const ageGroup = useUserStore((s) => s.ageGroup);

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

  return (
    <div data-testid="auth-callback" className="min-h-screen flex items-center justify-center">
      <p className="text-ink/70">{t('auth.signing_in')}</p>
    </div>
  );
}
