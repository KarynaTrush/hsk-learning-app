import { weakestSkill } from "./nextLesson.js";

const conf = (n, k = 4) => n / (n + k);

export function buildRecommendations(input) {
  const {
    skills = {}, toneScores = {}, writingStats = {}, grammarStats = {}, readStories = [],
    dueCount = 0, mistakesCount = 0, completedCount = 0, nextNode = null,
    grammar = [], stories = [], level = 1, firstChar = null, unlockAll = false,
  } = input;
  const recs = [];
  const weak = weakestSkill(skills);
  const weakSkill = weak && weak.accuracy < 0.65 ? weak : null;

  if (nextNode) {
    recs.push({
      type: "lesson",
      score: completedCount === 0 ? 0.9 : weakSkill ? 0.5 + (0.65 - weakSkill.accuracy) * 0.8 : 0.42,
      reason: completedCount === 0 ? "start" : weakSkill ? "weak" : "next",
      params: weakSkill ? { skill: weakSkill.skill, percent: Math.round(weakSkill.accuracy * 100) } : {},
      target: { nodeId: nextNode.id },
    });
  }

  if (dueCount > 0) {
    recs.push({ type: "review", score: Math.min(0.95, 0.3 + dueCount / 50), reason: "due", params: { count: dueCount }, target: {} });
  }

  if (mistakesCount >= 3) {
    recs.push({ type: "mistakes", score: Math.min(0.85, 0.35 + mistakesCount / 40), reason: "mistakes", params: { count: mistakesCount }, target: {} });
  }

  const toneRows = [1, 2, 3, 4].map((n) => {
    const list = toneScores[n] || [];
    const avg = list.length ? list.reduce((a, b) => a + b, 0) / list.length : null;
    return { tone: n, attempts: list.length, avg };
  });
  const toneWeak = toneRows.filter((r) => r.attempts >= 2 && r.avg < 75).sort((a, b) => a.avg - b.avg)[0];
  if (toneWeak) {
    recs.push({
      type: "tones",
      score: (1 - toneWeak.avg / 100) * conf(toneWeak.attempts, 3) * 1.15 + 0.1,
      reason: "tone",
      params: { tone: toneWeak.tone, percent: Math.round(toneWeak.avg) },
      target: { tone: toneWeak.tone },
    });
  } else if (toneRows.every((r) => r.attempts === 0) && completedCount >= 1) {
    recs.push({ type: "tones", score: 0.3, reason: "toneNew", params: {}, target: { tone: 1 } });
  }

  const writeRows = Object.entries(writingStats)
    .map(([char, v]) => ({ char, ...v }))
    .filter((r) => r.mistakes >= 2 && (r.bestStars || 0) < 3)
    .sort((a, b) => b.mistakes - a.mistakes);
  if (writeRows.length) {
    recs.push({
      type: "writing",
      score: Math.min(0.9, 0.25 + writeRows[0].mistakes * 0.07),
      reason: "write",
      params: { char: writeRows[0].char, count: writeRows[0].mistakes },
      target: { char: writeRows[0].char },
    });
  } else if (!Object.keys(writingStats).length && completedCount >= 1 && firstChar) {
    recs.push({ type: "writing", score: 0.28, reason: "writeNew", params: { char: firstChar }, target: { char: firstChar } });
  }

  const gRows = Object.entries(grammarStats)
    .map(([id, v]) => ({ id: Number(id), answers: v.answers, accuracy: v.answers ? v.correct / v.answers : 1 }))
    .filter((r) => r.answers >= 3 && r.accuracy < 0.7)
    .sort((a, b) => a.accuracy - b.accuracy);
  if (gRows.length) {
    recs.push({
      type: "grammar",
      score: (1 - gRows[0].accuracy) * conf(gRows[0].answers, 4) * 1.2 + 0.1,
      reason: "grammar",
      params: { percent: Math.round(gRows[0].accuracy * 100) },
      target: { topicId: gRows[0].id },
    });
  } else if (!Object.keys(grammarStats).length && completedCount >= 2 && grammar.length) {
    const topic = grammar.find((g) => g.level <= Math.max(level, 1)) || grammar[0];
    recs.push({ type: "grammar", score: 0.3, reason: "grammarNew", params: {}, target: { topicId: topic.id } });
  }

  const story = stories.find((s) => !readStories.includes(s.id) && (unlockAll || s.hsk <= Math.max(level, 1)));
  if (story) {
    const readingWeak = weak && weak.skill === "reading" && weak.accuracy < 0.65;
    recs.push({ type: "read", score: readingWeak ? 0.5 : 0.3, reason: "read", params: {}, target: { storyId: story.id } });
  }

  const best = new Map();
  for (const r of recs) if (!best.has(r.type) || best.get(r.type).score < r.score) best.set(r.type, r);
  return [...best.values()].sort((a, b) => b.score - a.score).map((r, i) => ({ ...r, rank: i + 1 }));
}