import type { IconProps } from './Icon.types';

export function LetterTileIcon({ size = 32, className, title }: IconProps) {
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
      {/* Tile */}
      <rect
        x="6"
        y="6"
        width="52"
        height="52"
        rx="10"
        fill="#3B82F6"
        stroke="#1A1A2E"
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {/* Letter "A" */}
      <path
        d="M22 46 L32 18 L42 46 M26 38 L38 38"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
