import { useRef } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { TAP_FEEDBACK_MS } from './timings';

const mocks = vi.hoisted(() => ({
  play: vi.fn(),
  useReducedMotion: vi.fn(() => false),
}));
vi.mock('../../hooks/useSound', () => ({
  useSound: () => ({ play: mocks.play, muted: false }),
}));
vi.mock('../../hooks/useReducedMotion', () => ({
  useReducedMotion: () => mocks.useReducedMotion(),
}));

import { Tile } from './Tile';

beforeEach(() => {
  mocks.play.mockClear();
  mocks.useReducedMotion.mockReturnValue(false);
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Tile', () => {
  it('renders the label and aria-label', () => {
    render(<Tile label="A" ariaLabel="alif" isCorrect={false} onCorrect={() => {}} onWrong={() => {}} />);
    const tile = screen.getByTestId('engine-tile');
    expect(tile).toHaveAttribute('aria-label', 'alif');
    expect(tile.textContent).toBe('A');
  });

  it('marks correct tap with data-feedback="correct" and plays the correct SFX', () => {
    render(<Tile label="A" ariaLabel="alif" isCorrect={true} onCorrect={() => {}} onWrong={() => {}} />);
    fireEvent.click(screen.getByTestId('engine-tile'));
    expect(screen.getByTestId('engine-tile')).toHaveAttribute('data-feedback', 'correct');
    expect(mocks.play).toHaveBeenCalledWith('correct');
  });

  it('marks wrong tap with data-feedback="wrong" and plays the wrong SFX', () => {
    render(<Tile label="A" ariaLabel="alif" isCorrect={false} onCorrect={() => {}} onWrong={() => {}} />);
    fireEvent.click(screen.getByTestId('engine-tile'));
    expect(screen.getByTestId('engine-tile')).toHaveAttribute('data-feedback', 'wrong');
    expect(mocks.play).toHaveBeenCalledWith('wrong');
  });

  it('delays onCorrect by TAP_FEEDBACK_MS.correct', () => {
    const onCorrect = vi.fn();
    render(<Tile label="A" ariaLabel="alif" isCorrect={true} onCorrect={onCorrect} onWrong={() => {}} />);
    fireEvent.click(screen.getByTestId('engine-tile'));
    expect(onCorrect).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(TAP_FEEDBACK_MS.correct); });
    expect(onCorrect).toHaveBeenCalledOnce();
  });

  it('ignores a second tap during the feedback window', () => {
    const onCorrect = vi.fn();
    render(<Tile label="A" ariaLabel="alif" isCorrect={true} onCorrect={onCorrect} onWrong={() => {}} />);
    fireEvent.click(screen.getByTestId('engine-tile'));
    fireEvent.click(screen.getByTestId('engine-tile'));
    expect(mocks.play).toHaveBeenCalledTimes(1);
  });

  it('sets data-reduced-motion="true" when reduced motion is active', () => {
    mocks.useReducedMotion.mockReturnValue(true);
    render(<Tile label="A" ariaLabel="alif" isCorrect={true} onCorrect={() => {}} onWrong={() => {}} />);
    fireEvent.click(screen.getByTestId('engine-tile'));
    expect(screen.getByTestId('engine-tile')).toHaveAttribute('data-reduced-motion', 'true');
  });

  it('shares lock with siblings when given a lockRef', () => {
    function Pair() {
      const lockRef = useRef(false);
      return (
        <>
          <Tile label="A" ariaLabel="a" isCorrect={true} lockRef={lockRef} onCorrect={() => {}} onWrong={() => {}} />
          <Tile label="B" ariaLabel="b" isCorrect={false} lockRef={lockRef} onCorrect={() => {}} onWrong={() => {}} />
        </>
      );
    }
    render(<Pair />);
    const tiles = screen.getAllByTestId('engine-tile');
    fireEvent.click(tiles[0]);
    fireEvent.click(tiles[1]);
    expect(mocks.play).toHaveBeenCalledTimes(1);
    expect(mocks.play).toHaveBeenCalledWith('correct');
  });

  it('does not fire onCorrect if unmounted mid-feedback', () => {
    const onCorrect = vi.fn();
    const { unmount } = render(<Tile label="A" ariaLabel="alif" isCorrect={true} onCorrect={onCorrect} onWrong={() => {}} />);
    fireEvent.click(screen.getByTestId('engine-tile'));
    unmount();
    act(() => { vi.advanceTimersByTime(TAP_FEEDBACK_MS.correct + 50); });
    expect(onCorrect).not.toHaveBeenCalled();
  });
});
