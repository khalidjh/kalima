import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import Hub from './Hub';
import { useUserStore } from '../stores/userStore';

describe('Hub', () => {
  beforeEach(() => useUserStore.getState().reset());

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
});
