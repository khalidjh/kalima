import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const navigateMock = vi.fn();
const updateProfileMock = vi.fn().mockResolvedValue(undefined);
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock('../hooks/useGameProgress', () => ({
  useGameProgress: () => ({
    progress: new Map(),
    loading: false,
    error: null,
    upsert: vi.fn(),
  }),
}));

vi.mock('../lib/profile', () => ({
  updateProfile: (...args: unknown[]) => updateProfileMock(...args),
}));

import Hub from './Hub';
import { useUserStore } from '../stores/userStore';

describe('Hub', () => {
  beforeEach(() => {
    useUserStore.getState().reset();
    navigateMock.mockClear();
    updateProfileMock.mockClear();
    updateProfileMock.mockResolvedValue(undefined);
  });

  it('greets the signed-in user by name', () => {
    useUserStore.getState().setProfile({ id: 'u1', displayName: 'Khalid', avatarUrl: null });
    render(<MemoryRouter><Hub /></MemoryRouter>);
    expect(screen.getByText(/Khalid/)).toBeInTheDocument();
  });

  it('falls back when no display name', () => {
    useUserStore.getState().setProfile({ id: 'u1', displayName: null, avatarUrl: null });
    render(<MemoryRouter><Hub /></MemoryRouter>);
    expect(screen.getByTestId('hub-greeting')).toBeInTheDocument();
  });

  it('renders a Letter Tap card', () => {
    render(<MemoryRouter><Hub /></MemoryRouter>);
    expect(screen.getByTestId('hub-card-letter-tap-sound')).toBeInTheDocument();
  });

  it('navigates to /game/letter-tap-sound when card tapped', () => {
    render(<MemoryRouter><Hub /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('hub-card-letter-tap-sound'));
    expect(navigateMock).toHaveBeenCalledWith('/game/letter-tap-sound');
  });

  it('navigates to /game/letter-tap-sound from the hero Play button', () => {
    render(<MemoryRouter><Hub /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('hub-continue-cta'));
    expect(navigateMock).toHaveBeenCalledWith('/game/letter-tap-sound');
  });

  it('renders progress bar and total stars at zero by default', () => {
    render(<MemoryRouter><Hub /></MemoryRouter>);
    expect(screen.getByTestId('hub-progress-bar')).toBeInTheDocument();
    expect(screen.getByTestId('hub-stars')).toHaveTextContent('0');
  });

  it('renders menu links to Trophies and Settings', () => {
    render(<MemoryRouter><Hub /></MemoryRouter>);
    expect(screen.getByTestId('hub-menu-trophies')).toHaveAttribute('href', '/trophies');
    expect(screen.getByTestId('hub-menu-settings')).toHaveAttribute('href', '/settings');
  });

  describe('age picker', () => {
    beforeEach(() => {
      useUserStore.getState().setProfile({ id: 'u1', displayName: 'Khalid', avatarUrl: null });
      useUserStore.getState().setAgeGroup('3-4');
    });

    it('toggles the picker open and closed when the age badge is tapped', () => {
      render(<MemoryRouter><Hub /></MemoryRouter>);
      expect(screen.queryByTestId('hub-age-picker')).not.toBeInTheDocument();
      fireEvent.click(screen.getByTestId('hub-age-badge'));
      expect(screen.getByTestId('hub-age-picker')).toBeInTheDocument();
      expect(screen.getByTestId('hub-age-option-3-4')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByTestId('hub-age-option-5-7')).toHaveAttribute('aria-pressed', 'false');
      fireEvent.click(screen.getByTestId('hub-age-badge'));
      // exit animation may keep node briefly; assert badge state instead
      expect(screen.getByTestId('hub-age-badge')).toHaveAttribute('aria-expanded', 'false');
    });

    it('updates the age group and persists to Supabase for signed-in users', async () => {
      render(<MemoryRouter><Hub /></MemoryRouter>);
      fireEvent.click(screen.getByTestId('hub-age-badge'));
      fireEvent.click(screen.getByTestId('hub-age-option-5-7'));
      await waitFor(() =>
        expect(updateProfileMock).toHaveBeenCalledWith('u1', { age_group: '5-7' }),
      );
      expect(useUserStore.getState().ageGroup).toBe('5-7');
    });

    it('skips Supabase upsert when in guest mode', () => {
      useUserStore.getState().startGuestSession();
      useUserStore.getState().setAgeGroup('3-4');
      render(<MemoryRouter><Hub /></MemoryRouter>);
      fireEvent.click(screen.getByTestId('hub-age-badge'));
      fireEvent.click(screen.getByTestId('hub-age-option-8-10'));
      expect(useUserStore.getState().ageGroup).toBe('8-10');
      expect(updateProfileMock).not.toHaveBeenCalled();
    });
  });

  describe('age-based recommendations', () => {
    beforeEach(() => {
      useUserStore.getState().setProfile({ id: 'u1', displayName: 'Khalid', avatarUrl: null });
    });

    it('flags Letter Tap as "for you" when ageGroup is 3-4', () => {
      useUserStore.getState().setAgeGroup('3-4');
      render(<MemoryRouter><Hub /></MemoryRouter>);
      expect(
        screen.getByTestId('hub-card-letter-tap-sound-recommended'),
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId('hub-card-word-builder-recommended'),
      ).not.toBeInTheDocument();
    });

    it('flags Word Builder but not Letter Tap when ageGroup is 8-10', () => {
      useUserStore.getState().setAgeGroup('8-10');
      render(<MemoryRouter><Hub /></MemoryRouter>);
      expect(
        screen.getByTestId('hub-card-word-builder-recommended'),
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId('hub-card-letter-tap-sound-recommended'),
      ).not.toBeInTheDocument();
    });

    it('places recommended tiles before non-recommended ones', () => {
      useUserStore.getState().setAgeGroup('8-10');
      render(<MemoryRouter><Hub /></MemoryRouter>);
      const ids = screen
        .getAllByRole('button')
        .map((el) => el.getAttribute('data-testid'))
        .filter((id): id is string => !!id && id.startsWith('hub-card-'));
      const wordBuilderIdx = ids.indexOf('hub-card-word-builder');
      const letterTapIdx = ids.indexOf('hub-card-letter-tap-sound');
      expect(wordBuilderIdx).toBeGreaterThan(-1);
      expect(letterTapIdx).toBeGreaterThan(-1);
      expect(wordBuilderIdx).toBeLessThan(letterTapIdx);
    });

    it('never marks locked placeholder tiles as recommended', () => {
      useUserStore.getState().setAgeGroup('5-7');
      render(<MemoryRouter><Hub /></MemoryRouter>);
      expect(
        screen.queryByTestId('hub-card-locked-1-recommended'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('hub-card-locked-2-recommended'),
      ).not.toBeInTheDocument();
    });

    it('shows no recommended badges when no age group is selected', () => {
      useUserStore.getState().reset();
      render(<MemoryRouter><Hub /></MemoryRouter>);
      expect(
        screen.queryByTestId('hub-card-letter-tap-sound-recommended'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('hub-card-word-builder-recommended'),
      ).not.toBeInTheDocument();
    });
  });
});
