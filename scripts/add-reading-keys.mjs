//node scripts/add-reading-keys.mjs
import fs from "fs";

const DIR = "src/i18n/locales";

const patches = {
  ru: {
    reading: {
      chengyuOfDay: "ЧЭНЪЮ ДНЯ",
      readNow: "Читать",
      min: "{{count}} мин",
      interactive: "ИНТЕРАКТИВНОЕ ЧТЕНИЕ",
      pinyin: "Пиньинь",
      play: "Прослушать запись ({{speed}}x)",
      stop: "Остановить",
      lessonVocab: "СЛОВАРЬ УРОКА",
      notes: "КУЛЬТУРНЫЕ ЗАМЕТКИ",
      empty: "Нет текстов по этому фильтру",
      topic: { legends: "Легенды", etiquette: "Этикет", modern: "Современный Китай" },
      notesItems: {
        tea: { title: "Чайная церемония", text: "Гунфу-ча — чайная церемония — это искусство, требующее точности, терпения и уважения к процессу." },
        table: { title: "Этикет за столом", text: "Никогда не втыкай палочки вертикально в рис — это символ смерти. Передавай еду двумя руками." },
        colors: { title: "Символика цветов", text: "Красный (红 hóng) — цвет счастья и благополучия. Белый цвет связан с трауром." },
      },
    },
  },
  pl: {
    reading: {
      chengyuOfDay: "CHENGYU DNIA",
      readNow: "Czytaj teraz",
      min: "{{count}} min",
      interactive: "CZYTANIE INTERAKTYWNE",
      pinyin: "Pinyin",
      play: "Odtwórz nagranie ({{speed}}x)",
      stop: "Zatrzymaj",
      lessonVocab: "SŁOWNIK LEKCJI",
      notes: "NOTATKI KULTUROWE",
      empty: "Brak tekstów dla tego filtra",
      topic: { legends: "Legendy", etiquette: "Etykieta", modern: "Współczesne Chiny" },
      notesItems: {
        tea: { title: "Ceremonia herbaty", text: "Gongfu Cha — ceremonia parzenia herbaty — to sztuka wymagająca precyzji, cierpliwości i szacunku dla procesu." },
        table: { title: "Etykieta przy stole", text: "Nigdy nie wbijaj pałeczek pionowo w ryż — symbolizuje to śmierć. Przekazuj jedzenie obiema rękami." },
        colors: { title: "Symbolika kolorów", text: "Czerwień (红 hóng) to kolor szczęścia i pomyślności. Biały kolor jest kojarzony z żałobą." },
      },
    },
  },
  en: {
    reading: {
      chengyuOfDay: "CHENGYU OF THE DAY",
      readNow: "Read now",
      min: "{{count}} min",
      interactive: "INTERACTIVE READING",
      pinyin: "Pinyin",
      play: "Play recording ({{speed}}x)",
      stop: "Stop",
      lessonVocab: "LESSON VOCABULARY",
      notes: "CULTURAL NOTES",
      empty: "No texts match this filter",
      topic: { legends: "Legends", etiquette: "Etiquette", modern: "Modern China" },
      notesItems: {
        tea: { title: "Tea ceremony", text: "Gongfu Cha, the tea ceremony, is an art that calls for precision, patience and respect for the process." },
        table: { title: "Table etiquette", text: "Never stick chopsticks upright in rice, as it symbolizes death. Pass food with both hands." },
        colors: { title: "Color symbolism", text: "Red (红 hóng) is the color of luck and prosperity. White is associated with mourning." },
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