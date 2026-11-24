import fs from "fs";

const DIR = "src/i18n/locales";

const patches = {
  ru: {
    slides: {
      kind: { fact: "Интересный факт", words: "Новые слова", game: "Разминка", theory: "Теория", quiz: "Проверим", text: "Читаем", recall: "Проверка слов" },
      continue: "Продолжить", finishLesson: "Завершить урок", next: "Дальше", finishBlock: "Готово", check: "Проверить",
      correct: "Верно!", wrong: "Не совсем.", answerIs: "Правильный ответ:", true: "Верно", false: "Неверно",
      typeAnswer: "Введите ответ", tapTiles: "Нажимайте на слова по порядку",
      tapWord: "Нажмите на карточку: услышите слово и увидите пример.",
      matchHint: "Соедините пары: нажмите слева, затем справа.",
      whatHeard: "Что вы услышали?", whichWordFits: "Какое слово подходит к картинке?",
      pinyin: "Пиньинь", translation: "Перевод", toQuestions: "К вопросам",
      whatMeans: "Что значит это слово?", whichWord: "Какое слово значит:", isTranslation: "Это верный перевод:",
      recallWords: "Вспомните слова", recallTruth: "Верно или нет?", recallBuild: "Составьте предложение",
    },
  },
  pl: {
    slides: {
      kind: { fact: "Ciekawostka", words: "Nowe słowa", game: "Rozgrzewka", theory: "Teoria", quiz: "Sprawdźmy", text: "Czytamy", recall: "Sprawdzian słów" },
      continue: "Dalej", finishLesson: "Zakończ lekcję", next: "Dalej", finishBlock: "Gotowe", check: "Sprawdź",
      correct: "Dobrze!", wrong: "Niezupełnie.", answerIs: "Poprawna odpowiedź:", true: "Prawda", false: "Fałsz",
      typeAnswer: "Wpisz odpowiedź", tapTiles: "Naciskaj słowa po kolei",
      tapWord: "Naciśnij kartę: usłyszysz słowo i zobaczysz przykład.",
      matchHint: "Połącz pary: naciśnij po lewej, potem po prawej.",
      whatHeard: "Co usłyszałeś(-aś)?", whichWordFits: "Które słowo pasuje do obrazka?",
      pinyin: "Pinyin", translation: "Tłumaczenie", toQuestions: "Do pytań",
      whatMeans: "Co znaczy to słowo?", whichWord: "Które słowo znaczy:", isTranslation: "Czy to poprawne tłumaczenie:",
      recallWords: "Przypomnij słowa", recallTruth: "Prawda czy fałsz?", recallBuild: "Ułóż zdanie",
    },
  },
  en: {
    slides: {
      kind: { fact: "Fun fact", words: "New words", game: "Warm-up", theory: "Theory", quiz: "Let's check", text: "Reading", recall: "Word check" },
      continue: "Continue", finishLesson: "Finish the lesson", next: "Next", finishBlock: "Done", check: "Check",
      correct: "Correct!", wrong: "Not quite.", answerIs: "The correct answer:", true: "True", false: "False",
      typeAnswer: "Type your answer", tapTiles: "Tap the words in order",
      tapWord: "Tap a card to hear the word and see an example.",
      matchHint: "Match the pairs: tap on the left, then on the right.",
      whatHeard: "What did you hear?", whichWordFits: "Which word fits the picture?",
      pinyin: "Pinyin", translation: "Translation", toQuestions: "To the questions",
      whatMeans: "What does this word mean?", whichWord: "Which word means:", isTranslation: "Is this the correct translation:",
      recallWords: "Recall the words", recallTruth: "True or false?", recallBuild: "Build the sentence",
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