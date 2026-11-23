import fs from "fs";

const DIR = "src/i18n/locales";

const patches = {
  ru: {
    char: {
      kicker: "Карточка слова",
      noData: "Этого слова нет в словаре.",
      meaning: "Значение",
      listen: "Слушать",
      listenSlow: "Медленно",
      strokesTitle: "Порядок черт",
      noStrokes: "Для этого иероглифа нет данных о чертах.",
      replay: "Показать ещё раз",
      practiceWrite: "Потренировать письмо",
      examplesTitle: "Примеры из историй",
      noExamples: "Примеров пока нет: слово появится в историях позже.",
      openStory: "Открыть историю",
      progressTitle: "Ваш прогресс",
      inReviews: "Слово в повторениях",
      notInReviews: "Ещё не в повторениях",
      mistakes: "Ошибок в слове: {{count}}",
      noMistakes: "Ошибок в этом слове нет",
      writeMistakes: "Ошибок при письме: {{count}}",
      practiceBtn: "Потренировать слово",
      lessonTitle: "Где изучать",
      noLesson: "Это слово пока не входит в уроки карты знаний.",
      relatedTitle: "Слова с этим иероглифом",
    },
  },
  pl: {
    char: {
      kicker: "Karta słowa",
      noData: "Tego słowa nie ma w słowniku.",
      meaning: "Znaczenie",
      listen: "Posłuchaj",
      listenSlow: "Wolno",
      strokesTitle: "Kolejność kresek",
      noStrokes: "Dla tego znaku nie ma danych o kreskach.",
      replay: "Pokaż jeszcze raz",
      practiceWrite: "Poćwicz pisanie",
      examplesTitle: "Przykłady z historii",
      noExamples: "Na razie brak przykładów: słowo pojawi się w historiach później.",
      openStory: "Otwórz historię",
      progressTitle: "Twój postęp",
      inReviews: "Słowo jest w powtórkach",
      notInReviews: "Jeszcze nie w powtórkach",
      mistakes: "Błędów w słowie: {{count}}",
      noMistakes: "W tym słowie nie ma błędów",
      writeMistakes: "Błędów przy pisaniu: {{count}}",
      practiceBtn: "Poćwicz słowo",
      lessonTitle: "Gdzie się uczyć",
      noLesson: "To słowo nie należy jeszcze do lekcji mapy wiedzy.",
      relatedTitle: "Słowa z tym znakiem",
    },
  },
  en: {
    char: {
      kicker: "Word card",
      noData: "This word is not in the dictionary.",
      meaning: "Meaning",
      listen: "Listen",
      listenSlow: "Slowly",
      strokesTitle: "Stroke order",
      noStrokes: "There is no stroke data for this character.",
      replay: "Show again",
      practiceWrite: "Practice writing",
      examplesTitle: "Examples from stories",
      noExamples: "No examples yet: the word will appear in stories later.",
      openStory: "Open the story",
      progressTitle: "Your progress",
      inReviews: "The word is in your reviews",
      notInReviews: "Not in your reviews yet",
      mistakes: "Mistakes in this word: {{count}}",
      noMistakes: "No mistakes in this word",
      writeMistakes: "Writing mistakes: {{count}}",
      practiceBtn: "Practice the word",
      lessonTitle: "Where to learn it",
      noLesson: "This word is not part of the knowledge map lessons yet.",
      relatedTitle: "Words with this character",
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