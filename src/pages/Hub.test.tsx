import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const navigateMock = vi.fn();
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

import Hub from './Hub';
import { useUserStore } from '../stores/userStore';

describe('Hub', () => {
  beforeEach(() => {
    useUserStore.getState().reset();
    navigateMock.mockClear();
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
});
