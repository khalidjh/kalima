import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const upsertMock = vi.fn().mockResolvedValue(undefined);

vi.mock('../../hooks/useGameProgress', () => ({
  useGameProgress: () => ({
    progress: new Map(),
    loading: false,
    error: null,
    upsert: upsertMock,
  }),
}));

vi.mock('./audio/speak', () => ({
  dispatchSpeak: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../hooks/useSpeech', () => ({
  useSpeech: () => ({ speak: vi.fn().mockResolvedValue(undefined), speaking: false, supported: true }),
}));

import { LetterTapSound } from './LetterTapSound';
import { useUserStore } from '../../stores/userStore';

beforeEach(() => {
  upsertMock.mockClear();
  useUserStore.setState({ profile: { id: 'u1', displayName: null, avatarUrl: null }, learnLang: 'ar' });
});

afterEach(() => {
  useUserStore.getState().reset();
});

async function playLevel(targetChar: string, targetName: string, mistakes: number) {
  // Pick level 0 from the grid
  fireEvent.click(screen.getByTestId('level-card-0'));
  // 3 prompts
  for (let p = 0; p < 3; p++) {
    if (p === 0) {
      // make `mistakes` wrong taps first, then correct
      for (let m = 0; m < mistakes; m++) {
        const tiles = screen.getAllByTestId('quiz-tile');
        const wrong = tiles.find((b) => b.getAttribute('aria-label') !== targetName);
        if (wrong) fireEvent.click(wrong);
      }
    }
    const correct = screen.getByLabelText(targetName);
    fireEvent.click(correct);
  }
}

describe('LetterTapSound', () => {
  it('shows level select initially', () => {
    render(<LetterTapSound />);
    expect(screen.getByTestId('level-select')).toBeInTheDocument();
  });

  it('starts a level when card tapped', () => {
    render(<LetterTapSound />);
    // First Arabic letter is alif (ا)
    fireEvent.click(screen.getByText('ا'));
    expect(screen.getByTestId('quiz')).toBeInTheDocument();
  });

  it('awards 3 stars for 0 mistakes', async () => {
    render(<LetterTapSound />);
    await playLevel('ا', 'alif', 0);
    await waitFor(() => expect(screen.getByTestId('level-result')).toBeInTheDocument());
    expect(upsertMock).toHaveBeenCalledWith(0, 3);
  });

  it('awards 2 stars for 1 mistake', async () => {
    render(<LetterTapSound />);
    await playLevel('ا', 'alif', 1);
    await waitFor(() => expect(screen.getByTestId('level-result')).toBeInTheDocument());
    expect(upsertMock).toHaveBeenCalledWith(0, 2);
  });

  it('awards 1 star for 2+ mistakes', async () => {
    render(<LetterTapSound />);
    await playLevel('ا', 'alif', 2);
    await waitFor(() => expect(screen.getByTestId('level-result')).toBeInTheDocument());
    expect(upsertMock).toHaveBeenCalledWith(0, 1);
  });

  it('Back button returns to level select', async () => {
    render(<LetterTapSound />);
    await playLevel('ا', 'alif', 0);
    fireEvent.click(screen.getByTestId('result-back'));
    expect(screen.getByTestId('level-select')).toBeInTheDocument();
  });
});
