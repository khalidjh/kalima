import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';
import { Card } from '../components/Card';

export default function Hub() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const profile = useUserStore((s) => s.profile);

  return (
    <section data-testid="hub-page" className="px-6 py-12 flex flex-col items-center gap-8">
      <h1 data-testid="hub-greeting" className="font-display text-4xl text-ink text-center">
        {profile?.displayName
          ? t('hub.greeting', { name: profile.displayName })
          : t('hub.greeting_fallback')}
      </h1>
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        <button
          type="button"
          data-testid="hub-card-letter-tap-sound"
          onClick={() => navigate('/game/letter-tap-sound')}
          className="text-left"
        >
          <Card>
            <div className="aspect-square flex flex-col items-center justify-center gap-2">
              <span className="text-4xl">🔤</span>
              <span className="font-display text-sm text-center">
                {t('game.letter_tap_sound.name')}
              </span>
            </div>
          </Card>
        </button>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <div className="aspect-square flex items-center justify-center text-3xl">🔒</div>
          </Card>
        ))}
      </div>
    </section>
  );
}
