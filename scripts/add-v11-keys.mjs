import fs from "fs";

const DIR = "src/i18n/locales";

const patches = {
  ru: {
    pt: {
      retake: {
        title: "Проверка уровня",
        subtitle: "Пройдите тест заново, чтобы узнать, насколько вы продвинулись",
        cardTitle: "Уровень",
        cardLast: "Последний тест: HSK {{level}} · {{date}}",
        cardNone: "Вы ещё не проходили тест уровня.",
        cardHint: "Тест можно пройти в любой момент. Прогресс не потеряется: результат применяется только если он выше вашего текущего места на карте.",
        cardBtn: "Проверить свой уровень",
        ahead: "Результат выше вашего текущего места на карте. Можно перейти на уровень HSK {{level}}: пройденные уроки сохранятся.",
        apply: "Перейти на HSK {{level}}",
        keep: "Оставить как есть",
        same: "Ваш текущий прогресс уже не ниже результата теста. Менять ничего не нужно.",
        done: "Готово",
      },
    },
  },
  pl: {
    pt: {
      retake: {
        title: "Sprawdzenie poziomu",
        subtitle: "Zrób test jeszcze raz, aby zobaczyć, jak daleko zaszedłeś(-aś)",
        cardTitle: "Poziom",
        cardLast: "Ostatni test: HSK {{level}} · {{date}}",
        cardNone: "Nie robiłeś(-aś) jeszcze testu poziomu.",
        cardHint: "Test można zrobić w każdej chwili. Postęp nie zginie: wynik zostanie zastosowany tylko wtedy, gdy jest wyższy niż twoje obecne miejsce na mapie.",
        cardBtn: "Sprawdź swój poziom",
        ahead: "Wynik jest wyższy niż twoje obecne miejsce na mapie. Możesz przejść na poziom HSK {{level}}: ukończone lekcje zostaną zachowane.",
        apply: "Przejdź na HSK {{level}}",
        keep: "Zostaw bez zmian",
        same: "Twój obecny postęp nie jest niższy niż wynik testu. Nic nie trzeba zmieniać.",
        done: "Gotowe",
      },
    },
  },
  en: {
    pt: {
      retake: {
        title: "Level check",
        subtitle: "Take the test again to see how far you have come",
        cardTitle: "Level",
        cardLast: "Last test: HSK {{level}} · {{date}}",
        cardNone: "You have not taken the level test yet.",
        cardHint: "You can take the test at any time. Your progress is safe: the result is applied only if it is higher than your current place on the map.",
        cardBtn: "Check your level",
        ahead: "The result is higher than your current place on the map. You can move to HSK level {{level}}: completed lessons are kept.",
        apply: "Move to HSK {{level}}",
        keep: "Keep as it is",
        same: "Your current progress is already at or above the test result. Nothing needs to change.",
        done: "Done",
      },
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