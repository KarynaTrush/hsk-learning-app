//node scripts/add-profile-keys.mjs
import fs from "fs";

const DIR = "src/i18n/locales";

const patches = {
  ru: { profile: { min: "{{count}} мин" } },
  pl: { profile: { min: "{{count}} min" } },
  en: { profile: { min: "{{count}} min" } },
};

function merge(target, patch, path = "", added = []) {
  for (const [k, v] of Object.entries(patch)) {
    if (v && typeof v === "object") {
      if (!target[k] || typeof target[k] !== "object") target[k] = {};
      merge(target[k], v, path + k + ".", added);
    } else if (!(k in target)) {
      target[k] = v;
      added.push(path + k);
    }
  }
  return added;
}

for (const [lang, patch] of Object.entries(patches)) {
  const file = `${DIR}/${lang}.json`;
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const added = merge(data, patch);
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
  console.log(`[${lang}] добавлено ключей: ${added.length}`);
}