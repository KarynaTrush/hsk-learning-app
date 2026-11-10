import { dateKey } from "./dates.js";

export const LEVEL_WORDS = [150, 300, 600, 1200, 2500, 5000];

export function lastDays(count, end = new Date()) {
  const out = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    out.push(dateKey(d));
  }
  return out;
}

export function sumActivity(log, field, days = 7, end = new Date()) {
  return lastDays(days, end).reduce((acc, key) => acc + (log?.[key]?.[field] || 0), 0);
}

export function todayActivity(log, field, end = new Date()) {
  return log?.[dateKey(end)]?.[field] || 0;
}

export function minutesOn(studyLog, key) {
  return Math.round((studyLog?.[key] || 0) / 60);
}

export function sumMinutes(studyLog, days = 7, end = new Date()) {
  return lastDays(days, end).reduce((acc, key) => acc + minutesOn(studyLog, key), 0);
}

export function heatmap(studyLog, activityLog, weeks = 5, end = new Date()) {
  const today = new Date(end);
  const todayKey = dateKey(today);
  const dow = (today.getDay() + 6) % 7;
  const start = new Date(today);
  start.setDate(today.getDate() - dow - (weeks - 1) * 7);
  const columns = [];
  for (let w = 0; w < weeks; w++) {
    const column = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      const key = dateKey(date);
      const future = key > todayKey;
      const minutes = minutesOn(studyLog, key);
      const actions = Object.values(activityLog?.[key] || {}).reduce((a, b) => a + b, 0);
      let level = 0;
      if (!future) {
        if (minutes >= 30) level = 4;
        else if (minutes >= 16) level = 3;
        else if (minutes >= 6) level = 2;
        else if (minutes >= 1 || actions > 0) level = 1;
      }
      column.push({ key, minutes, actions, level, future });
    }
    columns.push(column);
  }
  return columns;
}

export function goalOptions(level) {
  const base = Math.max(1, level);
  return [...new Set([base, Math.min(6, base + 1), Math.min(6, base + 2)])];
}

export function goalProgress(state, end = new Date()) {
  const target = Math.min(Math.max(state.targetHsk || 1, 1), 6);
  const needed = LEVEL_WORDS[target - 1];
  const learned = Object.keys(state.words || {}).length;
  const percent = Math.min(100, Math.round((learned / needed) * 100));
  const perWeek = sumActivity(state.activityLog, "words", 28, end) / 4;
  const remaining = Math.max(0, needed - learned);
  const weeks = remaining === 0 ? 0 : perWeek >= 1 ? Math.ceil(remaining / perWeek) : null;
  return { target, needed, learned, percent, weeks };
}