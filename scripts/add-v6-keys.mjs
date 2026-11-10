import fs from "fs";

const DIR = "src/i18n/locales";

const patches = {
  ru: {
    reviewsPage: {
      kicker: "Интервальные повторения", subtitle: "Освежайте слова в нужный момент, пока они не забылись",
      cardOf: "Карточка {{current}} из {{total}}", show: "Показать", know: "Знаю", dontKnow: "Не знаю",
      queueTitle: "ОЧЕРЕДЬ", sessionTitle: "ИТОГИ СЕССИИ", known: "Знаю", toLearn: "Повторить позже",
      doneTitle: "Сессия завершена", doneText: "Вы повторили карточек: {{count}}.", again: "Ещё раз",
      emptyTitle: "Сегодня нечего повторять", emptyText: "Все слова повторены вовремя. Хотите потренировать самые слабые?",
      noWeak: "Слабых слов пока нет: самое время идти вперёд по урокам.", weakBtn: "Повторить слабые слова ({{count}})", weakMode: "Слабые слова",
    },
    mistakes: {
      kicker: "Анализ ошибок", subtitle: "Слова, иероглифы, тоны и грамматика: всё, где вы ошибались, в одном месте",
      totalErrors: "Ошибок: {{count}}",
      tabs: { words: "Слова", writing: "Письмо", tones: "Тоны", grammar: "Грамматика" },
      byLesson: "ПО УРОКАМ", all: "Все", practice: "Тренировка по ошибкам ({{count}})",
      empty: "Здесь пока нет ошибок. Так держать!", emptyWriting: "Пока нет ошибок в письме.",
      emptyTones: "Вы ещё не тренировали тоны.", emptyGrammar: "Ошибок в грамматике пока нет.",
      lastError: "Последняя ошибка: {{when}}", justNow: "только что", dismiss: "Отметить освоенным",
      writeMistakes: "Ошибок при письме: {{count}}", writeAttempts: "Попыток: {{count}}", write: "Написать",
      toneAvg: "Среднее: {{percent}}%", attempts: "Попыток: {{count}}", weak: "Слабо", train: "Тренировать",
      grammarPercent: "Верно: {{percent}}%", answers: "Ответов: {{count}}", openTopic: "Открыть тему",
    },
  },
  pl: {
    reviewsPage: {
      kicker: "Powtórki interwałowe", subtitle: "Odświeżaj słowa we właściwym momencie, zanim je zapomnisz",
      cardOf: "Fiszka {{current}} z {{total}}", show: "Pokaż", know: "Znam", dontKnow: "Nie znam",
      queueTitle: "KOLEJKA", sessionTitle: "WYNIKI SESJI", known: "Znam", toLearn: "Powtórz później",
      doneTitle: "Sesja zakończona", doneText: "Powtórzone fiszki: {{count}}.", again: "Jeszcze raz",
      emptyTitle: "Dziś nie ma czego powtarzać", emptyText: "Wszystkie słowa są powtórzone na czas. Chcesz poćwiczyć te najsłabsze?",
      noWeak: "Na razie nie ma słabych słów: czas ruszać dalej z lekcjami.", weakBtn: "Powtórz słabe słowa ({{count}})", weakMode: "Słabe słowa",
    },
    mistakes: {
      kicker: "Analiza błędów", subtitle: "Słowa, znaki, tony i gramatyka: wszystko, w czym popełniasz błędy, w jednym miejscu",
      totalErrors: "Błędów: {{count}}",
      tabs: { words: "Słowa", writing: "Pisanie", tones: "Tony", grammar: "Gramatyka" },
      byLesson: "WEDŁUG LEKCJI", all: "Wszystkie", practice: "Trening błędów ({{count}})",
      empty: "Na razie nie ma tu błędów. Tak trzymaj!", emptyWriting: "Na razie brak błędów w pisaniu.",
      emptyTones: "Nie ćwiczyłeś(-aś) jeszcze tonów.", emptyGrammar: "Na razie brak błędów w gramatyce.",
      lastError: "Ostatni błąd: {{when}}", justNow: "przed chwilą", dismiss: "Oznacz jako opanowane",
      writeMistakes: "Błędów przy pisaniu: {{count}}", writeAttempts: "Prób: {{count}}", write: "Napisz",
      toneAvg: "Średnio: {{percent}}%", attempts: "Prób: {{count}}", weak: "Słabo", train: "Ćwicz",
      grammarPercent: "Poprawnie: {{percent}}%", answers: "Odpowiedzi: {{count}}", openTopic: "Otwórz temat",
    },
  },
  en: {
    reviewsPage: {
      kicker: "Spaced repetition", subtitle: "Refresh words at the right moment, before you forget them",
      cardOf: "Card {{current}} of {{total}}", show: "Show", know: "I know", dontKnow: "I don't know",
      queueTitle: "QUEUE", sessionTitle: "SESSION RESULTS", known: "Known", toLearn: "Review later",
      doneTitle: "Session complete", doneText: "Cards reviewed: {{count}}.", again: "Once more",
      emptyTitle: "Nothing to review today", emptyText: "All your words are reviewed on time. Want to practice the weakest ones?",
      noWeak: "No weak words yet: a good time to move forward with the lessons.", weakBtn: "Review weak words ({{count}})", weakMode: "Weak words",
    },
    mistakes: {
      kicker: "Mistake analysis", subtitle: "Words, characters, tones and grammar: everything you got wrong, in one place",
      totalErrors: "Mistakes: {{count}}",
      tabs: { words: "Words", writing: "Writing", tones: "Tones", grammar: "Grammar" },
      byLesson: "BY LESSON", all: "All", practice: "Mistake practice ({{count}})",
      empty: "No mistakes here yet. Keep it up!", emptyWriting: "No writing mistakes yet.",
      emptyTones: "You have not practiced tones yet.", emptyGrammar: "No grammar mistakes yet.",
      lastError: "Last mistake: {{when}}", justNow: "just now", dismiss: "Mark as mastered",
      writeMistakes: "Writing mistakes: {{count}}", writeAttempts: "Attempts: {{count}}", write: "Write",
      toneAvg: "Average: {{percent}}%", attempts: "Attempts: {{count}}", weak: "Weak", train: "Practice",
      grammarPercent: "Correct: {{percent}}%", answers: "Answers: {{count}}", openTopic: "Open the topic",
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