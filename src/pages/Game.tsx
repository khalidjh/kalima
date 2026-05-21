import { useParams } from 'react-router-dom';

export default function Game() {
  const { gameId } = useParams<{ gameId: string }>();
  return (
    <section data-testid="game-page">
      <h2 className="font-display text-2xl">Game: {gameId}</h2>
    </section>
  );
}
