import type { IconProps } from './Icon.types';

export function LangToggleIcon({ size = 32, className, title }: IconProps) {
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
      {/* Speech bubble background */}
      <path
        d="
          M 8 14
          A 6 6 0 0 1 14 8
          L 50 8
          A 6 6 0 0 1 56 14
          L 56 44
          A 6 6 0 0 1 50 50
          L 22 50
          L 14 58
          L 14 50
          A 6 6 0 0 1 8 44
          Z
        "
        fill="#3B82F6"
        stroke="#1A1A2E"
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {/* Diagonal split */}
      <path
        d="M 14 44 L 50 14"
        stroke="#1A1A2E"
        strokeWidth={4}
        strokeLinecap="round"
      />
      {/* Arabic ع (top-left) */}
      <text
        x="20"
        y="28"
        fontFamily="sans-serif"
        fontWeight="900"
        fontSize="18"
        fill="#FFFFFF"
        textAnchor="middle"
      >
        ع
      </text>
      {/* EN (bottom-right) */}
      <text
        x="42"
        y="44"
        fontFamily="sans-serif"
        fontWeight="900"
        fontSize="14"
        fill="#FFFFFF"
        textAnchor="middle"
      >
        EN
      </text>
    </svg>
  );
}
