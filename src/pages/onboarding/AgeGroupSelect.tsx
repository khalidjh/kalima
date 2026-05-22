import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { useUserStore } from '../../stores/userStore';
import { updateProfile } from '../../lib/profile';
import type { AgeGroup } from '../../stores/userStore';

const GROUPS: { value: AgeGroup; key: string; testId: string }[] = [
  { value: '3-4', key: 'onboarding.age_3_4', testId: 'age-3-4' },
  { value: '5-7', key: 'onboarding.age_5_7', testId: 'age-5-7' },
  { value: '8-10', key: 'onboarding.age_8_10', testId: 'age-8-10' },
];

export default function AgeGroupSelect() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const profile = useUserStore((s) => s.profile);
  const setAgeGroup = useUserStore((s) => s.setAgeGroup);
  const isGuest = useUserStore((s) => s.isGuest);
  const [error, setError] = useState<string | null>(null);

  async function choose(age: AgeGroup) {
    if (!profile) return;
    const previous = useUserStore.getState().ageGroup;
    setError(null);
    setAgeGroup(age);
    if (isGuest) {
      navigate('/hub', { replace: true });
      return;
    }
    try {
      await updateProfile(profile.id, { age_group: age });
      navigate('/hub', { replace: true });
    } catch (err) {
      console.error('updateProfile (age_group) failed:', err);
      setAgeGroup(previous);
      setError(t('errors.action_failed'));
    }
  }

  return (
    <section className="px-6 py-16 flex flex-col items-center gap-8">
      <h1 className="font-display text-4xl text-ink text-center">
        {t('onboarding.age_title')}
      </h1>
      <div className="flex flex-col gap-4 w-full max-w-sm">
        {GROUPS.map(({ value, key, testId }) => (
          <Button key={value} variant="primary" data-testid={testId} onClick={() => choose(value)}>
            {t(key)}
          </Button>
        ))}
      </div>
      {error && (
        <p data-testid="age-group-error" role="alert" className="text-red-600 text-sm">
          {error}
        </p>
      )}
    </section>
  );
}
