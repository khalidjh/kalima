import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className = '', ...rest }: CardProps) {
  return (
    <div
      data-testid="card"
      className={['rounded-2xl bg-surface shadow-card p-6', className].join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}
