import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { useUserStore } from '../../stores/userStore';
import { updateProfile } from '../../lib/profile';
import type { Lang } from '../../stores/userStore';

export default function LearnLanguage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const profile = useUserStore((s) => s.profile);
  const setLearnLang = useUserStore((s) => s.setLearnLang);

  async function choose(lang: Lang) {
    if (!profile) return;
    setLearnLang(lang);
    await updateProfile(profile.id, { learn_lang: lang });
    navigate('/onboarding/age', { replace: true });
  }

  return (
    <section className="px-6 py-16 flex flex-col items-center gap-8">
      <h1 className="font-display text-4xl text-ink text-center">
        {t('onboarding.learn_lang_title')}
      </h1>
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <Button variant="primary" data-testid="choose-ar" onClick={() => choose('ar')}>
          {t('onboarding.learn_lang_ar')}
        </Button>
        <Button variant="secondary" data-testid="choose-en" onClick={() => choose('en')}>
          {t('onboarding.learn_lang_en')}
        </Button>
      </div>
    </section>
  );
}
