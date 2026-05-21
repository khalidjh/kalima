import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import RequireAuth from './RequireAuth';
import { useUserStore } from '../stores/userStore';

function Protected() {
  return <div data-testid="protected">ok</div>;
}
function PublicLanding() {
  return <div data-testid="landing">home</div>;
}

function tree(initialPath: string) {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<PublicLanding />} />
        <Route element={<RequireAuth />}>
          <Route path="/hub" element={<Protected />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('RequireAuth', () => {
  beforeEach(() => useUserStore.getState().reset());

  it('redirects to / when no profile in store', () => {
    render(tree('/hub'));
    expect(screen.getByTestId('landing')).toBeInTheDocument();
  });

  it('renders child when profile present', () => {
    useUserStore.getState().setProfile({ id: 'u1', displayName: null, avatarUrl: null });
    render(tree('/hub'));
    expect(screen.getByTestId('protected')).toBeInTheDocument();
  });
});
