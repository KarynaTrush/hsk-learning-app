import fs from "fs";

const langs = ["ru", "pl", "en"];
const load = (l) => JSON.parse(fs.readFileSync(`src/i18n/locales/${l}.json`, "utf8"));
const flat = (o, p = "") =>
  Object.entries(o).flatMap(([k, v]) =>
    typeof v === "object" && v !== null ? flat(v, p + k + ".") : [p + k]
  );

const isUi = (k) => !k.startsWith("meanings.") && !k.startsWith("examples.");
const keys = Object.fromEntries(
  langs.map((l) => [l, new Set(flat(load(l)).filter(isUi))])
);

const all = new Set(langs.flatMap((l) => [...keys[l]]));

let missing = 0;
for (const l of langs) {
  for (const k of all) {
    if (!keys[l].has(k)) { console.log(`[${l}] нет ключа: ${k}`); missing++; }
  }
}
console.log(missing ? `Всего пропусков: ${missing}` : "Во всех языках одинаковые ключи ");