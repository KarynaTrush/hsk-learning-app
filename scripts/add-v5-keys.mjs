import fs from "fs";

const DIR = "src/i18n/locales";

const ACH = {
  ru: {
    firstLesson: ["Первый шаг", "Пройдите первый урок"],
    lessons5: ["Пять уроков", "Пройдите 5 уроков"],
    lessons15: ["Уверенный путь", "Пройдите 15 уроков"],
    words50: ["Словарный запас", "Выучите 50 слов"],
    words150: ["Первая сотня", "Выучите 150 слов"],
    words500: ["Знаток слов", "Выучите 500 слов"],
    streak3: ["Три дня подряд", "Занимайтесь 3 дня подряд"],
    streak7: ["Неделя без пропусков", "Занимайтесь 7 дней подряд"],
    streak30: ["Месяц упорства", "Занимайтесь 30 дней подряд"],
    tones10: ["Поющий голос", "Сделайте 10 попыток в тонах"],
    toneMaster: ["Мастер тонов", "Все четыре тона в среднем от 80%"],
    writer5: ["Каллиграф", "Напишите 5 иероглифов минимум на 2 звезды"],
    writer20: ["Мастер кисти", "Напишите 20 иероглифов минимум на 2 звезды"],
    reader3: ["Читатель", "Прочитайте 3 истории"],
    reader10: ["Книжный червь", "Прочитайте 10 историй"],
    grammar20: ["Грамматист", "Дайте 20 верных ответов в грамматике"],
    sharp: ["Меткий ученик", "Точность 90% после 50 ответов"],
  },
  pl: {
    firstLesson: ["Pierwszy krok", "Ukończ pierwszą lekcję"],
    lessons5: ["Pięć lekcji", "Ukończ 5 lekcji"],
    lessons15: ["Pewna droga", "Ukończ 15 lekcji"],
    words50: ["Zasób słów", "Poznaj 50 słów"],
    words150: ["Pierwsza setka", "Poznaj 150 słów"],
    words500: ["Znawca słów", "Poznaj 500 słów"],
    streak3: ["Trzy dni z rzędu", "Ucz się 3 dni z rzędu"],
    streak7: ["Tydzień bez przerw", "Ucz się 7 dni z rzędu"],
    streak30: ["Miesiąc wytrwałości", "Ucz się 30 dni z rzędu"],
    tones10: ["Śpiewający głos", "Wykonaj 10 prób w tonach"],
    toneMaster: ["Mistrz tonów", "Wszystkie cztery tony ze średnią od 80%"],
    writer5: ["Kaligraf", "Napisz 5 znaków na co najmniej 2 gwiazdki"],
    writer20: ["Mistrz pędzla", "Napisz 20 znaków na co najmniej 2 gwiazdki"],
    reader3: ["Czytelnik", "Przeczytaj 3 historie"],
    reader10: ["Mól książkowy", "Przeczytaj 10 historii"],
    grammar20: ["Gramatyk", "Udziel 20 poprawnych odpowiedzi z gramatyki"],
    sharp: ["Celny uczeń", "Trafność 90% po 50 odpowiedziach"],
  },
  en: {
    firstLesson: ["First step", "Complete your first lesson"],
    lessons5: ["Five lessons", "Complete 5 lessons"],
    lessons15: ["A steady path", "Complete 15 lessons"],
    words50: ["Word bank", "Learn 50 words"],
    words150: ["The first hundred", "Learn 150 words"],
    words500: ["Word expert", "Learn 500 words"],
    streak3: ["Three days in a row", "Study 3 days in a row"],
    streak7: ["A week without breaks", "Study 7 days in a row"],
    streak30: ["A month of persistence", "Study 30 days in a row"],
    tones10: ["Singing voice", "Make 10 tone attempts"],
    toneMaster: ["Tone master", "All four tones averaging 80% or more"],
    writer5: ["Calligrapher", "Write 5 characters with at least 2 stars"],
    writer20: ["Master of the brush", "Write 20 characters with at least 2 stars"],
    reader3: ["Reader", "Read 3 stories"],
    reader10: ["Bookworm", "Read 10 stories"],
    grammar20: ["Grammarian", "Give 20 correct grammar answers"],
    sharp: ["Sharp learner", "90% accuracy after 50 answers"],
  },
};

