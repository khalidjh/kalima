import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LevelSelect } from './LevelSelect';
import type { Letter, ProgressMap } from '../../types/game';

const letters: Letter[] = [
  { char: 'ا', name: 'alif', audio_key: 'alif' },
  { char: 'ب', name: 'baa', audio_key: 'baa' },
  { char: 'ت', name: 'taa', audio_key: 'taa' },
];

describe('LevelSelect', () => {
  it('renders one card per letter', () => {
    render(
      <LevelSelect
        letters={letters}
        levelIndices={Array.from({ length: letters.length }, (_, i) => i)}
        progress={new Map()}
        onPick={() => {}}
      />
    );
    expect(screen.getAllByTestId(/^level-card-\d+$/)).toHaveLength(3);
  });

  it('shows star count when level has progress', () => {
    const progress: ProgressMap = new Map([[0, 3], [2, 1]]);
    render(
      <LevelSelect
        letters={letters}
        levelIndices={[0, 1, 2]}
        progress={progress}
        onPick={() => {}}
      />
    );
    expect(screen.getByTestId('level-card-0').querySelectorAll('svg')).toHaveLength(3);
    expect(screen.getByTestId('level-card-2').querySelectorAll('svg')).toHaveLength(1);
    expect(screen.getByTestId('level-card-1').querySelectorAll('svg')).toHaveLength(0);
  });

  it('calls onPick with index when card tapped', () => {
    const onPick = vi.fn();
    render(
      <LevelSelect
        letters={letters}
        levelIndices={[0, 1, 2]}
        progress={new Map()}
        onPick={onPick}
      />
    );
    fireEvent.click(screen.getByTestId('level-card-1'));
    expect(onPick).toHaveBeenCalledWith(1);
  });
});
