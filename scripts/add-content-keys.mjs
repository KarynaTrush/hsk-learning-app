//node scripts/add-content-keys.mjs
import fs from "fs";

const DIR = "src/i18n/locales";

const patches = {
  ru: {
    path: {
      completed: "Пройдено",
      active: "Активный",
      locked: "Закрыто",
      lessonsCount: "Уроков: {{count}}",
      words: "Слов: {{count}}",
      comingSoon: "Уроки для этого уровня скоро появятся",
    },
    lesson: { empty: "В этом уроке пока нет слов" },
    content: { loading: "Загрузка уроков…", error: "Не удалось загрузить уроки", retry: "Повторить" },
  },
  pl: {
    path: {
      completed: "Ukończono",
      active: "Aktywne",
      locked: "Zablokowane",
      lessonsCount: "Lekcji: {{count}}",
      words: "Słów: {{count}}",
      comingSoon: "Lekcje dla tego poziomu pojawią się wkrótce",
    },
    lesson: { empty: "W tej lekcji nie ma jeszcze słów" },
    content: { loading: "Ładowanie lekcji…", error: "Nie udało się załadować lekcji", retry: "Spróbuj ponownie" },
  },
  en: {
    path: {
      completed: "Completed",
      active: "Active",
      locked: "Locked",
      lessonsCount: "Lessons: {{count}}",
      words: "Words: {{count}}",
      comingSoon: "Lessons for this level are coming soon",
    },
    lesson: { empty: "This lesson has no words yet" },
    content: { loading: "Loading lessons…", error: "Could not load lessons", retry: "Try again" },
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
}