import { logAnswers, logRecommendations } from "./progress";

const KEY = "xinna_event_queue_v1";
const MAX_ITEMS = 1000;
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;
const BATCH = 50;
let flushing = false;

function read() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function write(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    return;
  }
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function isPermanent(error) {
  return Boolean(error && error.code);
}

export function enqueueAnswer(userId, event) {
  const list = read();
  list.push({ id: makeId(), kind: "answer", userId, event, at: Date.now() });
  write(list.slice(-MAX_ITEMS));
}

export function enqueueRecommendations(userId, items) {
  if (!items.length) return;
  const list = read();
  list.push({ id: makeId(), kind: "rec", userId, items, at: Date.now() });
  write(list.slice(-MAX_ITEMS));
}

async function sendAnswers(userId, group) {
  try {
    await logAnswers(userId, group.map((g) => g.event));
    return { done: group, stop: false };
  } catch (e) {
    if (!isPermanent(e)) return { done: [], stop: true };
  }
  const done = [];
  for (const item of group) {
    try {
      await logAnswers(userId, [item.event]);
      done.push(item);
    } catch (e) {
      if (!isPermanent(e)) return { done, stop: true };
      console.warn("answer_events: событие отброшено", e);
      done.push(item);
    }
  }
  return { done, stop: false };
}

async function sendRecommendations(userId, item) {
  try {
    await logRecommendations(userId, item.items);
    return { done: [item], stop: false };
  } catch (e) {
    if (!isPermanent(e)) return { done: [], stop: true };
    console.warn("recommendation_events: событие отброшено", e);
    return { done: [item], stop: false };
  }
}

export async function flushQueue(userId) {
  if (flushing || !userId) return;
  flushing = true;
  try {
    for (;;) {
      const now = Date.now();
      const fresh = read().filter((i) => now - i.at < MAX_AGE_MS);
      const mine = fresh.filter((i) => i.userId === userId);
      if (!mine.length) {
        write(fresh);
        return;
      }
      let result;
      if (mine[0].kind === "answer") {
        const group = [];
        for (const item of mine) {
          if (item.kind !== "answer" || group.length >= BATCH) break;
          group.push(item);
        }
        result = await sendAnswers(userId, group);
      } else {
        result = await sendRecommendations(userId, mine[0]);
      }
      const doneIds = new Set(result.done.map((i) => i.id));
      write(read().filter((i) => !doneIds.has(i.id) && now - i.at < MAX_AGE_MS));
      if (result.stop || !result.done.length) return;
    }
  } finally {
    flushing = false;
  }
}
