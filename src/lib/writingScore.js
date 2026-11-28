export const MAX_STARS = 5;
export const PASS_STARS = 3;

export function starsFor(mistakes, strokes) {
  const n = Math.max(1, strokes || 1);
  if (mistakes <= 0) return 5;
  if (mistakes <= Math.max(1, Math.round(n * 0.15))) return 4;
  if (mistakes <= Math.max(2, Math.round(n * 0.3))) return 3;
  if (mistakes <= Math.max(3, Math.round(n * 0.5))) return 2;
  return 1;
}

export function isPass(stars) {
  return stars >= PASS_STARS;
}
