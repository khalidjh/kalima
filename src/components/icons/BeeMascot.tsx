import type { IconProps } from './Icon.types';

export function BeeMascot({ size = 64, className, title }: IconProps) {
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
      {/* Back wing */}
      <ellipse
        cx="22"
        cy="22"
        rx="10"
        ry="7"
        fill="#FFFFFF"
        stroke="#1A1A2E"
        strokeWidth={4}
        strokeLinejoin="round"
      />
      {/* Front wing */}
      <ellipse
        cx="42"
        cy="22"
        rx="10"
        ry="7"
        fill="#FFFFFF"
        stroke="#1A1A2E"
        strokeWidth={4}
        strokeLinejoin="round"
      />
      {/* Body - chubby ellipse */}
      <ellipse
        cx="32"
        cy="38"
        rx="18"
        ry="16"
        fill="#FACC15"
        stroke="#1A1A2E"
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {/* Stripe 1 */}
      <path
        d="M22 32 Q32 27 42 32"
        fill="none"
        stroke="#1A1A2E"
        strokeWidth={4}
        strokeLinecap="round"
      />
      {/* Stripe 2 */}
      <path
        d="M21 42 Q32 47 43 42"
        fill="none"
        stroke="#1A1A2E"
        strokeWidth={4}
        strokeLinecap="round"
      />
      {/* Eye - left */}
      <circle cx="26" cy="36" r="2.5" fill="#1A1A2E" />
      {/* Eye - right */}
      <circle cx="38" cy="36" r="2.5" fill="#1A1A2E" />
      {/* Smile */}
      <path
        d="M28 44 Q32 47 36 44"
        fill="none"
        stroke="#1A1A2E"
        strokeWidth={3}
        strokeLinecap="round"
      />
    </svg>
  );
}
