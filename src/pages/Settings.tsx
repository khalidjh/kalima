import { useState } from 'react';
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
  const [error, setError] = useState<string | null>(null);

  async function toggleUiLang() {
    if (!profile) return;
    const previous = uiLang;
    const next: Lang = uiLang === 'ar' ? 'en' : 'ar';
    setError(null);
    setUiLang(next);
    try {
      await i18n.changeLanguage(next);
      await updateProfile(profile.id, { ui_lang: next });
    } catch (err) {
      console.error('toggleUiLang failed:', err);
      setUiLang(previous);
      await i18n.changeLanguage(previous).catch(() => {});
      setError(t('errors.action_failed'));
    }
  }

  async function changeLearnLang() {
    if (!profile) return;
    const previous = useUserStore.getState().learnLang;
    setError(null);
    setLearnLang(null);
    try {
      await updateProfile(profile.id, { learn_lang: null });
      navigate('/onboarding', { replace: true });
    } catch (err) {
      console.error('changeLearnLang failed:', err);
      setLearnLang(previous);
      setError(t('errors.action_failed'));
    }
  }

  async function changeAgeGroup() {
    if (!profile) return;
    const previous = useUserStore.getState().ageGroup;
    setError(null);
    setAgeGroup(null);
    try {
      await updateProfile(profile.id, { age_group: null });
      navigate('/onboarding', { replace: true });
    } catch (err) {
      console.error('changeAgeGroup failed:', err);
      setAgeGroup(previous);
      setError(t('errors.action_failed'));
    }
  }

  async function logout() {
    setError(null);
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (err) {
      console.error('signOut failed:', err);
      setError(t('errors.action_failed'));
    }
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

      {error && (
        <p data-testid="settings-error" role="alert" className="text-red-600 text-sm">
          {error}
        </p>
      )}
    </section>
  );
}
