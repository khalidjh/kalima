import type { IconProps } from './Icon.types';

export function LockIcon({ size = 32, className, title }: IconProps) {
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
      {/* Shackle arc */}
      <path
        d="M20 32 L20 22 A12 12 0 0 1 44 22 L44 32"
        fill="none"
        stroke="#1A1A2E"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Body */}
      <rect
        x="14"
        y="30"
        width="36"
        height="28"
        rx="5"
        fill="#FFFFFF"
        stroke="#1A1A2E"
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {/* Keyhole */}
      <circle cx="32" cy="42" r="3.5" fill="#1A1A2E" />
      <rect x="30.5" y="42" width="3" height="8" rx="1.5" fill="#1A1A2E" />
    </svg>
  );
}
