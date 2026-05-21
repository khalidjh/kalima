import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

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
});
