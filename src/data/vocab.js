export const VOCAB = [
  { hanzi: "你好", pinyin: "nǐ hǎo", hsk: 1, category: "greetings", nodeId: 1, example: "你好，我是老师。" },
  { hanzi: "谢谢", pinyin: "xièxie", hsk: 1, category: "greetings", nodeId: 1, example: "谢谢你。" },
  { hanzi: "一", pinyin: "yī", hsk: 1, category: "numbers", nodeId: 2, example: "我有一个苹果。" },
  { hanzi: "二", pinyin: "èr", hsk: 1, category: "numbers", nodeId: 2, example: "二加二等于四。" },
  { hanzi: "三", pinyin: "sān", hsk: 1, category: "numbers", nodeId: 2, example: "我学了三天。" },
  { hanzi: "我", pinyin: "wǒ", hsk: 1, category: "people", nodeId: 3, example: "我是学生。" },
  { hanzi: "你", pinyin: "nǐ", hsk: 1, category: "people", nodeId: 3, example: "你叫什么名字？" },
  { hanzi: "他", pinyin: "tā", hsk: 1, category: "people", nodeId: 3, example: "他是老师。" },
  { hanzi: "今天", pinyin: "jīntiān", hsk: 1, category: "time", nodeId: 4, example: "今天是星期三。" },
  { hanzi: "明天", pinyin: "míngtiān", hsk: 1, category: "time", nodeId: 4, example: "明天我去学校。" },
  { hanzi: "星期", pinyin: "xīngqī", hsk: 1, category: "time", nodeId: 4, example: "这个星期很忙。" },
  { hanzi: "家人", pinyin: "jiārén", hsk: 1, category: "family", nodeId: 5, example: "我爱我的家人。" },
  { hanzi: "妈妈", pinyin: "māma", hsk: 1, category: "family", nodeId: 5, example: "妈妈很好。" },
  { hanzi: "中国", pinyin: "Zhōngguó", hsk: 1, category: "places", nodeId: 6, example: "我去中国。" },
  { hanzi: "爱好", pinyin: "àihào", hsk: 1, category: "interests", nodeId: 7, example: "我的爱好是看书。" },
  { hanzi: "天气", pinyin: "tiānqì", hsk: 1, category: "weather", nodeId: 8, example: "今天天气很好。" },
  { hanzi: "学校", pinyin: "xuéxiào", hsk: 1, category: "school", nodeId: 9, example: "学校很大。" },
  { hanzi: "老师", pinyin: "lǎoshī", hsk: 1, category: "school", nodeId: 9, example: "老师很好。" },
  { hanzi: "家", pinyin: "jiā", hsk: 1, category: "housing", nodeId: 10, example: "我在家。" },
  { hanzi: "买", pinyin: "mǎi", hsk: 1, category: "shopping", nodeId: 11, example: "我去买东西。" },
  { hanzi: "商店", pinyin: "shāngdiàn", hsk: 2, category: "shopping", nodeId: 11, example: "那个商店很大。" },
  { hanzi: "便宜", pinyin: "piányí", hsk: 2, category: "shopping", nodeId: 11, example: "这件衣服很便宜。" },
  { hanzi: "苹果", pinyin: "píngguǒ", hsk: 1, category: "food", nodeId: 12, example: "我喜欢吃苹果。" },
  { hanzi: "水果", pinyin: "shuǐguǒ", hsk: 1, category: "food", nodeId: 12, example: "水果很甜。" },
  { hanzi: "吃", pinyin: "chī", hsk: 1, category: "food", nodeId: 13, example: "我喜欢吃饭。" },
  { hanzi: "食物", pinyin: "shíwù", hsk: 2, category: "food", nodeId: 13, example: "这些食物很好吃。" },
  { hanzi: "米饭", pinyin: "mǐfàn", hsk: 1, category: "food", nodeId: 13, example: "我喜欢吃米饭。" },
  { hanzi: "面条", pinyin: "miàntiáo", hsk: 2, category: "food", nodeId: 13, example: "面条很好吃。" },
  { hanzi: "饺子", pinyin: "jiǎozi", hsk: 2, category: "food", nodeId: 13, example: "我们一起吃饺子吧。" },
  { hanzi: "水", pinyin: "shuǐ", hsk: 1, category: "food", nodeId: 13, example: "请给我一杯水。" },
  { hanzi: "茶", pinyin: "chá", hsk: 1, category: "food", nodeId: 13, example: "我想喝茶。" },
  { hanzi: "菜", pinyin: "cài", hsk: 1, category: "food", nodeId: 13, example: "这个菜很好吃。" },
  { hanzi: "火锅", pinyin: "huǒguō", hsk: 3, category: "food", nodeId: 13, example: "我们去吃火锅。" },
  { hanzi: "外卖", pinyin: "wàimài", hsk: 3, category: "food", nodeId: 13, example: "今晚点外卖。" },
  { hanzi: "下午", pinyin: "xiàwǔ", hsk: 1, category: "time", nodeId: 4, example: "下午我有课。" },
  { hanzi: "医院", pinyin: "yīyuàn", hsk: 2, category: "places", nodeId: 16, example: "医院在哪儿？" },
  { hanzi: "漂亮", pinyin: "piàoliang", hsk: 2, category: "people", nodeId: 15, example: "她很漂亮。" },
  { hanzi: "矛盾", pinyin: "máodùn", hsk: 4, category: "emotions", nodeId: 26, example: "这个说法很矛盾。" },
  { hanzi: "马虎", pinyin: "mǎhu", hsk: 4, category: "emotions", nodeId: 26, example: "做事不要马虎。" },
  { hanzi: "吃醋", pinyin: "chīcù", hsk: 5, category: "emotions", nodeId: 26, example: "他吃醋了。" },
];

