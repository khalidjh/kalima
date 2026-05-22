import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import * as Icons from './index';

const ALL = Object.entries(Icons).filter(([, v]) => typeof v === 'function') as Array<
  [string, React.ComponentType<{ size?: number; title?: string }>]
>;

describe('icon set', () => {
  it('exports at least one icon', () => {
    expect(ALL.length).toBeGreaterThan(0);
  });

  for (const [name, Component] of ALL) {
    it(`${name} renders an SVG`, () => {
      const { container } = render(<Component />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it(`${name} respects the size prop`, () => {
      const { container } = render(<Component size={48} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '48');
      expect(svg).toHaveAttribute('height', '48');
    });

    it(`${name} renders a <title> when title prop is set`, () => {
      const { container } = render(<Component title={`${name} icon`} />);
      const titleEl = container.querySelector('title');
      expect(titleEl).not.toBeNull();
      expect(titleEl?.textContent).toBe(`${name} icon`);
    });

    it(`${name} is aria-hidden when no title prop`, () => {
      const { container } = render(<Component />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  }
});
