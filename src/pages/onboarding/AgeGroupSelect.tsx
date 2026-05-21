import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { useUserStore } from '../../stores/userStore';
import { updateProfile } from '../../lib/profile';
import type { AgeGroup } from '../../stores/userStore';

const GROUPS: { value: AgeGroup; key: string; testId: string }[] = [
  { value: '3-5', key: 'onboarding.age_3_5', testId: 'age-3-5' },
  { value: '6-8', key: 'onboarding.age_6_8', testId: 'age-6-8' },
  { value: '9-12', key: 'onboarding.age_9_12', testId: 'age-9-12' },
];

export default function AgeGroupSelect() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const profile = useUserStore((s) => s.profile);
  const setAgeGroup = useUserStore((s) => s.setAgeGroup);

  async function choose(age: AgeGroup) {
    if (!profile) return;
    setAgeGroup(age);
    await updateProfile(profile.id, { age_group: age });
    navigate('/hub', { replace: true });
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
    </section>
  );
}
