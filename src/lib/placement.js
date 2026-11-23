export const LEVELS = [0, 1, 2, 3, 4, 5, 6];
export const MIN_QUESTIONS = 8;
export const MAX_QUESTIONS = 14;

const PRIOR = [0.22, 0.22, 0.17, 0.14, 0.11, 0.08, 0.06];
const GUESS = 0.25;
const DK_SHARE = 0.5;
const STOP_CONFIDENCE = 0.8;

const TONE_MARKS = {
  a: ["ā", "á", "ǎ", "à"],
  e: ["ē", "é", "ě", "è"],
  i: ["ī", "í", "ǐ", "ì"],
  o: ["ō", "ó", "ǒ", "ò"],
  u: ["ū", "ú", "ǔ", "ù"],
  ü: ["ǖ", "ǘ", "ǚ", "ǜ"],
};

const MARK_LOOKUP = new Map();
for (const [base, marks] of Object.entries(TONE_MARKS)) marks.forEach((mark, i) => MARK_LOOKUP.set(mark, { base, tone: i }));

export function knownProb(ell, level) {
  if (level <= ell) return 0.92;
  if (level === ell + 1) return ell === 0 ? 0.1 : 0.35;
  return 0.05;
}

export function likelihood(kind, ell, level) {
  const m = knownProb(ell, level);
  if (kind === "correct") return m + (1 - m) * (1 - DK_SHARE) * GUESS;
  if (kind === "wrong") return (1 - m) * (1 - DK_SHARE) * (1 - GUESS);
  return (1 - m) * DK_SHARE;
}

export function initialPosterior() {
  return [...PRIOR];
}

export function updatePosterior(post, kind, level) {
  const next = post.map((p, ell) => p * likelihood(kind, ell, level));
  const sum = next.reduce((a, b) => a + b, 0) || 1;
  return next.map((p) => p / sum);
}

function entropy(post) {
  return -post.reduce((acc, p) => acc + (p > 0 ? p * Math.log(p) : 0), 0);
}

export function estimate(post) {
  let best = 0;
  post.forEach((p, i) => {
    if (p > post[best]) best = i;
  });
  return { level: best, confidence: post[best], mean: post.reduce((a, p, i) => a + p * i, 0) };
}

export function nextLevel(post, asked) {
  if (asked === 0) return 1;
  const { level: map } = estimate(post);
  const lo = Math.max(1, map - 1);
  const hi = Math.min(6, map + 2);
  let bestLevel = lo;
  let bestScore = Infinity;
  for (let level = lo; level <= hi; level++) {
    let expected = 0;
    for (const kind of ["correct", "wrong", "dk"]) {
      const p = post.reduce((acc, prior, ell) => acc + prior * likelihood(kind, ell, level), 0);
      if (p > 0) expected += p * entropy(updatePosterior(post, kind, level));
    }
    if (expected < bestScore - 1e-9) {
      bestScore = expected;
      bestLevel = level;
    }
  }
  return bestLevel;
}

export function shouldStop(post, asked) {
  if (asked >= MAX_QUESTIONS) return true;
  return asked >= MIN_QUESTIONS && estimate(post).confidence >= STOP_CONFIDENCE;
}

function shuffle(list, rng) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function shortMeaning(text) {
  if (!text) return "";
  const parts = text.split(";").map((p) => p.trim()).filter(Boolean);
  let out = parts[0] || "";
  if (parts[1] && (out + "; " + parts[1]).length <= 34) out = `${out}; ${parts[1]}`;
  return out.length > 40 ? `${out.slice(0, 38).trim()}…` : out;
}

const HAS_TONE_MARK = /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/;

export function meaningOf(entry, lang) {
  const text = shortMeaning(entry.meaning?.[lang] || entry.meaning?.ru || entry.meaning?.en || "");
  return HAS_TONE_MARK.test(text) ? "" : text;
}

