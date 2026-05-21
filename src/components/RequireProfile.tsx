import { Navigate, Outlet } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';

export default function RequireProfile() {
  const learnLang = useUserStore((s) => s.learnLang);
  const ageGroup = useUserStore((s) => s.ageGroup);
  if (!learnLang || !ageGroup) return <Navigate to="/onboarding" replace />;
  return <Outlet />;
}
