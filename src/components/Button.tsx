import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'accent';

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary text-ink hover:brightness-95',
  secondary: 'bg-secondary text-white hover:brightness-110',
  accent: 'bg-accent text-white hover:brightness-110',
};

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant;
  children: ReactNode;
}

export function Button({ variant = 'primary', children, className = '', ...rest }: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={[
        'inline-flex items-center justify-center',
        'min-h-[48px] px-6 rounded-full',
        'font-display text-lg font-semibold',
        'shadow-card transition-[filter,opacity]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
