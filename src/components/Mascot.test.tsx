import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Mascot } from './Mascot';

describe('Mascot', () => {
  it('renders idle by default', () => {
    render(<Mascot />);
    expect(screen.getByTestId('mascot')).toHaveAttribute('data-mood', 'idle');
  });

  it('renders success mood', () => {
    render(<Mascot mood="success" />);
    expect(screen.getByTestId('mascot')).toHaveAttribute('data-mood', 'success');
  });

  it('renders fail mood', () => {
    render(<Mascot mood="fail" />);
    expect(screen.getByTestId('mascot')).toHaveAttribute('data-mood', 'fail');
  });
});
