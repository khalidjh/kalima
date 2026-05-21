import { act, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AuthCallback from './AuthCallback';
import { useUserStore } from '../stores/userStore';

beforeEach(() => {
  useUserStore.getState().reset();
});

describe('AuthCallback', () => {
  it('renders a brief progress indicator', () => {
    render(
      <MemoryRouter initialEntries={['/auth/callback']}>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('auth-callback')).toBeInTheDocument();
  });

  describe('with fake timers', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('shows an error after a 10s timeout when no profile arrives', () => {
      render(
        <MemoryRouter initialEntries={['/auth/callback']}>
          <Routes>
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/" element={<div data-testid="home-page" />} />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByTestId('auth-callback')).toBeInTheDocument();
      expect(screen.queryByTestId('auth-callback-error')).not.toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(10_000);
      });

      expect(screen.getByTestId('auth-callback-error')).toBeInTheDocument();
    });
  });
});
