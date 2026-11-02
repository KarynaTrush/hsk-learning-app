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
  const { error } = await supabase
    .from("user_progress")
    .upsert({ user_id: userId, state, updated_at: new Date().toISOString() });
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