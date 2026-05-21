import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useUserStore } from '../stores/userStore';
import { signOut } from '../lib/auth';
import { updateProfile } from '../lib/profile';
import type { Lang } from '../stores/userStore';
import i18n from '../i18n';

export default function Settings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const profile = useUserStore((s) => s.profile);
  const uiLang = useUserStore((s) => s.uiLang);
  const setUiLang = useUserStore((s) => s.setUiLang);
  const setLearnLang = useUserStore((s) => s.setLearnLang);
  const setAgeGroup = useUserStore((s) => s.setAgeGroup);

  async function toggleUiLang() {
    if (!profile) return;
    const next: Lang = uiLang === 'ar' ? 'en' : 'ar';
    setUiLang(next);
    await i18n.changeLanguage(next);
    await updateProfile(profile.id, { ui_lang: next });
  }

  async function changeLearnLang() {
    if (!profile) return;
    setLearnLang(null);
    await updateProfile(profile.id, { learn_lang: null });
    navigate('/onboarding', { replace: true });
  }

  async function changeAgeGroup() {
    if (!profile) return;
    setAgeGroup(null);
    await updateProfile(profile.id, { age_group: null });
    navigate('/onboarding', { replace: true });
  }

  async function logout() {
    await signOut();
    navigate('/', { replace: true });
  }

  return (
    <section
      data-testid="settings-page"
      className="px-6 py-12 flex flex-col items-center gap-6 max-w-md mx-auto"
    >
      <h1 className="font-display text-3xl text-ink">{t('settings.title')}</h1>

      <Button variant="secondary" data-testid="toggle-ui-lang" onClick={toggleUiLang}>
        {t('settings.ui_lang')}: {uiLang === 'ar' ? t('settings.switch_to_en') : t('settings.switch_to_ar')}
      </Button>

      <Button variant="secondary" data-testid="change-learn-lang" onClick={changeLearnLang}>
        {t('settings.change_learn_lang')}
      </Button>

      <Button variant="secondary" data-testid="change-age" onClick={changeAgeGroup}>
        {t('settings.change_age')}
      </Button>

      <Button variant="accent" data-testid="logout" onClick={logout}>
        {t('settings.logout')}
      </Button>
    </section>
  );
}
