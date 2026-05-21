import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders children and fires onClick', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Tap me</Button>);
    await userEvent.click(screen.getByRole('button', { name: /tap me/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies the primary variant by default', () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary');
  });

  it('applies the accent variant when specified', () => {
    render(<Button variant="accent">Go</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-accent');
  });

  it('does not fire onClick when disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Go
      </Button>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });
});
