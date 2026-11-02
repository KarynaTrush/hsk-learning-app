const CUMULATIVE_WORDS = [150, 300, 600, 1200, 2500, 5000];

export function examReadiness(state) {
  const target = Math.min(Math.max(state.targetHsk || 1, 1), 6);
  const learned = Object.keys(state.words || {}).length;
  return { target, percent: Math.min(100, Math.round((learned / CUMULATIVE_WORDS[target - 1]) * 100)) };
}