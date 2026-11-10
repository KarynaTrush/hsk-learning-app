import { segment } from "./segment.js";

const GENERIC = ["主语", "动词", "宾语", "名词", "形容词", "代词", "句子", "数字", "量词", "地点", "时间", "副词", "陈述句"];
let counter = 0;

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function distinct(candidates, excluded, count) {
  const seen = new Set(excluded);
  const out = [];
  for (const c of shuffle(candidates)) {
    if (!c || seen.has(c)) continue;
    seen.add(c);
    out.push(c);
    if (out.length === count) break;
  }
  return out;
}

export function patternKeywords(pattern = "") {
  let p = pattern;
  for (const g of GENERIC) p = p.split(g).join(" ");
  return [...new Set(p.match(/[\u4e00-\u9fff]+/g) || [])];
}

export function buildGrammarExercises(topic, topics, { lookup, lang, limit = 6 }) {
  const tr = (e) => e[lang] || e.ru;
  const tokensOf = (zh) => segment(zh, lookup).filter((t) => !t.punct).map((t) => t.text);
  const allTokens = topics.flatMap((t) => t.examples.flatMap((e) => tokensOf(e.zh)));
  const allTranslations = topics.flatMap((t) => t.examples.map(tr)).filter(Boolean);
  const keywords = patternKeywords(topic.pattern);
  const out = [];

  topic.examples.forEach((e, index) => {
    const tokens = tokensOf(e.zh);
    if (tokens.length >= 3) {
      let tiles = shuffle(tokens.map((text, i) => ({ id: `t${i}`, text })));
      for (let i = 0; i < 6 && tiles.map((x) => x.text).join("|") === tokens.join("|"); i++) tiles = shuffle(tiles);
      out.push({ id: `gx-${++counter}`, kind: "exercise", type: "order", skill: "grammar", ref: `g${topic.id}:order:${index}`, prompt: { mode: "order", hint: tr(e) }, tiles, answer: tokens });
    }

    const blankIndex = tokens.findIndex((tok) => keywords.some((k) => tok.includes(k)));
    if (blankIndex >= 0) {
      const target = tokens[blankIndex];
      const d = distinct(allTokens, [target, ...tokens], 3);
      if (d.length >= 2) {
        out.push({
          id: `gx-${++counter}`, kind: "exercise", type: "fill", skill: "grammar", ref: `g${topic.id}:fill:${index}`,
          prompt: { mode: "blank", tokens, blankIndex, hint: tr(e) },
          options: shuffle([target, ...d]).map((t) => ({ id: t, label: t, big: true })),
          correctId: target,
        });
      }
    }

    const correct = tr(e);
    const dt = distinct(allTranslations, [correct], 3);
    if (dt.length >= 2 && correct) {
      out.push({
        id: `gx-${++counter}`, kind: "exercise", type: "translate", skill: "grammar", ref: `g${topic.id}:translate:${index}`,
        prompt: { mode: "sentence", zh: e.zh, py: e.py },
        options: shuffle([correct, ...dt]).map((label) => ({ id: label, label })),
        correctId: correct,
      });
    }
  });

  const order = out.filter((x) => x.type === "order");
  const fill = out.filter((x) => x.type === "fill");
  const translate = out.filter((x) => x.type === "translate");
  const mixed = [];
  for (let i = 0; mixed.length < limit && i < 3; i++) {
    [fill[i], translate[i], order[i]].forEach((x) => x && mixed.length < limit && mixed.push(x));
  }
  return mixed;
}