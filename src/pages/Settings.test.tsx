import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  signOut: vi.fn().mockResolvedValue(undefined),
  signInWithGoogle: vi.fn().mockResolvedValue({ data: {}, error: null }),
  updateProfile: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mocks.navigate };
});

vi.mock('../lib/auth', () => ({
  signOut: mocks.signOut,
  signInWithGoogle: mocks.signInWithGoogle,
}));

vi.mock('../lib/profile', () => ({ updateProfile: mocks.updateProfile }));

import Settings from './Settings';
import { useUserStore } from '../stores/userStore';
import { useSoundStore } from '../stores/soundStore';
import i18n from '../i18n';

beforeEach(() => {
  useUserStore.getState().reset();
  useUserStore.getState().setProfile({ id: 'u1', displayName: null, avatarUrl: null });
  useSoundStore.setState({ muted: false });
  mocks.navigate.mockReset();
  mocks.signOut.mockReset();
  mocks.signOut.mockResolvedValue(undefined);
  mocks.updateProfile.mockReset();
  mocks.updateProfile.mockResolvedValue(undefined);
  mocks.signInWithGoogle.mockReset();
  mocks.signInWithGoogle.mockResolvedValue({ data: {}, error: null });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Settings', () => {
  it('toggles UI language and persists it', async () => {
    await i18n.changeLanguage('ar');
    render(<MemoryRouter><Settings /></MemoryRouter>);
    await userEvent.click(screen.getByTestId('toggle-ui-lang'));
    expect(mocks.updateProfile).toHaveBeenCalledWith('u1', { ui_lang: 'en' });
    expect(useUserStore.getState().uiLang).toBe('en');
  });

  it('signs out and navigates home', async () => {
    render(<MemoryRouter><Settings /></MemoryRouter>);
    await userEvent.click(screen.getByTestId('logout'));
    expect(mocks.signOut).toHaveBeenCalledOnce();
    expect(mocks.navigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('clears learning language and navigates to /onboarding', async () => {
    useUserStore.getState().setLearnLang('ar');
    render(<MemoryRouter><Settings /></MemoryRouter>);
    await userEvent.click(screen.getByTestId('change-learn-lang'));
    expect(useUserStore.getState().learnLang).toBeNull();
    expect(mocks.updateProfile).toHaveBeenCalledWith('u1', { learn_lang: null });
    expect(mocks.navigate).toHaveBeenCalledWith('/onboarding', { replace: true });
  });

  it('shows the sign-in upgrade CTA for guest users', () => {
    useUserStore.getState().reset();
    useUserStore.getState().startGuestSession();
    render(<MemoryRouter><Settings /></MemoryRouter>);
    expect(screen.getByTestId('guest-upgrade-cta')).toBeInTheDocument();
    expect(screen.getByTestId('guest-upgrade-warning')).toBeInTheDocument();
    expect(screen.queryByTestId('logout')).not.toBeInTheDocument();
  });

  it('shows sign-out for non-guest users', () => {
    render(<MemoryRouter><Settings /></MemoryRouter>);
    expect(screen.getByTestId('logout')).toBeInTheDocument();
    expect(screen.queryByTestId('guest-upgrade-cta')).not.toBeInTheDocument();
  });

  it('calls signInWithGoogle when guest taps the upgrade CTA', async () => {
    useUserStore.getState().reset();
    useUserStore.getState().startGuestSession();
    render(<MemoryRouter><Settings /></MemoryRouter>);
    await userEvent.click(screen.getByTestId('guest-upgrade-cta'));
    expect(mocks.signInWithGoogle).toHaveBeenCalledOnce();
  });

  it('reverts UI language and shows error when toggleUiLang updateProfile rejects', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await i18n.changeLanguage('ar');
    useUserStore.getState().setUiLang('ar');
    mocks.updateProfile.mockRejectedValue(new Error('boom'));
    render(<MemoryRouter><Settings /></MemoryRouter>);
    await userEvent.click(screen.getByTestId('toggle-ui-lang'));
    await waitFor(() => {
      expect(screen.getByTestId('settings-error')).toBeInTheDocument();
    });
    expect(useUserStore.getState().uiLang).toBe('ar');
  });

  it('renders the sound-effects toggle reflecting the current muted state', async () => {
    await i18n.changeLanguage('en');
    useSoundStore.setState({ muted: false });
    render(<MemoryRouter><Settings /></MemoryRouter>);
    expect(screen.getByTestId('toggle-sfx')).toHaveTextContent(/on/i);
  });

  it('flips soundStore.muted when the sound-effects toggle is clicked', async () => {
    useSoundStore.setState({ muted: false });
    render(<MemoryRouter><Settings /></MemoryRouter>);
    await userEvent.click(screen.getByTestId('toggle-sfx'));
    expect(useSoundStore.getState().muted).toBe(true);
    await userEvent.click(screen.getByTestId('toggle-sfx'));
    expect(useSoundStore.getState().muted).toBe(false);
  });
});
