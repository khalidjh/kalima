import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  navigate: vi.fn(),
}));
vi.mock('../lib/auth', () => ({
  signInWithGoogle: mocks.signIn,
  signOut: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mocks.navigate };
});

import Landing from './Landing';
import { useUserStore } from '../stores/userStore';

beforeEach(() => {
  useUserStore.getState().reset();
  mocks.signIn.mockReset();
  mocks.navigate.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Landing', () => {
  it('calls signInWithGoogle when CTA is clicked', async () => {
    mocks.signIn.mockResolvedValue({ data: {}, error: null });
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    );
    await userEvent.click(screen.getByRole('button', { name: /start|ابدأ/i }));
    expect(mocks.signIn).toHaveBeenCalledOnce();
  });

  it('redirects to /hub when signed in with a complete profile', () => {
    useUserStore.getState().setProfile({ id: 'u1', displayName: 'Khalid', avatarUrl: null });
    useUserStore.getState().setLearnLang('ar');
    useUserStore.getState().setAgeGroup('6-8');
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    );
    expect(mocks.navigate).toHaveBeenCalledWith('/hub', { replace: true });
  });

  it('starts a guest session and navigates to /onboarding when guest CTA is clicked', async () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    );
    await userEvent.click(screen.getByTestId('landing-guest-button'));
    expect(useUserStore.getState().isGuest).toBe(true);
    expect(useUserStore.getState().profile?.id).toMatch(/^guest-/);
    expect(mocks.navigate).toHaveBeenCalledWith('/onboarding');
  });

  it('shows an inline error when signInWithGoogle rejects', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.signIn.mockRejectedValue(new Error('boom'));
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    );
    await userEvent.click(screen.getByRole('button', { name: /start|ابدأ/i }));
    await waitFor(() => {
      expect(screen.getByTestId('landing-error')).toBeInTheDocument();
    });
    expect(mocks.navigate).not.toHaveBeenCalled();
  });
});
