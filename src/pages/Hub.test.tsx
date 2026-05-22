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

  describe('age-based sections', () => {
    beforeEach(() => {
      useUserStore.getState().setProfile({ id: 'u1', displayName: 'Khalid', avatarUrl: null });
    });

    it('renders the "For Ages 5 – 7" section header when ageGroup is 5-7', () => {
      useUserStore.getState().setAgeGroup('5-7');
      render(<MemoryRouter><Hub /></MemoryRouter>);
      expect(screen.getByTestId('hub-for-age-section')).toHaveTextContent('5-7');
    });

    it('places Letter Tap and Word Builder in the for-you section when age is 5-7', () => {
      useUserStore.getState().setAgeGroup('5-7');
      render(<MemoryRouter><Hub /></MemoryRouter>);
      const forYou = screen.getByTestId('hub-for-age-section');
      expect(forYou).toContainElement(screen.getByTestId('hub-card-letter-tap-sound'));
      expect(forYou).toContainElement(screen.getByTestId('hub-card-word-builder'));
    });

    it('places locked tiles in the "More to explore" section, not the for-you section', () => {
      useUserStore.getState().setAgeGroup('5-7');
      render(<MemoryRouter><Hub /></MemoryRouter>);
      const forYou = screen.getByTestId('hub-for-age-section');
      const explore = screen.getByTestId('hub-more-to-explore-section');
      expect(forYou).not.toContainElement(screen.getByTestId('hub-card-locked-1'));
      expect(forYou).not.toContainElement(screen.getByTestId('hub-card-locked-2'));
      expect(explore).toContainElement(screen.getByTestId('hub-card-locked-1'));
      expect(explore).toContainElement(screen.getByTestId('hub-card-locked-2'));
    });

    it('renders the for-you section before "More to explore" in DOM order', () => {
      useUserStore.getState().setAgeGroup('5-7');
      render(<MemoryRouter><Hub /></MemoryRouter>);
      const forYou = screen.getByTestId('hub-for-age-section');
      const explore = screen.getByTestId('hub-more-to-explore-section');
      const order = forYou.compareDocumentPosition(explore);
      expect(order & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('shows Letter Tap as the only for-you tile for age 3-4', () => {
      useUserStore.getState().setAgeGroup('3-4');
      render(<MemoryRouter><Hub /></MemoryRouter>);
      const forYou = screen.getByTestId('hub-for-age-section');
      expect(forYou).toContainElement(screen.getByTestId('hub-card-letter-tap-sound'));
      expect(forYou).not.toContainElement(screen.getByTestId('hub-card-word-builder'));
    });

    it('shows Word Builder as the only for-you tile for age 8-10', () => {
      useUserStore.getState().setAgeGroup('8-10');
      render(<MemoryRouter><Hub /></MemoryRouter>);
      const forYou = screen.getByTestId('hub-for-age-section');
      expect(forYou).toContainElement(screen.getByTestId('hub-card-word-builder'));
      expect(forYou).not.toContainElement(screen.getByTestId('hub-card-letter-tap-sound'));
    });

    it('falls back to a single "All Games" grid when no age group is selected', () => {
      // beforeEach sets a profile but no ageGroup. reset() clears both — reapply profile.
      useUserStore.getState().reset();
      useUserStore.getState().setProfile({ id: 'u1', displayName: 'Khalid', avatarUrl: null });
      render(<MemoryRouter><Hub /></MemoryRouter>);
      expect(screen.queryByTestId('hub-for-age-section')).not.toBeInTheDocument();
      expect(screen.queryByTestId('hub-more-to-explore-section')).not.toBeInTheDocument();
      expect(screen.getByTestId('hub-all-games-section')).toBeInTheDocument();
      // All four tiles still render in the fallback grid
      expect(screen.getByTestId('hub-card-letter-tap-sound')).toBeInTheDocument();
      expect(screen.getByTestId('hub-card-word-builder')).toBeInTheDocument();
      expect(screen.getByTestId('hub-card-locked-1')).toBeInTheDocument();
      expect(screen.getByTestId('hub-card-locked-2')).toBeInTheDocument();
    });

    it('does not navigate when the coming-soon Word Builder tile is clicked', () => {
      useUserStore.getState().setAgeGroup('5-7');
      render(<MemoryRouter><Hub /></MemoryRouter>);
      fireEvent.click(screen.getByTestId('hub-card-word-builder'));
      expect(navigateMock).not.toHaveBeenCalled();
    });

    it('does not navigate when a locked tile is clicked', () => {
      useUserStore.getState().setAgeGroup('5-7');
      render(<MemoryRouter><Hub /></MemoryRouter>);
      fireEvent.click(screen.getByTestId('hub-card-locked-1'));
      fireEvent.click(screen.getByTestId('hub-card-locked-2'));
      expect(navigateMock).not.toHaveBeenCalled();
    });
  });
});
