import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { STAR_CASCADE_MS } from './timings';

const mocks = vi.hoisted(() => ({
  play: vi.fn(),
  confetti: vi.fn(),
  useReducedMotion: vi.fn(() => false),
}));

vi.mock('../../hooks/useSound', () => ({
  useSound: () => ({ play: mocks.play, muted: false }),
}));
vi.mock('../../hooks/useReducedMotion', () => ({
  useReducedMotion: () => mocks.useReducedMotion(),
}));
vi.mock('canvas-confetti', () => ({
  default: (opts: unknown) => mocks.confetti(opts),
}));

import { LevelResult } from './LevelResult';

async function flushDynamicImports() {
  // Allow the awaited dynamic import("canvas-confetti") promise to resolve.
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

beforeEach(() => {
  mocks.play.mockClear();
  mocks.confetti.mockClear();
  mocks.useReducedMotion.mockReturnValue(false);
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('LevelResult cascade — 3 stars', () => {
  it('reveals star 1 synchronously and plays star_ping_1', () => {
    render(<LevelResult stars={3} onNext={() => {}} onReplay={() => {}} onBack={() => {}} hasNext />);
    const revealed = screen.getAllByTestId('star-filled').filter((el) => el.dataset.revealed === 'true');
    expect(revealed).toHaveLength(1);
    expect(mocks.play).toHaveBeenCalledWith('star_ping_1');
  });

  it('reveals star 2 at t=350 with star_ping_2', () => {
    render(<LevelResult stars={3} onNext={() => {}} onReplay={() => {}} onBack={() => {}} hasNext />);
    act(() => {
      vi.advanceTimersByTime(STAR_CASCADE_MS[1]);
    });
    const revealed = screen.getAllByTestId('star-filled').filter((el) => el.dataset.revealed === 'true');
    expect(revealed).toHaveLength(2);
    expect(mocks.play).toHaveBeenCalledWith('star_ping_2');
  });

  it('reveals star 3 + fanfare + confetti at t=700', async () => {
    render(<LevelResult stars={3} onNext={() => {}} onReplay={() => {}} onBack={() => {}} hasNext />);
    act(() => {
      vi.advanceTimersByTime(STAR_CASCADE_MS[2]);
    });
    await flushDynamicImports();
    const revealed = screen.getAllByTestId('star-filled').filter((el) => el.dataset.revealed === 'true');
    expect(revealed).toHaveLength(3);
    expect(mocks.play).toHaveBeenCalledWith('star_ping_3');
    expect(mocks.play).toHaveBeenCalledWith('level_up');
    expect(mocks.confetti).toHaveBeenCalledOnce();
  });
});

describe('LevelResult cascade — 2 stars (climax at last earned slot)', () => {
  it('fires fanfare + confetti at t=350 (not t=700)', async () => {
    render(<LevelResult stars={2} onNext={() => {}} onReplay={() => {}} onBack={() => {}} hasNext />);
    expect(mocks.play).toHaveBeenCalledWith('star_ping_1');
    act(() => {
      vi.advanceTimersByTime(STAR_CASCADE_MS[1]);
    });
    await flushDynamicImports();
    expect(mocks.play).toHaveBeenCalledWith('star_ping_2');
    expect(mocks.play).toHaveBeenCalledWith('level_up');
    expect(mocks.confetti).toHaveBeenCalledOnce();
    act(() => {
      vi.advanceTimersByTime(STAR_CASCADE_MS[2] - STAR_CASCADE_MS[1] + 100);
    });
    expect(mocks.play).not.toHaveBeenCalledWith('star_ping_3');
    expect(mocks.confetti).toHaveBeenCalledOnce(); // not a second time
  });
});

describe('LevelResult cascade — 1 star (climax synchronous)', () => {
  it('fires star_ping_1 + level_up + confetti on mount', async () => {
    render(<LevelResult stars={1} onNext={() => {}} onReplay={() => {}} onBack={() => {}} hasNext />);
    await flushDynamicImports();
    expect(mocks.play).toHaveBeenCalledWith('star_ping_1');
    expect(mocks.play).toHaveBeenCalledWith('level_up');
    expect(mocks.confetti).toHaveBeenCalledOnce();
  });
});

describe('LevelResult — reduced motion', () => {
  it('skips confetti at the climax but still plays fanfare + pings', async () => {
    mocks.useReducedMotion.mockReturnValue(true);
    render(<LevelResult stars={3} onNext={() => {}} onReplay={() => {}} onBack={() => {}} hasNext />);
    act(() => {
      vi.advanceTimersByTime(STAR_CASCADE_MS[2]);
    });
    await flushDynamicImports();
    expect(mocks.play).toHaveBeenCalledWith('star_ping_3');
    expect(mocks.play).toHaveBeenCalledWith('level_up');
    expect(mocks.confetti).not.toHaveBeenCalled();
  });
});

describe('LevelResult — buttons still work', () => {
  it('renders earned stars (1)', () => {
    render(<LevelResult stars={1} onNext={() => {}} onReplay={() => {}} onBack={() => {}} hasNext />);
    expect(screen.getAllByTestId('star-filled')).toHaveLength(1);
    expect(screen.getAllByTestId('star-empty')).toHaveLength(2);
  });

  it('Next button calls onNext when hasNext', () => {
    const onNext = vi.fn();
    render(<LevelResult stars={2} onNext={onNext} onReplay={() => {}} onBack={() => {}} hasNext />);
    fireEvent.click(screen.getByTestId('result-next'));
    expect(onNext).toHaveBeenCalledOnce();
  });

  it('Next button hidden when !hasNext', () => {
    render(<LevelResult stars={2} onNext={() => {}} onReplay={() => {}} onBack={() => {}} hasNext={false} />);
    expect(screen.queryByTestId('result-next')).toBeNull();
  });

  it('Replay button calls onReplay', () => {
    const onReplay = vi.fn();
    render(<LevelResult stars={2} onNext={() => {}} onReplay={onReplay} onBack={() => {}} hasNext />);
    fireEvent.click(screen.getByTestId('result-replay'));
    expect(onReplay).toHaveBeenCalledOnce();
  });

  it('Back button calls onBack', () => {
    const onBack = vi.fn();
    render(<LevelResult stars={2} onNext={() => {}} onReplay={() => {}} onBack={onBack} hasNext />);
    fireEvent.click(screen.getByTestId('result-back'));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
