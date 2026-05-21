import { useTranslation } from 'react-i18next';
import { Button } from '../components/Button';

export default function Landing() {
  const { t } = useTranslation();
  return (
    <section data-testid="landing-page" className="px-6 py-16 flex flex-col items-center gap-8">
      <h1 className="font-display text-6xl text-ink">Kalima</h1>
      <p className="text-xl text-ink/80 text-center max-w-md">{t('landing.tagline')}</p>
      <Button variant="primary">{t('landing.cta_start')}</Button>
    </section>
  );
}
