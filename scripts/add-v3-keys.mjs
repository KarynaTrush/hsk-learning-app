import fs from "fs";

const DIR = "src/i18n/locales";

const patches = {
  ru: {
    home: {
      greeting: "Добрый день, {{name}} · {{date}}",
      greetingNoName: "Добрый день · {{date}}",
      subtitle: "Рекомендация, повторения и задачи на сегодня",
      tagDue: "На повторение: {{count}}",
      tagLevel: "HSK {{level}}",
      lessonInfo: "Слов: {{words}} · около {{minutes}} мин",
      progressWords: "{{done}} из {{words}} слов",
      moreWords: "ещё {{count}} слов",
      cardsCount: "{{count}} карт",
      noErrors: "Ошибок пока нет. Так держать!",
      reason: {
        start: "Начните с первого урока: он объяснит, как устроен китайский язык.",
        next: "Следующий шаг на вашем пути: урок «{{lesson}}».",
        due: "Слов на повторение: {{count}}. Повторите их, а затем продолжайте урок «{{lesson}}».",
        weak: "Меньше всего верных ответов в навыке «{{skill}}» ({{percent}}%). В уроке «{{lesson}}» таких заданий будет больше.",
      },
    },
    toneLab: {
      kicker: "Произношение",
      subtitle: "Послушайте образец и повторите. Приложение покажет мелодию вашего голоса.",
      target: "Целевой слог",
      hear: "Прослушать образец",
      example: "Пример",
      press: "Нажмите и говорите",
      recording: "Идёт запись. Нажмите, чтобы закончить",
      vizTitle: "Мелодия вашего голоса",
      vizSub: "Ваш голос (тёмная линия) и образец (цветная линия)",
      high: "Высоко",
      low: "Низко",
      legendTarget: "Образец ({{tone}})",
      legendOthers: "Другие тоны",
      legendYou: "Ваш голос",
      score: "{{score}}% совпадения",
      live: "ЗАПИСЬ",
      good: "Отлично! Тон распознан верно.",
      goodDesc: "Мелодия совпала с образцом ({{tone}}) на {{score}}%.",
      almost: "Почти! Нужны небольшие поправки.",
      soundsLike: "Звучит скорее как {{tone}}.",
      accuracy: "Точность по тонам",
      tone: {
        1: { name: "I тон", desc: "ровный высокий", example: "māma (мама)" },
        2: { name: "II тон", desc: "восходящий", example: "máfan (хлопоты)" },
        3: { name: "III тон", desc: "нисходяще-восходящий", example: "mǎ (лошадь)" },
        4: { name: "IV тон", desc: "нисходящий", example: "mà (ругать)" },
      },
      hint: {
        1: "Держите голос ровно и высоко весь слог.",
        2: "Начните ниже и плавно поднимите тон.",
        3: "Сначала опустите голос, затем поднимите.",
        4: "Начните высоко и резко опустите тон.",
      },
      errors: {
        micDenied: "Нет доступа к микрофону. Разрешите его в настройках браузера.",
        micUnsupported: "Ваш браузер не поддерживает запись голоса.",
        noVoice: "Голос не слышен. Говорите громче и ближе к микрофону.",
      },
    },
    grammar: {
      kicker: "Справочник",
      title: "База грамматики",
      subtitle: "Все темы по уровням HSK: только объяснения и примеры, без упражнений",
      back: "К профилю",
      empty: "Темы этого уровня скоро появятся",
      pattern: "Модель",
    },
  },
  pl: {
    home: {
      greeting: "Dzień dobry, {{name}} · {{date}}",
      greetingNoName: "Dzień dobry · {{date}}",
      subtitle: "Rekomendacja, powtórki i zadania na dziś",
      tagDue: "Do powtórki: {{count}}",
      tagLevel: "HSK {{level}}",
      lessonInfo: "Słów: {{words}} · około {{minutes}} min",
      progressWords: "{{done}} z {{words}} słów",
      moreWords: "jeszcze {{count}} słów",
      cardsCount: "{{count}} kart",
      noErrors: "Na razie bez błędów. Tak trzymaj!",
      reason: {
        start: "Zacznij od pierwszej lekcji: wyjaśni, jak zbudowany jest język chiński.",
        next: "Następny krok na twojej ścieżce: lekcja «{{lesson}}».",
        due: "Słów do powtórki: {{count}}. Powtórz je, a potem kontynuuj lekcję «{{lesson}}».",
        weak: "Najmniej poprawnych odpowiedzi masz w umiejętności «{{skill}}» ({{percent}}%). W lekcji «{{lesson}}» będzie więcej takich zadań.",
      },
    },
    toneLab: {
      kicker: "Wymowa",
      subtitle: "Posłuchaj wzorca i powtórz. Aplikacja pokaże melodię twojego głosu.",
      target: "Docelowa sylaba",
      hear: "Odsłuchaj wzorzec",
      example: "Przykład",
      press: "Naciśnij i mów",
      recording: "Trwa nagrywanie. Naciśnij, aby zakończyć",
      vizTitle: "Melodia twojego głosu",
      vizSub: "Twój głos (ciemna linia) i wzorzec (kolorowa linia)",
      high: "Wysoko",
      low: "Nisko",
      legendTarget: "Wzorzec ({{tone}})",
      legendOthers: "Inne tony",
      legendYou: "Twój głos",
      score: "{{score}}% zgodności",
      live: "NAGRYWANIE",
      good: "Doskonale! Ton rozpoznany poprawnie.",
      goodDesc: "Melodia zgadza się ze wzorcem ({{tone}}) w {{score}}%.",
      almost: "Prawie! Potrzebne drobne korekty.",
      soundsLike: "Brzmi raczej jak {{tone}}.",
      accuracy: "Trafność tonów",
      tone: {
        1: { name: "I ton", desc: "płaski wysoki", example: "māma (mama)" },
        2: { name: "II ton", desc: "wznoszący", example: "máfan (kłopot)" },
        3: { name: "III ton", desc: "opadająco-wznoszący", example: "mǎ (koń)" },
        4: { name: "IV ton", desc: "opadający", example: "mà (besztać)" },
      },
      hint: {
        1: "Utrzymaj głos na stałym, wysokim poziomie przez całą sylabę.",
        2: "Zacznij niżej i wyraźnie wznieś ton.",
        3: "Najpierw opuść głos, a potem go wznieś.",
        4: "Zacznij wysoko i zdecydowanie opadnij.",
      },
      errors: {
        micDenied: "Brak dostępu do mikrofonu. Zezwól na niego w ustawieniach przeglądarki.",
        micUnsupported: "Twoja przeglądarka nie obsługuje nagrywania głosu.",
        noVoice: "Nie słychać głosu. Mów głośniej i bliżej mikrofonu.",
      },
    },
    grammar: {
      kicker: "Przewodnik",
      title: "Baza gramatyki",
      subtitle: "Wszystkie tematy według poziomów HSK: tylko wyjaśnienia i przykłady, bez ćwiczeń",
      back: "Do profilu",
      empty: "Tematy tego poziomu pojawią się wkrótce",
      pattern: "Wzór",
    },
  },
  en: {
    home: {
      greeting: "Good day, {{name}} · {{date}}",
      greetingNoName: "Good day · {{date}}",
      subtitle: "Recommendation, reviews and today's tasks",
      tagDue: "To review: {{count}}",
      tagLevel: "HSK {{level}}",
      lessonInfo: "Words: {{words}} · about {{minutes}} min",
      progressWords: "{{done}} of {{words}} words",
      moreWords: "{{count}} more words",
      cardsCount: "{{count}} cards",
      noErrors: "No mistakes yet. Keep it up!",
      reason: {
        start: "Start with the first lesson: it explains how Chinese works.",
        next: "The next step on your path: the lesson “{{lesson}}”.",
        due: "Words to review: {{count}}. Review them, then continue the lesson “{{lesson}}”.",
        weak: "Your lowest accuracy is in “{{skill}}” ({{percent}}%). The lesson “{{lesson}}” will include more of these tasks.",
      },
    },
    toneLab: {
      kicker: "Pronunciation",
      subtitle: "Listen to the model and repeat. The app shows the melody of your voice.",
      target: "Target syllable",
      hear: "Play the model",
      example: "Example",
      press: "Press and speak",
      recording: "Recording. Press to finish",
      vizTitle: "The melody of your voice",
      vizSub: "Your voice (dark line) and the model (colored line)",
      high: "High",
      low: "Low",
      legendTarget: "Model ({{tone}})",
      legendOthers: "Other tones",
      legendYou: "Your voice",
      score: "{{score}}% match",
      live: "RECORDING",
      good: "Excellent! The tone was recognized correctly.",
      goodDesc: "Your melody matches the model ({{tone}}) by {{score}}%.",
      almost: "Almost! A few small corrections are needed.",
      soundsLike: "It sounds more like {{tone}}.",
      accuracy: "Tone accuracy",
      tone: {
        1: { name: "Tone 1", desc: "high and flat", example: "māma (mom)" },
        2: { name: "Tone 2", desc: "rising", example: "máfan (trouble)" },
        3: { name: "Tone 3", desc: "falling then rising", example: "mǎ (horse)" },
        4: { name: "Tone 4", desc: "falling", example: "mà (to scold)" },
      },
      hint: {
        1: "Keep your voice high and steady through the whole syllable.",
        2: "Start lower and rise clearly.",
        3: "First drop your voice, then raise it.",
        4: "Start high and fall sharply.",
      },
      errors: {
        micDenied: "No access to the microphone. Allow it in your browser settings.",
        micUnsupported: "Your browser does not support voice recording.",
        noVoice: "No voice detected. Speak louder and closer to the microphone.",
      },
    },
    grammar: {
      kicker: "Reference",
      title: "Grammar base",
      subtitle: "All topics by HSK level: explanations and examples only, no exercises",
      back: "Back to profile",
      empty: "Topics for this level are coming soon",
      pattern: "Pattern",
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