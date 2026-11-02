import { nodeById } from "./path.js";

export const VOCAB = [];

const BY_HANZI = new Map();

export function setVocab(list) {
  VOCAB.length = 0;
  VOCAB.push(...list);
  BY_HANZI.clear();
  for (const w of list) BY_HANZI.set(w.hanzi, w);
}

export function vocabByHanzi(hanzi) {
  return BY_HANZI.get(hanzi);
}

export function vocabByNode(nodeId) {
  const node = nodeById(nodeId);
  if (!node) return [];
  return (node.wordHanzi || []).map((h) => BY_HANZI.get(h)).filter(Boolean);
}

export function wordMeaning(word, lang) {
  return word?.meaning?.[lang] || word?.meaning?.ru || word?.meaning?.en || "";
}

export function knownHanziSet(wordsMap) {
  return new Set(Object.keys(wordsMap || {}).filter((h) => (wordsMap[h]?.seen || 0) > 0 || (wordsMap[h]?.reps || 0) > 0));
}

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