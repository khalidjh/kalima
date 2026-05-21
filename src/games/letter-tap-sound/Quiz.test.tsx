import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  dispatchSpeak: vi.fn().mockResolvedValue(undefined),
  useSpeech: vi.fn(() => ({
    speak: vi.fn().mockResolvedValue(undefined),
    speaking: false,
    supported: true,
  })),
}));

vi.mock('./audio/speak', () => ({ dispatchSpeak: mocks.dispatchSpeak }));
vi.mock('../../hooks/useSpeech', () => ({ useSpeech: mocks.useSpeech }));

import { Quiz } from './Quiz';
import type { Letter } from '../../types/game';

const target: Letter = { char: 'ا', name: 'alif', audio_key: 'alif' };
const distractors: Letter[] = [
  { char: 'ب', name: 'baa', audio_key: 'baa' },
  { char: 'ت', name: 'taa', audio_key: 'taa' },
  { char: 'ث', name: 'thaa', audio_key: 'thaa' },
];

beforeEach(() => {
  mocks.dispatchSpeak.mockClear();
});

describe('Quiz', () => {
  it('renders 4 tiles', () => {
    render(<Quiz target={target} choices={[target, ...distractors]} lang="ar" onCorrect={() => {}} onWrong={() => {}} />);
    expect(screen.getAllByTestId('quiz-tile')).toHaveLength(4);
  });

  it('plays audio on mount', () => {
    render(<Quiz target={target} choices={[target, ...distractors]} lang="ar" onCorrect={() => {}} onWrong={() => {}} />);
    expect(mocks.dispatchSpeak).toHaveBeenCalledWith('alif', 'ar', expect.any(Function));
  });

  it('replays audio when speaker tapped', () => {
    render(<Quiz target={target} choices={[target, ...distractors]} lang="ar" onCorrect={() => {}} onWrong={() => {}} />);
    mocks.dispatchSpeak.mockClear();
    fireEvent.click(screen.getByTestId('quiz-speaker'));
    expect(mocks.dispatchSpeak).toHaveBeenCalledOnce();
  });

  it('fires onCorrect when target tile tapped', () => {
    const onCorrect = vi.fn();
    render(<Quiz target={target} choices={[target, ...distractors]} lang="ar" onCorrect={onCorrect} onWrong={() => {}} />);
    fireEvent.click(screen.getByLabelText('alif'));
    expect(onCorrect).toHaveBeenCalledOnce();
  });

  it('fires onWrong when non-target tile tapped', () => {
    const onWrong = vi.fn();
    render(<Quiz target={target} choices={[target, ...distractors]} lang="ar" onCorrect={() => {}} onWrong={onWrong} />);
    fireEvent.click(screen.getByLabelText('baa'));
    expect(onWrong).toHaveBeenCalledOnce();
  });
});
