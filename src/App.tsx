import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import Hub from './pages/Hub';
import Game from './pages/Game';
import Trophies from './pages/Trophies';
import Settings from './pages/Settings';

export default function App() {
  return (
    <main className="min-h-screen bg-surface">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/hub" element={<Hub />} />
        <Route path="/game/:gameId" element={<Game />} />
        <Route path="/trophies" element={<Trophies />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </main>
  );
}
