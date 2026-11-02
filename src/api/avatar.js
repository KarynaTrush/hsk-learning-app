import { supabase } from "./supabase";

const MAX_BYTES = 5 * 1024 * 1024;

async function toSquareBlob(file, size = 256) {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("image"))), "image/jpeg", 0.85);
  });
}

export async function uploadAvatar(userId, file) {
  if (!supabase) throw new Error("not_configured");
  if (!file.type.startsWith("image/")) throw new Error("avatar_type");
  if (file.size > MAX_BYTES) throw new Error("avatar_size");
  const blob = await toSquareBlob(file);
  const path = `${userId}/avatar.jpg`;
  const { error } = await supabase.storage.from("avatars").upload(path, blob, {
    upsert: true,
    contentType: "image/jpeg",
    cacheControl: "3600",
  });
  if (error) throw error;
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}