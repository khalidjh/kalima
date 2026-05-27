import type { Letter, ProgressMap } from '../../types/game';
import { LevelGrid } from '../_engine/LevelGrid';

interface LevelSelectProps {
  letters: Letter[];
  levelIndices: number[];
  progress: ProgressMap;
  onPick: (levelIndex: number) => void;
}

export function LevelSelect({ letters, levelIndices, progress, onPick }: LevelSelectProps) {
  return (
    <LevelGrid
      levelIndices={levelIndices}
      progress={progress}
      onPick={onPick}
      ariaLabelFor={(i) => letters[i].name}
      renderCard={(i) => (
        <span className="font-display font-black text-3xl text-ink">{letters[i].char}</span>
      )}
    />
  );
}
