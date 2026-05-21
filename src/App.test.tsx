// src/App.test.tsx
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the Kalima heading with display font class', () => {
    render(<App />);
    const heading = screen.getByRole('heading', { name: /kalima/i });
    expect(heading).toHaveClass('font-display');
  });
});
