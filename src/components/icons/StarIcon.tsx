import type { IconProps } from './Icon.types';

export function StarIcon({ size = 32, className, title }: IconProps) {
  const labelled = Boolean(title);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role={labelled ? 'img' : undefined}
      aria-hidden={labelled ? undefined : true}
    >
      {labelled && <title>{title}</title>}
      <path
        d="M32 6 L40 24 L60 26 L45 40 L49 60 L32 50 L15 60 L19 40 L4 26 L24 24 Z"
        fill="#FACC15"
        stroke="#1A1A2E"
        strokeWidth={5}
        strokeLinejoin="round"
      />
    </svg>
  );
}
