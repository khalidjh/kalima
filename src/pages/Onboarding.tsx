import { Routes, Route, Navigate } from 'react-router-dom';
import LearnLanguage from './onboarding/LearnLanguage';
import AgeGroupSelect from './onboarding/AgeGroupSelect';
import { useUserStore } from '../stores/userStore';

export default function Onboarding() {
  const learnLang = useUserStore((s) => s.learnLang);
  const ageGroup = useUserStore((s) => s.ageGroup);

  if (ageGroup && learnLang) return <Navigate to="/hub" replace />;

  return (
    <div data-testid="onboarding-page">
      <Routes>
        <Route index element={learnLang ? <AgeGroupSelect /> : <LearnLanguage />} />
        <Route path="age" element={<AgeGroupSelect />} />
      </Routes>
    </div>
  );
}
