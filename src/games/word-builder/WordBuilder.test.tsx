import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TAP_FEEDBACK_MS } from '../_engine/timings';

const mocks = vi.hoisted(() => ({
  upsert: vi.fn().mockResolvedValue(undefined),
  progress: new Map<number, number>(),
  play: vi.fn(),
  speak: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../hooks/useGameProgress', () => ({
  useGameProgress: () => ({
    progress: mocks.progress,
    loading: false,
    error: null,
    upsert: mocks.upsert,
  }),
}));
vi.mock('../../hooks/useSound', () => ({
  useSound: () => ({ play: mocks.play, muted: false }),
}));
vi.mock('../../hooks/useSpeech', () => ({
  useSpeech: () => ({ speak: mocks.speak, speaking: false, supported: true }),
}));
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

import { WordBuilder } from './WordBuilder';
import { useUserStore } from '../../stores/userStore';
import { WORDS_EN } from './data/words-en';

async function advance(kind: 'correct' | 'wrong') {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(TAP_FEEDBACK_MS[kind]);
  });
}

async function tapLetter(letter: string, kind: 'correct' | 'wrong' = 'correct') {
  fireEvent.click(screen.getByLabelText(`letter ${letter}`));
  await advance(kind);
}

beforeEach(() => {
  mocks.upsert.mockClear();
  mocks.play.mockClear();
  mocks.speak.mockClear();
  mocks.progress = new Map();
  useUserStore.setState({
    profile: { id: 'u1', displayName: null, avatarUrl: null },
    learnLang: 'en',
    ageGroup: '5-7',
  });
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
  useUserStore.getState().reset();
});

describe('WordBuilder', () => {
  it('shows level select initially', () => {
    render(<WordBuilder />);
    expect(screen.getByTestId('level-select')).toBeInTheDocument();
  });

  it('renders age-5-7 pool (20 cards) for age 5-7', () => {
    render(<WordBuilder />);
    expect(screen.getAllByTestId(/^level-card-/)).toHaveLength(20);
  });

  it('renders age-3-4 pool (8 cards) for age 3-4', () => {
    useUserStore.setState({ ageGroup: '3-4' });
    render(<WordBuilder />);
    expect(screen.getAllByTestId(/^level-card-/)).toHaveLength(8);
  });

  it('starts a level when a card is tapped (3-4 mode A)', () => {
    useUserStore.setState({ ageGroup: '3-4' });
    render(<WordBuilder />);
    // First age-3-4 word is CAT; level index is WORDS_EN.findIndex(w=>w.id==='cat')
    const catIndex = WORDS_EN.findIndex((w) => w.id === 'cat');
    fireEvent.click(screen.getByTestId(`level-card-${catIndex}`));
    expect(screen.getByTestId('spell-pad')).toBeInTheDocument();
    expect(screen.getByTestId('spell-word')).toHaveTextContent('CAT');
  });

  it('awards 3 stars for spelling CAT with 0 mistakes (age 3-4)', async () => {
    useUserStore.setState({ ageGroup: '3-4' });
    render(<WordBuilder />);
    const catIndex = WORDS_EN.findIndex((w) => w.id === 'cat');
    fireEvent.click(screen.getByTestId(`level-card-${catIndex}`));
    await tapLetter('C');
    await tapLetter('A');
    await tapLetter('T');
    await waitFor(() => expect(screen.getByTestId('level-result')).toBeInTheDocument());
    expect(mocks.upsert).toHaveBeenCalledWith(catIndex, 3);
  });

  it('awards 2 stars for 1 mistake', async () => {
    useUserStore.setState({ ageGroup: '3-4' });
    render(<WordBuilder />);
    const catIndex = WORDS_EN.findIndex((w) => w.id === 'cat');
    fireEvent.click(screen.getByTestId(`level-card-${catIndex}`));
    await tapLetter('A', 'wrong'); // C expected, tap A first
    await tapLetter('C');
    await tapLetter('A');
    await tapLetter('T');
    await waitFor(() => expect(screen.getByTestId('level-result')).toBeInTheDocument());
    expect(mocks.upsert).toHaveBeenCalledWith(catIndex, 2);
  });

  it('age 5-7 mode shows word + 2 distractors (5 tiles for CAT)', () => {
    // Switch to age 5-7 and pick a 3-letter word in its pool. Use FOX.
    useUserStore.setState({ ageGroup: '5-7' });
    render(<WordBuilder />);
    const foxIndex = WORDS_EN.findIndex((w) => w.id === 'fox');
    fireEvent.click(screen.getByTestId(`level-card-${foxIndex}`));
    expect(screen.getByTestId('spell-word')).toHaveTextContent('FOX');
    expect(screen.getAllByTestId('engine-tile')).toHaveLength(5);
  });

  it('age 8-10 mode does not show the word and speaks it on mount', () => {
    useUserStore.setState({ ageGroup: '8-10' });
    render(<WordBuilder />);
    const lionIndex = WORDS_EN.findIndex((w) => w.id === 'lion');
    fireEvent.click(screen.getByTestId(`level-card-${lionIndex}`));
    expect(screen.queryByTestId('spell-word')).not.toBeInTheDocument();
    expect(screen.getByTestId('spell-speaker')).toBeInTheDocument();
    expect(mocks.speak).toHaveBeenCalled();
    expect(mocks.speak.mock.calls[0][0]).toBe('LION');
  });

  it('Back button returns to level select', async () => {
    useUserStore.setState({ ageGroup: '3-4' });
    render(<WordBuilder />);
    const catIndex = WORDS_EN.findIndex((w) => w.id === 'cat');
    fireEvent.click(screen.getByTestId(`level-card-${catIndex}`));
    await tapLetter('C'); await tapLetter('A'); await tapLetter('T');
    await waitFor(() => expect(screen.getByTestId('level-result')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('result-back'));
    expect(screen.getByTestId('level-select')).toBeInTheDocument();
  });

  it('preserves earned stars across an age-group switch (progress is not age-keyed)', async () => {
    const catIndex = WORDS_EN.findIndex((w) => w.id === 'cat');
    mocks.progress = new Map([[catIndex, 3]]);
    useUserStore.setState({ ageGroup: '3-4' });
    render(<WordBuilder />);
    const card34 = screen.getByTestId(`level-card-${catIndex}`);
    expect(card34.querySelectorAll('svg')).toHaveLength(3);
    act(() => { useUserStore.setState({ ageGroup: '5-7' }); });
    // CAT isn't in the 5-7 pool, so card won't be visible — but we can verify
    // that the registry didn't lose progress by switching to 8-10 (also misses)
    // and back to 3-4.
    act(() => { useUserStore.setState({ ageGroup: '3-4' }); });
    await waitFor(() => {
      const card = screen.getByTestId(`level-card-${catIndex}`);
      expect(card.querySelectorAll('svg')).toHaveLength(3);
    });
  });
});
