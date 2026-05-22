import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'accent' | 'pop';
type Size = 'md' | 'lg';

// Pop Cartoon brand chrome is applied to every variant; the variant only
// chooses the colour pairing. Keeps `bg-primary` / `bg-accent` class names
// stable for existing tests and external usages.
const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary text-ink',
  secondary: 'bg-secondary text-white',
  accent: 'bg-accent text-white',
  pop: 'bg-tomato text-white',
};

const sizeClasses: Record<Size, string> = {
  md: 'min-h-[48px] px-6 text-lg',
  lg: 'min-h-[64px] px-8 text-2xl',
};

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...rest
}: ButtonProps) {
  const isPop = variant === 'pop';
  return (
    <motion.button
      whileTap={{ x: 4, y: 4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={[
        'inline-flex items-center justify-center',
        'rounded-2xl border-4 border-ink font-black tracking-wide',
        isPop ? 'shadow-pop-lg' : 'shadow-pop',
        'active:shadow-none transition-shadow',
        sizeClasses[size],
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
