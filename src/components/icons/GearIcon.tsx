import type { IconProps } from './Icon.types';

export function GearIcon({ size = 32, className, title }: IconProps) {
  const labelled = Boolean(title);
  // 8-toothed gear built from a single path
  // teeth at 12/3/6/9 o'clock and 4 diagonals
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
        d="
          M 28 4 L 36 4 L 38 14
          L 47 14 L 53 8 L 56 11 L 50 17
          L 50 26 L 60 28 L 60 36 L 50 38
          L 50 47 L 56 53 L 53 56 L 47 50
          L 38 50 L 36 60 L 28 60 L 26 50
          L 17 50 L 11 56 L 8 53 L 14 47
          L 14 38 L 4 36 L 4 28 L 14 26
          L 14 17 L 8 11 L 11 8 L 17 14
          L 26 14 Z
        "
        fill="#FACC15"
        stroke="#1A1A2E"
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {/* Center hole */}
      <circle
        cx="32"
        cy="32"
        r="7"
        fill="#FFFFFF"
        stroke="#1A1A2E"
        strokeWidth={5}
      />
    </svg>
  );
}
