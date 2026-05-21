import { Navigate, Outlet } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';

export default function RequireAuth() {
  const profile = useUserStore((s) => s.profile);
  if (!profile) return <Navigate to="/" replace />;
  return <Outlet />;
}
