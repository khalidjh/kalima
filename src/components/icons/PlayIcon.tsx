import type { IconProps } from './Icon.types';

export function PlayIcon({ size = 32, className, title }: IconProps) {
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
      {/* Right-pointing triangle, optical-centered (shifted slightly right) */}
      <path
        d="M18 10 L18 54 L54 32 Z"
        fill="#F87171"
        stroke="#1A1A2E"
        strokeWidth={5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
