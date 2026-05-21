import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import RequireProfile from './RequireProfile';
import { useUserStore } from '../stores/userStore';

function Inner() { return <div data-testid="inner">inner</div>; }
function OB() { return <div data-testid="onboarding">ob</div>; }

function tree(path: string) {
  return (
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/onboarding" element={<OB />} />
        <Route element={<RequireProfile />}>
          <Route path="/hub" element={<Inner />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('RequireProfile', () => {
  beforeEach(() => useUserStore.getState().reset());

  it('redirects to /onboarding when learn_lang missing', () => {
    useUserStore.getState().setProfile({ id: 'u1', displayName: null, avatarUrl: null });
    useUserStore.getState().setAgeGroup('3-5');
    render(tree('/hub'));
    expect(screen.getByTestId('onboarding')).toBeInTheDocument();
  });

  it('redirects to /onboarding when age_group missing', () => {
    useUserStore.getState().setProfile({ id: 'u1', displayName: null, avatarUrl: null });
    useUserStore.getState().setLearnLang('ar');
    render(tree('/hub'));
    expect(screen.getByTestId('onboarding')).toBeInTheDocument();
  });

  it('renders child when both fields set', () => {
    useUserStore.getState().setProfile({ id: 'u1', displayName: null, avatarUrl: null });
    useUserStore.getState().setLearnLang('ar');
    useUserStore.getState().setAgeGroup('3-5');
    render(tree('/hub'));
    expect(screen.getByTestId('inner')).toBeInTheDocument();
  });
});
