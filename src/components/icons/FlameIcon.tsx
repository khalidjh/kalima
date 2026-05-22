import type { IconProps } from './Icon.types';

export function FlameIcon({ size = 32, className, title }: IconProps) {
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
      {/* Outer flame */}
      <path
        d="
          M 32 6
          C 28 18 18 22 18 36
          C 18 50 24 58 32 58
          C 40 58 46 50 46 36
          C 46 28 40 26 38 18
          C 36 24 32 24 32 6 Z
        "
        fill="#F87171"
        stroke="#1A1A2E"
        strokeWidth={5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Inner flame */}
      <path
        d="
          M 32 26
          C 28 32 26 36 26 42
          C 26 50 28 54 32 54
          C 36 54 38 50 38 42
          C 38 36 34 32 32 26 Z
        "
        fill="#FACC15"
        stroke="#1A1A2E"
        strokeWidth={3}
        strokeLinejoin="round"
      />
    </svg>
  );
}
