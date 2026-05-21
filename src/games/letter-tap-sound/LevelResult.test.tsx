import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LevelResult } from './LevelResult';

describe('LevelResult', () => {
  it('renders earned stars (1)', () => {
    render(<LevelResult stars={1} onNext={() => {}} onReplay={() => {}} onBack={() => {}} hasNext />);
    expect(screen.getAllByTestId('star-filled')).toHaveLength(1);
    expect(screen.getAllByTestId('star-empty')).toHaveLength(2);
  });

  it('renders earned stars (3)', () => {
    render(<LevelResult stars={3} onNext={() => {}} onReplay={() => {}} onBack={() => {}} hasNext />);
    expect(screen.getAllByTestId('star-filled')).toHaveLength(3);
    expect(screen.queryAllByTestId('star-empty')).toHaveLength(0);
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
