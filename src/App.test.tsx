import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, vi } from 'vitest';
import App from './App';
import { useUserStore } from './stores/userStore';

vi.mock('./lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    from: vi.fn(),
  },
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

function seedCompleteProfile() {
  const store = useUserStore.getState();
  store.setProfile({ id: 'test-user', displayName: 'Test', avatarUrl: null });
  store.setLearnLang('ar');
  store.setAgeGroup('6-8');
}

describe('App routing', () => {
  beforeEach(() => {
    useUserStore.getState().reset();
  });

  it('renders / -> landing-page (unauthenticated)', () => {
    renderAt('/');
    expect(screen.getByTestId('landing-page')).toBeInTheDocument();
  });

  it('renders /onboarding when signed in but profile incomplete', () => {
    const store = useUserStore.getState();
    store.setProfile({ id: 'test-user', displayName: 'Test', avatarUrl: null });
    renderAt('/onboarding');
    expect(screen.getByTestId('onboarding-page')).toBeInTheDocument();
  });

  it.each([
    ['/hub', 'hub-page'],
    ['/trophies', 'trophies-page'],
    ['/settings', 'settings-page'],
  ])('renders %s -> %s (signed in + complete profile)', (path, testId) => {
    seedCompleteProfile();
    renderAt(path);
    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });

  it('renders game page with gameId param', () => {
    seedCompleteProfile();
    renderAt('/game/letter-tap-ar');
    expect(screen.getByTestId('game-page')).toHaveTextContent('letter-tap-ar');
  });

  it('redirects /hub to / when not signed in', () => {
    renderAt('/hub');
    expect(screen.getByTestId('landing-page')).toBeInTheDocument();
  });

  it('redirects /hub to /onboarding when profile incomplete', () => {
    const store = useUserStore.getState();
    store.setProfile({ id: 'test-user', displayName: 'Test', avatarUrl: null });
    renderAt('/hub');
    expect(screen.getByTestId('onboarding-page')).toBeInTheDocument();
  });

  it('redirects /hub to /onboarding when learnLang set but ageGroup missing', () => {
    const store = useUserStore.getState();
    store.setProfile({ id: 'test-user', displayName: 'Test', avatarUrl: null });
    store.setLearnLang('ar');
    renderAt('/hub');
    expect(screen.getByTestId('onboarding-page')).toBeInTheDocument();
  });

  it('renders /auth/callback when unauthenticated (no profile redirect)', () => {
    renderAt('/auth/callback');
    expect(screen.getByTestId('auth-callback')).toBeInTheDocument();
  });
});
