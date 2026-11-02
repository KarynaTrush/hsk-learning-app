export const SKILL_OF = {
  "choose-meaning": "recognition",
  "choose-hanzi": "recall",
  listen: "listening",
  "pinyin-pick": "pinyin",
  order: "grammar",
  fill: "grammar",
  translate: "reading",
};

const TONE_VOWELS = {
  a: "āáǎà",
  e: "ēéěè",
  i: "īíǐì",
  o: "ōóǒò",
  u: "ūúǔù",
  ü: "ǖǘǚǜ",
};

const MARKS = new Map();
for (const [base, marks] of Object.entries(TONE_VOWELS)) {
  [...marks].forEach((ch, i) => MARKS.set(ch, { base, tone: i + 1 }));
}

let counter = 0;
const nextId = (prefix) => `${prefix}-${++counter}`;

export function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function shiftSyllableTone(syllable, tone) {
  let out = "";
  let changed = false;
  for (const ch of syllable) {
    const info = MARKS.get(ch);
    if (info && !changed) {
      out += TONE_VOWELS[info.base][tone - 1];
      changed = true;
    } else {
      out += ch;
    }
  }
  return changed ? out : null;
}

export function pinyinVariants(pinyin, count) {
  const syllables = pinyin.split(" / ")[0].split(" ");
  const variants = new Set();
  syllables.forEach((syl, index) => {
    for (let tone = 1; tone <= 4; tone++) {
      const shifted = shiftSyllableTone(syl, tone);
      if (shifted && shifted !== syl) {
        const next = [...syllables];
        next[index] = shifted;
        variants.add(next.join(" "));
      }
    }
  });
  return shuffle([...variants]).slice(0, count);
}

