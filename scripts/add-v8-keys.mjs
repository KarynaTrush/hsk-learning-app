import fs from "fs";

const DIR = "src/i18n/locales";

const patches = {
  ru: {
    standard: {
      title: "Стандарт HSK",
      hint: "Выберите, по какому стандарту вы учитесь. Сейчас доступен HSK 2.0, а HSK 3.0 появится позже.",
      soon: "скоро",
      soonHint: "HSK 3.0 появится позже",
    },
    placement: { bar: "Тест уровня" },
    home: { allGood: "Других рекомендаций пока нет. Продолжайте в том же духе!" },
  },
  pl: {
    standard: {
      title: "Standard HSK",
      hint: "Wybierz, według którego standardu się uczysz. Na razie dostępny jest HSK 2.0, a HSK 3.0 pojawi się później.",
      soon: "wkrótce",
      soonHint: "HSK 3.0 pojawi się później",
    },
    placement: { bar: "Test poziomu" },
    home: { allGood: "Na razie nie ma innych rekomendacji. Tak trzymaj!" },
  },
  en: {
    standard: {
      title: "HSK standard",
      hint: "Choose which standard you are studying. HSK 2.0 is available now, and HSK 3.0 will come later.",
      soon: "soon",
      soonHint: "HSK 3.0 will be available later",
    },
    placement: { bar: "Level test" },
    home: { allGood: "No other recommendations for now. Keep it up!" },
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