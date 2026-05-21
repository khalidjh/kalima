import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
}));
vi.mock('../lib/auth', () => ({
  signInWithGoogle: mocks.signIn,
  signOut: vi.fn(),
}));

import Landing from './Landing';

beforeEach(() => {
  mocks.signIn.mockReset();
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
});
