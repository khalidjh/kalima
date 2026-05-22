import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'accent' | 'pop';
type Size = 'md' | 'lg';

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary text-ink hover:brightness-95',
  secondary: 'bg-secondary text-white hover:brightness-110',
  accent: 'bg-accent text-white hover:brightness-110',
  pop: 'bg-tomato text-white border-4 border-ink shadow-pop-lg',
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
      whileTap={isPop ? { x: 4, y: 4 } : { scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={[
        'inline-flex items-center justify-center',
        isPop ? 'rounded-2xl font-black tracking-wide' : 'rounded-full font-display font-semibold',
        sizeClasses[size],
        isPop ? 'active:shadow-none transition-shadow' : 'shadow-card transition-[filter,opacity]',
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
