import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import AuthCallback from './AuthCallback';

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
});