function isTranslated(entry, lang) {
  if (lang === "en") return true;
  const m = entry.meaning || {};
  return Boolean(m[lang]) && m[lang] !== m.en;
}

export function toneVariants(pinyin) {
  const syllables = pinyin.split(" ");
  const out = [];
  syllables.forEach((syllable, s) => {
    const chars = [...syllable];
    const at = chars.findIndex((c) => MARK_LOOKUP.has(c));
    if (at < 0) return;
    const { base, tone } = MARK_LOOKUP.get(chars[at]);
    for (let t = 0; t < 4; t++) {
      if (t === tone) continue;
      const copy = [...chars];
      copy[at] = TONE_MARKS[base][t];
      const next = [...syllables];
      next[s] = copy.join("");
      out.push(next.join(" "));
    }
  });
  return out;
}

function usable(entry) {
  return entry.hanzi.length <= 3 && !(entry.pinyin || "").includes(" / ") && Boolean(entry.pinyin);
}

function pickType(ttsOk, rng) {
  const r = rng();
  if (ttsOk) return r < 0.35 ? "meaning" : r < 0.6 ? "hanzi" : r < 0.8 ? "pinyin" : "listen";
  return r < 0.45 ? "meaning" : r < 0.75 ? "hanzi" : "pinyin";
}

export function buildQuestion({ level, pool, used, lang, ttsOk, rng = Math.random }) {
  const candidates = pool.filter((e) => e.hsk === level && usable(e) && meaningOf(e, lang));
  const fresh = candidates.filter((e) => !used.has(e.hanzi));
  const source = fresh.length ? fresh : candidates;
  if (!source.length) return null;
  const target = source[Math.floor(rng() * source.length)];
  const type = pickType(ttsOk, rng);

  const neighbours = pool.filter(
    (e) => Math.abs(e.hsk - level) <= 1 && e.hanzi !== target.hanzi && usable(e) && meaningOf(e, lang) && isTranslated(e, lang) === isTranslated(target, lang)
  );
  const sameLength = neighbours.filter((e) => e.hanzi.length === target.hanzi.length);
  const base = shuffle(sameLength.length >= 12 ? sameLength : neighbours, rng);

  const picked = [];
  const seen = new Set([type === "pinyin" ? target.pinyin : meaningOf(target, lang).toLowerCase()]);
  for (const e of base) {
    const key = type === "pinyin" ? e.pinyin : meaningOf(e, lang).toLowerCase();
    if (type === "hanzi") {
      if (e.hanzi === target.hanzi) continue;
    } else if (seen.has(key)) continue;
    seen.add(key);
    picked.push(e);
    if (picked.length === 3) break;
  }
  if (picked.length < 3) return null;

  let options;
  if (type === "pinyin") {
    const variants = shuffle([...new Set(toneVariants(target.pinyin))].filter((v) => v !== target.pinyin), rng).slice(0, 2);
    const extra = picked.map((e) => e.pinyin).filter((p) => p !== target.pinyin && !variants.includes(p));
    options = [target.pinyin, ...variants, ...extra].filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 4);
    if (options.length < 4) return null;
  } else if (type === "hanzi") {
    options = [target.hanzi, ...picked.map((e) => e.hanzi)];
  } else {
    options = [meaningOf(target, lang), ...picked.map((e) => meaningOf(e, lang))];
  }

  const shuffled = shuffle(options, rng);
  const correct = type === "pinyin" ? target.pinyin : type === "hanzi" ? target.hanzi : meaningOf(target, lang);
  return {
    id: `${type}:${target.hanzi}:${level}`,
    type,
    level,
    hanzi: target.hanzi,
    pinyin: target.pinyin,
    meaning: meaningOf(target, lang),
    options: shuffled,
    correctIndex: shuffled.indexOf(correct),
  };
}

export function startNodeLevel(level) {
  return level === 0 ? 0 : Math.min(6, level + 1);
}