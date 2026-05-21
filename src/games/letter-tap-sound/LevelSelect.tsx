import type { Letter, ProgressMap } from '../../types/game';

interface LevelSelectProps {
  letters: Letter[];
  progress: ProgressMap;
  onPick: (levelIndex: number) => void;
}

export function LevelSelect({ letters, progress, onPick }: LevelSelectProps) {
  return (
    <div
      data-testid="level-select"
      className="grid grid-cols-4 sm:grid-cols-6 gap-3 px-4 py-6 max-w-2xl mx-auto"
    >
      {letters.map((l, i) => {
        const stars = progress.get(i) ?? 0;
        return (
          <button
            key={i}
            type="button"
            data-testid={`level-card-${i}`}
            aria-label={l.name}
            onClick={() => onPick(i)}
            className="aspect-square bg-surface rounded-2xl shadow-card flex flex-col items-center justify-center gap-1"
          >
            <span className="font-display text-3xl">{l.char}</span>
            {stars > 0 && (
              <span className="text-xs">{'⭐'.repeat(stars)}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
