// node scripts/add-keys.mjs
import fs from "fs";

const DIR = "src/i18n/locales";

const patches = {
  pl: {
    auth: { name: "IMIĘ", namePlaceholder: "Anna" },
    placement: {
      resultTitle: "Test zakończony",
      assigned: "Zalecany start: HSK {{level}}",
      continue: "Przejdź do nauki",
    },
    lesson: { buildTitle: "Ułóż zdanie", buildHint: "Kliknij znaki we właściwej kolejności" },
    profile: {
      since: "Aktywna od {{date}}",
      streakDays: "{{count}} dni z rzędu",
      wordsLearned: "{{count}} słów",
      dynamics: "Dynamika HSK",
      dynamicsSub: "Przyrost słownictwa · 6 miesięcy",
    },
  },
  en: {
    auth: { name: "NAME", namePlaceholder: "Anna" },
    placement: {
      resultTitle: "Test completed",
      assigned: "Recommended start: HSK {{level}}",
      continue: "Continue to learning",
    },
    lesson: { buildTitle: "Build the sentence", buildHint: "Tap the characters in the correct order" },
    profile: {
      since: "Active since {{date}}",
      streakDays: "{{count}}-day streak",
      wordsLearned: "{{count}} words",
      dynamics: "HSK progress",
      dynamicsSub: "Vocabulary growth · 6 months",
    },
  },
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
  added.forEach((k) => console.log("   +", k));
}