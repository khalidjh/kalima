import type { IconProps } from './Icon.types';

export function TrophyIcon({ size = 32, className, title }: IconProps) {
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
      {/* Left handle */}
      <path
        d="M16 14 L8 14 A4 4 0 0 0 4 18 L4 24 A8 8 0 0 0 12 32 L16 32"
        fill="none"
        stroke="#1A1A2E"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right handle */}
      <path
        d="M48 14 L56 14 A4 4 0 0 1 60 18 L60 24 A8 8 0 0 1 52 32 L48 32"
        fill="none"
        stroke="#1A1A2E"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Cup body */}
      <path
        d="M16 10 L48 10 L46 34 A14 14 0 0 1 18 34 Z"
        fill="#FACC15"
        stroke="#1A1A2E"
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {/* Star detail on cup */}
      <path
        d="M32 18 L34.5 23 L40 23.5 L36 27 L37 32.5 L32 30 L27 32.5 L28 27 L24 23.5 L29.5 23 Z"
        fill="#FFFFFF"
        stroke="#1A1A2E"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {/* Stem */}
      <rect
        x="28"
        y="40"
        width="8"
        height="10"
        fill="#FACC15"
        stroke="#1A1A2E"
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {/* Base */}
      <rect
        x="18"
        y="50"
        width="28"
        height="8"
        rx="2"
        fill="#FACC15"
        stroke="#1A1A2E"
        strokeWidth={5}
        strokeLinejoin="round"
      />
    </svg>
  );
}
