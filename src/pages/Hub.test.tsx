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
      useUserStore.getState().setAgeGroup('3-5');
    });

    it('toggles the picker open and closed when the age badge is tapped', () => {
      render(<MemoryRouter><Hub /></MemoryRouter>);
      expect(screen.queryByTestId('hub-age-picker')).not.toBeInTheDocument();
      fireEvent.click(screen.getByTestId('hub-age-badge'));
      expect(screen.getByTestId('hub-age-picker')).toBeInTheDocument();
      expect(screen.getByTestId('hub-age-option-3-5')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByTestId('hub-age-option-6-8')).toHaveAttribute('aria-pressed', 'false');
      fireEvent.click(screen.getByTestId('hub-age-badge'));
      // exit animation may keep node briefly; assert badge state instead
      expect(screen.getByTestId('hub-age-badge')).toHaveAttribute('aria-expanded', 'false');
    });

    it('updates the age group and persists to Supabase for signed-in users', async () => {
      render(<MemoryRouter><Hub /></MemoryRouter>);
      fireEvent.click(screen.getByTestId('hub-age-badge'));
      fireEvent.click(screen.getByTestId('hub-age-option-6-8'));
      await waitFor(() =>
        expect(updateProfileMock).toHaveBeenCalledWith('u1', { age_group: '6-8' }),
      );
      expect(useUserStore.getState().ageGroup).toBe('6-8');
    });

    it('skips Supabase upsert when in guest mode', () => {
      useUserStore.getState().startGuestSession();
      useUserStore.getState().setAgeGroup('3-5');
      render(<MemoryRouter><Hub /></MemoryRouter>);
      fireEvent.click(screen.getByTestId('hub-age-badge'));
      fireEvent.click(screen.getByTestId('hub-age-option-9-12'));
      expect(useUserStore.getState().ageGroup).toBe('9-12');
      expect(updateProfileMock).not.toHaveBeenCalled();
    });
  });
});
