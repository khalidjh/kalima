import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('App routing', () => {
  it.each([
    ['/', 'landing-page'],
    ['/onboarding', 'choose-ar'],
    ['/hub', 'hub-page'],
    ['/trophies', 'trophies-page'],
    ['/settings', 'settings-page'],
  ])('renders %s -> %s', (path, testId) => {
    renderAt(path);
    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });

  it('renders game page with gameId param', () => {
    renderAt('/game/letter-tap-ar');
    expect(screen.getByTestId('game-page')).toHaveTextContent('letter-tap-ar');
  });
});
