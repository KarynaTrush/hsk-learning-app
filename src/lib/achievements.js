import { sumActivity, sumMinutes } from "./activity.js";

const lessons = (s) => (s.completedNodeIds || []).length;
const words = (s) => Object.keys(s.words || {}).length;
const streak = (s) => s.streak?.count || 0;
const toneTries = (s) => sumActivity(s.activityLog, "tones", 365);
const toneMasters = (s) =>
  [1, 2, 3, 4].filter((n) => {
    const list = s.toneScores?.[n] || [];
    return list.length >= 3 && list.reduce((a, b) => a + b, 0) / list.length >= 80;
  }).length;
const writers = (s) => Object.values(s.writingStats || {}).filter((v) => (v.bestStars || 0) >= 2).length;
const readers = (s) => (s.readStories || []).length;
const grammarRight = (s) => Object.values(s.grammarStats || {}).reduce((a, v) => a + (v.correct || 0), 0);
const sharp = (s) => ((s.stats?.answers || 0) >= 50 ? Math.round((s.stats.correct / s.stats.answers) * 100) : 0);

export const ACHIEVEMENTS = [
  { id: "firstLesson", hanzi: "初", color: "#4F7942", goal: 1, metric: lessons },
  { id: "lessons5", hanzi: "五", color: "#4F7942", goal: 5, metric: lessons },
  { id: "lessons15", hanzi: "路", color: "#4F7942", goal: 15, metric: lessons },
  { id: "words50", hanzi: "词", color: "#C83E34", goal: 50, metric: words },
  { id: "words150", hanzi: "百", color: "#C83E34", goal: 150, metric: words },
  { id: "words500", hanzi: "博", color: "#C83E34", goal: 500, metric: words },
  { id: "streak3", hanzi: "三", color: "#D4A843", goal: 3, metric: streak },
  { id: "streak7", hanzi: "周", color: "#D4A843", goal: 7, metric: streak },
  { id: "streak30", hanzi: "月", color: "#D4A843", goal: 30, metric: streak },
  { id: "tones10", hanzi: "声", color: "#3C8D93", goal: 10, metric: toneTries },
  { id: "toneMaster", hanzi: "调", color: "#3C8D93", goal: 4, metric: toneMasters },
  { id: "writer5", hanzi: "写", color: "#8A4F9E", goal: 5, metric: writers },
  { id: "writer20", hanzi: "笔", color: "#8A4F9E", goal: 20, metric: writers },
  { id: "reader3", hanzi: "读", color: "#A07820", goal: 3, metric: readers },
  { id: "reader10", hanzi: "书", color: "#A07820", goal: 10, metric: readers },
  { id: "grammar20", hanzi: "法", color: "#2B6CB0", goal: 20, metric: grammarRight },
  { id: "sharp", hanzi: "准", color: "#2B6CB0", goal: 90, metric: sharp },
];

export function evaluateAchievements(state) {
  return ACHIEVEMENTS.map((a) => {
    const value = a.metric(state);
    return { id: a.id, hanzi: a.hanzi, color: a.color, goal: a.goal, value, unlocked: value >= a.goal, percent: Math.min(100, Math.round((value / a.goal) * 100)) };
  });
}

const RANK_STEPS = [0, 3, 7, 11, 15];

export function rankIndex(unlockedCount) {
  let idx = 0;
  RANK_STEPS.forEach((step, i) => {
    if (unlockedCount >= step) idx = i;
  });
  return idx;
}

export const WEEKLY_GOALS = [
  { id: "minutes", target: 60 },
  { id: "words", target: 30 },
  { id: "lessons", target: 4 },
  { id: "tones", target: 10 },
  { id: "writes", target: 8 },
  { id: "reads", target: 2 },
];

export function weeklyProgress(state) {
  return WEEKLY_GOALS.map((g) => ({
    ...g,
    value: g.id === "minutes" ? sumMinutes(state.studyLog, 7) : sumActivity(state.activityLog, g.id, 7),
  }));
}