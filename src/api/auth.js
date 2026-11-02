import { supabase } from "./supabase";

export class AuthError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

function client() {
  if (!supabase) throw new AuthError("not_configured");
  return supabase;
}
function mapError(err) {
  if (err instanceof AuthError) return err;
  if (!err) return new AuthError("server_error");
  const code = err.code || "";
  const msg = (err.message || "").toLowerCase();
  if (code === "invalid_credentials" || msg.includes("invalid login credentials")) return new AuthError("invalid_credentials");
  if (code === "user_already_exists" || code === "email_exists" || msg.includes("already registered")) return new AuthError("email_taken");
  if (code === "weak_password") return new AuthError("password_short");
  if (code === "email_not_confirmed") return new AuthError("confirm_email");
  if (code === "over_request_rate_limit" || code === "over_email_send_rate_limit" || err.status === 429) return new AuthError("rate_limited");
  if (code === "email_address_invalid" || code === "validation_failed") return new AuthError("invalid_email");
  if (err.name === "AuthRetryableFetchError" || msg.includes("failed to fetch") || msg.includes("network")) return new AuthError("network");
  console.warn("Supabase auth error:", err);
  const unknown = new AuthError("server_error");
  unknown.detail = [err.code, err.status, err.message].filter(Boolean).join(" | ");
  return unknown;
}

export async function signUp({ name, email, password }) {
  try {
    const { data, error } = await client().auth.signUp({
      email,
      password,
      options: { data: { name } }, // имя попадёт в profiles.display_name через триггер в базе
    });
    if (error) throw error;
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      throw new AuthError("email_taken");
    }
    if (!data.session) throw new AuthError("confirm_email");
    return { user: data.user };
  } catch (err) {
    throw mapError(err);
  }
}

export async function signIn({ email, password }) {
  try {
    const { data, error } = await client().auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { user: data.user };
  } catch (err) {
    throw mapError(err);
  }
}

export async function signOut() {
  if (!supabase) return;
  try {
    await supabase.auth.signOut();
  } catch {
    /* локальная сессия всё равно сбрасывается */
  }
}
export async function changePassword({ email, oldPassword, newPassword }) {
  try {
    const { error: checkError } = await client().auth.signInWithPassword({ email, password: oldPassword });
    if (checkError) throw new AuthError("wrong_password");
    const { error } = await client().auth.updateUser({ password: newPassword });
    if (error) throw error;
  } catch (err) {
    throw mapError(err);
  }
}
export async function deleteAccount() {
  try {
    const { error } = await client().rpc("delete_my_account");
    if (error) throw error;
    await signOut();
  } catch (err) {
    throw mapError(err);
  }
}

export async function changeEmail(email) {
  try {
    const { error } = await client().auth.updateUser({ email });
    if (error) throw error;
  } catch (err) {
    throw mapError(err);
  }
}

export async function signOutOthers() {
  try {
    const { error } = await client().auth.signOut({ scope: "others" });
    if (error) throw error;
  } catch (err) {
    throw mapError(err);
  }
}

export async function currentAuthUser() {
  try {
    const { data, error } = await client().auth.getUser();
    if (error) throw error;
    return data.user;
  } catch (err) {
    throw mapError(err);
  }
}