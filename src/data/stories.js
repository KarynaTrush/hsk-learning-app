export const STORIES = [];

export function setStories(list) {
  STORIES.length = 0;
  STORIES.push(...list);
}
export const REQUIRED_OVERRIDES = {
  s1: ["你好", "我", "老师", "你", "今天", "天气", "学校"],
  s2: ["我", "家人", "妈妈", "明天", "家", "吃"],
  s3: ["饺子", "米饭", "面条", "茶", "水果"],
  s4: ["商店", "买", "苹果", "便宜"],
};

export const CHENGYU = [
  {
    zh: "一石二鸟", py: "yī shí èr niǎo",
    literal: { ru: "Одним камнем — две птицы", pl: "Jednym kamieniem — dwa ptaki", en: "One stone, two birds" },
    meaning: { ru: "Достичь двух целей одним действием.", pl: "Osiągnąć dwa cele jednym działaniem.", en: "Achieve two goals with one action." },
  },
  {
    zh: "画蛇添足", py: "huà shé tiān zú",
    literal: { ru: "Нарисовать змею и добавить ей ноги", pl: "Narysować węża i dorysować mu nogi", en: "Draw a snake and add feet" },
    meaning: { ru: "Испортить дело лишним усилием.", pl: "Zepsuć coś zbędnym dodatkiem.", en: "Spoil something by overdoing it." },
  },
  {
    zh: "守株待兔", py: "shǒu zhū dài tù",
    literal: { ru: "Сидеть у пня и ждать зайца", pl: "Siedzieć przy pniu i czekać na zająca", en: "Wait by a stump for a hare" },
    meaning: { ru: "Полагаться на удачу вместо усилий.", pl: "Liczyć na szczęście zamiast działać.", en: "Rely on luck instead of effort." },
  },
  {
    zh: "入乡随俗", py: "rù xiāng suí sú",
    literal: { ru: "Войдя в деревню, следуй её обычаям", pl: "Wchodząc do wioski, stosuj się do jej zwyczajów", en: "Follow local customs when you enter a village" },
    meaning: { ru: "Уважать обычаи места, где находишься.", pl: "Szanować zwyczaje miejsca, w którym się jest.", en: "Respect the customs of where you are." },
  },
];