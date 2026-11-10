export const PHRASES = [
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
    zh: "学如逆水行舟，不进则退。", py: "xué rú nì shuǐ xíng zhōu, bù jìn zé tuì.",
    literal: { ru: "Учёба как плавание против течения: не идёшь вперёд — откатываешься назад", pl: "Nauka jest jak płynięcie pod prąd: kto nie płynie naprzód, cofa się", en: "Learning is like rowing against the current: if you don't advance, you drift back" },
    meaning: { ru: "Без постоянных усилий начинаешь отставать.", pl: "Bez stałego wysiłku zaczynasz zostawać w tyle.", en: "Without steady effort you fall behind." },
  },
  {
    zh: "守株待兔", py: "shǒu zhū dài tù",
    literal: { ru: "Сидеть у пня и ждать зайца", pl: "Siedzieć przy pniu i czekać na zająca", en: "Wait by a stump for a hare" },
    meaning: { ru: "Полагаться на удачу вместо усилий.", pl: "Liczyć na szczęście zamiast działać.", en: "Rely on luck instead of effort." },
  },
  {
    zh: "千里之行，始于足下。", py: "qiān lǐ zhī xíng, shǐ yú zú xià.",
    literal: { ru: "Путь в тысячу ли начинается под ногами", pl: "Podróż tysiąca li zaczyna się pod stopami", en: "A journey of a thousand li begins beneath your feet" },
    meaning: { ru: "Любое большое дело начинается с первого шага.", pl: "Każde wielkie dzieło zaczyna się od pierwszego kroku.", en: "Every big undertaking starts with a first step." },
  },
  {
    zh: "入乡随俗", py: "rù xiāng suí sú",
    literal: { ru: "Войдя в деревню, следуй её обычаям", pl: "Wchodząc do wioski, stosuj się do jej zwyczajów", en: "Follow local customs when you enter a village" },
    meaning: { ru: "Уважать обычаи места, где находишься.", pl: "Szanować zwyczaje miejsca, w którym się jest.", en: "Respect the customs of where you are." },
  },
];

export function phraseOfDay(now = new Date()) {
  return PHRASES[Math.floor(now.getTime() / 86400000) % PHRASES.length];
}