// All juice-layer timings live here so tests and components share the same
// numbers. Tweak values here — never sprinkle magic numbers in JSX.

export const TAP_FEEDBACK_MS = {
  correct: 300,
  wrong: 400,
} as const;

// Each entry is the offset (ms) at which the corresponding star reveals,
// keyed by star index (0..2). Index 0 fires synchronously on mount.
export const STAR_CASCADE_MS = [0, 350, 700] as const;

export const CONFETTI_PARTICLES = 60;
