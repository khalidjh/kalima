import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { TAP_FEEDBACK_MS } from '../_engine/timings';

const mocks = vi.hoisted(() => ({
  play: vi.fn(),
  speak: vi.fn().mockResolvedValue(undefined),
  useReducedMotion: vi.fn(() => false),
}));
vi.mock('../../hooks/useSound', () => ({
  useSound: () => ({ play: mocks.play, muted: false }),
}));
vi.mock('../../hooks/useSpeech', () => ({
  useSpeech: () => ({ speak: mocks.speak, speaking: false, supported: true }),
}));
vi.mock('../../hooks/useReducedMotion', () => ({
  useReducedMotion: () => mocks.useReducedMotion(),
}));

import { SpellPad } from './SpellPad';
import type { Word } from './data/words-en';

const CAT: Word = { id: 'cat', text: 'CAT' };

beforeEach(() => {
  mocks.play.mockClear();
  mocks.speak.mockClear();
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
});

async function advancePastFeedback(kind: 'correct' | 'wrong') {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(TAP_FEEDBACK_MS[kind]);
  });
}

describe('SpellPad — mode A (word-shown-no-distractors)', () => {
  const config = { mode: 'word-shown-no-distractors' as const, extraDistractors: 0 };

  it('renders slots equal to word length', () => {
    render(<SpellPad word={CAT} config={config} onComplete={() => {}} />);
    expect(screen.getAllByTestId(/^spell-slot-/)).toHaveLength(3);
  });

  it('renders one tile per unique letter in the word (no distractors)', () => {
    render(<SpellPad word={CAT} config={config} onComplete={() => {}} />);
    // CAT has 3 unique letters
    expect(screen.getAllByTestId('engine-tile')).toHaveLength(3);
  });

  it('shows the word text above the slots', () => {
    render(<SpellPad word={CAT} config={config} onComplete={() => {}} />);
    expect(screen.getByTestId('spell-word')).toHaveTextContent('CAT');
  });

  it('fills slot 0 with C when C is tapped first', async () => {
    render(<SpellPad word={CAT} config={config} onComplete={() => {}} />);
    fireEvent.click(screen.getByLabelText('letter C'));
    await advancePastFeedback('correct');
    expect(screen.getByTestId('spell-slot-0')).toHaveTextContent('C');
    expect(screen.getByTestId('spell-slot-1').textContent ?? '').toBe('');
  });

  it('rejects an out-of-order tap as wrong', async () => {
    render(<SpellPad word={CAT} config={config} onComplete={() => {}} />);
    // First letter expected is C, but tap A
    fireEvent.click(screen.getByLabelText('letter A'));
    await advancePastFeedback('wrong');
    expect(screen.getByTestId('spell-slot-0').textContent ?? '').toBe('');
    expect(mocks.play).toHaveBeenCalledWith('wrong');
  });

  it('fires onComplete with mistakes=0 when CAT is spelled cleanly', async () => {
    const onComplete = vi.fn();
    render(<SpellPad word={CAT} config={config} onComplete={onComplete} />);
    for (const ch of ['C', 'A', 'T']) {
      fireEvent.click(screen.getByLabelText(`letter ${ch}`));
      await advancePastFeedback('correct');
    }
    expect(onComplete).toHaveBeenCalledWith(0);
  });

  it('fires onComplete with mistakes=2 after two wrong taps before completion', async () => {
    const onComplete = vi.fn();
    render(<SpellPad word={CAT} config={config} onComplete={onComplete} />);
    // wrong, wrong, then C A T
    fireEvent.click(screen.getByLabelText('letter A')); await advancePastFeedback('wrong');
    fireEvent.click(screen.getByLabelText('letter T')); await advancePastFeedback('wrong');
    fireEvent.click(screen.getByLabelText('letter C')); await advancePastFeedback('correct');
    fireEvent.click(screen.getByLabelText('letter A')); await advancePastFeedback('correct');
    fireEvent.click(screen.getByLabelText('letter T')); await advancePastFeedback('correct');
    expect(onComplete).toHaveBeenCalledWith(2);
  });

  it('marks a used tile as disabled after correct tap', async () => {
    render(<SpellPad word={CAT} config={config} onComplete={() => {}} />);
    fireEvent.click(screen.getByLabelText('letter C'));
    await advancePastFeedback('correct');
    expect(screen.getByLabelText('letter C')).toBeDisabled();
  });
});
