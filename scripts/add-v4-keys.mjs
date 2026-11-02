import fs from "fs";

const DIR = "src/i18n/locales";

const patches = {
  ru: {
    nav: { writing: "Письмо", writingSub: "Иероглифы и черты", readiness: "Готовность {{percent}}%" },
    flow: { skill: { writing: "Письмо иероглифов" } },
    reading: {
      bannerKicker: "Ваш уровень: HSK {{level}}",
      bannerSubtitle: "Открыто историй: {{open}} из {{total}}. Остальные откроются по мере прохождения уроков.",
      locked: "Откроется на уровне HSK {{level}}",
      readAgain: "Читать ещё раз",
      backToList: "К списку историй",
      hoverHint: "Наведите на иероглиф, чтобы увидеть пиньинь и перевод",
      noTranslation: "Перевода пока нет",
      playAll: "Озвучить текст",
      markRead: "Отметить как прочитанное",
      readDone: "Прочитано",
    },
    writing: {
      kicker: "Каллиграфия",
      subtitle: "Смотрите порядок черт, затем пишите иероглиф мышью или пальцем. Приложение проверяет каждую черту.",
      fromLesson: "Из урока",
      learned: "Выученные",
      customPlaceholder: "Любой иероглиф",
      go: "Открыть",
      mode: { watch: "Смотреть", trace: "По контуру", free: "Без подсказок" },
      unsupported: "Для этого иероглифа нет данных о чертах",
      loading: "Загрузка…",
      progress: "Черт написано: {{done}} из {{total}}",
      mistakes: "ошибок: {{count}}",
      watchHint: "Запомните порядок черт, затем нажмите «Пробую сам»",
      restart: "Заново",
      tryYourself: "Пробую сам",
      nextChar: "Следующий",
      strokesCount: "Черт: {{count}}",
      inWords: "Встречается в словах",
      strokeOrder: "Порядок черт",
      rulesTitle: "Правила написания",
      rule1: "Сверху вниз и слева направо.",
      rule2: "Горизонтальные черты раньше вертикальных (十).",
      rule3: "Сначала левая вниз, потом правая вниз (人).",
      rule4: "Рамку закрывают в самом конце (日).",
      result: { 1: "Хорошая попытка. Попробуйте ещё раз!", 2: "Хорошо!", 3: "Идеально!" },
      mistakesTotal: "Ошибок: {{count}}",
    },
  },
  pl: {
    nav: { writing: "Pisanie", writingSub: "Znaki i kreski", readiness: "Gotowość {{percent}}%" },
    flow: { skill: { writing: "Pisanie znaków" } },
    reading: {
      bannerKicker: "Twój poziom: HSK {{level}}",
      bannerSubtitle: "Odblokowane historie: {{open}} z {{total}}. Kolejne otworzą się wraz z postępami w lekcjach.",
      locked: "Odblokuje się na poziomie HSK {{level}}",
      readAgain: "Czytaj ponownie",
      backToList: "Do listy historii",
      hoverHint: "Najedź na znak, aby zobaczyć pinyin i tłumaczenie",
      noTranslation: "Brak tłumaczenia",
      playAll: "Odtwórz tekst",
      markRead: "Oznacz jako przeczytane",
      readDone: "Przeczytane",
    },
    writing: {
      kicker: "Kaligrafia",
      subtitle: "Obejrzyj kolejność kresek, a potem napisz znak myszką lub palcem. Aplikacja sprawdza każdą kreskę.",
      fromLesson: "Z lekcji",
      learned: "Poznane",
      customPlaceholder: "Dowolny znak",
      go: "Otwórz",
      mode: { watch: "Oglądaj", trace: "Po konturze", free: "Bez podpowiedzi" },
      unsupported: "Dla tego znaku nie ma danych o kreskach",
      loading: "Ładowanie…",
      progress: "Napisane kreski: {{done}} z {{total}}",
      mistakes: "błędów: {{count}}",
      watchHint: "Zapamiętaj kolejność kresek, potem naciśnij «Próbuję sam»",
      restart: "Od nowa",
      tryYourself: "Próbuję sam",
      nextChar: "Następny",
      strokesCount: "Kresek: {{count}}",
      inWords: "Występuje w słowach",
      strokeOrder: "Kolejność kresek",
      rulesTitle: "Zasady pisania",
      rule1: "Z góry na dół i od lewej do prawej.",
      rule2: "Kreski poziome przed pionowymi (十).",
      rule3: "Najpierw w lewo w dół, potem w prawo w dół (人).",
      rule4: "Ramkę zamyka się na końcu (日).",
      result: { 1: "Niezła próba. Spróbuj jeszcze raz!", 2: "Dobrze!", 3: "Idealnie!" },
      mistakesTotal: "Błędów: {{count}}",
    },
  },
  en: {
    nav: { writing: "Writing", writingSub: "Characters and strokes", readiness: "Readiness {{percent}}%" },
    flow: { skill: { writing: "Writing characters" } },
    reading: {
      bannerKicker: "Your level: HSK {{level}}",
      bannerSubtitle: "Stories unlocked: {{open}} of {{total}}. More open as you progress through the lessons.",
      locked: "Unlocks at HSK {{level}}",
      readAgain: "Read again",
      backToList: "Back to stories",
      hoverHint: "Hover over a character to see pinyin and the translation",
      noTranslation: "No translation yet",
      playAll: "Play the text",
      markRead: "Mark as read",
      readDone: "Read",
    },
    writing: {
      kicker: "Calligraphy",
      subtitle: "Watch the stroke order, then write the character with your mouse or finger. The app checks every stroke.",
      fromLesson: "From the lesson",
      learned: "Learned",
      customPlaceholder: "Any character",
      go: "Open",
      mode: { watch: "Watch", trace: "Trace", free: "No hints" },
      unsupported: "There is no stroke data for this character",
      loading: "Loading…",
      progress: "Strokes written: {{done}} of {{total}}",
      mistakes: "mistakes: {{count}}",
      watchHint: "Memorize the stroke order, then press “Try it myself”",
      restart: "Restart",
      tryYourself: "Try it myself",
      nextChar: "Next",
      strokesCount: "Strokes: {{count}}",
      inWords: "Appears in words",
      strokeOrder: "Stroke order",
      rulesTitle: "Writing rules",
      rule1: "Top to bottom and left to right.",
      rule2: "Horizontal strokes before vertical ones (十).",
      rule3: "Falling left before falling right (人).",
      rule4: "Close the frame last (日).",
      result: { 1: "Good try. Give it another go!", 2: "Well done!", 3: "Perfect!" },
      mistakesTotal: "Mistakes: {{count}}",
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
}