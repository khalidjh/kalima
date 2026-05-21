import { useTranslation } from 'react-i18next';
import { useUserStore } from '../stores/userStore';
import { Card } from '../components/Card';

export default function Hub() {
  const { t } = useTranslation();
  const profile = useUserStore((s) => s.profile);

  return (
    <section data-testid="hub-page" className="px-6 py-12 flex flex-col items-center gap-8">
      <h1 data-testid="hub-greeting" className="font-display text-4xl text-ink text-center">
        {profile?.displayName
          ? t('hub.greeting', { name: profile.displayName })
          : t('hub.greeting_fallback')}
      </h1>
      <p className="text-ink/70">{t('hub.coming_soon')}</p>
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <div className="aspect-square flex items-center justify-center text-3xl">🔒</div>
          </Card>
        ))}
      </div>
    </section>
  );
}
