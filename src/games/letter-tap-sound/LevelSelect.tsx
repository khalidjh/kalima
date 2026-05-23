import type { Letter, ProgressMap } from '../../types/game';
import { StarIcon } from '../../components/icons';

interface LevelSelectProps {
  letters: Letter[];
  levelIndices: number[];
  progress: ProgressMap;
  onPick: (levelIndex: number) => void;
}

export function LevelSelect({ letters, levelIndices, progress, onPick }: LevelSelectProps) {
  return (
    <div
      data-testid="level-select"
      className="grid grid-cols-4 sm:grid-cols-6 gap-3 px-4 py-6 max-w-2xl mx-auto"
    >
      {levelIndices.map((i) => {
        const l = letters[i];
        const stars = progress.get(i) ?? 0;
        return (
          <button
            key={i}
            type="button"
            data-testid={`level-card-${i}`}
            aria-label={l.name}
            onClick={() => onPick(i)}
            className="aspect-square bg-white border-4 border-ink rounded-2xl shadow-pop flex flex-col items-center justify-center gap-1 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            <span className="font-display font-black text-3xl text-ink">{l.char}</span>
            {stars > 0 && (
              <span className="inline-flex items-center gap-0.5" aria-hidden="true">
                {Array.from({ length: stars }).map((_, idx) => (
                  <StarIcon key={idx} size={14} />
                ))}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
