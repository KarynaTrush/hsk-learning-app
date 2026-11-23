import fs from "fs";

const DIR = "src/i18n/locales";

const patches = {
  ru: {
    pt: {
      title: "Определим ваш уровень",
      subtitle: "Короткий адаптивный тест",
      introText: "Тест из 8–14 вопросов подберёт ваш стартовый уровень. Он подстраивается под ответы: если вы отвечаете уверенно, слова становятся сложнее, а если нет, легче.",
      tip1: "Пиньинь в вопросах не показывается: проверяются реальные знания.",
      tip2: "Если не знаете слово, нажмите «Не знаю». Угадывание ухудшает точность результата.",
      tip3: "Вопросы разные при каждом прохождении: слова выбираются случайно.",
      tip4: "Это займёт около двух минут.",
      start: "Начать тест",
      counter: "Вопрос {{n}}",
      dontKnow: "Не знаю",
      listen: "Прослушать слово",
      q: {
        meaning: "Что означает это слово?",
        hanzi: "Какое слово означает:",
        pinyin: "Как читается это слово?",
        listen: "Прослушайте слово и выберите значение",
      },
      resultKicker: "Результат",
      level: "Уровень HSK {{level}}",
      levelZero: "Начинающий (HSK 0)",
      confidence: "Уверенность оценки: {{percent}}%",
      startAt: "Начнём с уровня HSK {{level}}. Уроки предыдущих уровней останутся доступны для повторения.",
      startBasics: "Начнём с основ (HSK 0): что такое китайский, пиньинь, тоны и иероглифы.",
      how: "Оценка учитывает, на какого уровня словах вы отвечали верно, где ошибались и где отвечали «Не знаю». Столбики показывают вероятность каждого уровня.",
      begin: "Начать обучение",
      noQuestions: "Не удалось подобрать вопросы. Начнём с основ.",
    },
  },
  pl: {
    pt: {
      title: "Sprawdźmy twój poziom",
      subtitle: "Krótki test adaptacyjny",
      introText: "Test z 8–14 pytań dobierze twój poziom startowy. Dostosowuje się do odpowiedzi: gdy odpowiadasz pewnie, słowa robią się trudniejsze, a gdy nie, łatwiejsze.",
      tip1: "Pinyin nie jest pokazywany w pytaniach: sprawdzamy prawdziwą wiedzę.",
      tip2: "Jeśli nie znasz słowa, naciśnij «Nie wiem». Zgadywanie obniża dokładność wyniku.",
      tip3: "Pytania są za każdym razem inne: słowa są losowane.",
      tip4: "To zajmie około dwóch minut.",
      start: "Zacznij test",
      counter: "Pytanie {{n}}",
      dontKnow: "Nie wiem",
      listen: "Odsłuchaj słowo",
      q: {
        meaning: "Co oznacza to słowo?",
        hanzi: "Które słowo oznacza:",
        pinyin: "Jak czyta się to słowo?",
        listen: "Posłuchaj słowa i wybierz znaczenie",
      },
      resultKicker: "Wynik",
      level: "Poziom HSK {{level}}",
      levelZero: "Początkujący (HSK 0)",
      confidence: "Pewność oceny: {{percent}}%",
      startAt: "Zaczniemy od poziomu HSK {{level}}. Lekcje wcześniejszych poziomów pozostaną dostępne do powtórki.",
      startBasics: "Zaczniemy od podstaw (HSK 0): czym jest chiński, pinyin, tony i znaki.",
      how: "Ocena uwzględnia, na jakim poziomie słów odpowiadałeś(-aś) poprawnie, gdzie się myliłeś(-aś) i gdzie wybierałeś(-aś) «Nie wiem». Słupki pokazują prawdopodobieństwo każdego poziomu.",
      begin: "Zacznij naukę",
      noQuestions: "Nie udało się dobrać pytań. Zaczniemy od podstaw.",
    },
  },
  en: {
    pt: {
      title: "Let's find your level",
      subtitle: "A short adaptive test",
      introText: "A test of 8–14 questions will find your starting level. It adapts to your answers: if you answer confidently the words get harder, and if not they get easier.",
      tip1: "Pinyin is not shown in the questions: your real knowledge is tested.",
      tip2: "If you don't know a word, press “I don't know”. Guessing makes the result less accurate.",
      tip3: "The questions are different every time: the words are picked at random.",
      tip4: "It takes about two minutes.",
      start: "Start the test",
      counter: "Question {{n}}",
      dontKnow: "I don't know",
      listen: "Play the word",
      q: {
        meaning: "What does this word mean?",
        hanzi: "Which word means:",
        pinyin: "How is this word read?",
        listen: "Listen to the word and choose the meaning",
      },
      resultKicker: "Result",
      level: "HSK level {{level}}",
      levelZero: "Beginner (HSK 0)",
      confidence: "Confidence of the estimate: {{percent}}%",
      startAt: "We will start at HSK level {{level}}. Lessons of earlier levels stay available for review.",
      startBasics: "We will start with the basics (HSK 0): what Chinese is, pinyin, tones and characters.",
      how: "The estimate considers at which level of words you answered correctly, where you made mistakes and where you answered “I don't know”. The bars show the probability of each level.",
      begin: "Start learning",
      noQuestions: "Could not prepare questions. We will start with the basics.",
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