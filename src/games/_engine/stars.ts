// Stars by mistakes — same rule across every tap-based game in the engine.
// 0 mistakes = 3 stars, 1 = 2, 2+ = 1.
export function starsFor(mistakes: number): number {
  if (mistakes === 0) return 3;
  if (mistakes === 1) return 2;
  return 1;
}
