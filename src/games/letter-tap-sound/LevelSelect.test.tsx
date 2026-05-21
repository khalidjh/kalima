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
    render(<LevelSelect letters={letters} progress={new Map()} onPick={() => {}} />);
    expect(screen.getAllByTestId(/^level-card-\d+$/)).toHaveLength(3);
  });

  it('shows star count when level has progress', () => {
    const progress: ProgressMap = new Map([[0, 3], [2, 1]]);
    render(<LevelSelect letters={letters} progress={progress} onPick={() => {}} />);
    expect(screen.getByTestId('level-card-0').textContent).toContain('⭐⭐⭐');
    expect(screen.getByTestId('level-card-2').textContent).toContain('⭐');
    expect(screen.getByTestId('level-card-1').textContent).not.toContain('⭐');
  });

  it('calls onPick with index when card tapped', () => {
    const onPick = vi.fn();
    render(<LevelSelect letters={letters} progress={new Map()} onPick={onPick} />);
    fireEvent.click(screen.getByTestId('level-card-1'));
    expect(onPick).toHaveBeenCalledWith(1);
  });
});
