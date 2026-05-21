import { Navigate, useParams } from 'react-router-dom';
import { getGame } from '../games/registry';

export default function Game() {
  const { gameId } = useParams<{ gameId: string }>();
  const game = gameId ? getGame(gameId) : undefined;
  if (!game) return <Navigate to="/hub" replace />;
  const Comp = game.Component;
  return (
    <section data-testid="game-page">
      <Comp />
    </section>
  );
}
