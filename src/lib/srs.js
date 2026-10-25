const DAY = 86400000;

export function createCard(hanzi, extra = {}) {
  return {
    hanzi,
    ease: 2.5,
    interval: 0,
    reps: 0,
    nextReview: Date.now(),
    lastReview: null,
    lapses: 0,
    seen: 0,
    correct: 0,
    ...extra,
  };
}

/** quality: 0 fail, 3 hard, 4 good, 5 easy */
export function reviewCard(card, quality) {
  const next = { ...card, seen: (card.seen || 0) + 1, lastReview: Date.now() };
  if (quality < 3) {
    next.reps = 0;
    next.interval = 0;
    next.lapses = (card.lapses || 0) + 1;
    next.nextReview = Date.now() + 10 * 60 * 1000;
    return next;
  }
  next.correct = (card.correct || 0) + 1;
  if (next.reps === 0) next.interval = 1;
  else if (next.reps === 1) next.interval = 3;
  else next.interval = Math.max(1, Math.round(next.interval * next.ease));
  next.reps += 1;
  next.ease = Math.max(1.3, next.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  next.nextReview = Date.now() + next.interval * DAY;
  return next;
}

export function isDue(card, now = Date.now()) {
  return !card.nextReview || card.nextReview <= now;
}

export function dueCards(wordsMap) {
  return Object.values(wordsMap || {}).filter((c) => isDue(c));
}

export function accuracyOf(wordsMap) {
  const list = Object.values(wordsMap || {});
  const seen = list.reduce((s, w) => s + (w.seen || 0), 0);
  const correct = list.reduce((s, w) => s + (w.correct || 0), 0);
  if (seen === 0) return 0;
  return Math.round((correct / seen) * 100);
}

export function masteredCount(wordsMap) {
  return Object.values(wordsMap || {}).filter((w) => (w.reps || 0) >= 2 && (w.lapses || 0) < 3).length;
}
