import type { IconProps } from './Icon.types';

export type FoxMood = 'idle' | 'success' | 'fail';

interface FoxProps extends IconProps {
  mood?: FoxMood;
}

export function FoxMascot({ mood = 'idle', size = 64, className, title }: FoxProps) {
  const labelled = Boolean(title);

  // Mouth paths swap based on mood
  const mouthPath =
    mood === 'success'
      ? 'M24 44 Q32 52 40 44' // big grin
      : mood === 'fail'
        ? 'M26 48 Q32 42 38 48' // downturn
        : 'M28 46 Q32 49 36 46'; // neutral

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
      {/* Left ear */}
      <path
        d="M12 18 L18 6 L24 18 Z"
        fill="#F87171"
        stroke="#1A1A2E"
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {/* Right ear */}
      <path
        d="M40 18 L46 6 L52 18 Z"
        fill="#F87171"
        stroke="#1A1A2E"
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {/* Face */}
      <path
        d="M10 30 Q10 14 32 14 Q54 14 54 30 L54 42 Q54 56 32 56 Q10 56 10 42 Z"
        fill="#F87171"
        stroke="#1A1A2E"
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {/* Snout (white center) */}
      <path
        d="M20 38 Q20 30 32 30 Q44 30 44 38 L44 46 Q44 54 32 54 Q20 54 20 46 Z"
        fill="#FFFFFF"
        stroke="#1A1A2E"
        strokeWidth={4}
        strokeLinejoin="round"
      />
      {/* Eye - left */}
      <circle cx="22" cy="26" r="3" fill="#1A1A2E" />
      {/* Eye - right */}
      <circle cx="42" cy="26" r="3" fill="#1A1A2E" />
      {/* Nose */}
      <ellipse cx="32" cy="38" rx="3" ry="2.5" fill="#1A1A2E" />
      {/* Mouth */}
      <path
        d={mouthPath}
        fill="none"
        stroke="#1A1A2E"
        strokeWidth={3}
        strokeLinecap="round"
      />
    </svg>
  );
}
