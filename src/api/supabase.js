import { createClient } from "@supabase/supabase-js";
 
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
 
export const supabaseConfigured = Boolean(url && key);
 
if (!supabaseConfigured) {
  console.warn("Supabase не настроен: создай .env.local с VITE_SUPABASE_URL и VITE_SUPABASE_PUBLISHABLE_KEY");
}

export const supabase = supabaseConfigured ? createClient(url, key) : null;
 
















