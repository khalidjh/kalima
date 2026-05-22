import type { IconProps } from './Icon.types';

export function PuzzleIcon({ size = 32, className, title }: IconProps) {
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
      {/* Classic puzzle piece: square base with a tab on top and a slot on right */}
      <path
        d="
          M 10 14
          L 26 14
          A 6 6 0 0 1 38 14
          L 50 14
          L 50 26
          A 6 6 0 0 0 50 38
          L 50 54
          L 38 54
          A 6 6 0 0 1 26 54
          L 10 54
          Z
        "
        fill="#F87171"
        stroke="#1A1A2E"
        strokeWidth={5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
