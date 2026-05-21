import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import Onboarding from './Onboarding';
import { useUserStore } from '../stores/userStore';

function tree(initialPath: string) {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/onboarding/*" element={<Onboarding />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Onboarding container', () => {
  beforeEach(() => {
    useUserStore.getState().reset();
    useUserStore.getState().setProfile({ id: 'u1', displayName: null, avatarUrl: null });
  });

  it('shows step 1 when learn_lang missing', () => {
    render(tree('/onboarding'));
    expect(screen.getByText(/ماذا تريد أن تتعلم|what do you want to learn/i)).toBeInTheDocument();
  });

  it('shows step 2 when learn_lang set but age_group missing', () => {
    useUserStore.getState().setLearnLang('ar');
    render(tree('/onboarding'));
    expect(screen.getByText(/كم عمرك|how old/i)).toBeInTheDocument();
  });
});
