import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  updateProfile: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mocks.navigate };
});

vi.mock('../../lib/profile', () => ({ updateProfile: mocks.updateProfile }));

import LearnLanguage from './LearnLanguage';
import { useUserStore } from '../../stores/userStore';

beforeEach(() => {
  useUserStore.getState().reset();
  useUserStore.getState().setProfile({ id: 'u1', displayName: null, avatarUrl: null });
  mocks.navigate.mockReset();
  mocks.updateProfile.mockReset();
  mocks.updateProfile.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('LearnLanguage', () => {
  it('persists ar choice and advances to step 2', async () => {
    render(<MemoryRouter><LearnLanguage /></MemoryRouter>);
    await userEvent.click(screen.getByTestId('choose-ar'));
    expect(mocks.updateProfile).toHaveBeenCalledWith('u1', { learn_lang: 'ar' });
    expect(useUserStore.getState().learnLang).toBe('ar');
    expect(mocks.navigate).toHaveBeenCalledWith('/onboarding/age', { replace: true });
  });

  it('persists en choice', async () => {
    render(<MemoryRouter><LearnLanguage /></MemoryRouter>);
    await userEvent.click(screen.getByTestId('choose-en'));
    expect(mocks.updateProfile).toHaveBeenCalledWith('u1', { learn_lang: 'en' });
    expect(useUserStore.getState().learnLang).toBe('en');
  });

  it('reverts local state and shows error when updateProfile rejects', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.updateProfile.mockRejectedValue(new Error('boom'));
    render(<MemoryRouter><LearnLanguage /></MemoryRouter>);
    await userEvent.click(screen.getByTestId('choose-ar'));
    await waitFor(() => {
      expect(screen.getByTestId('learn-lang-error')).toBeInTheDocument();
    });
    expect(useUserStore.getState().learnLang).toBeNull();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });
});
