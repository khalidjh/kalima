import { useTranslation } from 'react-i18next';

export default function Landing() {
  const { t } = useTranslation();
  return (
    <section data-testid="landing-page" className="px-6 py-12">
      <h1 className="font-display text-5xl text-ink">Kalima</h1>
      <p className="mt-4 text-lg">{t('landing.tagline')}</p>
    </section>
  );
}
