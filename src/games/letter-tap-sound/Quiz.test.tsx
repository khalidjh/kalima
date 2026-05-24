import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { TAP_FEEDBACK_MS } from './timings';

const mocks = vi.hoisted(() => ({
  dispatchSpeak: vi.fn().mockResolvedValue(undefined),
  useSpeech: vi.fn(() => ({
    speak: vi.fn().mockResolvedValue(undefined),
    speaking: false,
    supported: true,
  })),
  play: vi.fn(),
  useReducedMotion: vi.fn(() => false),
}));

vi.mock('./audio/speak', () => ({ dispatchSpeak: mocks.dispatchSpeak }));
vi.mock('../../hooks/useSpeech', () => ({ useSpeech: mocks.useSpeech }));
vi.mock('../../hooks/useSound', () => ({
  useSound: () => ({ play: mocks.play, muted: false }),
}));
vi.mock('../../hooks/useReducedMotion', () => ({
  useReducedMotion: () => mocks.useReducedMotion(),
}));

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
  mocks.play.mockClear();
  mocks.useReducedMotion.mockReturnValue(false);
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Quiz', () => {
  it('renders 4 tiles', () => {
    render(<Quiz target={target} choices={[target, ...distractors]} lang="ar" onCorrect={() => {}} onWrong={() => {}} />);
    expect(screen.getAllByTestId('quiz-tile')).toHaveLength(4);
  });

  it('renders quiz tile aria-labels in the same order as the choices array', () => {
    const choices = [target, ...distractors];
    render(<Quiz target={target} choices={choices} lang="ar" onCorrect={() => {}} onWrong={() => {}} />);
    const tiles = screen.getAllByTestId('quiz-tile');
    expect(tiles).toHaveLength(choices.length);
    tiles.forEach((tile, i) => {
      expect(tile.getAttribute('aria-label')).toBe(choices[i].name);
    });
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

  it('marks the tapped target tile with data-feedback="correct" and plays the correct SFX', () => {
    render(<Quiz target={target} choices={[target, ...distractors]} lang="ar" onCorrect={() => {}} onWrong={() => {}} />);
    fireEvent.click(screen.getByLabelText('alif'));
    expect(screen.getByLabelText('alif')).toHaveAttribute('data-feedback', 'correct');
    expect(mocks.play).toHaveBeenCalledWith('correct');
  });

  it('delays onCorrect by TAP_FEEDBACK_MS.correct', () => {
    const onCorrect = vi.fn();
    render(<Quiz target={target} choices={[target, ...distractors]} lang="ar" onCorrect={onCorrect} onWrong={() => {}} />);
    fireEvent.click(screen.getByLabelText('alif'));
    expect(onCorrect).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(TAP_FEEDBACK_MS.correct);
    });
    expect(onCorrect).toHaveBeenCalledOnce();
  });

  it('marks a wrong tile with data-feedback="wrong" and plays the wrong SFX', () => {
    render(<Quiz target={target} choices={[target, ...distractors]} lang="ar" onCorrect={() => {}} onWrong={() => {}} />);
    fireEvent.click(screen.getByLabelText('baa'));
    expect(screen.getByLabelText('baa')).toHaveAttribute('data-feedback', 'wrong');
    expect(mocks.play).toHaveBeenCalledWith('wrong');
  });

  it('delays onWrong by TAP_FEEDBACK_MS.wrong', () => {
    const onWrong = vi.fn();
    render(<Quiz target={target} choices={[target, ...distractors]} lang="ar" onCorrect={() => {}} onWrong={onWrong} />);
    fireEvent.click(screen.getByLabelText('baa'));
    act(() => {
      vi.advanceTimersByTime(TAP_FEEDBACK_MS.wrong - 1);
    });
    expect(onWrong).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onWrong).toHaveBeenCalledOnce();
  });

  it('ignores a second tap during the feedback window', () => {
    const onCorrect = vi.fn();
    const onWrong = vi.fn();
    render(<Quiz target={target} choices={[target, ...distractors]} lang="ar" onCorrect={onCorrect} onWrong={onWrong} />);
    fireEvent.click(screen.getByLabelText('alif'));
    fireEvent.click(screen.getByLabelText('baa')); // ignored — feedback in flight
    expect(mocks.play).toHaveBeenCalledTimes(1);
    act(() => {
      vi.advanceTimersByTime(TAP_FEEDBACK_MS.correct);
    });
    expect(onCorrect).toHaveBeenCalledOnce();
    expect(onWrong).not.toHaveBeenCalled();
  });

  it('ignores two taps fired inside a single React batch (multi-touch lock)', () => {
    const onCorrect = vi.fn();
    const onWrong = vi.fn();
    render(<Quiz target={target} choices={[target, ...distractors]} lang="ar" onCorrect={onCorrect} onWrong={onWrong} />);
    act(() => {
      fireEvent.click(screen.getByLabelText('alif'));
      fireEvent.click(screen.getByLabelText('baa'));
    });
    expect(mocks.play).toHaveBeenCalledTimes(1);
    expect(mocks.play).toHaveBeenCalledWith('correct');
    act(() => {
      vi.advanceTimersByTime(TAP_FEEDBACK_MS.correct);
    });
    expect(onCorrect).toHaveBeenCalledOnce();
    expect(onWrong).not.toHaveBeenCalled();
  });

  it('does not fire onCorrect if the component unmounts mid-feedback', () => {
    const onCorrect = vi.fn();
    const { unmount } = render(
      <Quiz target={target} choices={[target, ...distractors]} lang="ar" onCorrect={onCorrect} onWrong={() => {}} />,
    );
    fireEvent.click(screen.getByLabelText('alif'));
    unmount();
    act(() => {
      vi.advanceTimersByTime(TAP_FEEDBACK_MS.correct + 50);
    });
    expect(onCorrect).not.toHaveBeenCalled();
  });

  it('sets data-reduced-motion="true" on the tile when reduced motion is active', () => {
    mocks.useReducedMotion.mockReturnValue(true);
    render(<Quiz target={target} choices={[target, ...distractors]} lang="ar" onCorrect={() => {}} onWrong={() => {}} />);
    fireEvent.click(screen.getByLabelText('alif'));
    const tile = screen.getByLabelText('alif');
    expect(tile).toHaveAttribute('data-feedback', 'correct');
    expect(tile).toHaveAttribute('data-reduced-motion', 'true');
  });
});