const achievements = (lang) =>
  Object.fromEntries(Object.entries(ACH[lang]).map(([id, [title, desc]]) => [id, { title, desc }]));

const patches = {
  ru: {
    back: { to: "Назад: {{name}}" },
    nav: { goal: "Цель", goalPercent: "{{percent}}% пути" },
    reading: {
      readNow: "Читать", min: "{{count}} мин", pinyin: "Пиньинь", lessonVocab: "СЛОВА ИСТОРИИ", notes: "КУЛЬТУРНЫЕ ЗАМЕТКИ",
      empty: "Нет историй по этому фильтру",
      topic: { legends: "Легенды", etiquette: "Этикет", modern: "Современный Китай" },
      notesItems: {
        tea: { title: "Чайная церемония", text: "Гунфу-ча — чайная церемония — это искусство, требующее точности, терпения и уважения к процессу." },
        table: { title: "Этикет за столом", text: "Никогда не втыкай палочки вертикально в рис — это символ смерти. Передавай еду двумя руками." },
        colors: { title: "Символика цветов", text: "Красный (红 hóng) — цвет счастья и благополучия. Белый цвет связан с трауром." },
      },
    },
    home: {
      heroKicker: "Рекомендовано вам", moreRecs: "Ещё рекомендации", phraseKicker: "Фраза дня",
      cta: { lesson: "К уроку", review: "Повторить", mistakes: "Разобрать ошибки", tones: "Тренировать тоны", writing: "Писать", grammar: "К теме", read: "Читать" },
      pill: { words: "Слов: {{count}}", minutes: "~{{count}} мин", cards: "Карт: {{count}}", strokes: "По чертам" },
      task: { words: "Выучить новых слов: {{count}}", reviews: "Повторить карточек: {{count}}", minutes: "Позаниматься {{count}} мин", tones: "Попыток в тонах: {{count}}", writes: "Написать иероглифов: {{count}}", nothing: "Нечего повторять сегодня" },
      tasks: { title: "Задачи на сегодня", plan: "План дня" },
      plan: { title: "План на сегодня", hint: "Настройте нагрузку под себя: задачи на главной обновятся.", newWords: "Новых слов", reviews: "Повторений", minutes: "Минут занятий", tones: "Попыток в тонах", writes: "Иероглифов", save: "Сохранить", cancel: "Отмена" },
      activity: { title: "Активность", week: "За неделю: {{count}} мин", minutes: "{{count}} мин", less: "Меньше", more: "Больше" },
    },
    recommend: {
      title: { review: "Повторение слов", mistakes: "Работа над ошибками", tones: "Тренировка тонов", writing: "Написать «{{char}}»", grammar: "Грамматика", read: "Чтение" },
      reason: {
        start: "Начните с первого урока: он объяснит, как устроен китайский язык.",
        next: "Следующий шаг на вашем пути: урок «{{lesson}}».",
        weak: "Меньше всего верных ответов в навыке «{{skill}}» ({{percent}}%). В уроке «{{lesson}}» таких заданий будет больше.",
        due: "Слов на повторение: {{count}}. Освежите их, пока они не забылись.",
        mistakes: "В ошибках накопилось слов: {{count}}. Разберите их, чтобы закрепить.",
        tone: "{{tone}} получается хуже всего: в среднем {{percent}}%. Потренируйте его.",
        toneNew: "Вы ещё не пробовали тоны. Начните с самого простого: ровного первого.",
        write: "Иероглиф «{{char}}» вызвал ошибок: {{count}}. Напишите его ещё раз.",
        writeNew: "Попробуйте написать иероглиф «{{char}}» по порядку черт.",
        grammar: "В этой теме верных ответов всего {{percent}}%. Перечитайте теорию и решите мини-упражнения.",
        grammarNew: "Загляните в базу грамматики: короткая теория и упражнения закрепят уроки.",
        read: "Прочитайте историю по вашему уровню: слова из уроков закрепятся в контексте.",
      },
    },
    goals: {
      title: "Цели и награды", subtitle: "Выберите цель, следите за неделей и собирайте награды", unlocked: "награды",
      unlockedOf: "Открыто: {{count}} из {{total}}", examGoal: "Цель на экзамен",
      examHint: "Выберите реалистичную цель: ваш уровень сейчас HSK {{level}}, доступны до двух уровней выше.",
      words: "{{learned}} из {{needed}} слов", eta: "При вашем темпе: примерно {{weeks}} нед.",
      etaUnknown: "Пока мало данных для прогноза", etaDone: "Нужное число слов уже выучено",
      weeklyTitle: "Цели недели", achievements: "Награды",
      weekly: { minutes: "Минут занятий", words: "Новых слов", lessons: "Уроков", tones: "Попыток в тонах", writes: "Написанных иероглифов", reads: "Прочитанных историй" },
      rank: { 0: "Новичок", 1: "Ученик", 2: "Знаток", 3: "Мастер", 4: "Эксперт" },
    },
    achievements: achievements("ru"),
    grammar: { subtitle2: "Выберите тему: теория, примеры и мини-упражнения" },
    grammarPage: {
      backToList: "К списку тем", theory: "Теория", mistake: "Типичная ошибка", examples: "Примеры", practice: "Мини-упражнения",
      practiceText: "Закрепите тему: составьте предложение, вставьте слово и выберите перевод.",
      stats: "Ваши ответы: {{correct}} верных из {{total}}", start: "Начать упражнения", again: "Ещё раз", done: "Упражнения пройдены",
    },
  },
  pl: {
    back: { to: "Wróć: {{name}}" },
    nav: { goal: "Cel", goalPercent: "{{percent}}% drogi" },
    reading: {
      readNow: "Czytaj", min: "{{count}} min", pinyin: "Pinyin", lessonVocab: "SŁOWA Z HISTORII", notes: "NOTATKI KULTUROWE",
      empty: "Brak historii dla tego filtra",
      topic: { legends: "Legendy", etiquette: "Etykieta", modern: "Współczesne Chiny" },
      notesItems: {
        tea: { title: "Ceremonia herbaty", text: "Gongfu Cha — ceremonia parzenia herbaty — to sztuka wymagająca precyzji, cierpliwości i szacunku dla procesu." },
        table: { title: "Etykieta przy stole", text: "Nigdy nie wbijaj pałeczek pionowo w ryż — symbolizuje to śmierć. Przekazuj jedzenie obiema rękami." },
        colors: { title: "Symbolika kolorów", text: "Czerwień (红 hóng) to kolor szczęścia i pomyślności. Biały kolor jest kojarzony z żałobą." },
      },
    },
    home: {
      heroKicker: "Polecane dla ciebie", moreRecs: "Więcej rekomendacji", phraseKicker: "Fraza dnia",
      cta: { lesson: "Do lekcji", review: "Powtórz", mistakes: "Omów błędy", tones: "Ćwicz tony", writing: "Pisz", grammar: "Do tematu", read: "Czytaj" },
      pill: { words: "Słów: {{count}}", minutes: "~{{count}} min", cards: "Kart: {{count}}", strokes: "Po kreskach" },
      task: { words: "Poznaj nowych słów: {{count}}", reviews: "Powtórz kart: {{count}}", minutes: "Ucz się {{count}} min", tones: "Prób w tonach: {{count}}", writes: "Napisz znaków: {{count}}", nothing: "Dziś nie ma czego powtarzać" },
      tasks: { title: "Zadania na dziś", plan: "Plan dnia" },
      plan: { title: "Plan na dziś", hint: "Dostosuj obciążenie do siebie: zadania na stronie głównej się zaktualizują.", newWords: "Nowe słowa", reviews: "Powtórki", minutes: "Minuty nauki", tones: "Próby w tonach", writes: "Znaki", save: "Zapisz", cancel: "Anuluj" },
      activity: { title: "Aktywność", week: "W tym tygodniu: {{count}} min", minutes: "{{count}} min", less: "Mniej", more: "Więcej" },
    },
    recommend: {
      title: { review: "Powtórka słów", mistakes: "Praca nad błędami", tones: "Trening tonów", writing: "Napisz «{{char}}»", grammar: "Gramatyka", read: "Czytanie" },
      reason: {
        start: "Zacznij od pierwszej lekcji: wyjaśni, jak zbudowany jest język chiński.",
        next: "Następny krok na twojej ścieżce: lekcja «{{lesson}}».",
        weak: "Najmniej poprawnych odpowiedzi masz w umiejętności «{{skill}}» ({{percent}}%). W lekcji «{{lesson}}» będzie więcej takich zadań.",
        due: "Słów do powtórki: {{count}}. Odśwież je, zanim je zapomnisz.",
        mistakes: "W błędach zebrało się słów: {{count}}. Omów je, aby utrwalić.",
        tone: "{{tone}} wychodzi ci najgorzej: średnio {{percent}}%. Poćwicz go.",
        toneNew: "Jeszcze nie próbowałeś(-aś) tonów. Zacznij od najprostszego: płaskiego pierwszego.",
        write: "Znak «{{char}}» sprawił błędów: {{count}}. Napisz go jeszcze raz.",
        writeNew: "Spróbuj napisać znak «{{char}}» zgodnie z kolejnością kresek.",
        grammar: "W tym temacie masz tylko {{percent}}% poprawnych odpowiedzi. Przeczytaj teorię i rozwiąż mini-ćwiczenia.",
        grammarNew: "Zajrzyj do bazy gramatyki: krótka teoria i ćwiczenia utrwalą lekcje.",
        read: "Przeczytaj historię na swoim poziomie: słowa z lekcji utrwalą się w kontekście.",
      },
    },
    goals: {
      title: "Cele i nagrody", subtitle: "Wybierz cel, śledź tydzień i zbieraj nagrody", unlocked: "nagrody",
      unlockedOf: "Odblokowano: {{count}} z {{total}}", examGoal: "Cel egzaminacyjny",
      examHint: "Wybierz realistyczny cel: twój poziom to teraz HSK {{level}}, dostępne są do dwóch poziomów wyżej.",
      words: "{{learned}} z {{needed}} słów", eta: "W twoim tempie: około {{weeks}} tyg.",
      etaUnknown: "Na razie za mało danych do prognozy", etaDone: "Potrzebna liczba słów jest już poznana",
      weeklyTitle: "Cele tygodnia", achievements: "Nagrody",
      weekly: { minutes: "Minuty nauki", words: "Nowe słowa", lessons: "Lekcje", tones: "Próby w tonach", writes: "Napisane znaki", reads: "Przeczytane historie" },
      rank: { 0: "Nowicjusz", 1: "Uczeń", 2: "Znawca", 3: "Mistrz", 4: "Ekspert" },
    },
    achievements: achievements("pl"),
    grammar: { subtitle2: "Wybierz temat: teoria, przykłady i mini-ćwiczenia" },
    grammarPage: {
      backToList: "Do listy tematów", theory: "Teoria", mistake: "Typowy błąd", examples: "Przykłady", practice: "Mini-ćwiczenia",
      practiceText: "Utrwal temat: ułóż zdanie, uzupełnij słowo i wybierz tłumaczenie.",
      stats: "Twoje odpowiedzi: {{correct}} poprawnych z {{total}}", start: "Zacznij ćwiczenia", again: "Jeszcze raz", done: "Ćwiczenia ukończone",
    },
  },
  en: {
    back: { to: "Back: {{name}}" },
    nav: { goal: "Goal", goalPercent: "{{percent}}% of the way" },
    reading: {
      readNow: "Read", min: "{{count}} min", pinyin: "Pinyin", lessonVocab: "STORY WORDS", notes: "CULTURAL NOTES",
      empty: "No stories match this filter",
      topic: { legends: "Legends", etiquette: "Etiquette", modern: "Modern China" },
      notesItems: {
        tea: { title: "Tea ceremony", text: "Gongfu Cha, the tea ceremony, is an art that calls for precision, patience and respect for the process." },
        table: { title: "Table etiquette", text: "Never stick chopsticks upright in rice, as it symbolizes death. Pass food with both hands." },
        colors: { title: "Color symbolism", text: "Red (红 hóng) is the color of luck and prosperity. White is associated with mourning." },
      },
    },
    home: {
      heroKicker: "Recommended for you", moreRecs: "More recommendations", phraseKicker: "Phrase of the day",
      cta: { lesson: "Go to the lesson", review: "Review", mistakes: "Work on mistakes", tones: "Practice tones", writing: "Write", grammar: "Open the topic", read: "Read" },
      pill: { words: "Words: {{count}}", minutes: "~{{count}} min", cards: "Cards: {{count}}", strokes: "Stroke by stroke" },
      task: { words: "Learn new words: {{count}}", reviews: "Review cards: {{count}}", minutes: "Study for {{count}} min", tones: "Tone attempts: {{count}}", writes: "Write characters: {{count}}", nothing: "Nothing to review today" },
      tasks: { title: "Today's tasks", plan: "Daily plan" },
      plan: { title: "Today's plan", hint: "Adjust the workload to suit you: the tasks on the home page will update.", newWords: "New words", reviews: "Reviews", minutes: "Study minutes", tones: "Tone attempts", writes: "Characters", save: "Save", cancel: "Cancel" },
      activity: { title: "Activity", week: "This week: {{count}} min", minutes: "{{count}} min", less: "Less", more: "More" },
    },
    recommend: {
      title: { review: "Word review", mistakes: "Work on mistakes", tones: "Tone training", writing: "Write “{{char}}”", grammar: "Grammar", read: "Reading" },
      reason: {
        start: "Start with the first lesson: it explains how Chinese works.",
        next: "The next step on your path: the lesson “{{lesson}}”.",
        weak: "Your lowest accuracy is in “{{skill}}” ({{percent}}%). The lesson “{{lesson}}” will include more of these tasks.",
        due: "Words to review: {{count}}. Refresh them before you forget.",
        mistakes: "Words piled up in your mistakes: {{count}}. Go through them to lock them in.",
        tone: "{{tone}} is your weakest: {{percent}}% on average. Practice it.",
        toneNew: "You have not tried tones yet. Start with the easiest: the flat first tone.",
        write: "The character “{{char}}” caused {{count}} mistakes. Write it once more.",
        writeNew: "Try writing the character “{{char}}” stroke by stroke.",
        grammar: "You have only {{percent}}% correct on this topic. Reread the theory and do the mini-exercises.",
        grammarNew: "Take a look at the grammar base: short theory and exercises will reinforce your lessons.",
        read: "Read a story at your level: words from the lessons will stick in context.",
      },
    },
    goals: {
      title: "Goals and rewards", subtitle: "Pick a goal, track your week and collect rewards", unlocked: "rewards",
      unlockedOf: "Unlocked: {{count}} of {{total}}", examGoal: "Exam goal",
      examHint: "Choose a realistic goal: your level is now HSK {{level}}, up to two levels higher are available.",
      words: "{{learned}} of {{needed}} words", eta: "At your pace: about {{weeks}} wk.",
      etaUnknown: "Not enough data for a forecast yet", etaDone: "You already know the required number of words",
      weeklyTitle: "Weekly goals", achievements: "Rewards",
      weekly: { minutes: "Study minutes", words: "New words", lessons: "Lessons", tones: "Tone attempts", writes: "Characters written", reads: "Stories read" },
      rank: { 0: "Beginner", 1: "Student", 2: "Connoisseur", 3: "Master", 4: "Expert" },
    },
    achievements: achievements("en"),
    grammar: { subtitle2: "Pick a topic: theory, examples and mini-exercises" },
    grammarPage: {
      backToList: "Back to topics", theory: "Theory", mistake: "Typical mistake", examples: "Examples", practice: "Mini-exercises",
      practiceText: "Reinforce the topic: build a sentence, fill in a word and choose the translation.",
      stats: "Your answers: {{correct}} correct out of {{total}}", start: "Start the exercises", again: "Once more", done: "Exercises complete",
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