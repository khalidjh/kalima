// src/App.test.tsx
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the Kalima heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /kalima/i })).toBeInTheDocument();
  });
});
