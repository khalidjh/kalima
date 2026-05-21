import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders children with surface styling', () => {
    render(
      <Card>
        <p>Inside</p>
      </Card>,
    );
    const inside = screen.getByText('Inside');
    const card = inside.closest('[data-testid="card"]');
    expect(card).not.toBeNull();
    expect(card).toHaveClass('rounded-2xl');
    expect(card).toHaveClass('bg-surface');
  });
});