export const PLACEMENT_QUESTIONS = [
  { hanzi: "吃", pinyin: "chī", questionKey: "placement.qChar", options: [
    { pinyin: "chī", meaningKey: "吃" }, { pinyin: "hē", meaningKey: "喝" },
    { pinyin: "zuò", meaningKey: "坐" }, { pinyin: "zǒu", meaningKey: "走" },
  ], correct: 0 },
  { hanzi: "美", pinyin: "měi", questionKey: "placement.qChar", options: [
    { pinyin: "hǎo", meaningKey: "好" }, { pinyin: "měi", meaningKey: "美" },
    { pinyin: "dà", meaningKey: "大" }, { pinyin: "xiǎo", meaningKey: "小" },
  ], correct: 1 },
  { hanzi: "朋友", pinyin: "péngyou", questionKey: "placement.qWord", options: [
    { pinyin: "jiārén", meaningKey: "家人" }, { pinyin: "lǎoshī", meaningKey: "老师" },
    { pinyin: "péngyou", meaningKey: "朋友" }, { pinyin: "tóngxué", meaningKey: "同学" },
  ], correct: 2 },
  { hanzi: "水", pinyin: "shuǐ", questionKey: "placement.qChar", options: [
    { pinyin: "chá", meaningKey: "茶" }, { pinyin: "shuǐ", meaningKey: "水" },
    { pinyin: "mǐfàn", meaningKey: "米饭" }, { pinyin: "cài", meaningKey: "菜" },
  ], correct: 1 },
  { hanzi: "学校", pinyin: "xuéxiào", questionKey: "placement.qWord", options: [
    { pinyin: "yīyuàn", meaningKey: "医院" }, { pinyin: "shāngdiàn", meaningKey: "商店" },
    { pinyin: "xuéxiào", meaningKey: "学校" }, { pinyin: "jiā", meaningKey: "家" },
  ], correct: 2 },
  { hanzi: "今天", pinyin: "jīntiān", questionKey: "placement.qWord", options: [
    { pinyin: "jīntiān", meaningKey: "今天" }, { pinyin: "míngtiān", meaningKey: "明天" },
    { pinyin: "xiàwǔ", meaningKey: "下午" }, { pinyin: "xīngqī", meaningKey: "星期" },
  ], correct: 0 },
  { hanzi: "便宜", pinyin: "piányí", questionKey: "placement.qWord", options: [
    { pinyin: "piàoliang", meaningKey: "漂亮" }, { pinyin: "piányí", meaningKey: "便宜" },
    { pinyin: "mǎhu", meaningKey: "马虎" }, { pinyin: "máodùn", meaningKey: "矛盾" },
  ], correct: 1 },
  { hanzi: "饺子", pinyin: "jiǎozi", questionKey: "placement.qWord", options: [
    { pinyin: "mǐfàn", meaningKey: "米饭" }, { pinyin: "miàntiáo", meaningKey: "面条" },
    { pinyin: "jiǎozi", meaningKey: "饺子" }, { pinyin: "huǒguō", meaningKey: "火锅" },
  ], correct: 2 },
];

export function vocabByNode(nodeId) {
  return VOCAB.filter((w) => w.nodeId === nodeId);
}

export function vocabByHanzi(hanzi) {
  return VOCAB.find((w) => w.hanzi === hanzi);
}

export function knownHanziSet(wordsMap) {
  return new Set(Object.keys(wordsMap || {}).filter((h) => (wordsMap[h]?.seen || 0) > 0 || (wordsMap[h]?.reps || 0) > 0));
}