function pickDistinct(candidates, keyOf, excluded, count) {
  const seen = new Set(excluded);
  const out = [];
  for (const item of shuffle(candidates)) {
    const key = keyOf(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
    if (out.length === count) break;
  }
  return out;
}

function preferSameLevel(pool, word) {
  const same = pool.filter((w) => w.hsk === word.hsk);
  return same.length >= 6 ? same : pool;
}

export function skillWeight(skills, skill) {
  const s = skills?.[skill];
  const accuracy = ((s?.correct || 0) + 1) / ((s?.answers || 0) + 2);
  return 1.6 - accuracy;
}

export function weightedOrder(items, weightOf) {
  return items
    .map((item) => ({ item, key: Math.random() ** (1 / Math.max(weightOf(item), 0.05)) }))
    .sort((a, b) => b.key - a.key)
    .map((x) => x.item);
}

export function buildWordExercise(type, word, ctx) {
  const { pool, meaningOf } = ctx;
  const others = preferSameLevel(pool.filter((w) => w.hanzi !== word.hanzi), word);
  const meaning = meaningOf(word);
  let prompt;
  let options;
  let correctId;

  if (type === "choose-meaning") {
    const d = pickDistinct(others, meaningOf, [meaning], 3);
    if (d.length < 3) return null;
    prompt = { mode: "hanzi", text: word.hanzi };
    options = shuffle([word, ...d]).map((w) => ({ id: w.hanzi, label: meaningOf(w) }));
    correctId = word.hanzi;
  } else if (type === "choose-hanzi" || type === "listen") {
    const d = pickDistinct(others, (w) => w.hanzi, [word.hanzi], 3);
    if (d.length < 3) return null;
    prompt = type === "listen" ? { mode: "audio", speak: word.hanzi } : { mode: "text", text: meaning };
    options = shuffle([word, ...d]).map((w) => ({ id: w.hanzi, label: w.hanzi, big: true }));
    correctId = word.hanzi;
  } else if (type === "pinyin-pick") {
    if (word.pinyin.includes(" / ")) return null;
    let variants = pinyinVariants(word.pinyin, 3);
    if (variants.length < 3) {
      const extra = pickDistinct(
        others,
        (w) => w.pinyin.split(" / ")[0],
        [word.pinyin, ...variants],
        3 - variants.length
      ).map((w) => w.pinyin.split(" / ")[0]);
      variants = [...variants, ...extra];
    }
    if (variants.length < 3) return null;
    prompt = { mode: "hanzi", text: word.hanzi, hint: meaning };
    options = shuffle([word.pinyin, ...variants]).map((p) => ({ id: p, label: p }));
    correctId = word.pinyin;
  } else {
    return null;
  }

  return {
    id: nextId("ex"),
    kind: "exercise",
    type,
    skill: SKILL_OF[type],
    ref: word.hanzi,
    wordRef: word.hanzi,
    prompt,
    options,
    correctId,
  };
}

export function buildTranslate(sentence, ctx) {
  const { sentencePool, lang } = ctx;
  const textOf = (s) => s.tr?.[lang] || s.tr?.ru || "";
  const correct = textOf(sentence);
  const d = pickDistinct(sentencePool.filter((s) => s.id !== sentence.id), textOf, [correct], 3);
  if (d.length < 2 || !correct) return null;
  return {
    id: nextId("ex"),
    kind: "exercise",
    type: "translate",
    skill: SKILL_OF.translate,
    ref: sentence.zh,
    prompt: { mode: "sentence", zh: sentence.zh, py: sentence.pinyin },
    options: shuffle([sentence, ...d]).map((s) => ({ id: String(s.id), label: textOf(s) })),
    correctId: String(sentence.id),
  };
}

export function buildFill(sentence, ctx) {
  if (sentence.blankIndex == null) return null;
  const target = sentence.tokens[sentence.blankIndex];
  const tokenPool = ctx.sentencePool.flatMap((s) => s.tokens);
  const d = pickDistinct(tokenPool, (t) => t, [target, ...sentence.tokens], 3);
  if (d.length < 2) return null;
  return {
    id: nextId("ex"),
    kind: "exercise",
    type: "fill",
    skill: SKILL_OF.fill,
    ref: sentence.zh,
    prompt: {
      mode: "blank",
      tokens: sentence.tokens,
      blankIndex: sentence.blankIndex,
      hint: sentence.tr?.[ctx.lang] || sentence.tr?.ru || "",
    },
    options: shuffle([target, ...d]).map((t) => ({ id: t, label: t, big: true })),
    correctId: target,
  };
}

export function buildOrder(sentence, ctx) {
  if (sentence.tokens.length < 3) return null;
  const joined = sentence.tokens.join("|");
  let tiles = shuffle(sentence.tokens.map((text, i) => ({ id: `t${i}`, text })));
  for (let i = 0; i < 6 && tiles.map((t) => t.text).join("|") === joined; i++) tiles = shuffle(tiles);
  return {
    id: nextId("ex"),
    kind: "exercise",
    type: "order",
    skill: SKILL_OF.order,
    ref: sentence.zh,
    prompt: { mode: "order", hint: sentence.tr?.[ctx.lang] || sentence.tr?.ru || "" },
    tiles,
    answer: sentence.tokens,
  };
}

export function buildQuiz(q, ctx) {
  const { lang } = ctx;
  const pickText = (o) => (o && typeof o === "object" ? o[lang] || o.ru || o.en || o.t || "" : "");
  const options = q.options.map((opt, i) => ({
    id: String(i),
    label: opt.t ?? pickText(opt),
    big: Boolean(opt.t),
  }));
  const text = pickText(q.prompt);
  return {
    id: nextId("ex"),
    kind: "exercise",
    type: q.audio ? "audio-quiz" : "quiz",
    skill: q.skill || "knowledge",
    ref: `quiz:${q.id ?? q.position}`,
    prompt: q.audio ? { mode: "audio", speak: q.audio, text } : { mode: "text", text },
    options,
    correctId: String(q.correct),
    explanation: pickText(q.explain),
  };
}

export function cloneForRetry(step) {
  const copy = { ...step, id: nextId("retry"), retry: true };
  if (step.options) copy.options = shuffle(step.options);
  if (step.tiles) copy.tiles = shuffle(step.tiles);
  return copy;
}

export function planLesson({
  words,
  notes = [],
  sentences = [],
  quiz = [],
  skills = {},
  pool,
  sentencePool,
  lang,
  meaningOf,
  canSpeak = false,
  intro = true,
  policy = "weighted-skill-v1",
}) {
  const ctx = { pool, sentencePool, lang, meaningOf };
  const steps = [];

  notes.forEach((note) => steps.push({ id: nextId("note"), kind: "note", note }));
  if (intro) words.forEach((word) => steps.push({ id: nextId("word"), kind: "word", word }));

  words.forEach((word) => {
    const e = buildWordExercise("choose-meaning", word, ctx);
    if (e) steps.push(e);
  });

  const secondPass = ["choose-hanzi", "pinyin-pick", ...(canSpeak ? ["listen"] : [])];
  shuffle(words)
    .slice(0, Math.min(words.length, 4))
    .forEach((word) => {
      for (const type of weightedOrder(secondPass, (t) => skillWeight(skills, SKILL_OF[t]))) {
        const e = buildWordExercise(type, word, ctx);
        if (e) {
          steps.push(e);
          break;
        }
      }
    });

  sentences.forEach((s) => {
    [buildTranslate(s, ctx), buildOrder(s, ctx), buildFill(s, ctx)].forEach((e) => e && steps.push(e));
  });

  quiz.forEach((q) => steps.push(buildQuiz(q, ctx)));

  return steps.map((s) => ({ ...s, policy }));
}