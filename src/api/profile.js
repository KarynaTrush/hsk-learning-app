import { supabase } from "./supabase";
 
export async function fetchProfile(userId) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data;
}
 
export async function updateProfile(userId, patch) {
  const stamped = { ...patch, updated_at: new Date().toISOString() };
  const { data, error } = await supabase.from("profiles").update(stamped).eq("id", userId).select("id");
  if (error) throw error;
  if (data && data.length) return;
  const { error: insertError } = await supabase.from("profiles").insert({ id: userId, ...stamped });
  if (insertError) throw insertError;
}
 