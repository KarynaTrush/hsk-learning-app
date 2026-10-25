import { VOCAB, vocabByNode } from "../data/vocab";
import { dueCards, masteredCount } from "./srs";
import { PATH_NODES } from "../data/path";

export function categoryErrorCounts(mistakes) {
  const counts = {};
  for (const m of mistakes || []) {
    const v = VOCAB.find((w) => w.hanzi === m.hanzi);
    const cat = v?.category || "food";
    counts[cat] = (counts[cat] || 0) + (m.count || 1);
  }
  return counts;
}

export function recommendLesson(state) {
  const nodes = PATH_NODES;
  const completed = new Set(state.completedNodeIds || []);
  const errorCats = categoryErrorCounts(state.mistakes);
  const topCat = Object.entries(errorCats).sort((a, b) => b[1] - a[1])[0]?.[0];

  if (topCat) {
    const problemNode = nodes.find((n) => n.category === topCat && !completed.has(n.id))
      || nodes.find((n) => n.category === topCat);
    if (problemNode) {
      return { node: problemNode, reason: "errors", category: topCat, due: dueCards(state.words).length };
    }
  }

  const active = nodes.find((n) => n.id === state.activeNodeId) || nodes.find((n) => !completed.has(n.id)) || nodes[12];
  return { node: active, reason: "progress", category: active.category, due: dueCards(state.words).length };
}

export function nodeProgress(state, nodeId) {
  const words = vocabByNode(nodeId);
  if (!words.length) return { total: 0, known: 0, pct: 0 };
  const known = words.filter((w) => (state.words?.[w.hanzi]?.seen || 0) > 0).length;
  return { total: words.length, known, pct: Math.round((known / words.length) * 100) };
}

export function forecastExam(state) {
  const target = state.targetHsk || 4;
  const targets = { 1: 150, 2: 300, 3: 600, 4: 1200, 5: 2500, 6: 5000 };
  const goal = targets[target] || 1200;
  const learned = masteredCount(state.words);
  const started = state.startedAt ? new Date(state.startedAt) : new Date();
  const days = Math.max(1, Math.round((Date.now() - started.getTime()) / 86400000));
  const rate = learned / days;
  const remaining = Math.max(0, goal - learned);
  const daysLeft = rate > 0.05 ? Math.round(remaining / Math.max(rate, 0.15)) : 180;
  const date = new Date();
  date.setDate(date.getDate() + daysLeft);
  const readiness = Math.min(99, Math.round((learned / goal) * 100) || 8);
  return { date, daysLeft, readiness, target, learned, goal };
}

export function hskCategoryStats(state, level) {
  const words = VOCAB.filter((w) => w.hsk === level || (level === 1 && w.hsk === 1));
  const cats = {};
  for (const w of words) {
    if (!cats[w.category]) cats[w.category] = { total: 0, known: 0 };
    cats[w.category].total += 1;
    if ((state.words?.[w.hanzi]?.seen || 0) > 0) cats[w.category].known += 1;
  }
  return Object.entries(cats).map(([key, v]) => ({
    key,
    pct: v.total ? Math.round((v.known / v.total) * 100) : 0,
  }));
}

export function weeksLearning(state) {
  if (!state.startedAt) return 1;
  return Math.max(1, Math.round((Date.now() - new Date(state.startedAt).getTime()) / (7 * 86400000)));
}
