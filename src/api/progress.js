import { supabase } from "./supabase";
export async function loadProgress(userId) {
  const { data, error } = await supabase
    .from("user_progress")
    .select("state, updated_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data; // null, если строки ещё нет
}

export async function saveProgress(userId, state) {
  const stamp = new Date().toISOString();
  const { error } = await supabase.from("user_progress").upsert({ user_id: userId, state, updated_at: stamp });
  if (error) throw error;
  return stamp;
}
export async function logRecommendations(userId, items) {
  if (!items.length) return;
  const { error } = await supabase.from("recommendation_events").insert(
    items.map((r) => ({
      user_id: userId,
      rec_type: r.type,
      reason: r.reason,
      target: r.target || {},
      score: r.score,
      rank: r.rank,
      action: r.action,
      policy: "rules-v1",
    }))
  );
  if (error) throw error;
}

export async function logAnswers(userId, events) {
  if (!events.length) return;
  const rows = events.map((e) => ({
    user_id: userId,
    hanzi: e.hanzi,
    correct: e.correct,
    response_ms: e.responseMs ?? null,
    source: e.source ?? null,
    exercise_type: e.type ?? null,
    skill: e.skill ?? null,
    lesson_id: e.lessonId ?? null,
    policy: e.policy ?? null,
    ...(e.createdAt ? { created_at: e.createdAt } : {}),
  }));
  const { error } = await supabase.from("answer_events").insert(rows);
  if (error) throw error;
}

export async function logAnswer(userId, { hanzi, correct, responseMs = null, source = null, type = null, skill = null, lessonId = null, policy = null }) {
  const { error } = await supabase.from("answer_events").insert({
    user_id: userId,
    hanzi,
    correct,
    response_ms: responseMs,
    source,
    exercise_type: type,
    skill,
    lesson_id: lessonId,
    policy,
  });
  if (error) throw error;
}