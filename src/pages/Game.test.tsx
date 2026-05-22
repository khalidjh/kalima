import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('../games/loader', () => {
  const FakeGame = () => <div data-testid="fake-game">hello</div>;
  return {
    getGame: (id: string) => (id === 'letter-tap-sound' ? { id, nameKey: 'x', Component: FakeGame } : undefined),
  };
});

import Game from './Game';

describe('Game page', () => {
  it('renders the registered game by id', () => {
    render(
      <MemoryRouter initialEntries={['/game/letter-tap-sound']}>
        <Routes>
          <Route path="/game/:gameId" element={<Game />} />
          <Route path="/hub" element={<div data-testid="hub" />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('fake-game')).toBeInTheDocument();
  });

  it('redirects to /hub when game id is unknown', () => {
    render(
      <MemoryRouter initialEntries={['/game/unknown']}>
        <Routes>
          <Route path="/game/:gameId" element={<Game />} />
          <Route path="/hub" element={<div data-testid="hub" />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('hub')).toBeInTheDocument();
  });
});
