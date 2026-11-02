export function weakestSkill(skills, minAnswers = 8) {
  let worst = null;
  for (const [skill, v] of Object.entries(skills || {})) {
    if (!v || v.answers < minAnswers) continue;
    const accuracy = v.correct / v.answers;
    if (!worst || accuracy < worst.accuracy) worst = { skill, accuracy, answers: v.answers };
  }
  return worst;
}

export function nextLesson({ completedCount, dueCount, skills }) {
  const weak = weakestSkill(skills);
  if (completedCount === 0) return { reason: "start" };
  if (dueCount >= 5) return { reason: "due", count: dueCount };
  if (weak && weak.accuracy < 0.65) return { reason: "weak", skill: weak.skill, percent: Math.round(weak.accuracy * 100) };
  return { reason: "next" };
}