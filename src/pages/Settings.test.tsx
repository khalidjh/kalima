import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  signOut: vi.fn().mockResolvedValue(undefined),
  updateProfile: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mocks.navigate };
});

vi.mock('../lib/auth', () => ({
  signOut: mocks.signOut,
  signInWithGoogle: vi.fn(),
}));

vi.mock('../lib/profile', () => ({ updateProfile: mocks.updateProfile }));

import Settings from './Settings';
import { useUserStore } from '../stores/userStore';
import i18n from '../i18n';

beforeEach(() => {
  useUserStore.getState().reset();
  useUserStore.getState().setProfile({ id: 'u1', displayName: null, avatarUrl: null });
  mocks.navigate.mockReset();
  mocks.signOut.mockReset();
  mocks.signOut.mockResolvedValue(undefined);
  mocks.updateProfile.mockReset();
  mocks.updateProfile.mockResolvedValue(undefined);
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
});
