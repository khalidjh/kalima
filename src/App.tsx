import { Routes, Route } from 'react-router-dom';
import { useDirection } from './hooks/useDirection';
import { useAuth } from './hooks/useAuth';
import RequireAuth from './components/RequireAuth';
import RequireProfile from './components/RequireProfile';
import { Header } from './components/Header';
import Landing from './pages/Landing';
import AuthCallback from './pages/AuthCallback';
import Onboarding from './pages/Onboarding';
import Hub from './pages/Hub';
import Game from './pages/Game';
import Trophies from './pages/Trophies';
import Settings from './pages/Settings';

export default function App() {
  useDirection();
  useAuth();
  return (
    <main className="min-h-screen bg-sunny">
      <Header />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Signed-in routes */}
        <Route element={<RequireAuth />}>
          <Route path="/onboarding/*" element={<Onboarding />} />

          {/* Signed-in + complete profile */}
          <Route element={<RequireProfile />}>
            <Route path="/hub" element={<Hub />} />
            <Route path="/game/:gameId" element={<Game />} />
            <Route path="/trophies" element={<Trophies />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </main>
  );
}
